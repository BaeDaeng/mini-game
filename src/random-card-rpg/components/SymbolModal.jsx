// 턴 종료 후 심볼 선택 창
import React from 'react';

const SymbolModal = ({ choices, onSelect }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ marginBottom: '10px' }}>새로운 심볼 추가</h2>
        <p style={{ color: '#aaa', marginBottom: '20px' }}>인벤토리에 넣을 심볼을 하나 선택하세요.</p>
        
        <div className="choice-list">
          {choices.map((symbol, index) => (
            <button 
              key={index} 
              className="choice-btn"
              onClick={() => onSelect(symbol)}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                {symbol.name.split(' ')[0]}
              </div>
              <div style={{ fontWeight: 'bold' }}>{symbol.name.split(' ')[1]}</div>
              <div style={{ fontSize: '0.8rem', color: '#ffd700', marginTop: '5px' }}>
                가치: {symbol.value}G
              </div>
              {symbol.desc && (
                <div style={{ fontSize: '0.7rem', color: '#00d4ff', marginTop: '8px' }}>
                  {symbol.desc}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SymbolModal;