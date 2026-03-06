import React, { useRef, useEffect, useState } from 'react';
import './brock-brick.css';

const App = () => {
  const canvasRef = useRef(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const isHoveringRestartRef = useRef(false);

  const gameState = useRef({
    isPlaying: true,
    ball: { x: 240, y: 280, dx: 4, dy: -4, radius: 8, speed: 5.6 },
    paddle: { height: 10, width: 80, x: 200 },
    bricks: [],
    brickInfo: { rowCount: 4, columnCount: 6, width: 65, height: 20, padding: 10, offsetTop: 30, offsetLeft: 20 }
  });

  const initBricks = () => {
    const state = gameState.current;
    state.bricks = [];
    for (let c = 0; c < state.brickInfo.columnCount; c++) {
      state.bricks[c] = [];
      for (let r = 0; r < state.brickInfo.rowCount; r++) {
        state.bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  };

  const fullRestartGame = () => {
    const state = gameState.current;
    initBricks();
    state.paddle.x = 200;
    state.ball = { x: 240, y: 280, dx: 4, dy: -4, radius: 8, speed: 5.6 };
    state.isPlaying = true;
    setIsCleared(false);
    setIsGameOver(false);
    setAttempts(1);
    setTimeElapsed(0); 
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '7') {
        gameState.current.isPlaying = false;
        setIsCleared(true);
      }
      
      if (e.code === 'Space' && isHoveringRestartRef.current) {
        e.preventDefault();
        fullRestartGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let timerId;
    if (!isGameOver && !isCleared) {
      timerId = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerId); 
  }, [isGameOver, isCleared]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    initBricks();

    const drawBall = (state) => {
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ff4757';
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = (state) => {
      ctx.beginPath();
      ctx.rect(state.paddle.x, canvas.height - state.paddle.height - 10, state.paddle.width, state.paddle.height);
      ctx.fillStyle = '#2ed573';
      ctx.fill();
      ctx.closePath();
    };

    const drawBricks = (state) => {
      const { brickInfo, bricks } = state;
      for (let c = 0; c < brickInfo.columnCount; c++) {
        for (let r = 0; r < brickInfo.rowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickInfo.width + brickInfo.padding) + brickInfo.offsetLeft;
            const brickY = r * (brickInfo.height + brickInfo.padding) + brickInfo.offsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickInfo.width, brickInfo.height);
            ctx.fillStyle = '#1e90ff';
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    };

    const collisionDetection = (state) => {
      const { brickInfo, bricks, ball } = state;
      let activeBricks = 0;

      for (let c = 0; c < brickInfo.columnCount; c++) {
        for (let r = 0; r < brickInfo.rowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            activeBricks++;
            if (
              ball.x > b.x &&
              ball.x < b.x + brickInfo.width &&
              ball.y > b.y &&
              ball.y < b.y + brickInfo.height
            ) {
              ball.dy = -ball.dy;
              b.status = 0;
              activeBricks--;
            }
          }
        }
      }

      if (activeBricks === 0 && state.isPlaying) {
        state.isPlaying = false;
        setIsCleared(true);
      }
    };

    const draw = () => {
      const state = gameState.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBricks(state);
      drawBall(state);
      drawPaddle(state);
      collisionDetection(state);

      if (state.isPlaying) {
        if (state.ball.x + state.ball.dx > canvas.width - state.ball.radius || state.ball.x + state.ball.dx < state.ball.radius) {
          state.ball.dx = -state.ball.dx;
        }
        
        if (state.ball.y + state.ball.dy < state.ball.radius) {
          state.ball.dy = -state.ball.dy;
        } 
        else if (state.ball.y + state.ball.dy > canvas.height - state.ball.radius - 10) { 
          if (state.ball.x > state.paddle.x && state.ball.x < state.paddle.x + state.paddle.width) {
            const paddleCenter = state.paddle.x + state.paddle.width / 2;
            const hitPoint = (state.ball.x - paddleCenter) / (state.paddle.width / 2);
            const maxBounceAngle = Math.PI / 3;
            const bounceAngle = hitPoint * maxBounceAngle;

            state.ball.dx = state.ball.speed * Math.sin(bounceAngle);
            state.ball.dy = -state.ball.speed * Math.cos(bounceAngle);
            
          } else if (state.ball.y + state.ball.dy > canvas.height - state.ball.radius) {
            state.isPlaying = false;
            setIsGameOver(true);
            setAttempts((prev) => prev + 1); 
          }
        }

        state.ball.x += state.ball.dx;
        state.ball.y += state.ball.dy;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // 마우스 이동 (반응형 화면에 맞춘 좌표 보정)
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || isCleared) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // CSS 크기와 실제 캔버스 해상도의 비율 계산
    const relativeX = (e.clientX - rect.left) * scaleX;
    const state = gameState.current;
    
    if (relativeX > 0 && relativeX < canvas.width) {
      state.paddle.x = relativeX - state.paddle.width / 2;
    }
  };

  // 터치 이동 (반응형 화면에 맞춘 좌표 보정)
  const handleTouchMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || isCleared) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const relativeX = (e.touches[0].clientX - rect.left) * scaleX;
    const state = gameState.current;

    if (relativeX > 0 && relativeX < canvas.width) {
      state.paddle.x = relativeX - state.paddle.width / 2;
    }
  };

  const continueGame = () => {
    const state = gameState.current;
    if (isGameOver && !isCleared) {
      state.ball = { x: state.paddle.x + state.paddle.width / 2, y: 280, dx: 4, dy: -4, radius: 8, speed: 5.6 };
      state.isPlaying = true;
      setIsGameOver(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-info">
        <h1>블럭 깨기</h1>
        <div className="stats">
          <div>시간: {timeElapsed}초</div>
          <div>시도 횟수: {attempts}</div>
        </div>
      </div>
      
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={480} // 캔버스의 내부 해상도는 고정
          height={320}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onClick={continueGame}
          onTouchStart={continueGame}
        />
        
        {isCleared && (
          <div className="overlay">
            <h2>Game Clear! 🎉</h2>
            <p>걸린 시간: {timeElapsed}초 | 시도 횟수: {attempts}번</p>
            <button 
              className="restart-btn" 
              onClick={fullRestartGame}
              onMouseEnter={() => isHoveringRestartRef.current = true}
              onMouseLeave={() => isHoveringRestartRef.current = false}
            >
              Restart
            </button>
          </div>
        )}

        {isGameOver && !isCleared && (
          <div className="overlay game-over" onClick={continueGame} onTouchStart={continueGame}>
            <h2>Oops!</h2>
            <p style={{ fontSize: '1rem', color: '#ccc', cursor: 'pointer' }}>
              화면을 터치/클릭하여 계속하세요
            </p>
          </div>
        )}
      </div>

      <div className="instructions">
        <p>PC: 마우스 이동 (클릭 불필요) / 모바일: 터치 및 드래그</p>
      </div>
    </div>
  );
};

export default App;