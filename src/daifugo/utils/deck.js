// src/daifugo/utils/deck.js

const SUITS = ['Spade', 'Heart', 'Diamond', 'Club'];
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
  // 💡 기획 변경: 조커를 1장만 사용합니다. (총 53장)
  deck.push({ suit: 'Joker', rank: 'Joker', value: 16, id: 'Joker-1' });
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

export const distributeCards = (players) => {
  const deck = shuffle(createDeck());
  const newPlayers = JSON.parse(JSON.stringify(players));
  let currentPlayerIdx = 0;

  while (deck.length > 0) {
    newPlayers[currentPlayerIdx].hand.push(deck.pop());
    currentPlayerIdx = (currentPlayerIdx + 1) % 4;
  }

  let startingTurn = 0;
  newPlayers.forEach((player, idx) => {
    player.hand.sort((a, b) => a.value - b.value);
    if (player.hand.some(c => c.suit === 'Spade' && c.rank === '3')) {
      startingTurn = idx;
    }
  });

  return { updatedPlayers: newPlayers, startingTurn };
};