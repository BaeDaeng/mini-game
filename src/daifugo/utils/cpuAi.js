// src/daifugo/utils/cpuAi.js
import { sortHand, isValidPlay } from './gameLogic';

export const getCpuBestPlay = (hand, tableCards, isRevolution, is11Back) => {
  const sortedHand = sortHand(hand, isRevolution, is11Back);
  if (sortedHand.length === 0) return [];

  if (!tableCards || tableCards.length === 0) {
    const weakestCard = sortedHand[0];
    return sortedHand.filter(c => c.rank === weakestCard.rank);
  }

  const tableCount = tableCards.length;
  if (tableCount === 1 && tableCards[0].rank === 'Joker') {
    const spade3 = sortedHand.find(c => c.suit === 'Spade' && c.rank === '3');
    if (spade3) return [spade3];
  }

  for (let i = 0; i <= sortedHand.length - tableCount; i++) {
    const candidateCombo = sortedHand.slice(i, i + tableCount);
    const isAllSameRank = candidateCombo.every(c => c.rank === candidateCombo[0].rank);
    if (isAllSameRank && isValidPlay(candidateCombo, tableCards, isRevolution, is11Back)) {
      return candidateCombo;
    }
  }
  return [];
};

export const getCpuWeakestCards = (hand, count, isRevolution, is11Back) => {
  const sortedHand = sortHand(hand, isRevolution, is11Back);
  return sortedHand.slice(0, count);
};

// 💡 CPU가 12 봄버 발동 시 가장 필요없는 숫자를 파괴 타겟으로 지정하는 기능
export const getCpuBomberTarget = (hand, isRevolution, is11Back) => {
  const sortedHand = sortHand(hand, isRevolution, is11Back);
  if (sortedHand.length === 0) return '3'; 
  const weakestNormalCard = sortedHand.find(c => c.rank !== 'Joker') || sortedHand[0];
  return weakestNormalCard.rank;
};