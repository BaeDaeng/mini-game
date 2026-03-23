// 게임의 모든 상태와 계산 로직
import { useState, useCallback } from 'react';
import { SYMBOLS } from '../data/symbols';

export const useGameEngine = () => {
  const [gold, setGold] = useState(0);
  const [rent, setRent] = useState(150); // 초기 임대료
  const [daysLeft, setDaysLeft] = useState(5);
  const [inventory, setInventory] = useState([...Array(5).fill(SYMBOLS[0])]);
  const [displaySlots, setDisplaySlots] = useState(Array(20).fill(null));

  // 임대료를 지불하고 다음 목표를 설정하는 로직 (에러 해결용)
  const payRent = useCallback(() => {
    if (gold >= rent) {
      setGold(prev => prev - rent);
      setRent(prev => Math.floor(prev * 1.5)); // 다음 임대료는 1.5배 상승
      setDaysLeft(5); // 날짜 초기화
      return true;
    }
    return false;
  }, [gold, rent]);

  const spin = useCallback(() => {
    const board = [...inventory].sort(() => 0.5 - Math.random()).slice(0, 20);
    setDisplaySlots(board);

    let income = 0;
    board.forEach((s) => {
      if (!s) return;
      let val = s.value;
      if (s.id === 'cat' && board.some(item => item?.id === 'milk')) val *= 3;
      if (s.id === 'flower' && board.some(item => item?.id === 'water')) val += 3;
      income += val;
    });

    setGold(prev => prev + income);
    setDaysLeft(prev => prev - 1);
  }, [inventory]);

  // setRent를 직접 내보내거나 위처럼 함수 안에서 사용하면 에러가 사라집니다.
  return { gold, rent, daysLeft, inventory, displaySlots, spin, payRent, setInventory, setGold, setDaysLeft };
};