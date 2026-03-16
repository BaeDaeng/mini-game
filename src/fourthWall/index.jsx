import React, { useState } from 'react';
import './fourthWall.css';
import Stage1 from './stages/Stage1';
import Stage2 from './stages/Stage2';
import Stage3 from './stages/Stage3';
import Stage4 from './stages/Stage4';
import Stage5 from './stages/Stage5';

export default function FourthWallGame() {
  const [stage, setStage] = useState(1);

  const nextStage = () => {
    setStage(prev => prev + 1);
  };

  return (
    <div className="fw-container">
      {stage === 1 && <Stage1 onClear={nextStage} />}
      {stage === 2 && <Stage2 onClear={nextStage} />}
      {stage === 3 && <Stage3 onClear={nextStage} />}
      {stage === 4 && <Stage4 onClear={nextStage} />}
      {stage === 5 && <Stage5 onClear={nextStage} />}
      
      {stage === 6 && (
        <div className="fw-stage-box">
          <h2>🎉 탈출 성공! 🎉</h2>
          <p>브라우저의 한계를 극복하셨습니다.</p>
          <button className="fw-btn" onClick={() => setStage(1)}>다시 하기</button>
        </div>
      )}
    </div>
  );
}