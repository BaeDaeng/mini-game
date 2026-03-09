import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './balloon-up.css';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const INITIAL_RADIUS = 40;
const MIN_RADIUS = 15;

const BalloonUp = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  const [time, setTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [bestTime, setBestTime] = useState(0);

  const state = useRef({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    vx: 0,
    vy: 0,
    radius: INITIAL_RADIUS,
    gravity: 0.15,
    wind: 0,
    particles: [],
    startTime: null,
    elapsed: 0,
    gameOver: false,
  });

  const initGame = () => {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        speed: Math.random() * 2 + 1
      });
    }

    state.current = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      vx: 0,
      vy: -5,
      radius: INITIAL_RADIUS,
      gravity: 0.15,
      wind: 0,
      particles: particles,
      startTime: performance.now(),
      elapsed: 0,
      gameOver: false,
    };
    setIsGameOver(false);
    setTime(0);
  };

  const updatePhysics = () => {
    const s = state.current;
    if (s.gameOver) return;

    const now = performance.now();
    s.elapsed = (now - s.startTime) / 1000;
    
    // 난이도 상승 로직 (30초 목표 매운맛)
    s.gravity = 0.15 + (s.elapsed * 0.025); 
    s.radius = Math.max(MIN_RADIUS, INITIAL_RADIUS - (s.elapsed * 0.8));

    // 바람 세기 변화
    if (Math.random() < 0.03) {
      s.wind = (Math.random() - 0.5) * (s.elapsed * 0.2); 
    }

    s.vy += s.gravity;
    s.vx += s.wind;
    s.vx *= 0.98;

    s.x += s.vx;
    s.y += s.vy;

    s.particles.forEach(p => {
      p.x += s.wind * 15 + (s.wind > 0 ? p.speed : -p.speed);
      if (p.x > GAME_WIDTH + 50) p.x = -50;
      if (p.x < -50) p.x = GAME_WIDTH + 50;
    });

    if (s.x - s.radius < 0) { s.x = s.radius; s.vx *= -0.7; }
    if (s.x + s.radius > GAME_WIDTH) { s.x = GAME_WIDTH - s.radius; s.vx *= -0.7; }

    if (s.y - s.radius > GAME_HEIGHT) {
      s.gameOver = true;
      setIsGameOver(true);
      setBestTime(prev => Math.max(prev, s.elapsed));
    }
    if (s.y - s.radius < 0) { s.y = s.radius; s.vy *= -0.5; }
  };

  // 🔥 마우스 클릭과 모바일 터치를 모두 지원하는 함수
  // 🔥 화면 비율 문제와 스크롤 간섭을 완벽히 해결한 입력 함수
  const handleCanvasInput = (e) => {
    // 1. 브라우저의 기본 터치 동작(스크롤, 더블탭 확대 등) 강제 차단
    if (e.cancelable) {
      e.preventDefault();
    }

    const s = state.current;
    if (s.gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // 마우스인지 터치인지 확인해서 좌표 추출
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // 2. 🌟 핵심: 화면에 보이는 크기(rect)와 실제 캔버스 내부 픽셀(canvas.width)의 비율 계산
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // 터치한 CSS 화면 좌표를 내부 게임 좌표로 변환
    const clickX = (clientX - rect.left) * scaleX;
    const clickY = (clientY - rect.top) * scaleY;

    // 풍선 중심과 터치한 곳의 거리 계산
    const dist = Math.sqrt((clickX - s.x) ** 2 + (clickY - s.y) ** 2);

    // 3. 모바일 배려: 손가락으로 가려지는 걸 감안해 판정 범위를 아주 넉넉하게(+60) 늘려줍니다!
    if (dist < s.radius + 60) {
      s.vy = -7 - (s.elapsed * 0.12);
      s.vx += (s.x - clickX) * 0.25;
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = state.current;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (!s.gameOver) {
      updatePhysics();
      setTime(s.elapsed.toFixed(2));
    }

    // 1. 바람 시각화
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.2)';
    ctx.lineWidth = 2;
    s.particles.forEach(p => {
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + (s.wind * 100), p.y);
    });
    ctx.stroke();

    // 2. 풍선 줄
    ctx.beginPath();
    ctx.moveTo(s.x, s.y + s.radius);
    ctx.bezierCurveTo(s.x, s.y + s.radius + 10, s.x - (s.wind * 100), s.y + s.radius + 20, s.x - (s.wind * 50), s.y + s.radius + 40);
    ctx.strokeStyle = '#ced4da';
    ctx.stroke();

    // 3. 풍선 본체
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.wind * 2);
    
    ctx.beginPath();
    ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
    const hue = Math.max(0, 210 - s.elapsed * 5); 
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-s.radius * 0.3, -s.radius * 0.3, s.radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
    ctx.restore();

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    initGame();
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="balloon-container">
      <button className="back-btn" onClick={() => navigate('/')}>⬅️ 메인으로</button>
      
      <div className="game-header">
        <div className="timer-badge">{time}s</div>
        <p className="best-record">최고 기록: {bestTime.toFixed(2)}s</p>
      </div>

      <div className="canvas-area">
        <canvas 
          ref={canvasRef} 
          width={GAME_WIDTH} 
          height={GAME_HEIGHT} 
          onClick={handleCanvasInput}
        />

        {isGameOver && (
          <div className="game-over-overlay">
            <h2>앗! 풍선이...🎈</h2>
            <p className="final-time">{time}초 동안 버텼습니다!</p>
            <button className="retry-button" onClick={initGame}>다시 도전</button>
          </div>
        )}
      </div>

      <p className="game-hint">풍선을 터치해서 바닥에 떨어지지 않게 하세요!</p>
    </div>
  );
};

export default BalloonUp;