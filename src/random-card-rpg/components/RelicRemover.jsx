// 아이템 제거 버튼
import React from 'react';

const RelicRemover = ({ X_count, onToggleRemoveMode, isRemoveMode }) => {
  const isOutOfX = X_count <= 0;

  return (
    <button 
      className="btn-yellow pixel-border"
      onClick={onToggleRemoveMode} 
      disabled={isOutOfX && !isRemoveMode}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '15px',
        padding: '10px',
        background: isRemoveMode ? '#ffaaaa' : '#facc22',
      }}
    >
      <div style={{ 
        background: 'white', 
        color: 'red', 
        borderRadius: '50%', 
        width: '30px', 
        height: '30px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '2px solid red',
        fontWeight: 'bold'
      }}>
        ✖
      </div>
      <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{X_count}</span>
    </button>
  );
};

export default RelicRemover;