import React from 'react';
import DescriptionText from './DescriptionText';

const InventoryModal = ({ isOpen, onClose, inventorySymbols, onItemClick }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onClose} style={{ zIndex: 150 }}>
      <div className="modal-content pixel-border" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ borderBottom: '2px solid #5a3c22', paddingBottom: '10px', margin: '0 0 20px 0' }}>🎒 인벤토리</h2>
        
        <div className="inventory-list" style={{ textAlign: 'left' }}>
          
          {/* 심볼(아이템) 덱 목록만 남김 */}
          <h3 style={{ color: '#5a3c22', marginBottom: '10px' }}>보유 중인 덱 (총 {inventorySymbols.length}장)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '10px' }}>
            {inventorySymbols.map((s, idx) => (
              <div 
                key={idx} 
                className={`pixel-border`}
                style={{ background: '#e2d1a7', padding: '10px 5px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                onClick={() => onItemClick && onItemClick(s)}
              >
                <div style={{ fontSize: '2rem', lineHeight: '1' }}>{s.name.split(' ')[0]}</div>
                <div className={`rarity-${s.rarity}`} style={{ fontSize: '0.8rem', marginTop: '5px', fontWeight: 'bold', wordBreak: 'keep-all', lineHeight: '1.2' }}>
                  {s.name.split(' ').slice(1).join(' ')}
                </div>
              </div>
            ))}
          </div>

        </div>
        
        <button className="btn-yellow pixel-border" onClick={onClose} style={{ marginTop: '20px', width: '100%' }}>닫기</button>
      </div>
    </div>
  );
};

export default InventoryModal;