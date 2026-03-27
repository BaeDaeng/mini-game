import { useInventoryStore } from '../store/useInventoryStore';
import { ITEM_TYPES } from '../constants/itemTypes';

const ITEM_COLORS = { /* ... 기존 색상 객체 유지 ... */
  MEDKIT: { bg: 'rgba(22, 163, 74, 0.8)', border: '#15803d' },
  BULLET: { bg: 'rgba(234, 88, 12, 0.8)', border: '#c2410c' },
  SIDEARM: { bg: 'rgba(37, 99, 235, 0.8)', border: '#1d4ed8' },
  MELEE: { bg: 'rgba(220, 38, 38, 0.8)', border: '#b91c1c' },
  TACTICAL_GEAR: { bg: 'rgba(75, 85, 99, 0.8)', border: '#374151' },
  ARMOR: { bg: 'rgba(124, 58, 237, 0.8)', border: '#6d28d9' },
  ARTIFACT: { bg: 'rgba(202, 138, 4, 0.8)', border: '#a16207' },
};

export default function Item({ id, isPreview = false }) {
  const { items, startDrag, draggingItemId, mousePos, dragOffset, rotateItem, setHoveredItemInfo, clearHoveredItemInfo } = useInventoryStore();
  const item = isPreview ? id : items[id];
  const isDragging = draggingItemId === item?.id;
  const colors = ITEM_COLORS[item?.typeKey] || ITEM_COLORS.TACTICAL_GEAR;

  const handlePointerDown = (e) => {
    if (isPreview) return;
    e.preventDefault(); e.stopPropagation();
    const wrapper = document.getElementById(`item-${item.id}`);
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    startDrag(item.id, e.clientX, e.clientY, e.clientX - rect.left, e.clientY - rect.top);
  };

  // 🌟 마우스가 올라가고 내려올 때 정보 띄우기
  const handlePointerEnter = () => { if (!isDragging) setHoveredItemInfo(item); };
  const handlePointerLeave = () => { if (!isDragging) clearHoveredItemInfo(); };

  if (!item) return null;

  const rows = item.shape.length;
  const cols = item.shape[0].length;
  const CELL_SIZE = isPreview ? 25 : 50;

  return (
    <div
      id={isPreview ? undefined : `item-${item.id}`} 
      className={isPreview ? '' : `item-element ${isDragging ? 'dragging' : ''}`}
      data-id={item.id}
      onContextMenu={(e) => { e.preventDefault(); if (isDragging) rotateItem(item.id); }}
      style={{
        display: 'grid', gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`, gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
        position: isDragging ? 'fixed' : (item.isPlaced ? 'absolute' : 'relative'),
        left: isDragging ? mousePos.x - dragOffset.x : (item.isPlaced ? item.col * 50 : 'auto'),
        top: isDragging ? mousePos.y - dragOffset.y : (item.isPlaced ? item.row * 50 : 'auto'),
        zIndex: isDragging ? 9999 : 10, opacity: isDragging ? 0.8 : 1, transition: isDragging ? 'none' : 'transform 0.1s',
        pointerEvents: 'none', 
      }}
    >
      {item.shape.map((rowArr, r) =>
        rowArr.map((cell, c) => {
          const isFirstBlock = cell === 1 && r === 0 && c === rowArr.findIndex(val => val === 1);
          return (
            <div
              key={`${r}-${c}`}
              onPointerDown={cell === 1 ? handlePointerDown : undefined} 
              // 🌟 실질적인 타일(모양이 있는 부분)에 호버 이벤트 부착
              onPointerEnter={cell === 1 ? handlePointerEnter : undefined}
              onPointerLeave={cell === 1 ? handlePointerLeave : undefined}
              style={{
                width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px`,
                backgroundColor: cell === 1 ? colors.bg : 'transparent', border: cell === 1 ? `1px solid ${colors.border}` : 'none',
                boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 'bold', fontSize: isPreview ? '10px' : '14px',
                pointerEvents: cell === 1 ? (isDragging ? 'none' : 'auto') : 'none',
              }}
            >
              {isFirstBlock ? `Lv.${item.level}` : ''}
            </div>
          );
        })
      )}
    </div>
  );
}