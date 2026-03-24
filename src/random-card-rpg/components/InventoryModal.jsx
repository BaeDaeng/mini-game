// 인벤토리 모달
import React from 'react';

const InventoryModal = ({ isOpen, onClose, inventorySymbols, inventoryRelics, onEquipRelic, onItemClick }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onClose} style={{ zIndex: 150 }}>
      <div className="modal-content pixel-border" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ borderBottom: '2px solid #5a3c22', paddingBottom: '10px', margin: '0 0 20px 0' }}>🎒 인벤토리</h2>
        
        <div className="inventory-list" style={{ textAlign: 'left' }}>
          
          <h3 style={{ color: '#5a3c22', marginBottom: '10px' }}>보유 중인 덱 (총 {inventorySymbols.length}장)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '30px' }}>
            {inventorySymbols.map((s, idx) => (
              <div 
                key={idx} 
                className={`pixel-border`}
                style={{ background: '#e2d1a7', padding: '10px 5px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                onClick={() => onItemClick && onItemClick(s)}
              >
                <div style={{ fontSize: '2rem', lineHeight: '1' }}>{s.name.split(' ')[0]}</div>
                {/* 인벤토리에도 텍스트 및 레어도 색상 출력 */}
                <div className={`rarity-${s.rarity}`} style={{ fontSize: '0.8rem', marginTop: '5px', fontWeight: 'bold', wordBreak: 'keep-all', lineHeight: '1.2' }}>
                  {s.name.split(' ').slice(1).join(' ')}
                </div>
              </div>
            ))}
          </div>

          {/* 미장착 유물 목록 */}
          <h3 style={{ color: '#5a3c22', marginBottom: '10px' }}>보유 중인 유물</h3>
          {inventoryRelics.length === 0 ? (
            <div className="pixel-border" style={{ background: '#e2d1a7', padding: '15px', textAlign: 'center', color: '#5a3c22' }}>
              인벤토리에 유물이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {inventoryRelics.map((r, idx) => (
                <div key={idx} className="inventory-item pixel-border" style={{ background: '#e2d1a7', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div 
                    className="inventory-info" 
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => onItemClick && onItemClick({ ...r, isRelic: true })}
                  >
                    <strong className={`rarity-${r.rarity}`} style={{ fontSize: '1.1rem', display: 'block', marginBottom: '5px' }}>{r.name}</strong>
                    <span style={{ fontSize: '0.9rem', color: '#555' }}>{r.effect || r.desc}</span>
                  </div>
                  <button 
                    className="btn-yellow pixel-border" 
                    style={{ width: 'auto', padding: '8px 20px', marginLeft: '10px' }} 
                    onClick={(e) => { 
                      e.stopPropagation(); // 장착 버튼 누를 땐 설명창 안 뜨게 막음
                      onEquipRelic(idx); 
                      onClose(); 
                    }}
                  >
                    장착
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button className="btn-yellow pixel-border" onClick={onClose} style={{ marginTop: '30px', width: '100%' }}>닫기</button>
      </div>
    </div>
  );
};

export default InventoryModal;