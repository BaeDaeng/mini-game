import { useInventoryStore } from '../store/useInventoryStore';
import { checkPlacement } from '../utils/gridUtils';
import Cell from './Cell';
import Item from './Item';

export default function Inventory() {
  const { grid, items, draggingItemId, hoveredCell, clearHoveredCell } = useInventoryStore();

  if (!grid || grid.length === 0) return <div style={{ color: 'white' }}>로딩 중...</div>;

  const placedItems = Object.values(items).filter(item => item.isPlaced);
  const draggingItem = draggingItemId ? items[draggingItemId] : null;

  let previewBoxes = [];
  if (draggingItem && hoveredCell) {
    // 🌟 미리보기도 내가 잡은 오프셋만큼 빼서 진짜 위치를 계산
    const tlRow = hoveredCell.row - useInventoryStore.getState().grabOffset.row;
    const tlCol = hoveredCell.col - useInventoryStore.getState().grabOffset.col;

    const result = checkPlacement(grid, draggingItem.shape, tlRow, tlCol, draggingItemId);
    const isValid = result.status === 'place' || result.status === 'merge';
    const bgColor = isValid ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)';
    const borderColor = isValid ? '#16a34a' : '#dc2626';

    draggingItem.shape.forEach((rowArr, r) => {
      rowArr.forEach((cell, c) => {
        if (cell === 1) {
          previewBoxes.push(
            <div
              key={`preview-${r}-${c}`}
              style={{
                position: 'absolute',
                top: (tlRow + r) * 50,
                left: (tlCol + c) * 50,
                width: '50px', height: '50px',
                backgroundColor: bgColor,
                border: `3px solid ${borderColor}`,
                boxSizing: 'border-box',
                zIndex: 20, pointerEvents: 'none',
              }}
            />
          );
        }
      });
    });
  }

  return (
    <div className="inventory-panel">
      <h2>TACTICAL BACKPACK</h2>
      <div
        className="grid-board"
        onPointerLeave={clearHoveredCell}
        style={{
          gridTemplateRows: `repeat(${grid.length}, 50px)`,
          gridTemplateColumns: `repeat(${grid[0].length}, 50px)`,
        }}
      >
        {grid.map((row, r) => row.map((cellValue, c) => (
          <Cell key={`${r}-${c}`} row={r} col={c} cellValue={cellValue} />
        )))}
        {placedItems.map(item => <Item key={item.id} id={item.id} />)}
        {previewBoxes}
      </div>
    </div>
  );
}