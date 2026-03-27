import { useEffect } from 'react';
import { useInventoryStore } from './store/useInventoryStore';
import Inventory from './components/Inventory';
import DraftScreen from './components/DraftScreen';
import ItemInfo from './components/ItemInfo'; // 🌟 새로 만든 컴포넌트 임포트
import CombatScreen from './components/CombatScreen';
import './inventory-puzzle.css';

export default function GameStart() {
  const { initLevel } = useInventoryStore();

  useEffect(() => {
    const initialGrid = [
      [0, 0, 0, 0, 0], [0, -1, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, -1, -1, 0], [0, 0, 0, 0, 0],
    ];
    initLevel(initialGrid);
  }, [initLevel]);

  useEffect(() => {
    const handlePointerMove = (e) => {
      const state = useInventoryStore.getState();
      if (state.draggingItemId) state.updateMousePos(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      const state = useInventoryStore.getState();
      if (!state.draggingItemId) return;

      const dragId = state.draggingItemId;
      const dragNode = document.getElementById(`item-${dragId}`);
      
      if (dragNode) {
        const dragRect = dragNode.getBoundingClientRect();
        const targets = document.querySelectorAll('.item-element:not(.dragging)');
        let isMerged = false;

        for (let target of targets) {
          const targetId = target.getAttribute('data-id');
          const dragItem = state.items[dragId];
          const targetItem = state.items[targetId];

          if (targetItem && dragItem &&
              targetItem.typeKey === dragItem.typeKey &&
              targetItem.level === dragItem.level &&
              targetItem.level < 3) {
            
            const targetRect = target.getBoundingClientRect();
            const overlapX = Math.max(0, Math.min(dragRect.right, targetRect.right) - Math.max(dragRect.left, targetRect.left));
            const overlapY = Math.max(0, Math.min(dragRect.bottom, targetRect.bottom) - Math.max(dragRect.top, targetRect.top));
            const overlapArea = overlapX * overlapY;
            const dragArea = dragRect.width * dragRect.height; 

            if (overlapArea / dragArea >= 0.8) {
              state.mergeItems(dragId, targetId);
              isMerged = true;
              break;
            }
          }
        }
        if (isMerged) return; 
      }

      if (state.hoveredCell) {
        const tlRow = state.hoveredCell.row - state.grabOffset.row;
        const tlCol = state.hoveredCell.col - state.grabOffset.col;
        state.dropItem(dragId, tlRow, tlCol);
      } else {
        state.returnToQueue(dragId);
      }
    };

    const handleKeyDown = (e) => {
      const state = useInventoryStore.getState();
      if (state.draggingItemId && (e.key === 'r' || e.key === 'R')) state.rotateItem(state.draggingItemId);
      if (state.draftsRemaining > 0 && state.draftOptions.length > 0) {
        if (e.key === '1' && state.draftOptions[0]) state.selectDraftItem(state.draftOptions[0]);
        if (e.key === '2' && state.draftOptions[1]) state.selectDraftItem(state.draftOptions[1]);
        if (e.key === '3' && state.draftOptions[2]) state.selectDraftItem(state.draftOptions[2]);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.gameState === 'playing' && state.draftsRemaining === 0) state.endTurn();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="puzzle-container">
      <Inventory />
      <DraftScreen />
      <ItemInfo />  {/* 🌟 여기에 추가! */}
      <CombatScreen />
    </div>
  );
}