// src/daifugo/utils/gameLogic.js

export const getCardPower = (card, isRevolution, is11Back) => {
  if (card.rank === 'Joker') return 16;
  let power = card.value;
  const isReversed = isRevolution !== is11Back;
  if (isReversed) {
    power = 18 - power; 
  }
  return power;
};

export const isValidPlay = (selectedCards, tableCards, isRevolution, is11Back) => {
  if (!selectedCards || selectedCards.length === 0) return false;

  const nonJokers = selectedCards.filter(c => c.rank !== 'Joker');
  if (nonJokers.length > 0) {
    const targetRank = nonJokers[0].rank;
    if (!nonJokers.every(c => c.rank === targetRank)) return false; 
  }

  const selectedPower = nonJokers.length > 0 ? getCardPower(nonJokers[0], isRevolution, is11Back) : 16; 

  if (!tableCards || tableCards.length === 0) return true;

  const tableCount = tableCards.length;
  const tableNonJokers = tableCards.filter(c => c.rank !== 'Joker');
  const tablePower = tableNonJokers.length > 0 ? getCardPower(tableNonJokers[0], isRevolution, is11Back) : 16;

  // 스페이드 3 가에시
  if (tableCount === 1 && tableCards[0].rank === 'Joker' && selectedCards.length === 1) {
    if (selectedCards[0].suit === 'Spade' && selectedCards[0].rank === '3') return true;
  }

  if (selectedCards.length === tableCount) {
    return selectedPower > tablePower;
  }
  return false;
};

export const sortHand = (hand, isRevolution, is11Back) => {
  return [...hand].sort((a, b) => {
     return getCardPower(a, isRevolution, is11Back) - getCardPower(b, isRevolution, is11Back);
  });
};

// 💡 추가됨: 카드를 다 털어낸 사람을 건너뛰고 진짜 다음 턴을 찾아주는 함수
export const getNextActiveTurn = (currentTurn, direction, skipCount, players) => {
  let nextTurn = currentTurn;
  let skipsLeft = skipCount;
  let loopBreaker = 0; // 무한루프 방지
  
  while (skipsLeft > 0 && loopBreaker < 20) {
    nextTurn = (nextTurn + direction) % players.length;
    if (nextTurn < 0) nextTurn += players.length;
    // 손에 카드가 남아있는 사람만 턴을 받음
    if (players[nextTurn].hand.length > 0) {
      skipsLeft--;
    }
    loopBreaker++;
  }
  return nextTurn;
};