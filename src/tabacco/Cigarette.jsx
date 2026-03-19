import React, { useState, useEffect } from 'react';

export default function Cigarette() {
  const [isPuffing, setIsPuffing] = useState(false);
  const [progress, setProgress] = useState(0); // 0 (새 담배) ~ 100 (다 탄 담배)
  const [smokes, setSmokes] = useState([]);

  // 실제 평균 흡연 시간 3분 7초 = 187,000ms
  // (테스트 시 답답하다면 이 값을 10000 정도로 줄여서 확인해보세요)
  const TOTAL_SMOKE_TIME_MS = 187000; 

  const handleMouseDown = () => setIsPuffing(true);
  const handleMouseUp = () => {
    setIsPuffing(false);
    if (progress < 100) {
      // 마우스를 놓을 때마다 연기 이펙트 생성
      setSmokes(prev => [...prev, { id: Date.now() }]);
    }
  };

  useEffect(() => {
    let interval;
    if (isPuffing && progress < 100) {
      // 50ms마다 진행도 업데이트
      const step = 100 / (TOTAL_SMOKE_TIME_MS / 50);
      
      interval = setInterval(() => {
        setProgress(p => {
          if (p + step >= 100) {
            setIsPuffing(false); // 다 타면 강제로 멈춤
            return 100;
          }
          return p + step;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPuffing, progress]);

  // 생성된 연기 이펙트는 4초 후 화면(DOM)에서 제거
  useEffect(() => {
    if (smokes.length > 0) {
      const timer = setTimeout(() => {
        setSmokes(prev => prev.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [smokes]);

  return (
    <div className="cigarette-container">
      <div
        className={`cigarette ${isPuffing ? 'puffing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        <div className="filter" />
        {/* progress 수치만큼 흰색 종이 부분의 길이가 줄어듭니다 */}
        <div className="paper" style={{ width: `${100 - progress}%` }} />
        {/* 누르고 있을 때만 불씨가 밝아집니다 */}
        <div className="ash" style={{ opacity: isPuffing ? 1 : 0.4 }} />
      </div>

      {smokes.map(smoke => (
        <div key={smoke.id} className="smoke-puff" />
      ))}
    </div>
  );
}