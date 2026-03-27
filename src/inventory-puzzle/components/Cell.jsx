import { useInventoryStore } from '../store/useInventoryStore';

export default function Cell({ row, col, cellValue }) {
  const setHoveredCell = useInventoryStore(state => state.setHoveredCell);

  return (
    <div
      className={`grid-cell ${cellValue === -1 ? 'obstacle' : ''}`}
      onPointerEnter={() => {
        // 아이템을 드래그 중일 때만 현재 타일의 좌표를 스토어에 전달
        if (useInventoryStore.getState().draggingItemId) {
          setHoveredCell(row, col);
        }
      }}
    />
  );
}