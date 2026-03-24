// 왼쪽 상태 및 목표 영역
// src/random-card-rpg/components/LeftPanel.jsx
import React from 'react';
import RelicRemover from './RelicRemover';

const LeftPanel = ({ daysLeft, gold, targetGold, X_count, onToggleRemoveMode, isRemoveMode, onOpenInventory }) => {
  return (
    <aside className="left-panel">
      <div className="stat-box pixel-border wooden-bg">
        <span className="stat-title">공격까지 남은 턴</span>
        <strong className="stat-value">{daysLeft}턴</strong>
      </div>
      <div className="stat-box pixel-border wooden-bg">
        <span className="stat-title">보유 골드</span>
        <strong className="stat-value">{gold}G</strong>
      </div>
      <div className="wanted-box pixel-border wooden-bg">
        <div className="wanted-header">WANTED</div>
        <div className="stat-title">달성 목표</div>
        <strong className="stat-value">{targetGold}G</strong>
        <div className="wanted-progress">진행: {gold}/{targetGold}G</div>
      </div>
      <RelicRemover X_count={X_count} onToggleRemoveMode={onToggleRemoveMode} isRemoveMode={isRemoveMode} />
      <div className="btn-box">
        <button className="btn" onClick={onOpenInventory}>인벤토리 보기</button>
      </div>
    </aside>
  );
};
export default LeftPanel;