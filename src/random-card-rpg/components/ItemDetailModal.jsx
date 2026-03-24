// 아이템 상세 설명 창
import React from 'react';

const ItemDetailModal = ({ item, onClose, isRelic }) => {
  if (!item) return null;

  const rarityName = { 'common': '일반', 'rare': '희귀', 'special': '특별', 'legendary': '전설' }[item.rarity];
  
  return (
    <div className="modal-overlay open" onClick={onClose} style={{ zIndex: 300 }}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <div className="detail-icon">{item.name.split(' ')[0]}</div>
        <div className="detail-name">{item.name.split(' ').slice(1).join(' ')}</div>
        <div className={`rarity-${item.rarity}`} style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{rarityName} {isRelic ? '유물' : '아이템'}</div>
        
        <div className="detail-desc-box">
          {!isRelic && item.gold !== undefined && (
            <div className="detail-row"><span className="detail-label">골드:</span> {item.gold}개</div>
          )}
          {item.effect && <div className="detail-row"><span className="detail-label">효과:</span> {item.effect}</div>}
          {item.adjacent && <div className="detail-row"><span className="detail-label">인접:</span> {item.adjacent}</div>}
          {item.destroy && <div className="detail-row"><span className="detail-label">파괴:</span> {item.destroy}</div>}
          {item.lastWord && <div className="detail-row"><span className="detail-label">유언:</span> {item.lastWord}</div>}
        </div>
        
        <button className="btn-yellow pixel-border" onClick={onClose} style={{ marginTop: '20px', width: '100%' }}>닫기</button>
      </div>
    </div>
  );
};
export default ItemDetailModal;