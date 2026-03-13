// src/card-games/spider/spiderLogic.js

export const RANK_VALUES = {
  'ace': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, 
  '8': 8, '9': 9, '10': 10, 'jack': 11, 'queen': 12, 'king': 13
};

// 난이도에 따른 스파이더 덱 생성 (총 104장)
export const createSpiderDeck = (difficulty) => {
  const ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];
  let suitsToUse = [];
  
  if (difficulty === 1) suitsToUse = ['spades'];
  else if (difficulty === 2) suitsToUse = ['spades', 'hearts'];
  else suitsToUse = ['spades', 'hearts', 'clubs', 'diamonds'];

  let deck = [];
  // 104장을 맞추기 위해 무늬 세트를 반복
  const setsNeeded = 8 / suitsToUse.length; 

  for (let i = 0; i < setsNeeded; i++) {
    for (let suit of suitsToUse) {
      for (let rank of ranks) {
        deck.push({
          id: `${suit}-${rank}-${i}-${Math.random()}`,
          suit,
          rank,
          image: `/cards/${rank}_${suit}_white.png`,
          isFaceUp: false
        });
      }
    }
  }

  // 셔플
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

// 연속된 카드들이 같은 무늬이며 내림차순인지 확인 (같이 이동 가능한지)
export const isValidSequence = (cards) => {
  if (cards.length === 0) return false;
  let currentSuit = cards[0].suit;
  let currentRank = RANK_VALUES[cards[0].rank];

  for (let i = 1; i < cards.length; i++) {
    if (!cards[i].isFaceUp) return false;
    if (cards[i].suit !== currentSuit) return false;
    if (RANK_VALUES[cards[i].rank] !== currentRank - 1) return false;
    currentRank--;
  }
  return true;
};

// 특정 열(Column)의 끝부분이 K~A로 완성되었는지 확인
export const checkForCompletion = (column) => {
  if (column.length < 13) return false;
  const last13 = column.slice(-13);
  
  if (RANK_VALUES[last13[0].rank] !== 13) return false; // K로 시작해야 함
  return isValidSequence(last13);
};