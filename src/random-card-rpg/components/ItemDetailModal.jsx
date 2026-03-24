// 아이템 상세 설명 창
import React from 'react';
import DescriptionText from './DescriptionText';

const ItemDetailModal = ({ item, onClose, isRelic, onItemClick }) => {
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
          {item.effect && <div className="detail-row"><span className="detail-label">효과:</span> <DescriptionText text={item.effect} onItemClick={onItemClick} /></div>}
          {item.adjacent && <div className="detail-row"><span className="detail-label">인접:</span> <DescriptionText text={item.adjacent} onItemClick={onItemClick} /></div>}
          {item.destroy && <div className="detail-row"><span className="detail-label">파괴:</span> <DescriptionText text={item.destroy} onItemClick={onItemClick} /></div>}
          {item.lastWord && <div className="detail-row"><span className="detail-label">유언:</span> <DescriptionText text={item.lastWord} onItemClick={onItemClick} /></div>}
        </div>
        
        <button className="btn-yellow pixel-border" onClick={onClose} style={{ marginTop: '20px', width: '100%' }}>닫기</button>
      </div>
    </div>
  );
};
export default ItemDetailModal;