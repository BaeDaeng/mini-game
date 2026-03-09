import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Matter from 'matter-js';
import './suika-game.css';

// Vite의 BASE_URL은 기본적으로 '/'로 끝납니다.
const PUBLIC_URL = import.meta.env.BASE_URL;

// 🔥 [모바일 대응]: 게임의 내부 논리적 해상도를 정의합니다. (2:3 비율)
const GAME_LOGICAL_WIDTH = 400;
const GAME_LOGICAL_HEIGHT = 600;

const FRUITS = [
  { name: '체리', radius: 15, img: `${PUBLIC_URL}suika-images/cherry.png`, score: 2 },
  { name: '딸기', radius: 25, img: `${PUBLIC_URL}suika-images/strawberry.png`, score: 4 },
  { name: '키위', radius: 35, img: `${PUBLIC_URL}suika-images/kiwi.png`, score: 8 },
  { name: '귤',   radius: 45, img: `${PUBLIC_URL}suika-images/tangerine.png`, score: 16 },
  { name: '사과', radius: 55, img: `${PUBLIC_URL}suika-images/apple.png`, score: 32 },
  { name: '배',   radius: 65, img: `${PUBLIC_URL}suika-images/pear.png`, score: 64 },
  { name: '코코넛', radius: 80, img: `${PUBLIC_URL}suika-images/coconut.png`, score: 128 },
  { name: '호박', radius: 100, img: `${PUBLIC_URL}suika-images/pumpkin.png`, score: 256 },
];

