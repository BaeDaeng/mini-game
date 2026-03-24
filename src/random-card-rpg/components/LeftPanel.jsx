// 왼쪽 상태 및 목표 영역
import React from 'react';

const LeftPanel = ({ daysLeft, gold, targetGold, removeCount, spinCount, onOpenInventory, onOpenRemoveModal }) => {
  return (
    <aside className="left-panel">
      <div className="stat-box pixel-border">공격 까지 {daysLeft}턴</div>
      
      <div className="stat-box pixel-border" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <span style={{ color: '#d4af37', fontSize: '1.2rem' }}>🪙</span> <span>{gold}</span>
      </div>
      
      <div className="wanted-box pixel-border">
        <div className="wanted-header">WANTED</div>
        <div className="wanted-progress" style={{ fontWeight: 'bold' }}>목표: {targetGold}G</div>
      </div>

      <div style={{ flex: 1 }}></div>

      {/* 조작 버튼 영역: 아이템 제거 버튼 추가 */}
      <div className="stat-box pixel-border" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px 10px' }}>
        {/* 아이템 제거 버튼 */}
        <button 
          className="btn-yellow pixel-border" 
          style={{ 
            width: '100%', 
            padding: '10px', 
            background: removeCount > 0 ? '#ffaaaa' : '#ccc', 
            color: '#111' 
          }}
          disabled={removeCount <= 0}
          onClick={onOpenRemoveModal}
        >
          <span style={{ color: 'red' }}>❌</span> 아이템 제거 ({removeCount})
        </button>
        
        {/* 스핀 표시 (보상 창에서만 사용하므로 버튼 형태 유지 안함) */}
        <div style={{ background: '#e2d1a7', padding: '10px', borderRadius: '5px', border: '2px solid #5a3c22', fontWeight: 'bold' }}>
          <span style={{ color: 'blue' }}>🔄</span> 스핀: {spinCount}
        </div>
      </div>
      
      <button className="btn-yellow pixel-border" style={{ fontSize: '1.2rem', padding: '15px' }} onClick={onOpenInventory}>
        인벤토리
      </button>
    </aside>
  );
};

export default LeftPanel;