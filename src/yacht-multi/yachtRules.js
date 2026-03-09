// 주사위 족보 점수 계산기
export const calculateScore = (dice, category) => {
  const sum = dice.reduce((a, b) => a + b, 0);
  const counts = [0, 0, 0, 0, 0, 0, 0]; // index 1~6 사용
  dice.forEach(d => counts[d]++);

  switch (category) {
    case 'ones': return counts[1] * 1;
    case 'twos': return counts[2] * 2;
    case 'threes': return counts[3] * 3;
    case 'fours': return counts[4] * 4;
    case 'fives': return counts[5] * 5;
    case 'sixes': return counts[6] * 6;
    case 'choice': return sum;
    case 'fourOfAKind': return counts.some(c => c >= 4) ? sum : 0;
    case 'fullHouse': return (counts.includes(3) && counts.includes(2)) ? sum : 0;
    case 'smallStraight': {
      const str = counts.slice(1).map(c => c > 0 ? 1 : 0).join('');
      return (str.includes('1111')) ? 15 : 0;
    }
    case 'largeStraight': {
      const str2 = counts.slice(1).map(c => c > 0 ? 1 : 0).join('');
      return (str2.includes('11111')) ? 30 : 0;
    }
    case 'yacht': return counts.some(c => c === 5) ? 50 : 0;
    default: return 0;
  }
};

// 초기 빈 점수판
export const getInitialScores = () => ({
  ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
  choice: null, fourOfAKind: null, fullHouse: null, smallStraight: null, largeStraight: null, yacht: null
});