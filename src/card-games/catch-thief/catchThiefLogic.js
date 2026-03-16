// src/card-games/catch-thief/catchThiefLogic.js

// 52장 + 조커 1장 = 53장 덱 생성
export const createCatchThiefDeck = () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];
  let deck = [];
  
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ id: `${suit}-${rank}`, suit, rank, image: `/cards/${rank}_${suit}_white.png` });
    }
  }
  // 조커 추가 (유일하게 짝이 없는 카드)
  deck.push({ id: 'joker-1', suit: 'joker', rank: 'joker', image: '/cards/joker_white.png' });
  
  // 셔플
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// 💡 스파이 모드 전용 덱 생성 (52장 중 무작위 1장 제거 = 총 51장)
export const createSpyDeck = () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];
  let deck = [];
  
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ id: `${suit}-${rank}`, suit, rank, image: `/cards/${rank}_${suit}_white.png` });
    }
  }
  
  // 셔플 (피셔-예이츠 알고리즘)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  // 💡 스파이 모드 핵심: 조커를 넣는 대신, 섞인 덱에서 아무 카드나 1장 몰래 빼버립니다!
  deck.pop(); 
  
  return deck;
};

// 손패에서 같은 숫자(rank) 2장이 모이면 제거하는 함수
export const removePairs = (hand) => {
  let rankCounts = {};
  hand.forEach(card => {
    if (!rankCounts[card.rank]) rankCounts[card.rank] = [];
    rankCounts[card.rank].push(card);
  });

  let newHand = [];
  for (let rank in rankCounts) {
    // 홀수 개(1장 또는 3장)일 경우 1장만 남기고, 짝수 개면 전부 제거됨
    if (rankCounts[rank].length % 2 !== 0) {
      newHand.push(rankCounts[rank][rankCounts[rank].length - 1]);
    }
  }
  return newHand;
};