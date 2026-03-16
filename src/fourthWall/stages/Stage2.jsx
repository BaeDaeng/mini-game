import React, { useState, useEffect } from 'react';

export default function Stage2({ onClear }) {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isConnected = width <= 600;

  return (
    <div className="fw-stage-box" style={{ width: '80vw', maxWidth: 'none' }}>
      <h2>[ 스테이지 2: 끊어진 다리 ]</h2>
      <p>두 블록 사이의 거리가 너무 멉니다. 다리를 연결하세요.</p>
      <p style={{ fontSize: '12px', color: '#888' }}>(현재 너비: {width}px)</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', background: '#000', padding: '20px' }}>
        <div style={{ width: '100px', height: '50px', background: isConnected ? '#0f0' : '#f00', transition: 'background 0.3s' }}>시작점</div>
        <div style={{ width: '100px', height: '50px', background: isConnected ? '#0f0' : '#f00', transition: 'background 0.3s' }}>도착점</div>
      </div>

      {isConnected && (
        <div style={{ marginTop: '30px' }}>
          <p>연결되었습니다!</p>
          <button className="fw-btn" onClick={onClear}>건너가기</button>
        </div>
      )}
    </div>
  );
}