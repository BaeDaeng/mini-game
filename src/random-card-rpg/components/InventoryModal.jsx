// 인벤토리 모달
import React from 'react';

const InventoryModal = ({ isOpen, onClose, inventorySymbols, inventoryRelics, onEquipRelic }) => {
  if (!isOpen) return null; // 열려있지 않으면 아예 렌더링하지 않음

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ borderBottom: '2px solid #664b36', paddingBottom: '10px', margin: '0 0 20px 0' }}>🎒 인벤토리</h2>
        
        <div className="inventory-list" style={{ textAlign: 'left' }}>
          
          {/* 심볼 덱 목록 */}
          <h3 style={{ color: '#664b36', marginBottom: '10px' }}>보유 중인 덱 (총 {inventorySymbols.length}장)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '30px' }}>
            {[...inventorySymbols].map((s, idx) => (
              <div key={idx} style={{ background: '#e0ca9e', padding: '10px', borderRadius: '5px', border: '1px solid #664b36', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem' }}>{s.name.split(' ')[0]}</div>
              </div>
            ))}
          </div>

          {/* 미장착 유물 목록 */}
          <h3 style={{ color: '#664b36', marginBottom: '10px' }}>보유 중인 유물</h3>
          {inventoryRelics.length === 0 ? (
            <div style={{ background: '#e0ca9e', padding: '15px', borderRadius: '5px', textAlign: 'center', color: '#664b36' }}>
              인벤토리에 유물이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[...inventoryRelics].map((r, idx) => (
                <div key={idx} className="inventory-item" style={{ background: '#e0ca9e', padding: '10px 15px', borderRadius: '5px', border: '1px solid #664b36', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="inventory-info">
                    <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '5px' }}>{r.name}</strong>
                    <span style={{ fontSize: '0.9rem', color: '#555' }}>{r.desc}</span>
                  </div>
                  <button 
                    className="btn" 
                    style={{ width: 'auto', padding: '8px 20px' }} 
                    onClick={() => { onEquipRelic(idx); onClose(); }}
                  >
                    장착
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button className="btn" onClick={onClose} style={{ marginTop: '30px', background: '#664b36', color: 'white' }}>닫기</button>
      </div>
    </div>
  );
};

export default InventoryModal;