const SuikaGame = () => {
  const navigate = useNavigate();
  const sceneRef = useRef(null);
  const engineRef = useRef(Matter.Engine.create());
  const runnerRef = useRef(Matter.Runner.create());
  
  const [score, setScore] = useState(0);
  const [nextFruitIndex, setNextFruitIndex] = useState(0); 
  const [isGameOver, setIsGameOver] = useState(false);
  
  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);
  const canDropRef = useRef(true); 
  const timerRef = useRef(null); 
  
  const nextFruitIndexRef = useRef(0);

  const fullRestartGame = () => {
    Matter.World.clear(engineRef.current.world);
    Matter.Engine.clear(engineRef.current);
    
    // 🔥 [수정됨]: 정의된 해상도 상수를 사용합니다.
    const width = GAME_LOGICAL_WIDTH;
    const height = GAME_LOGICAL_HEIGHT;
    const wallOptions = { isStatic: true, render: { fillStyle: 'transparent' } };
    
    const ground = Matter.Bodies.rectangle(width / 2, height, width, 60, wallOptions);
    const leftWall = Matter.Bodies.rectangle(0, height / 2, 60, height, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width, height / 2, 60, height, wallOptions);
    
    Matter.World.add(engineRef.current.world, [ground, leftWall, rightWall]);

    scoreRef.current = 0;
    setScore(0);
    setIsGameOver(false);
    isGameOverRef.current = false;

    const initialFruit = Math.floor(Math.random() * 3);
    setNextFruitIndex(initialFruit);
    nextFruitIndexRef.current = initialFruit;
    
    Matter.Runner.run(runnerRef.current, engineRef.current);
  };

  useEffect(() => {
    const currentScene = sceneRef.current; 
    const { Engine, Render, Runner, World, Bodies, Events } = Matter;
    const engine = engineRef.current;
    const runner = runnerRef.current;
    
    // 🔥 [수정됨]: 정의된 해상도 상수를 사용합니다.
    const width = GAME_LOGICAL_WIDTH;
    const height = GAME_LOGICAL_HEIGHT;
    const DEADLINE_Y = 120; 

    const render = Render.create({
      element: currentScene,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: '#ffeaa7',
        // 🔥 [모바일 대응 필수]: 픽셀 밀도가 높은 모바일 기기에서도 선명하게 보이도록 설정
        pixelRatio: window.devicePixelRatio || 1
      }
    });

    const initWalls = () => {
      const wallOptions = { isStatic: true, render: { fillStyle: 'transparent' } };
      const ground = Bodies.rectangle(width / 2, height, width, 60, wallOptions);
      const leftWall = Bodies.rectangle(0, height / 2, 60, height, wallOptions);
      const rightWall = Bodies.rectangle(width, height / 2, 60, height, wallOptions);
      World.add(engine.world, [ground, leftWall, rightWall]);
    };
    initWalls(); 

    const addFruit = (x, y, level) => {
      const fruit = FRUITS[level];
      
      // 🔥 [해결책]: 이미지 시각적 확대 비율 설정
      // 1.0보다 큰 값을 넣으면 이미지가 물리적인 원보다 커집니다.
      // 이미지의 여백이 많을수록 이 값을 키워주세요 (추천: 1.15 ~ 1.3)
      const VISUAL_SCALE_MULTIPLIER = 1.2; 

      // 기존 스케일에 확대 비율을 곱해줍니다.
      const scale = ((fruit.radius * 2) / 512) * VISUAL_SCALE_MULTIPLIER; 

      // 물리 엔진의 반지름(fruit.radius)은 건드리지 않고 그대로 사용합니다.
      const body = Bodies.circle(x, y, fruit.radius, {
        label: `${level}`,
        restitution: 0.3,     // 탄성 
        friction: 0.01,        // 마찰력
        density: 0.002 * (level + 1),   // 무게
        isMerged: false, 
        render: {
          sprite: {
            texture: fruit.img,
            xScale: scale, // 확대된 스케일 적용
            yScale: scale, // 확대된 스케일 적용
          }
        }
      });
      World.add(engine.world, body);
    };

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((collision) => {
        const { bodyA, bodyB } = collision;

        if (bodyA.label === bodyB.label && bodyA.label !== 'Rectangle Body') {
          if (bodyA.isMerged || bodyB.isMerged) return;
          
          const level = parseInt(bodyA.label);
          
          if (level < FRUITS.length - 1) {
            bodyA.isMerged = true;
            bodyB.isMerged = true;
            
            World.remove(engine.world, [bodyA, bodyB]);
            
            const midX = (bodyA.position.x + bodyB.position.x) / 2;
            const midY = (bodyA.position.y + bodyB.position.y) / 2;
            
            addFruit(midX, midY, level + 1);

            scoreRef.current += FRUITS[level + 1].score;
            setScore(scoreRef.current);
          } else {
            bodyA.isMerged = true;
            bodyB.isMerged = true;
            World.remove(engine.world, [bodyA, bodyB]);
            scoreRef.current += 1000;
            setScore(scoreRef.current);
          }
        }
      });
    });

    Events.on(engine, 'afterUpdate', () => {
      if (isGameOverRef.current) return;

      const bodies = Matter.Composite.allBodies(engine.world);
      let isOverDeadline = false;

      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        if (body.label !== 'Rectangle Body') {
          if (body.position.y - body.circleRadius < DEADLINE_Y && body.velocity.y > -0.5 && body.velocity.y < 0.5) {
            isOverDeadline = true;
            break;
          }
        }
      }

      if (isOverDeadline) {
        if (!timerRef.current) {
          timerRef.current = setTimeout(() => {
            isGameOverRef.current = true;
            setIsGameOver(true);
            Runner.stop(runner);
          }, 2000);
        }
      } else {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    });

    Render.run(render);
    Runner.run(runner, engine);

    // 🔥 [반응형 클릭 처리 핵심]: 캔버스 크기가 줄었을 때 마우스 좌표를 게임 내부 좌표로 변환
    const handleMouseClick = (e) => {
      if (isGameOverRef.current || !canDropRef.current) return;

      // 1. 현재 화면에 보이는 캔버스 엘리먼트 가져오기
      const canvas = currentScene.querySelector('canvas');
      if (!canvas) return;

      // 2. 캔버스의 실제 화면상 위치와 크기 정보를 가져옴
      const rect = canvas.getBoundingClientRect();
      
      // 3. 화면상의 클릭 X 좌표 계산 (캔버스 내부 상대 좌표)
      const clickXVisible = e.clientX - rect.left;

      // 4. 비율 계산: (내부 논리 너비 / 현재 화면에 보이는 실제 너비)
      const scaleX = GAME_LOGICAL_WIDTH / rect.width;

      // 5. 실제 게임 내부 좌표로 변환
      let clickXLogical = clickXVisible * scaleX;
      
      const currentLevel = nextFruitIndexRef.current;
      const currentRadius = FRUITS[currentLevel].radius;
      
      // 변환된 내부 좌표를 기준으로 벽 충돌 방지 계산
      if (clickXLogical < currentRadius) clickXLogical = currentRadius;
      if (clickXLogical > width - currentRadius) clickXLogical = GAME_LOGICAL_WIDTH - currentRadius;

      // 변환된 내부 좌표에 과일 생성
      addFruit(clickXLogical, 40, currentLevel); 

      const nextLevel = Math.floor(Math.random() * 3);
      setNextFruitIndex(nextLevel);
      nextFruitIndexRef.current = nextLevel;

      canDropRef.current = false;
      setTimeout(() => {
        canDropRef.current = true;
      }, 800);
    };

    currentScene.addEventListener('click', handleMouseClick);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world);
      Engine.clear(engine);
      render.canvas.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (currentScene) currentScene.removeEventListener('click', handleMouseClick);
    };
  }, []);

  // 🔥 [구조 수정됨]: CSS 처리를 수월하게 하기 위해 `game-canvas-wrapper` 추가
  return (
    <div className="suika-container">
      <button className="back-btn" onClick={() => navigate('/')}>⬅️ 메인으로</button>

      <div className="suika-header">
        <h1>🎃 호박 게임</h1>
        <div className="score-board">SCORE: {score}</div>
      </div>

      <div className="game-wrapper">
        <div className="game-canvas-wrapper">
          <div className="next-fruit-indicator">
            <span>Next: </span>
            <img src={FRUITS[nextFruitIndex].img} alt="다음" />
          </div>
          
          <div className="deadline"></div>

          <div ref={sceneRef} className="suika-canvas" />

          {isGameOver && (
            <div className="game-over-overlay">
              <h2>Game Over!</h2>
              <p>최종 점수: {score}점</p>
              <button className="restart-btn" onClick={fullRestartGame}>다시 하기</button>
            </div>
          )}
        </div>
        
        <div className="evolution-guide">
          {FRUITS.map((fruit, idx) => (
            <React.Fragment key={fruit.name}>
              <div className="guide-item"><img src={fruit.img} alt={fruit.name} /></div>
              {idx < FRUITS.length - 1 && <span className="arrow">▶</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuikaGame;