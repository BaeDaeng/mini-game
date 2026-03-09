import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './stack-the-block.css';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const BLOCK_HEIGHT = 30;
const PERFECT_TOLERANCE = 5; // 이 픽셀 오차 이내면 '퍼펙트'로 판정

const StackTheBlock = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const perfectTimeoutRef = useRef(null); // 퍼펙트 타이머 관리용

  // 화면에 렌더링할 상태 (UI용)
  const [score, setScore] = useState(0);
  const [stackCount, setStackCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showPerfect, setShowPerfect] = useState(false); // 🔥 퍼펙트 글씨 상태

  // 게임 로직 상태 (React 리렌더링 없이 Canvas 업데이트용)
  const gameState = useRef({
    blocks: [],       
    debris: [],       
    movingBlock: null, 
    cameraY: 0,       
    score: 0,
    stackCount: 0,
    gameOver: false,
  });

  // 게임 초기화
  const initGame = () => {
    const startWidth = 200;
    gameState.current = {
      blocks: [{ x: GAME_WIDTH / 2 - startWidth / 2, y: GAME_HEIGHT - BLOCK_HEIGHT * 2, w: startWidth, color: '#34495e' }],
      debris: [],
      movingBlock: createNextBlock(startWidth, GAME_HEIGHT - BLOCK_HEIGHT * 3),
      cameraY: 0,
      score: 0,
      stackCount: 0,
      gameOver: false,
    };
    setScore(0);
    setStackCount(0);
    setIsGameOver(false);
    setShowPerfect(false);
  };

  // 🔥 멈춰있던 게임 루프를 다시 깨우는 확실한 재시작 함수
  const restartGame = () => {
    initGame();
    if (perfectTimeoutRef.current) clearTimeout(perfectTimeoutRef.current);
    cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // 다음 움직이는 블록 생성
  const createNextBlock = (width, yPos) => {
    const randomSpeed = (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1);
    const startX = randomSpeed > 0 ? 0 : GAME_WIDTH - width;

    return {
      x: startX,
      y: yPos,
      w: width,
      speed: randomSpeed,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    };
  };

  // 게임 루프
  const gameLoop = () => {
    if (gameState.current.gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = gameState.current;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const targetCameraY = Math.max(0, (state.stackCount - 10) * BLOCK_HEIGHT);
    state.cameraY += (targetCameraY - state.cameraY) * 0.1;

    ctx.save();
    ctx.translate(0, state.cameraY);

    state.blocks.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, BLOCK_HEIGHT);
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.strokeRect(b.x, b.y, b.w, BLOCK_HEIGHT);
    });

    state.debris.forEach((d, index) => {
      ctx.fillStyle = d.color;
      ctx.fillRect(d.x, d.y, d.w, BLOCK_HEIGHT);
      d.y += 10; 
      if (d.y > GAME_HEIGHT + state.cameraY) state.debris.splice(index, 1);
    });

    if (state.movingBlock) {
      const mb = state.movingBlock;
      mb.x += mb.speed;

      if (mb.x < 0) {
        mb.x = 0;
        mb.speed *= -1;
      } else if (mb.x + mb.w > GAME_WIDTH) {
        mb.x = GAME_WIDTH - mb.w;
        mb.speed *= -1;
      }

      ctx.fillStyle = mb.color;
      ctx.fillRect(mb.x, mb.y, mb.w, BLOCK_HEIGHT);
    }

    ctx.restore();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // 블록 떨어뜨리기 (클릭 이벤트)
  const handleDrop = () => {
    const state = gameState.current;
    if (state.gameOver || !state.movingBlock) return;

    const topBlock = state.blocks[state.blocks.length - 1];
    const moving = state.movingBlock;

    const deltaX = moving.x - topBlock.x;
    const isPerfect = Math.abs(deltaX) <= PERFECT_TOLERANCE;
    let overlap = topBlock.w - Math.abs(deltaX);

    if (overlap <= 0) {
      state.gameOver = true;
      setIsGameOver(true);
      return;
    }

    let newWidth, newX;

    if (isPerfect) {
      // 🔥 퍼펙트 타이밍 성공 시
      newWidth = topBlock.w;
      newX = topBlock.x;
      state.score += 300;
      
      // 글씨 1초간 띄우기
      setShowPerfect(true);
      if (perfectTimeoutRef.current) clearTimeout(perfectTimeoutRef.current);
      perfectTimeoutRef.current = setTimeout(() => {
        setShowPerfect(false);
      }, 1000);

    } else {
      newWidth = overlap;
      newX = Math.max(moving.x, topBlock.x);
      state.score += Math.floor(newWidth);
      
      const debrisX = deltaX > 0 ? topBlock.x + topBlock.w : moving.x;
      const debrisW = Math.abs(deltaX);
      state.debris.push({ x: debrisX, y: moving.y, w: debrisW, color: moving.color });
    }

    state.blocks.push({ x: newX, y: moving.y, w: newWidth, color: moving.color });
    state.stackCount += 1;

    setScore(state.score);
    setStackCount(state.stackCount);

    const nextY = moving.y - BLOCK_HEIGHT;
    state.movingBlock = createNextBlock(newWidth, nextY);
  };

  useEffect(() => {
    initGame();
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(requestRef.current);
      if (perfectTimeoutRef.current) clearTimeout(perfectTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="stack-container" onClick={handleDrop}>
      <button className="back-btn" onClick={(e) => { e.stopPropagation(); navigate('/'); }}>
        ⬅️ 메인으로
      </button>

      <div className="stack-header">
        <h1>무한 쌓기</h1>
        <div className="info-bar">
          <span className="score">점수: {score}</span>
          <span className="stack">층수: {stackCount}층</span>
        </div>
      </div>

      <div className="canvas-wrapper">
        {/* 🔥 퍼펙트 타이밍 UI 추가 */}
        {showPerfect && <div className="perfect-text">퍼펙트 타이밍!</div>}

        <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} />

        {isGameOver && (
          <div className="game-over-screen">
            <h2>게임 종료!</h2>
            <div className="final-stats">
              <p>최종 점수: <strong>{score}</strong> 점</p>
              <p>도달 층수: <strong>{stackCount}</strong> 층</p>
            </div>
            <p className="praise">
              {stackCount > 30 ? "미친 피지컬이네요! 😱" : stackCount > 15 ? "꽤 하시는데요? 😎" : "아직 감을 못 잡으셨군요! 🤭"}
            </p>
            {/* 🔥 재시작 함수 변경 */}
            <button className="retry-btn" onClick={(e) => { e.stopPropagation(); restartGame(); }}>
              다시 하기
            </button>
          </div>
        )}
      </div>
      {!isGameOver && <p className="hint">화면을 탭해서 블록을 떨어뜨리세요!</p>}
    </div>
  );
};

export default StackTheBlock;