// 오른쪽 유물 영역
import React from 'react';

const RelicPanel = ({ equippedRelics, onRemoveRelic, isRemoveMode }) => {
  return (
    <aside className="right-panel pixel-border wooden-bg">
      <div className="relic-header stat-title">보유한 유물</div>
      
      {equippedRelics.length === 0 && (
        <div style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>
          장착 중인 유물이 없습니다.
        </div>
      )}

      {equippedRelics.map((relic, index) => (
        <div 
          key={index} 
          className={`relic-item ${isRemoveMode ? 'remove-mode' : ''}`} 
          onClick={() => isRemoveMode && onRemoveRelic(index)}
          style={{ position: 'relative' }}
        >
          <div className="relic-icon">{relic.name.split(' ')[0]}</div>
          <div className="relic-info">
            <span className="relic-name">{relic.name.split(' ').slice(1).join(' ')}</span>
            <span className="relic-desc">{relic.desc}</span>
          </div>
          {isRemoveMode && (
            <div className="remove-overlay" style={{ cursor: 'pointer' }}>❌</div>
          )}
        </div>
      ))}
    </aside>
  );
};

export default RelicPanel;