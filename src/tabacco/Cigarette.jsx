import React, { useState, useEffect, useRef } from 'react';

// 💡 type Props 추가 수신
export default function Cigarette({ setTotalPuffMs, type }) {
  const [isPuffing, setIsPuffing] = useState(false);
  const [progress, setProgress] = useState(0);     
  const [ashLength, setAshLength] = useState(0);   
  const [smokes, setSmokes] = useState([]);        
  const [fallingAshes, setFallingAshes] = useState([]); 
  
  const cigaretteRef = useRef(null);

  // 현재 테스트용 10초 설정입니다. 확인 후 187000(3분 7초)으로 돌려주세요!
  const TOTAL_SMOKE_TIME_MS = 40000; 
  const PAPER_START_WIDTH = 230; 

  const handleMouseDown = () => { if (progress < 100) setIsPuffing(true); };
  const handleMouseUp = () => {
    if (isPuffing && progress < 100) {
      setIsPuffing(false);
      setSmokes(prev => [...prev, { id: Date.now() }]);
    }
  };

  useEffect(() => {
    let interval;
    if (isPuffing && progress < 100) {
      const step = 100 / (TOTAL_SMOKE_TIME_MS / 50); 
      
      interval = setInterval(() => {
        setProgress(p => {
          if (p + step >= 100) {
            setIsPuffing(false);
            return 100;
          }
          return p + step;
        });

        setAshLength(prev => {
          const newAsh = prev + step;
          if (newAsh > 12) {
            dropAsh();
            return 0; 
          }
          return newAsh;
        });
        
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPuffing, progress]);

  const isBurning = progress > 0 && progress < 100;
  
  useEffect(() => {
    let timer;
    if (isBurning) {
      timer = setInterval(() => {
        setTotalPuffMs(prev => prev + 1000); 
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBurning, setTotalPuffMs]);

  const dropAsh = () => {
    if (cigaretteRef.current) {
      const rect = cigaretteRef.current.getBoundingClientRect();
      const dropX = rect.right - 20; 
      const dropY = rect.top + 5;
      
      setFallingAshes(prev => [...prev, { id: Date.now(), x: dropX, y: dropY }]);
    }
  };

  useEffect(() => {
    if (smokes.length > 0) {
      const t = setTimeout(() => setSmokes(p => p.slice(1)), 4000);
      return () => clearTimeout(t);
    }
  }, [smokes]);

  useEffect(() => {
    if (fallingAshes.length > 0) {
      const t = setTimeout(() => setFallingAshes(p => p.slice(1)), 1200);
      return () => clearTimeout(t);
    }
  }, [fallingAshes]);

  const handleChainSmoke = () => {
    setProgress(0);
    setAshLength(0);
    setIsPuffing(false);
    setTotalPuffMs(0); 
  };

  const currentPaperWidth = PAPER_START_WIDTH * ((100 - progress) / 100);
  const currentAshWidth = ashLength * 2.3; 

  return (
    <div className="cigarette-container">
      {progress >= 100 && (
        <div className="chain-smoke-container">
          <span style={{ color: '#ccc', fontSize: '1.2rem' }}>꽁초만 남았습니다...</span>
          <button className="chain-smoke-btn" onClick={handleChainSmoke}>
            🔥 줄담하기 (새 담배 꺼내기)
          </button>
        </div>
      )}

      {/* 💡 className에 type(담배 종류) 추가 적용 */}
      <div
        ref={cigaretteRef}
        className={`cigarette ${type} ${isPuffing ? 'puffing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        style={{ 
          opacity: progress >= 100 ? 0 : 1, 
          transition: 'opacity 0.5s',
          pointerEvents: progress >= 100 ? 'none' : 'auto'
        }}
      >
        <div className="filter" />
        <div className="paper" style={{ width: `${currentPaperWidth}px` }} />
        
        <div className="ash" style={{ width: `${currentAshWidth}px` }}>
          <div className="fire" style={{ opacity: isPuffing ? 1 : 0.4 }} />
        </div>
      </div>

      {smokes.map(smoke => (
        <div key={smoke.id} className="smoke-puff" />
      ))}

      {fallingAshes.map(ash => (
        <div 
          key={ash.id} 
          className="falling-ash" 
          style={{ left: ash.x, top: ash.y, position: 'fixed' }} 
        />
      ))}
    </div>
  );
}