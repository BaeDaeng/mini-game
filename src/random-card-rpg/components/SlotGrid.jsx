// 슬롯 머신 격자 UI
import React from 'react';

const SlotGrid = ({ slots }) => {
  // 슬롯이 비어있을 경우를 대비해 20개의 칸을 보장합니다.
  const displaySlots = [...slots, ...Array(Math.max(0, 20 - slots.length)).fill(null)];

  return (
    <div className="grid-frame pixel-border wooden-bg">
      {displaySlots.slice(0, 20).map((slot, index) => (
        <div key={index} className="grid-item">
          {slot ? (
            <div className="symbol-wrapper" title={slot.desc}>
              <span className="symbol-icon">{slot.name.split(' ')[0]}</span>
            </div>
          ) : (
            <span style={{ opacity: 0.1 }}>?</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default SlotGrid;