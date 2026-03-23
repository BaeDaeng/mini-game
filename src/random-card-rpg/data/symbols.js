// 심볼 데이터 및 시너지 정의
export const SYMBOLS = [
  { id: 'coin', name: '🪙 동전', value: 1, rarity: 'common' },
  { id: 'cat', name: '🐱 고양이', value: 1, rarity: 'common', desc: '우유 옆에서 가치 3배' },
  { id: 'milk', name: '🥛 우유', value: 1, rarity: 'common' },
  { id: 'flower', name: '🌻 꽃', value: 2, rarity: 'uncommon', desc: '물뿌리개 옆에서 가치 +3' },
  { id: 'water', name: '💧 물뿌리개', value: 1, rarity: 'uncommon' },
  { id: 'diamond', name: '💎 다이아', value: 5, rarity: 'rare' },
];

export const getRandomChoices = (count = 3) => {
  return [...Array(count)].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
};