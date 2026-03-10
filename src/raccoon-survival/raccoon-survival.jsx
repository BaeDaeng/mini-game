// @ts-nocheck
// eslint-disable
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './raccoon-survival.css';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const SURVIVAL_TIME_LIMIT = 300; 

const ASSETS = {
  bg: '/survival-image/background.png',
  player: '/survival-image/raccoon.png',
  enemy1: '/survival-image/enemy1.png',
  enemy2: '/survival-image/enemy2.png',
  enemy3: '/survival-image/enemy3.png',
};

const UPGRADE_POOL = [
  { id: 'dmg', name: '공격력 증가', desc: '총알 데미지가 10 증가합니다.' },
  { id: 'multi', name: '병렬 발사 (멀티샷)', desc: '한 번에 발사되는 총알이 1개 늘어납니다.' },
  { id: 'pierce', name: '직렬 발사 (관통력)', desc: '총알이 적을 1번 더 관통합니다.' },
  { id: 'fireRate', name: '연사 속도 증가', desc: '무기 쿨타임이 15% 감소합니다.' },
  { id: 'speed', name: '이동 속도 증가', desc: '라쿤의 발이 빨라집니다.' },
  { id: 'maxHp', name: '최대 체력 증가', desc: '최대 체력이 20 증가하고 일부 회복합니다.' },
  { id: 'regen', name: '재생력', desc: '5초마다 체력을 1씩 회복합니다.' },
];

