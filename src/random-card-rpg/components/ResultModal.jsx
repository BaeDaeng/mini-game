// 승리/패배 시 화면 중앙에 뜨는 모달 UI
import React from 'react';

const ResultModal = ({ gameState, gold, targetGold, onNextStage, onRestart }) => {
  if (gameState === 'playing') return null;

  const isClear = gameState === 'stage_clear';

  return (
    <div className="modal-overlay open" style={{ zIndex: 200 }}>
      <div className="modal-content pixel-border cream-bg" style={{ textAlign: 'center', padding: '40px' }}>
        {isClear ? (
          <>
            <h1 style={{ color: '#d4af37', fontSize: '2.5rem', marginBottom: '10px' }}>🎉 목표 달성!</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#5a3c22' }}>
              무사히 <strong>{targetGold}G</strong>를 지불했습니다.
            </p>
            <div style={{ marginBottom: '30px', fontSize: '1.1rem', background: '#e2d1a7', padding: '10px', borderRadius: '5px' }}>
              남은 골드: <strong>{gold - targetGold}G</strong>
            </div>
            <button className="btn-yellow pixel-border" onClick={onNextStage} style={{ fontSize: '1.5rem', padding: '15px 30px', width: '100%' }}>
              다음 스테이지로 진입
            </button>
          </>
        ) : (
          <>
            <h1 style={{ color: '#d32f2f', fontSize: '2.5rem', marginBottom: '10px' }}>💀 파산했습니다...</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#5a3c22' }}>
              기한 내에 목표 금액을 채우지 못했습니다.
            </p>
            <div style={{ marginBottom: '30px', fontSize: '1.1rem', background: '#ffcccc', padding: '10px', borderRadius: '5px' }}>
              부족한 골드: <strong style={{ color: '#d32f2f' }}>{targetGold - gold}G</strong>
            </div>
            <button className="btn-yellow pixel-border" onClick={onRestart} style={{ fontSize: '1.5rem', padding: '15px 30px', background: '#ffaaaa', width: '100%' }}>
              처음부터 다시 시작하기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultModal;