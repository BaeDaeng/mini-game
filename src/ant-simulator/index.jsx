// src/ant-simulator/index.jsx
import { useEffect, useRef } from 'react';
import { SimulationEngine } from './SimulationEngine';
import './AntSimulator.css'; // ✨ CSS 파일 임포트

export default function AntSimulator() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1000;
    canvas.height = 700;

    engineRef.current = new SimulationEngine(canvas);

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);

  return (
    // ✨ style 속성 대신 className 사용
    <div className="simulator-container">
      <h2 className="simulator-title">🐜 Swarm Intelligence: 개미 군집 시뮬레이터</h2>
      <p className="simulator-description">
        흰색: 탐색 중인 개미 / 빨간색: 먹이를 찾은 개미 / 초록색 궤적: 먹이 페로몬
      </p>
      <canvas ref={canvasRef} className="simulator-canvas" />
    </div>
  );
}