const SurvivalRaccoon = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const imagesRef = useRef({});

  const [gameState, setGameState] = useState('START'); 
  const [uiState, setUiState] = useState({ hp: 100, maxHp: 100, exp: 0, maxExp: 10, level: 1, time: 0, kills: 0 });
  const [upgradeChoices, setUpgradeChoices] = useState([]);
  const [showStartMessage, setShowStartMessage] = useState(false);

  const engine = useRef({
    isPlaying: false, 
    triggerEasterEgg: false,
    joystick: { active: false, id: null, originX: 0, originY: 0, currentX: 0, currentY: 0, dx: 0, dy: 0 },
    keys: { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false },
    lastTime: 0,
    elapsed: 0,
    player: { x: 0, y: 0, speed: 150, hp: 100, maxHp: 100, exp: 0, maxExp: 10, level: 1, kills: 0, regenTimer: 0 },
    weapons: [
      { id: 'basic_gun', cooldown: 1.0, timer: 0, damage: 20, speed: 400, multi: 1, pierce: 1 }
    ],
    enemies: [],
    bullets: [],
    expGems: [],
    spawnTimer: 0,
  });

  useEffect(() => {
    Object.entries(ASSETS).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      imagesRef.current[key] = img;
    });

    const handleKeyDown = (e) => { 
      engine.current.keys[e.key] = true; 
      if (e.key === '7') engine.current.triggerEasterEgg = true;
    };
    const handleKeyUp = (e) => { engine.current.keys[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const startGame = () => {
    engine.current = {
      ...engine.current,
      isPlaying: true, 
      triggerEasterEgg: false,
      joystick: { active: false, id: null, originX: 0, originY: 0, currentX: 0, currentY: 0, dx: 0, dy: 0 },
      lastTime: window.performance.now(),
      elapsed: 0,
      player: { x: 0, y: 0, speed: 150, hp: 100, maxHp: 100, exp: 0, maxExp: 10, level: 1, kills: 0, regenTimer: 0 },
      weapons: [{ id: 'basic_gun', cooldown: 1.0, timer: 0, damage: 20, speed: 400, multi: 1, pierce: 1 }],
      enemies: [],
      bullets: [],
      expGems: [],
      spawnTimer: 0,
    };
    setUiState({ hp: 100, maxHp: 100, exp: 0, maxExp: 10, level: 1, time: 0, kills: 0 });
    setGameState('PLAYING');
    setShowStartMessage(true);
    setTimeout(() => setShowStartMessage(false), 5000);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // ⏸ 일시정지 함수
  const pauseGame = () => {
    engine.current.isPlaying = false;
    setGameState('PAUSED');
  };

  // ▶️ 계속하기 함수
  const resumeGame = () => {
    engine.current.isPlaying = true;
    setGameState('PLAYING');
    engine.current.lastTime = window.performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const getRandomUpgrades = () => {
    const shuffled = [...UPGRADE_POOL].sort(() => 0.5 - window.Math.random());
    return shuffled.slice(0, 3);
  };

  const selectUpgrade = (id) => {
    const p = engine.current.player;
    const w = engine.current.weapons[0]; 

    switch (id) {
      case 'dmg': w.damage += 10; break;
      case 'multi': w.multi += 1; break;
      case 'pierce': w.pierce += 1; break;
      case 'fireRate': w.cooldown = window.Math.max(0.2, w.cooldown * 0.85); break;
      case 'speed': p.speed += 30; break;
      case 'maxHp': p.maxHp += 20; p.hp += 20; break;
      case 'regen': p.regenRate = (p.regenRate || 0) + 1; break;
      default: break;
    }

    engine.current.isPlaying = true; 
    engine.current.joystick.active = false;
    setGameState('PLAYING');
    engine.current.lastTime = window.performance.now(); 
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const handleTouchStart = (e) => {
    const touch = e.changedTouches[0];
    const eng = engine.current;
    eng.joystick.active = true;
    eng.joystick.originX = touch.clientX;
    eng.joystick.originY = touch.clientY;
    eng.joystick.currentX = touch.clientX;
    eng.joystick.currentY = touch.clientY;
    eng.joystick.id = touch.identifier;
  };

  const handleTouchMove = (e) => {
    const eng = engine.current;
    if (!eng.joystick.active) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === eng.joystick.id) {
        eng.joystick.currentX = e.changedTouches[i].clientX;
        eng.joystick.currentY = e.changedTouches[i].clientY;
        
        let dx = eng.joystick.currentX - eng.joystick.originX;
        let dy = eng.joystick.currentY - eng.joystick.originY;
        const dist = window.Math.hypot(dx, dy);
        const maxDist = 40; 
        if (dist > 0) {
          eng.joystick.dx = dx / window.Math.max(dist, maxDist);
          eng.joystick.dy = dy / window.Math.max(dist, maxDist);
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    const eng = engine.current;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === eng.joystick.id) {
        eng.joystick.active = false;
        eng.joystick.dx = 0;
        eng.joystick.dy = 0;
      }
    }
  };

  const spawnEnemy = (deltaTime) => {
    const eng = engine.current;
    eng.spawnTimer += deltaTime;
    
    const spawnRate = window.Math.max(0.15, 1.0 - (eng.elapsed / 250) * 0.85);

    if (eng.spawnTimer >= spawnRate) {
      eng.spawnTimer = 0;
      const angle = window.Math.random() * window.Math.PI * 2;
      const dist = 500; 
      
      const hpMultiplier = 1 + (eng.elapsed / 45); 
      const speedMultiplier = 1 + (eng.elapsed / 300) * 0.4;

      const types = ['enemy1', 'enemy2', 'enemy3'];
      const type = types[window.Math.floor(window.Math.random() * types.length)];
      
      let baseHp = 30;
      let speed = 60 * speedMultiplier;
      if (type === 'enemy2') { baseHp = 50; speed = 40 * speedMultiplier; } 
      if (type === 'enemy3') { baseHp = 20; speed = 90 * speedMultiplier; } 

      eng.enemies.push({
        x: eng.player.x + window.Math.cos(angle) * dist,
        y: eng.player.y + window.Math.sin(angle) * dist,
        hp: baseHp * hpMultiplier,
        maxHp: baseHp * hpMultiplier,
        speed: speed,
        type: type,
        damage: 10
      });
    }
  };

  const fireWeapons = (deltaTime) => {
    const eng = engine.current;
    if (eng.enemies.length === 0) return;

    let nearestEnemy = null;
    let minDist = Infinity;
    eng.enemies.forEach(e => {
      const dist = window.Math.hypot(e.x - eng.player.x, e.y - eng.player.y);
      if (dist < minDist) { minDist = dist; nearestEnemy = e; }
    });

    if (!nearestEnemy) return;

    eng.weapons.forEach(w => {
      w.timer += deltaTime;
      if (w.timer >= w.cooldown) {
        w.timer = 0;
        const angleToEnemy = window.Math.atan2(nearestEnemy.y - eng.player.y, nearestEnemy.x - eng.player.x);
        
        const spread = 0.2; 
        const startAngle = angleToEnemy - (spread * (w.multi - 1)) / 2;

        for (let i = 0; i < w.multi; i++) {
          const finalAngle = startAngle + (spread * i);
          eng.bullets.push({
            x: eng.player.x,
            y: eng.player.y,
            vx: window.Math.cos(finalAngle) * w.speed,
            vy: window.Math.sin(finalAngle) * w.speed,
            damage: w.damage,
            pierce: w.pierce,
            lifeTime: 2.0 
          });
        }
      }
    });
  };

  const gameLoop = (time) => {
    if (!engine.current.isPlaying) return;
    const eng = engine.current;

    if (eng.triggerEasterEgg) {
      eng.triggerEasterEgg = false;
      eng.isPlaying = false;
      setGameState('GAME_OVER'); 
      updateUiState();
      return;
    }

    const deltaTime = (time - eng.lastTime) / 1000;
    eng.lastTime = time;
    eng.elapsed += deltaTime;

    if (eng.elapsed >= SURVIVAL_TIME_LIMIT) {
      eng.isPlaying = false; 
      setGameState('VICTORY');
      updateUiState();
      return;
    }

    const p = eng.player;

    let dx = 0; let dy = 0;
    if (eng.joystick.active) {
      dx = eng.joystick.dx;
      dy = eng.joystick.dy;
    } else {
      if (eng.keys.w || eng.keys.ArrowUp) dy -= 1;
      if (eng.keys.s || eng.keys.ArrowDown) dy += 1;
      if (eng.keys.a || eng.keys.ArrowLeft) dx -= 1;
      if (eng.keys.d || eng.keys.ArrowRight) dx += 1;
      if (dx !== 0 && dy !== 0) {
        const length = window.Math.hypot(dx, dy);
        dx /= length; dy /= length;
      }
    }
    
    p.x += dx * p.speed * deltaTime;
    p.y += dy * p.speed * deltaTime;

    if (p.regenRate) {
      p.regenTimer += deltaTime;
      if (p.regenTimer >= 5) {
        p.regenTimer = 0;
        p.hp = window.Math.min(p.maxHp, p.hp + p.regenRate);
      }
    }

    spawnEnemy(deltaTime);
    for (let i = eng.enemies.length - 1; i >= 0; i--) {
      const e = eng.enemies[i];
      const angle = window.Math.atan2(p.y - e.y, p.x - e.x);
      e.x += window.Math.cos(angle) * e.speed * deltaTime;
      e.y += window.Math.sin(angle) * e.speed * deltaTime;

      if (window.Math.hypot(e.x - p.x, e.y - p.y) < 30) {
        p.hp -= e.damage * deltaTime; 
        if (p.hp <= 0) {
          eng.isPlaying = false; 
          setGameState('GAME_OVER');
          updateUiState();
          return;
        }
      }
    }

    fireWeapons(deltaTime);
    for (let i = eng.bullets.length - 1; i >= 0; i--) {
      const b = eng.bullets[i];
      b.x += b.vx * deltaTime;
      b.y += b.vy * deltaTime;
      b.lifeTime -= deltaTime;

      if (b.lifeTime <= 0) { eng.bullets.splice(i, 1); continue; }

      for (let j = eng.enemies.length - 1; j >= 0; j--) {
        const e = eng.enemies[j];
        if (window.Math.hypot(b.x - e.x, b.y - e.y) < 25) {
          e.hp -= b.damage;
          b.pierce -= 1;
          
          if (e.hp <= 0) {
            eng.expGems.push({ x: e.x, y: e.y, value: 5 }); 
            eng.enemies.splice(j, 1);
            p.kills += 1;
          }
          if (b.pierce <= 0) {
            eng.bullets.splice(i, 1);
            break; 
          }
        }
      }
    }

    const pickupRadius = 80;
    for (let i = eng.expGems.length - 1; i >= 0; i--) {
      const gem = eng.expGems[i];
      if (window.Math.hypot(gem.x - p.x, gem.y - p.y) < pickupRadius) {
        p.exp += gem.value;
        eng.expGems.splice(i, 1);

        if (p.exp >= p.maxExp) {
          p.exp -= p.maxExp;
          p.maxExp = window.Math.floor(p.maxExp * 1.5);
          p.level += 1;
          setUpgradeChoices(getRandomUpgrades());
          eng.isPlaying = false; 
          setGameState('LEVEL_UP'); 
          updateUiState();
          return; 
        }
      }
    }

    drawGame();
    updateUiState();

    if (engine.current.isPlaying) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const drawGame = () => {
    const ctx = canvasRef.current.getContext('2d');
    const eng = engine.current;
    const { player, enemies, bullets, expGems } = eng;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.save();
    const camX = GAME_WIDTH / 2 - player.x;
    const camY = GAME_HEIGHT / 2 - player.y;
    ctx.translate(camX, camY);

    const bgImg = imagesRef.current.bg;
    if (bgImg && bgImg.complete) {
      const size = 256; 
      const startX = window.Math.floor((player.x - GAME_WIDTH / 2) / size) * size;
      const startY = window.Math.floor((player.y - GAME_HEIGHT / 2) / size) * size;
      
      for (let x = startX; x < player.x + GAME_WIDTH / 2 + size; x += size) {
        for (let y = startY; y < player.y + GAME_HEIGHT / 2 + size; y += size) {
          ctx.drawImage(bgImg, x, y, size, size);
        }
      }
    } else {
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(player.x - GAME_WIDTH, player.y - GAME_HEIGHT, GAME_WIDTH * 2, GAME_HEIGHT * 2);
    }

    expGems.forEach(gem => {
      ctx.fillStyle = '#00d2d3';
      ctx.beginPath();
      ctx.arc(gem.x, gem.y, 6, 0, window.Math.PI * 2);
      ctx.fill();
    });

    enemies.forEach(e => {
      const img = imagesRef.current[e.type];
      if (img && img.complete) {
        ctx.drawImage(img, e.x - 20, e.y - 20, 40, 40);
      } else {
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(e.x - 15, e.y - 15, 30, 30);
      }
      ctx.fillStyle = 'red';
      ctx.fillRect(e.x - 15, e.y - 25, 30, 4);
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(e.x - 15, e.y - 25, 30 * (e.hp / e.maxHp), 4);
    });

    bullets.forEach(b => {
      ctx.fillStyle = '#feca57';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 5, 0, window.Math.PI * 2);
      ctx.fill();
    });

    const pImg = imagesRef.current.player;
    if (pImg && pImg.complete) {
      ctx.drawImage(pImg, player.x - 24, player.y - 24, 48, 48);
    } else {
      ctx.fillStyle = '#3182f6';
      ctx.beginPath();
      ctx.arc(player.x, player.y, 20, 0, window.Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    if (eng.joystick.active) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;
      
      const jx = (eng.joystick.originX - rect.left) * scaleX;
      const jy = (eng.joystick.originY - rect.top) * scaleY;
      const cx = (eng.joystick.currentX - rect.left) * scaleX;
      const cy = (eng.joystick.currentY - rect.top) * scaleY;
      
      let dx = cx - jx;
      let dy = cy - jy;
      const dist = window.Math.hypot(dx, dy);
      const maxRadius = 50 * scaleX; 
      
      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(jx, jy, maxRadius, 0, window.Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(jx + dx, jy + dy, 20 * scaleX, 0, window.Math.PI * 2);
      ctx.fillStyle = '#3182f6';
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  };

  const updateUiState = () => {
    const p = engine.current.player;
    setUiState({
      hp: window.Math.max(0, p.hp),
      maxHp: p.maxHp,
      exp: p.exp,
      maxExp: p.maxExp,
      level: p.level,
      time: engine.current.elapsed,
      kills: p.kills,
    });
  };

  const formatTime = (seconds) => {
    const m = window.Math.floor(seconds / 60);
    const s = window.Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="raccoon-container">
      {gameState === 'PLAYING' && (
        <button className="pause-btn" onClick={pauseGame}>⏸</button>
      )}

      {(gameState === 'PLAYING' || gameState === 'LEVEL_UP' || gameState === 'PAUSED') && (
        <div className="hud">
          <div className="timer">{formatTime(uiState.time)} / 05:00</div>
          
          <div className="status-bars">
            <div className="bar-bg">
              <div className="hp-bar" style={{ width: `${(uiState.hp / uiState.maxHp) * 100}%` }}></div>
              <span className="bar-text">HP {window.Math.floor(uiState.hp)}/{uiState.maxHp}</span>
            </div>
            <div className="bar-bg">
              <div className="exp-bar" style={{ width: `${(uiState.exp / uiState.maxExp) * 100}%` }}></div>
              <span className="bar-text">Lv.{uiState.level} ({window.Math.floor((uiState.exp / uiState.maxExp) * 100)}%)</span>
            </div>
          </div>
          <div className="kill-count">💀 {uiState.kills} Kills</div>
        </div>
      )}

      {showStartMessage && <div className="start-alert">5분간 살아남아라!</div>}

      <canvas 
        ref={canvasRef} 
        width={GAME_WIDTH} 
        height={GAME_HEIGHT} 
        className="game-canvas"
        style={{ touchAction: 'none' }} 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />

      {gameState === 'START' && (
        <div className="overlay start-screen">
          <button className="back-btn" onClick={() => navigate('/')}>⬅️ 메인으로</button>
          <h1>🦝 라쿤 서바이벌!</h1>
          <p>사방에서 몰려오는 적들을 피해 5분 동안 살아남으세요.</p>
          <button className="action-btn" onClick={startGame}>게임 시작</button>
        </div>
      )}

      {gameState === 'LEVEL_UP' && (
        <div className="overlay level-up-screen">
          <h2>LEVEL UP!</h2>
          <p>업그레이드를 선택하세요</p>
          <div className="upgrade-cards">
            {upgradeChoices.map(u => (
              <div key={u.id} className="card" onClick={() => selectUpgrade(u.id)}>
                <h3>{u.name}</h3>
                <p>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === 'PAUSED' && (
        <div className="overlay pause-screen">
          <h2>⏸ 일시정지</h2>
          <p>잠시 휴식 중입니다...</p>
          <div className="btn-group vertical">
            <button className="action-btn" onClick={resumeGame}>계속하기</button>
            <button className="action-btn" onClick={startGame}>다시하기</button>
            <button className="action-btn secondary" onClick={() => navigate('/')}>돌아가기</button>
          </div>
        </div>
      )}

      {(gameState === 'GAME_OVER' || gameState === 'VICTORY') && (
        <div className="overlay end-screen">
          <h1 style={{ color: gameState === 'VICTORY' ? '#2ed573' : '#ff4757' }}>
            {gameState === 'VICTORY' ? '🏆 생존 성공!' : '💀 게임 오버'}
          </h1>
          <div className="stats-box">
            <p>생존 시간: <strong>{formatTime(uiState.time)}</strong></p>
            <p>물리친 적: <strong>{uiState.kills}</strong> 마리</p>
            <p>최종 레벨: <strong>Lv.{uiState.level}</strong></p>
          </div>
          <div className="btn-group">
            <button className="action-btn" onClick={startGame}>다시 하기</button>
            <button className="action-btn secondary" onClick={() => navigate('/')}>메인으로</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurvivalRaccoon;