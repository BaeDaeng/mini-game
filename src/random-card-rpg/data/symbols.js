// 심볼 데이터
export const SYMBOLS = [
  { 
    id: 'coin', 
    name: '🪙 동전', 
    value: 1, 
    rarity: 'common' 
  },
  { 
    id: 'cat', 
    name: '🐱 고양이', 
    value: 1, 
    rarity: 'common', 
    desc: '우유가 덱에 있으면 가치 3배' 
  },
  { 
    id: 'milk', 
    name: '🥛 우유', 
    value: 1, 
    rarity: 'common' 
  },
  { 
    id: 'flower', 
    name: '🌻 꽃', 
    value: 2, 
    rarity: 'uncommon', 
    desc: '물뿌리개가 덱에 있으면 가치 +3' 
  },
  { 
    id: 'water', 
    name: '💧 물뿌리개', 
    value: 1, 
    rarity: 'uncommon' 
  },
  { 
    id: 'diamond', 
    name: '💎 다이아', 
    value: 5, 
    rarity: 'rare' 
  },
];

// 게임 턴 종료 후 선택지로 보여줄 무작위 심볼을 뽑는 함수입니다.
export const getRandomChoices = (count = 3) => {
  return [...Array(count)].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
};