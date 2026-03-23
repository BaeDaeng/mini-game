// 골드, 턴, 목표액 표시 상단바
import React from 'react';

const StatBar = ({ gold, rent, daysLeft }) => {
  return (
    <div className="stat-bar">
      <div className="stat-item">
        <span style={{ color: '#ffd700' }}>💰 보유 골드:</span>
        <strong style={{ marginLeft: '8px', fontSize: '1.2rem' }}>{gold}G</strong>
      </div>
      <div className="stat-item">
        <span style={{ color: '#ff4d4d' }}>🏠 목표 임대료:</span>
        <strong style={{ marginLeft: '8px' }}>{rent}G</strong>
      </div>
      <div className="stat-item">
        <span style={{ color: '#00d4ff' }}>⏳ 남은 날짜:</span>
        <strong style={{ marginLeft: '8px' }}>{daysLeft}일</strong>
      </div>
    </div>
  );
};

export default StatBar;