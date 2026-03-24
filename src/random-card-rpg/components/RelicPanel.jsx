// 오른쪽 유물 영역
import React from 'react';

const RelicPanel = ({ equippedRelics, onRemoveRelic, isRemoveMode, onRelicClick }) => {
  return (
    <aside className="right-panel">
      {/* 유물 패널 헤더 */}
      <div 
        className="pixel-border" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: '#fdf6e3', 
          padding: '10px 15px',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}
      >
        <span style={{ fontSize: '1.5rem', color: '#4da6ff' }}>🏺</span>
        <span>유물</span>
        <span style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#d4af37' }}>⚙️</span>
      </div>
      
      {/* 유물 목록 영역 */}
      <div 
        className="pixel-border" 
        style={{ 
          flex: 1, 
          backgroundColor: '#fdf6e3', 
          padding: '15px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px',
          overflowY: 'auto'
        }}
      >
        {equippedRelics.length === 0 && (
          <div style={{ color: '#aaa', textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
            장착 중인 유물이 없습니다.
          </div>
        )}

        {equippedRelics.map((relic, index) => (
          <div 
            key={index} 
            className={`relic-item ${isRemoveMode ? 'remove-mode' : ''}`} 
            onClick={() => {
              // 제거 모드일 때는 유물 삭제, 아닐 때는 상세 정보창 띄우기
              if (isRemoveMode) {
                onRemoveRelic(index);
              } else if (onRelicClick) {
                onRelicClick(relic);
              }
            }}
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '5px',
                position: 'relative',
                cursor: 'pointer'
            }}
          >
            {/* 동그란 유물 아이콘 배경 */}
            <div 
                className="relic-icon" 
                style={{ 
                    backgroundColor: '#cc7a6f', 
                    borderRadius: '50%', 
                    width: '45px', 
                    height: '45px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.8rem',
                    border: '2px solid #5a3c22',
                    boxShadow: '1px 1px 0px rgba(0,0,0,0.2)'
                }}
            >
              {relic.name.split(' ')[0]}
            </div>

            {/* 유물 이름 */}
            <div className="relic-info" style={{ marginLeft: '15px' }}>
              <span className={`relic-name rarity-${relic.rarity}`} style={{ fontSize: '1.1rem' }}>
                {relic.name.split(' ').slice(1).join(' ')}
              </span>
            </div>

            {/* 유물 제거 모드 오버레이 */}
            {isRemoveMode && (
              <div className="remove-overlay" style={{ borderRadius: '8px', cursor: 'pointer' }}>
                ❌
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default RelicPanel;