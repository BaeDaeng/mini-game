import React, { useState } from 'react';

export default function Stage5({ onClear }) {
  const [answer, setAnswer] = useState('');

  const checkAnswer = () => {
    // 공백 무시, 대소문자 무시 처리
    if (answer.trim().toUpperCase() === 'GHOST_PROTOCOL') {
      onClear();
    } else {
      alert("틀렸습니다.");
    }
  };

  return (
    <div className="fw-stage-box">
      <h2>[ 파이널 스테이지: 투명 잉크 ]</h2>
      <p>마지막 암호는 화면에 존재하지만, 모니터의 빛으로는 볼 수 없습니다.</p>
      <p><b>종이에 '인쇄'하려는 순간에만</b> 잉크가 나타납니다.</p>

      {/* 이 텍스트는 fourthWall.css의 @media print 설정에 의해 인쇄 미리보기에서만 보입니다! */}
      <div className="print-secret">
        GHOST_PROTOCOL
      </div>

      <input 
        type="text" 
        className="fw-input" 
        placeholder="숨겨진 암호를 입력하세요"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <br/>
      <button className="fw-btn" onClick={checkAnswer}>탈출하기</button>
    </div>
  );
}