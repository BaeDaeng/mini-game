// src/card-games/texas-holdem/holdemLogic.js

// 카드 값 매핑
const RANK_VALUES = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'jack': 11, 'queen': 12, 'king': 13, 'ace': 14 };

// 7장의 카드 중 가장 높은 족보의 점수를 계산 (간이 알고리즘)
export const evaluateHand = (cards) => {
  if (!cards || cards.length < 5) return { score: 0, name: "하이 카드" };

  const suits = {};
  const ranks = {};
  cards.forEach(card => {
    suits[card.suit] = (suits[card.suit] || 0) + 1;
    ranks[RANK_VALUES[card.rank]] = (ranks[RANK_VALUES[card.rank]] || 0) + 1;
  });

  const rankNumbers = Object.keys(ranks).map(Number).sort((a, b) => b - a);
  let isFlush = false;

  for (let suit in suits) {
    if (suits[suit] >= 5) {
      isFlush = true;
    }
  }

  // 스트레이트 확인
  let isStraight = false;
  let straightHigh = 0;
  let consecutives = 0;
  for (let i = 0; i < rankNumbers.length - 1; i++) {
    if (rankNumbers[i] - 1 === rankNumbers[i + 1]) {
      consecutives++;
      if (consecutives >= 4) { isStraight = true; straightHigh = rankNumbers[i - 3]; break; }
    } else if (rankNumbers[i] !== rankNumbers[i + 1]) {
      consecutives = 0;
    }
  }
  // A, 2, 3, 4, 5 예외 처리
  if (ranks[14] && ranks[2] && ranks[3] && ranks[4] && ranks[5]) { isStraight = true; straightHigh = 5; }

  const counts = Object.values(ranks).sort((a, b) => b - a);
  
  if (isStraight && isFlush) return { score: 8000 + straightHigh, name: "스트레이트 플러쉬" };
  if (counts[0] === 4) return { score: 7000 + rankNumbers[0], name: "포카드" };
  if (counts[0] === 3 && counts[1] >= 2) return { score: 6000 + rankNumbers[0], name: "풀하우스" };
  if (isFlush) return { score: 5000, name: "플러쉬" };
  if (isStraight) return { score: 4000 + straightHigh, name: "스트레이트" };
  if (counts[0] === 3) return { score: 3000 + rankNumbers[0], name: "트리플" };
  if (counts[0] === 2 && counts[1] === 2) return { score: 2000 + rankNumbers[0], name: "투페어" };
  if (counts[0] === 2) return { score: 1000 + rankNumbers[0], name: "원페어" };
  
  return { score: rankNumbers[0], name: "하이 카드" };
};