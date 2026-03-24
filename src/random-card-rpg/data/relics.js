// 유물 데이터
export const RELICS = [
  { id: 'four_leaf_clover', name: '🍀 네잎클로버', desc: '행운 증가. 희귀 심볼 출현 확률 상승.', effectFunction: null, overallEffectFunction: null, rarity: 'rare' },
  { id: 'golden_key', name: '🔑 황금 열쇠', desc: '상점 심볼 가격 할인.', effectFunction: null, overallEffectFunction: null, rarity: 'uncommon' },
  { id: 'ancient_book', name: '📖 고대 마법서', desc: '마법 심볼 가치 증가.', effectFunction: (board, s, val, income) => s.id === 'magic_bolt' ? income + 5 : income, rarity: 'rare' },
];

export const getRandomRelicChoice = (count = 1) => {
  return [...Array(count)].map(() => RELICS[Math.floor(Math.random() * RELICS.length)]);
};