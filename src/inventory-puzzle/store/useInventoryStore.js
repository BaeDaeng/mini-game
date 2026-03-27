import { create } from 'zustand';
import { checkPlacement, rotateShape } from '../utils/gridUtils';
import { ITEM_TYPES } from '../constants/itemTypes';
import { getEnemyForStage } from '../data/levels';

const cloneGrid = (grid) => grid.map((row) => [...row]);

const updateGridWithItem = (grid, shape, startRow, startCol, value) => {
  const newGrid = cloneGrid(grid);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) newGrid[startRow + r][startCol + c] = value;
    }
  }
  return newGrid;
};

export const useInventoryStore = create((set, get) => ({
  grid: [], items: {}, 
  draggingItemId: null, mousePos: { x: 0, y: 0 }, dragOffset: { x: 0, y: 0 }, grabOffset: { row: 0, col: 0 },
  hoveredCell: null,
  
  // 🌟 새롭게 추가된 상태: 마우스가 올라간 아이템의 정보
  hoveredItemInfo: null, 

  player: { maxHp: 30, hp: 30, armor: 0 }, enemy: null, gameState: 'playing', turn: 1, currentStage: 1,
  draftOptions: [], draftsRemaining: 0,

  initLevel: (initialGrid) => {
    set({
      grid: initialGrid, items: {}, draggingItemId: null, hoveredCell: null, hoveredItemInfo: null,
      player: { maxHp: 30, hp: 30, armor: 0 }, enemy: getEnemyForStage(1),
      gameState: 'playing', turn: 1, currentStage: 1, draftsRemaining: 3, draftOptions: [],
    });
    get().generateDraftOptions();
  },

  nextStage: () => {
    const state = get();
    const nextStageNum = state.currentStage + 1;
    set({
      currentStage: nextStageNum, enemy: getEnemyForStage(nextStageNum), gameState: 'playing',
      turn: 1, draftsRemaining: 1, player: { ...state.player, armor: 0 }
    });
    get().generateDraftOptions();
  },

  generateDraftOptions: () => {
    const types = Object.keys(ITEM_TYPES);
    const options = Array(3).fill(null).map((_, i) => {
      const typeKey = types[Math.floor(Math.random() * types.length)];
      return { id: `draft_${Date.now()}_${i}`, typeKey, level: Math.random() < 0.7 ? 1 : 2, shape: ITEM_TYPES[typeKey].shape, isPlaced: false };
    });
    set({ draftOptions: options });
  },

  selectDraftItem: (item) => {
    const { draftsRemaining, items } = get();
    set({ items: { ...items, [item.id]: item }, draftsRemaining: draftsRemaining - 1, hoveredItemInfo: null });
    if (draftsRemaining - 1 > 0) get().generateDraftOptions();
    else set({ draftOptions: [] });
  },

  endTurn: () => {
    const state = get();
    if (state.gameState !== 'playing') return;

    let totalDamage = 0, totalRecovery = 0, totalArmor = 0;
    Object.values(state.items).forEach(item => {
      if (item.isPlaced) {
        const stats = ITEM_TYPES[item.typeKey].levels[item.level - 1].stats;
        if (stats.damage) totalDamage += stats.damage;
        if (stats.recovery) totalRecovery += stats.recovery;
        if (stats.armor) totalArmor += stats.armor;
      }
    });

    let newPlayer = { ...state.player }, newEnemy = { ...state.enemy };
    newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + totalRecovery);
    newPlayer.armor += totalArmor;
    newEnemy.hp -= totalDamage;

    if (newEnemy.hp <= 0) return set({ enemy: newEnemy, gameState: 'victory' });

    let incoming = newEnemy.atk;
    if (newPlayer.armor >= incoming) newPlayer.armor -= incoming;
    else { incoming -= newPlayer.armor; newPlayer.armor = 0; newPlayer.hp -= incoming; }

    if (newPlayer.hp <= 0) return set({ player: newPlayer, enemy: newEnemy, gameState: 'defeat' });
    set({ player: newPlayer, enemy: newEnemy, turn: state.turn + 1, draftsRemaining: 1 });
    get().generateDraftOptions();
  },

  startDrag: (id, mouseX, mouseY, offsetX, offsetY) => {
    const { grid, items } = get();
    const item = items[id];
    if (!item) return;

    let newGrid = grid;
    if (item.isPlaced) newGrid = updateGridWithItem(grid, item.shape, item.row, item.col, 0);

    const grabCol = Math.floor(offsetX / 50);
    const grabRow = Math.floor(offsetY / 50);

    set({
      grid: newGrid, draggingItemId: id, mousePos: { x: mouseX, y: mouseY }, dragOffset: { x: offsetX, y: offsetY },
      grabOffset: { row: grabRow, col: grabCol }, hoveredCell: null, hoveredItemInfo: null
    });
  },

  updateMousePos: (x, y) => set({ mousePos: { x, y } }),
  setHoveredCell: (row, col) => set({ hoveredCell: { row, col } }),
  clearHoveredCell: () => set({ hoveredCell: null }),
  
  // 🌟 아이템 정보 호버 설정 함수
  setHoveredItemInfo: (item) => set({ hoveredItemInfo: item }),
  clearHoveredItemInfo: () => set({ hoveredItemInfo: null }),

  rotateItem: (id) => {
    set((state) => {
      const item = state.items[id];
      if (!item) return state;

      const rows = item.shape.length;
      const newShape = rotateShape(item.shape);
      const oldGrab = state.grabOffset;
      const newGrabRow = oldGrab.col;
      const newGrabCol = (rows - 1) - oldGrab.row;
      const newOffsetX = newGrabCol * 50 + (state.dragOffset.x % 50);
      const newOffsetY = newGrabRow * 50 + (state.dragOffset.y % 50);

      return {
        items: { ...state.items, [id]: { ...item, shape: newShape } },
        grabOffset: { row: newGrabRow, col: newGrabCol }, dragOffset: { x: newOffsetX, y: newOffsetY }
      };
    });
  },

  returnToQueue: (id) => {
    const { items } = get();
    if (!items[id]) return;
    set({ items: { ...items, [id]: { ...items[id], isPlaced: false } }, draggingItemId: null, hoveredCell: null });
  },

  mergeItems: (dragId, targetId) => {
    const { items } = get();
    const targetItem = items[targetId];
    if (!targetItem) return;

    const newItems = { ...items };
    newItems[targetId] = { ...targetItem, level: targetItem.level + 1 };
    delete newItems[dragId]; 
    set({ items: newItems, draggingItemId: null, hoveredCell: null });
  },

  dropItem: (id, targetRow, targetCol) => {
    const { grid, items, returnToQueue } = get();
    const item = items[id];
    if (!item) return;

    const result = checkPlacement(grid, item.shape, targetRow, targetCol, id);
    if (result.status === 'place') {
      const newGrid = updateGridWithItem(grid, item.shape, targetRow, targetCol, id);
      set({ grid: newGrid, items: { ...items, [id]: { ...item, row: targetRow, col: targetCol, isPlaced: true } }, draggingItemId: null, hoveredCell: null });
    } else {
      returnToQueue(id);
    }
  }
}));