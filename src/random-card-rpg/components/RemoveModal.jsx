import React from 'react';

const RemoveModal = ({ isOpen, onClose, inventorySymbols, removeCount, onRemove }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onClose} style={{ zIndex: 160 }}>
      <div className="modal-content pixel-border" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ borderBottom: '2px solid #5a3c22', paddingBottom: '10px', margin: '0 0 10px 0', color: '#d32f2f' }}>
          ❌ 아이템 제거 (남은 횟수: {removeCount}개)
        </h2>
        <p style={{ marginBottom: '20px', color: '#5a3c22', fontWeight: 'bold' }}>
          제거할 아이템을 클릭하세요. (프리스트는 제거할 수 없습니다)
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '30px' }}>
          {inventorySymbols.map((s, idx) => {
            const isPriest = s.id === 'priest';
            return (
              <div 
                key={idx} 
                className={`pixel-border`}
                style={{ 
                  background: isPriest ? '#aaa' : '#ffcccc', // 제거 모드임을 강조하기 위해 붉은빛 배경
                  padding: '10px 5px', 
                  textAlign: 'center', 
                  cursor: isPriest ? 'not-allowed' : 'pointer', 
                  opacity: isPriest ? 0.6 : 1,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  transition: 'transform 0.1s'
                }}
                onMouseOver={e => { if (!isPriest) e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseOut={e => { if (!isPriest) e.currentTarget.style.transform = 'scale(1)'; }}
                onClick={() => {
                  if (!isPriest && removeCount > 0) {
                    onRemove(idx);
                    // 방금 제거해서 남은 횟수가 0이 되면 자동으로 창 닫기
                    if (removeCount - 1 <= 0) onClose();
                  }
                }}
              >
                <div style={{ fontSize: '2rem', lineHeight: '1' }}>{s.name.split(' ')[0]}</div>
                <div className={`rarity-${s.rarity}`} style={{ fontSize: '0.8rem', marginTop: '5px', fontWeight: 'bold', wordBreak: 'keep-all', lineHeight: '1.2' }}>
                  {s.name.split(' ').slice(1).join(' ')}
                </div>
              </div>
            );
          })}
        </div>
        
        <button className="btn-yellow pixel-border" onClick={onClose} style={{ width: '100%', fontSize: '1.2rem' }}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default RemoveModal;