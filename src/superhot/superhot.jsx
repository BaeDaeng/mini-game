import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { nanoid } from 'nanoid';
import * as THREE from 'three';
import './superhot.css';

// --- 1. 파편(Fragment) ---
function Fragment({ initialPos, velocity, globalTimeRef, onFinish }) {
  const meshRef = useRef();
  const life = useRef(1.0);
  const vel = useRef(new THREE.Vector3(...velocity));

  useEffect(() => {
    if (meshRef.current) meshRef.current.position.set(...initialPos);
  }, [initialPos]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = delta * globalTimeRef.current.current;
    
    meshRef.current.position.add(vel.current.clone().multiplyScalar(t));
    vel.current.y -= 15.0 * t;
    
    if (meshRef.current.position.y < 0.05) {
      meshRef.current.position.y = 0.05;
      vel.current.set(0, 0, 0);
    }

    life.current -= t * 1.5;
    meshRef.current.scale.setScalar(Math.max(0, life.current));
    if (life.current <= 0) onFinish();
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.15, 0.15, 0.15]} />
      <meshStandardMaterial color="#ff0000" />
    </mesh>
  );
}

// --- 2. 적(Enemy) ---
function Enemy({ id, initialPos, hp = 1, speed = 4.0, playerRef, globalTimeRef, enemyPositionsRef, onPlayerHit }) {
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) meshRef.current.position.set(initialPos[0], 0.9, initialPos[2]);
    
    const positions = enemyPositionsRef.current;
    return () => {
      if (positions) delete positions[id];
    };
  }, [initialPos, id, enemyPositionsRef]);

  useFrame((state, delta) => {
    if (!meshRef.current || !playerRef.current) return;
    const t = delta * globalTimeRef.current.current;

    const targetPos = playerRef.current.position.clone();
    targetPos.y = 0; 
    
    const currentPos2D = new THREE.Vector3(meshRef.current.position.x, 0, meshRef.current.position.z);
    const distance = currentPos2D.distanceTo(targetPos);
    
    if (distance < 1.5) {
      onPlayerHit();
      return;
    }

    const dir = targetPos.clone().sub(currentPos2D).normalize();
    meshRef.current.position.add(dir.multiplyScalar(speed * t));
    meshRef.current.lookAt(playerRef.current.position.x, playerRef.current.position.y, playerRef.current.position.z);

    meshRef.current.position.y = Math.sin(globalTimeRef.current.accumulatedTime * 8) * 0.1 + 0.9;

    enemyPositionsRef.current[id] = meshRef.current.position;
  });

  return (
    <group ref={meshRef} name={id}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial color="#ff0000" emissive="#bb0000" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#ff2222" />
      </mesh>
      {Array.from({ length: hp }).map((_, i) => (
        <mesh key={i} position={[0, 1.4 + i * 0.3, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#ffaa00" />
        </mesh>
      ))}
    </group>
  );
}

// --- 3. 가시 함정(Trap) ---
function Trap({ id, pos, playerRef, onPlayerHit, onRemove }) {
  const circleMatRef = useRef();
  const spikeRef = useRef();
  const timeAlive = useRef(0);
  const isActive = useRef(false);

  useFrame((_, delta) => {
    timeAlive.current += delta;
    
    if (timeAlive.current >= 2.0 && !isActive.current) {
      isActive.current = true;
      if (circleMatRef.current) circleMatRef.current.color.set('red');
      if (spikeRef.current) spikeRef.current.visible = true;
    }

    if (timeAlive.current >= 2.5) {
      onRemove(id);
    }

    if (isActive.current && playerRef.current) {
      const dist = new THREE.Vector2(playerRef.current.position.x, playerRef.current.position.z)
        .distanceTo(new THREE.Vector2(pos[0], pos[2]));
      
      if (dist < 2.5 && playerRef.current.position.y < 3.5) {
        onPlayerHit();
      }
    }
  });

  return (
    <group position={[pos[0], 0, pos[2]]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 32]} />
        <meshBasicMaterial ref={circleMatRef} color="orange" transparent opacity={0.5} />
      </mesh>
      <mesh ref={spikeRef} position={[0, 1, 0]} visible={false}>
        <cylinderGeometry args={[0, 2.5, 2, 16]} />
        <meshStandardMaterial color="#880000" />
      </mesh>
    </group>
  );
}

