import React, { useState, useEffect } from 'react';

export default function Stage4({ onClear }) {
  const [hiddenTime, setHiddenTime] = useState(0);

  useEffect(() => {
    let timer;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 유저가 다른 탭으로 넘어갔을 때 타이머 시작
        timer = setInterval(() => {
          setHiddenTime((prev) => prev + 1);
        }, 1000);
      } else {
        // 다시 돌아왔을 때 타이머 정지
        clearInterval(timer);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (hiddenTime >= 3) {
      onClear();
    }
  }, [hiddenTime, onClear]);

  return (
    <div className="fw-stage-box">
      <h2>[ 스테이지 4: 부끄럼쟁이 유령 ]</h2>
      <p>유령은 누군가 쳐다보고 있으면 절대 문을 열어주지 않습니다.</p>
      
      <div style={{ marginTop: '30px', fontSize: '50px' }}>
        👻
      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
        (안 본 시간: {hiddenTime}초)
      </p>
    </div>
  );
}