import { useInventoryStore } from '../store/useInventoryStore';
import { ITEM_TYPES } from '../constants/itemTypes';

export default function ItemInfo() {
  const { hoveredItemInfo } = useInventoryStore();

  return (
    <div className="info-panel">
      <h2>ITEM INFO</h2>
      
      {!hoveredItemInfo ? (
        <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', padding: '1rem', border: '2px dashed #4b5563', borderRadius: '8px' }}>
          아이템에 마우스를<br/>올려보세요
        </div>
      ) : (
        <div style={{ backgroundColor: '#374151', padding: '15px', borderRadius: '8px', border: '2px solid #4b5563', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f3f4f6', fontSize: '1.1rem', borderBottom: '1px solid #4b5563', paddingBottom: '8px' }}>
            {ITEM_TYPES[hoveredItemInfo.typeKey].levels[hoveredItemInfo.level - 1].name}
            <span style={{ color: '#4ade80', marginLeft: '8px', fontSize: '0.9rem' }}>Lv.{hoveredItemInfo.level}</span>
          </h3>
          
          <div style={{ fontSize: '0.9rem', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ITEM_TYPES[hoveredItemInfo.typeKey].levels[hoveredItemInfo.level - 1].stats.damage && (
              <div>⚔️ 데미지: <span style={{ color: '#f87171', fontWeight: 'bold' }}>+{ITEM_TYPES[hoveredItemInfo.typeKey].levels[hoveredItemInfo.level - 1].stats.damage}</span></div>
            )}
            {ITEM_TYPES[hoveredItemInfo.typeKey].levels[hoveredItemInfo.level - 1].stats.recovery && (
              <div>💖 회복: <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+{ITEM_TYPES[hoveredItemInfo.typeKey].levels[hoveredItemInfo.level - 1].stats.recovery}</span></div>
            )}
            {ITEM_TYPES[hoveredItemInfo.typeKey].levels[hoveredItemInfo.level - 1].stats.armor && (
              <div>🛡️ 방어구: <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>+{ITEM_TYPES[hoveredItemInfo.typeKey].levels[hoveredItemInfo.level - 1].stats.armor}</span></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}