// --- 4. 총알(Bullet) ---
function Bullet({ id, initialPos, direction, globalTimeRef, onRemove, enemyPositionsRef, onEnemyHit }) {
  const meshRef = useRef();
  const bulletSpeed = 50;
  const isDead = useRef(false);

  useEffect(() => {
    if (meshRef.current) meshRef.current.position.set(...initialPos);
  }, [initialPos]);

  useFrame((state, delta) => {
    if (!meshRef.current || isDead.current) return;
    const t = delta * globalTimeRef.current.current;
    
    const move = new THREE.Vector3(...direction).multiplyScalar(bulletSpeed * t);
    meshRef.current.position.add(move);

    Object.entries(enemyPositionsRef.current).forEach(([enemyId, enemyPos]) => {
      if (isDead.current || !enemyPos) return;
      
      const dist = new THREE.Vector2(meshRef.current.position.x, meshRef.current.position.z)
        .distanceTo(new THREE.Vector2(enemyPos.x, enemyPos.z));
      
      if (dist < 1.0 && meshRef.current.position.y > 0 && meshRef.current.position.y < 2.5) {
        isDead.current = true;
        onEnemyHit(enemyId, [meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z]);
        onRemove(id);
      }
    });

    if (meshRef.current.position.length() > 200) {
      isDead.current = true;
      onRemove(id);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
  );
}

// --- 5. 경계선(Boundaries) ---
function Boundaries() {
  return (
    <group>
      <gridHelper args={[80, 80, '#888888', '#dddddd']} position={[0, 0.01, 0]} />
      {[
        { pos: [0, 5, -40], rot: [0, 0, 0] },
        { pos: [0, 5, 40], rot: [0, Math.PI, 0] },
        { pos: [-40, 5, 0], rot: [0, Math.PI / 2, 0] },
        { pos: [40, 5, 0], rot: [0, -Math.PI / 2, 0] }
      ].map((wall, idx) => (
        <mesh key={idx} position={wall.pos} rotation={wall.rot}>
          <planeGeometry args={[80, 10]} />
          <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

// --- 6. 컨트롤러 및 시간 제어 ---
function GameController({ playerRef, mouseDirRef, globalTimeRef, isActive }) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const rotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  
  const playerVelY = useRef(0);
  const isJumping = useRef(false);

  useEffect(() => {
    playerRef.current = camera;
    if (!isActive) return;
    
    const handleClick = () => gl.domElement.requestPointerLock();
    
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === gl.domElement) {
        rotation.current.y -= e.movementX * 0.002;
        rotation.current.x -= e.movementY * 0.002;
        rotation.current.x = Math.max(-Math.PI/2.5, Math.min(Math.PI/2.5, rotation.current.x));
      }
    };
    
    const handleDown = (e) => { 
      keys.current[e.code] = true; 
      if (e.code === 'Space' && !isJumping.current) {
        isJumping.current = true;
        playerVelY.current = 8.0; 
      }
    };
    
    const handleUp = (e) => { keys.current[e.code] = false; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [camera, playerRef, gl, isActive]);

  useFrame((state, delta) => {
    if (!isActive) return;
    
    camera.quaternion.setFromEuler(rotation.current);
    
    let isMoving = false;

    if (keys.current['KeyW'] || keys.current['KeyS'] || keys.current['KeyA'] || keys.current['KeyD'] || isJumping.current) {
      isMoving = true;
      const moveSpeed = 0.3;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0; forward.normalize();
      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));

      if (keys.current['KeyW']) camera.position.add(forward.clone().multiplyScalar(moveSpeed));
      if (keys.current['KeyS']) camera.position.sub(forward.clone().multiplyScalar(moveSpeed));
      if (keys.current['KeyA']) camera.position.sub(right.clone().multiplyScalar(moveSpeed));
      if (keys.current['KeyD']) camera.position.add(right.clone().multiplyScalar(moveSpeed));
    }

    // 💡 ESLint 오류 수정: 점프 로직에서 camera.position.y 직접 할당 제거
    if (isJumping.current) {
      const nextY = camera.position.y + playerVelY.current * delta;
      playerVelY.current -= 20.0 * delta;

      if (nextY <= 2.5) {
        camera.position.setY(2.5);
        isJumping.current = false;
        playerVelY.current = 0;
      } else {
        camera.position.setY(nextY);
      }
    }

    if (globalTimeRef.current.shootBurst > 0) {
      isMoving = true;
      globalTimeRef.current.shootBurst -= delta;
    }
    
    const clampedX = Math.max(-40, Math.min(40, camera.position.x));
    const clampedZ = Math.max(-40, Math.min(40, camera.position.z));
    camera.position.setX(clampedX);
    camera.position.setZ(clampedZ);

    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    mouseDirRef.current = [dir.x, dir.y, dir.z];

    globalTimeRef.current.target = isMoving ? 1.0 : 0.05;
    globalTimeRef.current.current = THREE.MathUtils.lerp(
      globalTimeRef.current.current, 
      globalTimeRef.current.target, 
      delta * 12
    );
    
    globalTimeRef.current.accumulatedTime += delta * globalTimeRef.current.current;
  });

  return null;
}

// --- 7. 게임 로직 매니저 ---
function GameLogicManager({ gameState, setEnemies, setTraps, playerRef, timerUITextRef }) {
  const elapsed = useRef(0);
  const enemyTimer = useRef(0);
  const trapTimer = useRef(0);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      elapsed.current = 0;
      enemyTimer.current = 0;
      trapTimer.current = 0;
    }
  }, [gameState]);

  useFrame((_, delta) => {
    if (gameState !== 'PLAYING') return;

    elapsed.current += delta;
    enemyTimer.current += delta;
    trapTimer.current += delta;

    if (timerUITextRef.current) {
      const m = Math.floor(elapsed.current / 60);
      const s = Math.floor(elapsed.current % 60);
      timerUITextRef.current.innerText = `${m}:${s.toString().padStart(2, '0')}`;
    }

    const difficultyLevel = Math.floor(elapsed.current / 10);
    const currentSpawnDelay = Math.max(0.5, 2.5 - difficultyLevel * 0.4);

    if (enemyTimer.current >= currentSpawnDelay) {
      enemyTimer.current = 0;
      
      const hp = difficultyLevel + 1; 
      const enemySpeed = 4.0 + (difficultyLevel * 0.8); 

      setEnemies(prev => {
        if (prev.length >= 15) return prev; 
        const angle = Math.random() * Math.PI * 2;
        const radius = 25 + Math.random() * 15;
        const playerPos = playerRef.current ? playerRef.current.position : new THREE.Vector3(0,0,0);
        return [...prev, {
          id: nanoid(),
          hp: hp,
          speed: enemySpeed,
          pos: [playerPos.x + Math.cos(angle) * radius, 0, playerPos.z + Math.sin(angle) * radius]
        }];
      });
    }

    if (trapTimer.current >= 5.0) {
      trapTimer.current = 0;
      if (playerRef.current) {
        const playerPos = playerRef.current.position;
        setTraps(prev => [...prev, {
          id: nanoid(),
          pos: [playerPos.x, 0, playerPos.z]
        }]);
      }
    }
  });

  return null;
}

// --- 8. 메인 앱 ---
export default function SuperHotGame() {
  const [gameState, setGameState] = useState('START'); 
  const [score, setScore] = useState(0);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [fragments, setFragments] = useState([]);
  const [traps, setTraps] = useState([]);
  
  const playerRef = useRef();
  const mouseDirRef = useRef([0, 0, -1]);
  const isMouseDown = useRef(false);
  const enemyPositionsRef = useRef({});
  const timerUITextRef = useRef(null);
  
  const processedKillsRef = useRef(new Set()); 

  const globalTimeRef = useRef({
    current: 0.05, 
    target: 0.05,
    shootBurst: 0,
    accumulatedTime: 0 
  });

  const startGame = () => {
    if (playerRef.current) playerRef.current.position.set(0, 2.5, 5);
    setEnemies([{ id: nanoid(), hp: 1, speed: 4.0, pos: [0, 0, -20] }]);
    setTraps([]);
    setBullets([]);
    setFragments([]);
    setScore(0);
    processedKillsRef.current.clear(); 
    globalTimeRef.current = { current: 0.05, target: 0.05, shootBurst: 0, accumulatedTime: 0 };
    enemyPositionsRef.current = {}; 
    setGameState('PLAYING');
  };

  const shoot = () => {
    if (gameState !== 'PLAYING') return;
    if (document.pointerLockElement && !isMouseDown.current) {
      isMouseDown.current = true;
      globalTimeRef.current.shootBurst = 0.05; 

      if (playerRef.current) {
        const p = playerRef.current.position;
        setBullets(prev => [...prev, { 
          id: nanoid(), 
          pos: [p.x, p.y, p.z], 
          dir: [...mouseDirRef.current] 
        }]);
      }
    }
  };

  const onEnemyHit = useCallback((enemyId, hitPos) => {
    setEnemies(prev => {
      const enemyIndex = prev.findIndex(e => e.id === enemyId);
      if (enemyIndex === -1) return prev;
      
      const enemy = prev[enemyIndex];
      
      if (enemy.hp > 1) {
        const newEnemies = [...prev];
        newEnemies[enemyIndex] = { ...enemy, hp: enemy.hp - 1 };
        return newEnemies;
      } 
      
      if (!processedKillsRef.current.has(enemyId)) {
        processedKillsRef.current.add(enemyId);
        
        setTimeout(() => {
          setScore(s => s + 1);
          const newFrags = Array.from({ length: 15 }).map(() => ({
            id: nanoid(),
            pos: hitPos,
            vel: [(Math.random() - 0.5) * 15, Math.random() * 15 + 5, (Math.random() - 0.5) * 15]
          }));
          setFragments(f => [...f, ...newFrags]);
        }, 0);
      }

      return prev.filter(e => e.id !== enemyId);
    });
  }, []);

  const handlePlayerHit = useCallback(() => {
    setGameState('GAME_OVER');
    globalTimeRef.current.current = 0; 
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);

  return (
    <div 
      className="game-container"
      onPointerDown={shoot}
      onPointerUp={() => { isMouseDown.current = false; }}
    >
      {gameState === 'PLAYING' && <div className="crosshair" />}

      {(gameState === 'PLAYING' || gameState === 'GAME_OVER') && (
        <div className="ui-overlay score-ui">
          <h2>KILLS: {score}</h2>
        </div>
      )}

      {(gameState === 'PLAYING' || gameState === 'GAME_OVER') && (
        <div className="ui-overlay timer-ui">
          <h2 ref={timerUITextRef}>0:00</h2>
        </div>
      )}

      {gameState === 'START' && (
        <div className="start-screen">
          <h1 className="super-hot-text">SUPER<br/>HOT</h1>
          <p>시간은 당신이 움직일 때만 흐릅니다.</p>
          <button className="action-btn" onClick={startGame}>START</button>
          <p className="warning-text">주의: 가만히 있으면 바닥에서 가시 함정이 올라옵니다.</p>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <div className="game-over-screen">
          <h1 className="super-hot-text">SUPER<br/>HOT</h1>
          <p>파괴한 적: {score}</p>
          <button className="action-btn" onClick={startGame}>다시 하기</button>
        </div>
      )}

      <Canvas>
        <color attach="background" args={['#ffffff']} />
        <PerspectiveCamera makeDefault fov={75} />
        
        <GameController 
          playerRef={playerRef} 
          mouseDirRef={mouseDirRef} 
          globalTimeRef={globalTimeRef}
          isActive={gameState === 'PLAYING'}
        />

        <GameLogicManager 
          gameState={gameState}
          setEnemies={setEnemies}
          setTraps={setTraps}
          playerRef={playerRef}
          timerUITextRef={timerUITextRef}
        />
        
        <ambientLight intensity={1.5} />
        <pointLight position={[20, 30, 20]} intensity={2} />
        
        <Boundaries />

        {enemies.map(e => (
          <Enemy 
            key={e.id} 
            id={e.id} 
            initialPos={e.pos} 
            hp={e.hp}
            speed={e.speed}
            playerRef={playerRef} 
            globalTimeRef={globalTimeRef} 
            enemyPositionsRef={enemyPositionsRef} 
            onPlayerHit={handlePlayerHit}
          />
        ))}

        {traps.map(t => (
          <Trap 
            key={t.id}
            id={t.id}
            pos={t.pos}
            playerRef={playerRef}
            onPlayerHit={handlePlayerHit}
            onRemove={(id) => setTraps(prev => prev.filter(trap => trap.id !== id))}
          />
        ))}
        
        {bullets.map(b => (
          <Bullet 
            key={b.id} 
            id={b.id} 
            initialPos={b.pos} 
            direction={b.dir} 
            globalTimeRef={globalTimeRef} 
            enemyPositionsRef={enemyPositionsRef} 
            onEnemyHit={onEnemyHit}
            onRemove={(id) => setBullets(prev => prev.filter(bul => bul.id !== id))} 
          />
        ))}

        {fragments.map(f => (
          <Fragment 
            key={f.id} 
            initialPos={f.pos} 
            velocity={f.vel} 
            globalTimeRef={globalTimeRef} 
            onFinish={() => setFragments(prev => prev.filter(fr => fr.id !== f.id))} 
          />
        ))}
      </Canvas>
    </div>
  );
}