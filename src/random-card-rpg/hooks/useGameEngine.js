// 게임의 모든 상태와 계산 로직
import { useState, useCallback } from 'react';
import { SYMBOLS } from '../data/symbols';
// import { RELICS } from '../data/relics'; // 처음엔 유물이 없으니 주석 처리하거나 빈 배열 사용

export const useGameEngine = () => {
  // 실제 게임 시작에 맞는 초기값 설정
  const [gold, setGold] = useState(0); 
  const [targetGold, setTargetGold] = useState(100); // 1스테이지 목표 (예시)
  const [daysLeft, setDaysLeft] = useState(5); // 1스테이지 기한 (예시)
  const [inventorySymbols, setInventorySymbols] = useState([...Array(5).fill(SYMBOLS[0])]); // 기본 동전 5개로 시작
  const [displaySlots, setDisplaySlots] = useState(Array(20).fill(null));
  
  const [X_count, setX_count] = useState(0); // 처음엔 X 없음 (게임 진행하며 획득)
  const [equippedRelics, setEquippedRelics] = useState([]); // 처음엔 장착 유물 없음
  const [inventoryRelics, setInventoryRelics] = useState([]); // 보유 유물도 없음
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  const calculateIncome = useCallback((board) => {
    let income = 0;
    board.forEach((s) => {
      if (!s) return;
      let val = s.value;
      
      // 심볼 시너지 계산
      if (s.id === 'cat' && board.some(item => item?.id === 'milk')) val *= 3;
      if (s.id === 'flower' && board.some(item => item?.id === 'water')) val += 3;
      
      // 유물 개별 시너지 반영
      equippedRelics.forEach(relic => {
        if (relic.effectFunction) {
          income = relic.effectFunction(board, s, val, income);
        }
      });
      
      income += val;
    });
    
    // 유물 전체 시너지 반영
    equippedRelics.forEach(relic => {
        if (relic.overallEffectFunction) {
            income = relic.overallEffectFunction(board, income);
        }
    });

    return income;
  }, [equippedRelics]);

  const spin = useCallback(() => {
    // 남은 턴이 없으면 스핀을 막는 방어 로직
    if (daysLeft <= 0) return;

    // 덱에서 20개를 랜덤으로 뽑아 보드에 배치
    const board = [...inventorySymbols].sort(() => 0.5 - Math.random()).slice(0, 20);
    setDisplaySlots(board);

    // 수입 계산 및 상태 업데이트
    const income = calculateIncome(board);
    setGold(prev => prev + income);
    setDaysLeft(prev => prev - 1);
  }, [calculateIncome, inventorySymbols, daysLeft]);

  const addRelicToInventory = (relic) => {
    setInventoryRelics(prev => [...prev, relic]);
  };

  const equipRelic = (relicIndex) => {
    setInventoryRelics(prev => {
      const newInventory = [...prev];
      const relicToEquip = newInventory.splice(relicIndex, 1)[0];
      setEquippedRelics(equipped => [...equipped, relicToEquip]);
      return newInventory;
    });
  };

  const removeRelic = (relicIndex) => {
    if (X_count > 0 && equippedRelics[relicIndex]) {
      setEquippedRelics(prev => {
        const newEquipped = [...prev];
        // 제거된 유물은 파괴로 처리
        newEquipped.splice(relicIndex, 1);
        return newEquipped;
      });
      setX_count(prev => prev - 1);
      
      // 유물을 다 지웠는데 제거 모드가 켜져있으면 자동으로 끄기
      if (X_count - 1 === 0) setIsRemoveMode(false);
    }
  };

  const addX = (count) => {
    setX_count(prev => prev + count);
  };

  const toggleRemoveMode = () => {
    if (X_count > 0) setIsRemoveMode(prev => !prev);
  };

  return { 
      gold, targetGold, daysLeft, inventorySymbols, displaySlots, spin, setInventorySymbols,
      X_count, equippedRelics, inventoryRelics, isRemoveMode,
      addRelicToInventory, equipRelic, removeRelic, addX, toggleRemoveMode,
      setGold, setTargetGold, setDaysLeft // 나중에 다음 스테이지로 넘어갈 때 쓰기 위해 추가
  };
};