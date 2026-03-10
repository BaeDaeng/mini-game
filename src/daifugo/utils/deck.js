// src/daifugo/utils/deck.js

const SUITS = ['Spade', 'Heart', 'Diamond', 'Club'];
// 카드의 기본 서열 가중치 (3이 가장 낮고, 2가 가장 높음)
const RANKS = [
  { name: '3', value: 3 }, { name: '4', value: 4 }, { name: '5', value: 5 },
  { name: '6', value: 6 }, { name: '7', value: 7 }, { name: '8', value: 8 },
  { name: '9', value: 9 }, { name: '10', value: 10 }, { name: 'J', value: 11 },
  { name: 'Q', value: 12 }, { name: 'K', value: 13 }, { name: 'A', value: 14 },
  { name: '2', value: 15 }
];

export const createDeck = () => {
  let deck = [];
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      deck.push({ suit: suit, rank: rank.name, value: rank.value, id: `${suit}-${rank.name}` });
    }
  }
  // 대부호에서는 일반적으로 조커 2장을 사용합니다 (총 54장)
  deck.push({ suit: 'Joker', rank: 'Joker', value: 16, id: 'Joker-1' });
  deck.push({ suit: 'Joker', rank: 'Joker', value: 16, id: 'Joker-2' });
  return deck;
};

export const shuffle = (deck) => {
  let shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 4명의 플레이어에게 카드를 분배하고 스페이드 3을 가진 사람의 인덱스를 반환
export const distributeCards = (players) => {
  const deck = shuffle(createDeck());
  const newPlayers = JSON.parse(JSON.stringify(players)); // 안전한 깊은 복사
  let currentPlayerIdx = 0;

  // 1장씩 순서대로 분배
  while (deck.length > 0) {
    newPlayers[currentPlayerIdx].hand.push(deck.pop());
    currentPlayerIdx = (currentPlayerIdx + 1) % 4;
  }

  // 첫 턴(스페이드 3) 찾기 및 패 정렬
  let startingTurn = 0;
  newPlayers.forEach((player, idx) => {
    // 💡 분배가 끝난 후 플레이어의 패를 보기 좋게 정렬 (기본 서열 기준)
    player.hand.sort((a, b) => a.value - b.value);
    
    // 스페이드 3을 가지고 있다면 그 사람이 선 턴
    if (player.hand.some(c => c.suit === 'Spade' && c.rank === '3')) {
      startingTurn = idx;
    }
  });

  return { updatedPlayers: newPlayers, startingTurn };
};