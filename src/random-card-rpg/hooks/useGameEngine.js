// 게임의 모든 상태와 계산 로직
// src/random-card-rpg/hooks/useGameEngine.js
import { useState, useCallback } from 'react';
import { SYMBOLS } from '../data/symbols';
import { RELICS, getRandomRelic } from '../data/relics';
import { processBoardEffects } from '../utils/effectLogic';

export const createItem = (baseItem) => ({ 
  ...baseItem, 
  uid: Math.random().toString(36).substr(2, 9), 
  stacks: 0,
  age: 0
});

export const useGameEngine = () => {
  const [stage, setStage] = useState(1);
  const [gold, setGold] = useState(0); 
  const [targetGold, setTargetGold] = useState(30); 
  const [daysLeft, setDaysLeft] = useState(7); 
  
  const initialDeck = [
    SYMBOLS.find(s => s.id === 'priest'),
    SYMBOLS.find(s => s.id === 'blessing'),
    SYMBOLS.find(s => s.id === 'fairy'),
    SYMBOLS.find(s => s.id === 'heretic'),
    SYMBOLS.find(s => s.id === 'coin'),
    SYMBOLS.find(s => s.id === 'coin')
  ].map(createItem);
  
  const [inventorySymbols, setInventorySymbols] = useState(initialDeck); 
  const [displaySlots, setDisplaySlots] = useState(Array(20).fill(null));
  
  const [removeCount, setRemoveCount] = useState(1); 
  const [spinCount, setSpinCount] = useState(1);     
  const [equippedRelics, setEquippedRelics] = useState([]);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [baseGoldBonus, setBaseGoldBonus] = useState(0); 

  const [turnState, setTurnState] = useState('idle'); 
  const [turnResults, setTurnResults] = useState(Array(20).fill(null)); 
  const [turnTotal, setTurnTotal] = useState(null); 
  const [effectResults, setEffectResults] = useState(Array(20).fill(null));
  const [destroyedSlots, setDestroyedSlots] = useState(Array(20).fill(false));

  const spin = useCallback(() => {
    if (daysLeft <= 0 || turnState !== 'idle') return;

    setTurnState('gold_anim');

    // 턴 나이(age)를 스핀 버튼 누르는 즉시 올려서 배지 UI에 바로 반영
    const currentInv = inventorySymbols.map(item => ({ ...item, age: (item.age || 0) + 1 }));

    const shuffledInv = [...currentInv].sort(() => 0.5 - Math.random());
    const selected = shuffledInv.slice(0, 20);
    let board = [...selected, ...Array(20 - selected.length).fill(null)].sort(() => 0.5 - Math.random());
    
    setDisplaySlots(board);
    setInventorySymbols(currentInv); // 바뀐 나이를 인벤토리에도 미리 1차 갱신

    let income = 0;
    let slotIncomes = Array(20).fill(null);

    let globalBonus = 0;
    const cainCount = currentInv.filter(s => s.id === 'cain_bless').length;
    const blessPriestCount = currentInv.filter(s => s.id === 'bless_priest').length;
    const highBlessCount = currentInv.filter(s => ['zenaris_bless', 'agnes_bless', 'echidna_bless', 'lurutia_bless'].includes(s.id)).length;
    globalBonus += cainCount; 
    globalBonus += (blessPriestCount * highBlessCount * 2); 

    board.forEach((s, index) => { 
      if (!s) return;
      let val = baseGoldBonus; 
      if (s.gold) val += s.gold; 
      if (val !== 0) slotIncomes[index] = val; 
      income += val; 
    });
    
    income += globalBonus;

    setTurnResults(slotIncomes);
    setTurnTotal(income);
    setGold(prev => prev + income);

    // 1단계 연출 후 (2초 대기)
    setTimeout(() => {
      setTurnResults(Array(20).fill(null));
      setTurnTotal(null);

      // 2단계 효과 판정
      const { effectResults: effResults, destroyedSlots: destSlots, itemsToAdd, uidsToRemove, stackUpdates, mutations, extraGold, extraRemoves, extraSpins, extraRelics, permGoldInc } = processBoardEffects(board);

      const hasEffects = effResults.some(r => r !== null) || destSlots.some(d => d);

      if (hasEffects) {
        setTurnState('effect_anim');
        setEffectResults(effResults);
        setDestroyedSlots(destSlots);
        
        if (extraGold !== 0) setGold(g => g + extraGold);
        if (extraRemoves > 0) setRemoveCount(r => r + extraRemoves);
        if (extraSpins > 0) setSpinCount(s => s + extraSpins);
        if (permGoldInc > 0) setBaseGoldBonus(b => b + permGoldInc);
        if (extraRelics > 0) {
          for(let i=0; i<extraRelics; i++) setEquippedRelics(prev => [...prev, getRandomRelic(prev)]);
        }

        setInventorySymbols(prev => {
          let nextInv = prev.filter(item => !uidsToRemove.includes(item.uid));
          nextInv = nextInv.map(item => {
            let n = { ...item };
            if (stackUpdates[item.uid] !== undefined) n.stacks = stackUpdates[item.uid];
            if (mutations[item.uid]) {
              const base = SYMBOLS.find(s => s.id === mutations[item.uid]);
              if (base) n = { ...base, uid: item.uid, stacks: 0, age: 0 };
            }
            return n;
          });
          itemsToAdd.forEach(id => {
            const base = SYMBOLS.find(s => s.id === id);
            if (base) nextInv.push(createItem(base));
          });
          return nextInv;
        });

        setTimeout(() => {
          setEffectResults(Array(20).fill(null));
          setDestroyedSlots(Array(20).fill(false));
          completeTurn();
        }, 2000);
      } else {
        completeTurn();
      }
    }, 2000);

    function completeTurn() {
      setDaysLeft(prev => {
        const newDays = prev - 1;
        setTurnState('finished');
        return newDays;
      });
    }
  }, [inventorySymbols, daysLeft, turnState, baseGoldBonus]);

  const useReroll = () => { if (spinCount > 0) { setSpinCount(p => p - 1); return true; } return false; };
  const removeSymbol = (index) => {
    if (removeCount > 0 && inventorySymbols[index].id !== 'priest') {
      setInventorySymbols(p => { const n = [...p]; n.splice(index, 1); return n; });
      setRemoveCount(p => p - 1);
      return true;
    }
    return false;
  };
  const removeRelic = (relicIndex) => {
    if (removeCount > 0 && equippedRelics[relicIndex]) {
      setEquippedRelics(p => { const n = [...p]; n.splice(relicIndex, 1); return n; });
      setRemoveCount(p => p - 1);
      if (removeCount - 1 === 0) setIsRemoveMode(false);
    }
  };
  const toggleRemoveMode = () => { if (removeCount > 0) setIsRemoveMode(p => !p); };

  const nextStage = () => {
    setGold(prev => prev - targetGold); 
    setTargetGold(prev => Math.floor(prev * 1.5) + 20); 
    setDaysLeft(7); 
    setRemoveCount(prev => prev + stage); 
    setSpinCount(prev => prev + stage);
    setStage(prev => prev + 1); 
    setDisplaySlots(Array(20).fill(null)); 
    setTurnState('idle');
  };

  const restartGame = () => {
    setStage(1); setGold(0); setTargetGold(30); setDaysLeft(7);
    setInventorySymbols(initialDeck); setDisplaySlots(Array(20).fill(null));
    setRemoveCount(1); setSpinCount(1); setEquippedRelics([]); setBaseGoldBonus(0);
    setTurnState('idle');
  };

  const addRelic = (relic) => setEquippedRelics(prev => [...prev, relic]);

  return { 
      stage, gold, targetGold, daysLeft, inventorySymbols, displaySlots,
      removeCount, spinCount, equippedRelics, isRemoveMode,
      turnState, setTurnState, turnResults, turnTotal, effectResults, destroyedSlots,
      spin, nextStage, restartGame, setInventorySymbols, removeSymbol, removeRelic, toggleRemoveMode, useReroll, addRelic
  };
};