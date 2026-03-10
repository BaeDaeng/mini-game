// src/daifugo/utils/cpuAi.js
import { sortHand, isValidPlay } from './gameLogic';

/**
 * 💡 1. 일반 턴 (제출 또는 패스 결정)
 * CPU가 현재 상황에서 낼 수 있는 가장 합리적인(약한) 카드를 선택합니다.
 */
export const getCpuBestPlay = (hand, tableCards, isRevolution, is11Back) => {
  // 카드를 현재 룰 기준 약한 순서대로 정렬
  const sortedHand = sortHand(hand, isRevolution, is11Back);
  if (sortedHand.length === 0) return [];

  // [상황 A] 선 턴일 경우 (바닥이 비어있음)
  if (!tableCards || tableCards.length === 0) {
    const weakestCard = sortedHand[0];
    // 기획 요구사항: 가장 낮은 카드를 가능한 한 여러 장을 한 번에 낸다.
    return sortedHand.filter(c => c.rank === weakestCard.rank);
  }

  // [상황 B] 받아치는 턴일 경우 (바닥에 카드가 있음)
  const tableCount = tableCards.length;

  // 특수 예외: 스페이드 3 가에시
  if (tableCount === 1 && tableCards[0].rank === 'Joker') {
    const spade3 = sortedHand.find(c => c.suit === 'Spade' && c.rank === '3');
    if (spade3) return [spade3];
  }

  // 기획 요구사항: 낼 수 있는 카드 중 가깝게 강한 카드를 낸다.
  // (이미 약한 순으로 정렬되어 있으므로, 처음으로 조건에 맞는 조합이 가장 가깝게 강한 패가 됨)
  for (let i = 0; i <= sortedHand.length - tableCount; i++) {
    // 바닥 장수만큼 카드를 묶어서 확인
    const candidateCombo = sortedHand.slice(i, i + tableCount);
    
    // 묶은 카드들이 모두 같은 숫자인지 확인 (조커 조합 등 복잡한 인공지능은 배제)
    const isAllSameRank = candidateCombo.every(c => c.rank === candidateCombo[0].rank);
    
    if (isAllSameRank && isValidPlay(candidateCombo, tableCards, isRevolution, is11Back)) {
      return candidateCombo;
    }
  }

  // 낼 카드가 없으면 빈 배열(Pass) 반환
  return [];
};

/**
 * 💡 2. 특수 룰 카드 선택 (7 와타시, 세금 납부)
 * 넘겨줄 카드를 고를 때, 자신이 가진 가장 약한 카드를 지정된 장수만큼 반환합니다.
 */
export const getCpuWeakestCards = (hand, count, isRevolution, is11Back) => {
  const sortedHand = sortHand(hand, isRevolution, is11Back);
  // 가장 약한 카드부터 count장만큼 잘라서 반환
  return sortedHand.slice(0, count);
};

/**
 * 💡 3. 12 봄버 타겟 선택
 * Q 카드를 냈을 때, 자신이 가진 카드 중 가장 약한 카드의 '숫자(Rank)'를 파괴 타겟으로 반환합니다.
 */
export const getCpuBomberTarget = (hand, isRevolution, is11Back) => {
  const sortedHand = sortHand(hand, isRevolution, is11Back);
  if (sortedHand.length === 0) return '3'; // 안전장치

  // 조커는 봄버로 파괴할 수 없으므로, 조커가 아닌 일반 카드 중 가장 약한 것을 찾음
  const weakestNormalCard = sortedHand.find(c => c.rank !== 'Joker') || sortedHand[0];
  return weakestNormalCard.rank;
};