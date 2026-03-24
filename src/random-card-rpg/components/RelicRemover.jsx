// 유물 제거 버튼
import React from 'react';

const RelicRemover = ({ X_count, onToggleRemoveMode, isRemoveMode }) => {
  const isOutOfX = X_count <= 0;

  return (
    <div className="stat-box pixel-border wooden-bg" style={{ padding: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}>
        {/* X 보유량 표시 */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#e0ca9e', padding: '10px', borderRadius: '5px', border: '2px solid #664b36' }}>
          <span style={{ color: 'red', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '8px' }}>❌</span>
          <strong style={{ fontSize: '1.2rem' }}>{X_count}</strong>
        </div>
        
        {/* 제거 모드 토글 버튼 */}
        <button 
          className="btn" 
          onClick={onToggleRemoveMode} 
          disabled={isOutOfX && !isRemoveMode}
          style={{ 
            flex: 1, 
            height: '100%',
            background: isRemoveMode ? '#ffaaaa' : '#e0ca9e',
            opacity: (isOutOfX && !isRemoveMode) ? 0.5 : 1,
            cursor: (isOutOfX && !isRemoveMode) ? 'not-allowed' : 'pointer'
          }}
        >
          {isRemoveMode ? '취소하기' : '유물 지우기'}
        </button>
      </div>
    </div>
  );
};

export default RelicRemover;