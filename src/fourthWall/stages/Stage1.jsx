import React, { useEffect } from 'react';

export default function Stage1({ onClear }) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "⬇️ 시선을 아래로 내려보세요 ⬇️";
    
    // 이 스테이지에서만 스크롤 허용
    document.body.style.overflow = "auto";
    
    return () => {
      document.title = originalTitle;
      document.body.style.overflow = "hidden";
    };
  }, []);

  return (
    <div style={{ height: '300vh', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '40%', width: '100%', textAlign: 'center' }}>
        <h2>[ 스테이지 1 ]</h2>
        <p>화면에는 아무것도 없습니다.</p>
        <p>힌트는 항상 가장 높은 곳에 있습니다.</p>
      </div>

      <div style={{ position: 'absolute', bottom: '50px', width: '100%', textAlign: 'center' }}>
        <p>잘 찾으셨군요!</p>
        <button className="fw-btn" onClick={onClear}>다음으로 넘어가기</button>
      </div>
    </div>
  );
}