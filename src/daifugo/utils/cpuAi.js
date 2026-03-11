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

// 💡 CPU가 낸 장수(count)만큼 파괴할 대상을 배열로 반환합니다.
export const getCpuBomberTarget = (hand, isRevolution, is11Back, count) => {
  const sortedHand = sortHand(hand, isRevolution, is11Back);
  
  // 손패에서 조커를 제외하고 약한 순서대로 '중복 없는' 숫자(랭크)들만 뽑아냅니다.
  const uniqueRanks = [...new Set(sortedHand.filter(c => c.rank !== 'Joker').map(c => c.rank))];
  
  if (uniqueRanks.length === 0) return ['3']; // 만약 손에 조커밖에 없다면 기본값 반환
  
  // 가장 불필요한(약한) 숫자부터 count개만큼 배열로 잘라서 반환
  return uniqueRanks.slice(0, count);
};