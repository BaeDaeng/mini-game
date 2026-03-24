// 턴 종료 후 심볼 선택 창, 스핀 기능
import React from 'react';

const SymbolModal = ({ isOpen, choices, onSelect, spinCount, onReroll }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" style={{ zIndex: 200 }}>
      <div className="modal-content pixel-border cream-bg" style={{ width: '90%', maxWidth: '900px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '2px solid #5a3c22', paddingBottom: '10px' }}>
          보상 선택
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
          {choices.map((symbol, index) => (
            <div 
              key={index} 
              className="pixel-border" 
              onClick={() => onSelect(symbol)}
              style={{ background: '#fff', padding: '15px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'transform 0.1s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: '3.5rem', textAlign: 'center' }}>{symbol.name.split(' ')[0]}</div>
              <div className={`rarity-${symbol.rarity}`} style={{ fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center' }}>
                {symbol.name.split(' ').slice(1).join(' ')}
              </div>
              
              <div style={{ fontSize: '0.9rem', color: '#111', background: '#fdf6e3', padding: '10px', borderRadius: '5px', flex: 1, border: '1px solid #e2d1a7' }}>
                {symbol.gold !== undefined && <div style={{ marginBottom: '5px' }}><strong>💰 골드:</strong> {symbol.gold}개</div>}
                {symbol.effect && <div style={{ marginBottom: '5px' }}><strong>✨ 효과:</strong> {symbol.effect}</div>}
                {symbol.adjacent && <div style={{ marginBottom: '5px' }}><strong>↔️ 인접:</strong> {symbol.adjacent}</div>}
                {symbol.destroy && <div style={{ marginBottom: '5px' }}><strong>💥 파괴:</strong> {symbol.destroy}</div>}
                {symbol.lastWord && <div><strong>👻 유언:</strong> {symbol.lastWord}</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
          <button className="btn-yellow pixel-border" onClick={onReroll} disabled={spinCount <= 0} style={{ fontSize: '1.2rem', padding: '12px 40px' }}>
            🔄 스핀 (남은 횟수: {spinCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymbolModal;