import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Matter from 'matter-js';
import './suika-game.css';

import cherryImg from '../assets/suika-images/cherry.png';
import strawberryImg from '../assets/suika-images/strawberry.png';
import kiwiImg from '../assets/suika-images/kiwi.png';
import tangerineImg from '../assets/suika-images/tangerine.png';
import appleImg from '../assets/suika-images/apple.png';
import pearImg from '../assets/suika-images/pear.png';
import coconutImg from '../assets/suika-images/coconut.png';
import pumpkinImg from '../assets/suika-images/pumpkin.png';

const FRUITS = [
  { name: '체리', radius: 15, img: cherryImg, score: 2 },
  { name: '딸기', radius: 25, img: strawberryImg, score: 4 },
  { name: '키위', radius: 35, img: kiwiImg, score: 8 },
  { name: '귤',   radius: 45, img: tangerineImg, score: 16 },
  { name: '사과', radius: 55, img: appleImg, score: 32 },
  { name: '배',   radius: 65, img: pearImg, score: 64 },
  { name: '코코넛', radius: 80, img: coconutImg, score: 128 },
  { name: '호박', radius: 100, img: pumpkinImg, score: 256 },
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
  
  // 🔥 [버그 수정 핵심]: 다음 과일 인덱스를 안전하게 추적하기 위한 Ref 추가
  const nextFruitIndexRef = useRef(0);

  const fullRestartGame = () => {
    Matter.World.clear(engineRef.current.world);
    Matter.Engine.clear(engineRef.current);
    
    const width = 400;
    const height = 600;
    const wallOptions = { isStatic: true, render: { fillStyle: 'transparent' } };
    const ground = Matter.Bodies.rectangle(width / 2, height, width, 60, wallOptions);
    const leftWall = Matter.Bodies.rectangle(0, height / 2, 60, height, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width, height / 2, 60, height, wallOptions);
    
    Matter.World.add(engineRef.current.world, [ground, leftWall, rightWall]);

    scoreRef.current = 0;
    setScore(0);
    setIsGameOver(false);
    isGameOverRef.current = false;

    // 초기 랜덤 과일 세팅
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
    
    const width = 400;
    const height = 600;
    const DEADLINE_Y = 120; 

    const render = Render.create({
      element: currentScene,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: '#ffeaa7',
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
      const scale = (fruit.radius * 2) / 512; 

      const body = Bodies.circle(x, y, fruit.radius, {
        label: `${level}`,
        restitution: 0.3,      // 탄성
        friction: 0.02,      // 마찰력
        density: 0.002 * (level + 1),   // 무게
        isMerged: false, 
        render: {
          sprite: {
            texture: fruit.img,
            xScale: scale,
            yScale: scale,
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

    const handleMouseClick = (e) => {
      if (isGameOverRef.current || !canDropRef.current) return;

      const rect = currentScene.getBoundingClientRect();
      let clickX = e.clientX - rect.left;
      
      // 🔥 [버그 수정 핵심]: Ref를 사용해 최신 상태를 안전하게 읽어옴
      const currentLevel = nextFruitIndexRef.current;
      const currentRadius = FRUITS[currentLevel].radius;
      
      if (clickX < currentRadius) clickX = currentRadius;
      if (clickX > width - currentRadius) clickX = width - currentRadius;

      // 1. 과일 떨어뜨리기 (상태 업데이트 함수 밖으로 꺼냄)
      addFruit(clickX, 40, currentLevel); 

      // 2. 다음 과일 세팅하기
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

  return (
    <div className="suika-container">
      <button className="back-btn" onClick={() => navigate('/')}>⬅️ 메인으로</button>

      <div className="suika-header">
        <h1>🎃 호박 게임</h1>
        <div className="score-board">SCORE: {score}</div>
      </div>

      <div className="game-wrapper">
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