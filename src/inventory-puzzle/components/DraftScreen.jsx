import { useInventoryStore } from '../store/useInventoryStore';
import { ITEM_TYPES } from '../constants/itemTypes';
import Item from './Item';

export default function DraftScreen() {
  const { items, draftOptions, draftsRemaining, selectDraftItem, clearHoveredCell } = useInventoryStore();
  
  // ITEM_TYPES에 정의된 순서대로 정렬하기 위해 키 배열을 가져옵니다.
  const typeOrder = Object.keys(ITEM_TYPES);

  // 🌟 핵심: 가방에 없는 아이템을 걸러낸 뒤 정렬(Sort) 로직 추가
  const unplacedItems = Object.values(items)
    .filter(item => !item.isPlaced)
    .sort((a, b) => {
      // 1. 종류(typeKey)에 따라 정렬 (ITEM_TYPES에 정의된 순서 기준)
      const typeIndexA = typeOrder.indexOf(a.typeKey);
      const typeIndexB = typeOrder.indexOf(b.typeKey);
      
      if (typeIndexA !== typeIndexB) {
        return typeIndexA - typeIndexB;
      }
      
      // 2. 같은 종류라면 레벨(level) 순서로 정렬 (내림차순: 높은 레벨이 위로)
      return b.level - a.level; 
    });

  return (
    <div className="draft-panel">
      <h2>LOOT ({draftsRemaining}번 남음)</h2>
      
      {draftOptions.length > 0 ? (
        <div className="draft-options">
          {draftOptions.map(option => (
            <div 
              key={option.id} className="draft-card"
              onClick={() => selectDraftItem(option)}
            >
              <div style={{ marginRight: '15px' }}><Item id={option} isPreview={true} /></div>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>{ITEM_TYPES[option.typeKey].name} Lv.{option.level}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginBottom: '20px', color: '#9ca3af', fontSize: '0.9rem' }}>
          아이템 획득 완료.<br/>가방에 배치하세요.
        </div>
      )}

      <h2>QUEUE</h2>
      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '10px' }}>
        드래그 중 <b>R</b>키로 회전<br/>(가방 밖으로 빼면 대기열로 이동)
      </p>
      
      <div className="queue-container" onPointerEnter={clearHoveredCell}>
        {/* 정렬된 unplacedItems 배열을 렌더링합니다 */}
        {unplacedItems.map(item => (
          <Item key={item.id} id={item.id} />
        ))}
      </div>
    </div>
  );
}