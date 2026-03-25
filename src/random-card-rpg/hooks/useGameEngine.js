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

const STAGE_DATA = [
  { turns: 6, target: 30 },
  { turns: 6, target: 50 },
  { turns: 7, target: 95 },
  { turns: 7, target: 135 },
  { turns: 7, target: 180 },
  { turns: 8, target: 365 },
  { turns: 8, target: 400 },
  { turns: 8, target: 440 },
  { turns: 8, target: 500 }
];

export const useGameEngine = () => {
  const getInitialDeck = () => [
    SYMBOLS.find(s => s.id === 'priest'),
    SYMBOLS.find(s => s.id === 'blessing'),
    SYMBOLS.find(s => s.id === 'fairy'),
    SYMBOLS.find(s => s.id === 'heretic'),
    SYMBOLS.find(s => s.id === 'coin'),
    SYMBOLS.find(s => s.id === 'coin')
  ].map(createItem);
  
  const [difficulty, setDifficulty] = useState(1); 
  const [stage, setStage] = useState(1);
  const [gold, setGold] = useState(0); 
  const [targetGold, setTargetGold] = useState(STAGE_DATA[0].target); 
  const [daysLeft, setDaysLeft] = useState(STAGE_DATA[0].turns); 
  
  const [inventorySymbols, setInventorySymbols] = useState(getInitialDeck()); 
  const [displaySlots, setDisplaySlots] = useState(Array(20).fill(null));
  
  const [removeCount, setRemoveCount] = useState(1); 
  const [spinCount, setSpinCount] = useState(1);     
  const [equippedRelics, setEquippedRelics] = useState([]);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [baseGoldBonus, setBaseGoldBonus] = useState(0); 
  
  const [gameStats, setGameStats] = useState({ destroyedTrashBags: 0, destroyedTimeMages: 0, destroyedItems: 0 });

  const [turnState, setTurnState] = useState('idle'); 
  const [turnResults, setTurnResults] = useState(Array(20).fill(null)); 
  const [turnTotal, setTurnTotal] = useState(null); 
  const [effectResults, setEffectResults] = useState(Array(20).fill(null));
  const [destroyedSlots, setDestroyedSlots] = useState(Array(20).fill(false));

  const [relicResults, setRelicResults] = useState([]);
  const [relicEffectResults, setRelicEffectResults] = useState([]);
  const [destroyedRelics, setDestroyedRelics] = useState([]);

  const spin = useCallback(() => {
    if (daysLeft <= 0 || turnState !== 'idle') return;

    setTurnState('gold_anim');

    let currentInv = [...inventorySymbols].map(item => ({ ...item, age: (item.age || 0) + 1 }));
    let currentRelics = [...equippedRelics].map(r => ({ ...r, age: (r.age || 0) + 1 }));

    currentRelics.forEach(r => {
      if (r.id === 'trader' && r.stacks < 3) {
        const needed = 3 - r.stacks;
        let took = 0;
        for(let i=0; i<needed; i++) {
          const cIdx = currentInv.findIndex(x => x.id === 'coin');
          if (cIdx !== -1) { currentInv.splice(cIdx, 1); took++; }
        }
        r.stacks += took;
      }
    });

    const shuffledInv = [...currentInv].sort(() => 0.5 - Math.random());
    const selected = shuffledInv.slice(0, 20);
    let board = [...selected, ...Array(20 - selected.length).fill(null)].sort(() => 0.5 - Math.random());
    
    setDisplaySlots(board);
    setInventorySymbols(currentInv); 
    
    const relicEffects = {
      belial: currentRelics.some(r => r.id === 'belial'),
      lich: currentRelics.some(r => r.id === 'lich'),
      prayerEvoMult: currentRelics.some(r => r.id === 'believer_prayer') ? 3 : 1,
      elfEvoMult: currentRelics.some(r => r.id === 'elder_elf') ? 2 : 1,
      dragonEvoMult: currentRelics.some(r => r.id === 'dragon_trainer') ? 2.5 : 1,
      hammer: currentRelics.some(r => r.id === 'hammer'),
      training: currentRelics.some(r => r.id === 'training'),
      elderDragon: currentRelics.some(r => r.id === 'elder_dragon'),
      graveRobber: currentRelics.some(r => r.id === 'grave_robber'),
      lightSpirit: currentRelics.some(r => r.id === 'light_spirit'),
      colorlessOrb: currentRelics.some(r => r.id === 'colorless_orb'),
      lichSpellbook: currentRelics.some(r => r.id === 'lich_spellbook'),
      fairyShoes: currentRelics.some(r => r.id === 'fairy_shoes'),
      graveKeeper: currentRelics.some(r => r.id === 'grave_keeper'),
      cGuildBadge: currentRelics.some(r => r.id === 'c_guild_badge'),
      bGuildBadge: currentRelics.some(r => r.id === 'b_guild_badge'),
      aGuildBadge: currentRelics.some(r => r.id === 'a_guild_badge'),
      dragonKnight: currentRelics.some(r => r.id === 'dragon_knight'),
      highBelievers: currentRelics.some(r => r.id === 'high_believers'),
      bible: currentRelics.some(r => r.id === 'bible'),
      vampireLord: currentRelics.some(r => r.id === 'vampire_lord'),
      charmRing: currentRelics.some(r => r.id === 'charm_ring'),
      demonCrest: currentRelics.some(r => r.id === 'demon_crest'),
      goldNecklace: currentRelics.some(r => r.id === 'gold_necklace'),
      constellation: currentRelics.some(r => r.id === 'constellation'),
      evangelist: currentRelics.some(r => r.id === 'evangelist'),
      bishop: currentRelics.some(r => r.id === 'bishop')
    };

    let income = 0;
    let slotIncomes = Array(20).fill(null);
    let rIncomes = Array(currentRelics.length).fill(null);
    let bonusFromRelics = 0;

    let globalBonus = 0;
    const cainCount = currentInv.filter(s => s.id === 'cain_bless').length;
    const blessPriestCount = currentInv.filter(s => s.id === 'bless_priest').length;
    const highBlessCount = currentInv.filter(s => ['zenaris_bless', 'agnes_bless', 'echidna_bless', 'lurutia_bless'].includes(s.id)).length;
    
    // 가인의 축복: 각자가 가지고 있는 가인의 축복 개수만큼 골드를 주므로 제곱
    globalBonus += (cainCount * cainCount); 
    globalBonus += (blessPriestCount * highBlessCount * 2); 

    board.forEach((s, index) => { 
      if (!s) return;
      let val = baseGoldBonus; 
      if (s.gold) val += s.gold; 
      
      if (s.id === 'fairy' && relicEffects.fairyShoes) val += 1;
      if (['tomb', 'cemetery'].includes(s.id) && relicEffects.graveKeeper) val += 1;
      if (s.id === 'priest') {
          if (relicEffects.cGuildBadge) val += 1;
          if (relicEffects.bGuildBadge) val += 2;
          if (relicEffects.aGuildBadge) val += 3;
      }
      if (['baby_dragon', 'gold_baby_dragon', 'dragon', 'hades'].includes(s.id) && relicEffects.dragonKnight) {
          val += (s.gold || 0); 
      }
      if (s.id === 'zenaris_bless' && relicEffects.highBelievers) val += 4;
      if (s.id === 'great_bless' && relicEffects.bible) val += 2;
      if (['vampire', 'vampire_essence'].includes(s.id) && relicEffects.vampireLord) val += 1;
      if (['tempted_priest', 'succubus'].includes(s.id) && relicEffects.charmRing) val += 2;
      if (['agnes_curse', 'echidna_curse'].includes(s.id) && relicEffects.demonCrest) val += 1;
      if (['gold_ingot', 'mammon'].includes(s.id) && relicEffects.goldNecklace) val += 2;
      if (['angel', 'gabriel'].includes(s.id) && relicEffects.constellation) val += 1;
      if (s.id === 'heretic' && relicEffects.evangelist) val += 1;
      if (['believer', 'church'].includes(s.id) && relicEffects.bishop) val += 1;

      if (val !== 0) slotIncomes[index] = val; 
      income += val; 
    });
    
    currentRelics.forEach((r, idx) => {
      let rInc = 0;
      if (r.id === 'lucky_coin' || r.id === 'trash_can') rInc += 1;
      if (r.id === 'trader') rInc += r.stacks;
      if (r.id === 'bank') rInc -= 1;
      if (r.id === 'antique_collector' && currentRelics.length >= 5) rInc += 2;
      if (r.id === 'lucky_statue') rInc += 2;
      if (r.id === 'garbage_bin') rInc += gameStats.destroyedTrashBags;
      if (r.id === 'novice_wand') rInc += gameStats.destroyedTimeMages;
      if (r.id === 'garbage_truck' || r.id === 'lucky_charm') rInc += 3;
      if (r.id === 'novice_mage') rInc += 5;
      if (r.id === 'piggy_bank') rInc -= 3;
      if (r.id === 'training_sandbag' && currentInv.length >= 30) rInc += 5;
      if (r.id === 'lucky_sword') rInc += 4;
      if (r.id === 'gods_grace') rInc += Math.floor(currentRelics.length / 2);
      if (r.id === 'destroyer') rInc += Math.floor(gameStats.destroyedItems / 8);

      if (rInc !== 0) {
          rIncomes[idx] = rInc;
          bonusFromRelics += rInc;
      }
    });

    const totalIncome = income + globalBonus + bonusFromRelics;

    setTurnResults(slotIncomes);
    setRelicResults(rIncomes);
    setTurnTotal(totalIncome);
    setGold(prev => prev + totalIncome);
    setEquippedRelics(currentRelics);

    setTimeout(() => {
      setTurnResults(Array(20).fill(null));
      setRelicResults(Array(currentRelics.length).fill(null));
      setTurnTotal(null);

      const { effectResults: effResults, destroyedSlots: destSlots, itemsToAdd, uidsToRemove, stackUpdates, mutations, extraGold, extraRemoves, extraSpins, extraRelics, permGoldInc, lightSpiritEvents, itemsDestroyedThisTurn } = processBoardEffects(board, relicEffects);

      let finalExtraGold = extraGold;
      let finalExtraRemoves = extraRemoves;
      let finalExtraSpins = extraSpins;
      
      let rEffects = Array(currentRelics.length).fill(null);
      let rDestroyed = Array(currentRelics.length).fill(false);
      let rToRemove = [];

      if (relicEffects.colorlessOrb) {
        if (board[0] && board[4] && board[15] && board[19] && !destSlots[0] && !destSlots[4] && !destSlots[15] && !destSlots[19]) {
            finalExtraGold += 3;
            effResults[0] = effResults[0] ? effResults[0] + '\n+ 💰 3 (구슬)' : '+ 💰 3 (구슬)';
        }
      }
      if (currentRelics.some(r => r.id === 'bonus') && (totalIncome + finalExtraGold) <= 20) {
          finalExtraGold += 2;
          const bIdx = currentRelics.findIndex(r => r.id === 'bonus');
          rEffects[bIdx] = '+ 💰2';
      }
      if (currentRelics.some(r => r.id === 'double_bonus') && (totalIncome + finalExtraGold) <= 45) {
          finalExtraGold += 3;
          const dbIdx = currentRelics.findIndex(r => r.id === 'double_bonus');
          rEffects[dbIdx] = '+ 💰3';
      }

      if (lightSpiritEvents > 0) {
        const lsIdx = currentRelics.findIndex(r => r.id === 'light_spirit');
        if (lsIdx !== -1) {
            const newStacks = currentRelics[lsIdx].stacks + lightSpiritEvents;
            if (newStacks >= 3) {
                rDestroyed[lsIdx] = true;
                rToRemove.push(currentRelics[lsIdx].uid);
                rEffects[lsIdx] = '💥 파괴됨\n+ ✨2';
                itemsToAdd.push('lurutia_bless', 'lurutia_bless');
            } else {
                currentRelics[lsIdx].stacks = newStacks;
                rEffects[lsIdx] = `스택 +${lightSpiritEvents}`;
            }
        }
      }

      currentRelics.forEach((r, idx) => {
        const destroyRelic = (text, goldAdd=0, adds=[], removeAdd=0, spinAdd=0) => {
            rDestroyed[idx] = true;
            rToRemove.push(r.uid);
            if (rEffects[idx]) rEffects[idx] += `\n${text}`; else rEffects[idx] = text;
            if (goldAdd) finalExtraGold += goldAdd;
            if (removeAdd) finalExtraRemoves += removeAdd;
            if (spinAdd) finalExtraSpins += spinAdd;
            adds.forEach(a => itemsToAdd.push(a));
            if (r.id === 'trash_bag') setGameStats(p => ({ ...p, destroyedTrashBags: p.destroyedTrashBags + 1 }));
            if (r.id === 'time_mage') setGameStats(p => ({ ...p, destroyedTimeMages: p.destroyedTimeMages + 1 }));
        };

        if (r.id === 'bank' && r.age >= 10) destroyRelic('💥 파괴됨\n+ 💰30', 30);
        if (r.id === 'trash_bag' && r.stacks >= 2) destroyRelic('💥 파괴됨\n+ 💰12', 12);
        if (r.id === 'time_mage' && r.stacks >= 2) destroyRelic('💥 파괴됨\n+ 💰12', 12);
        if (r.id === 'trash_can' && r.age >= 5) destroyRelic('💥 파괴됨\n+ ❌1', 0, [], 1, 0);
        if (r.id === 'guild_safety' && r.age >= 10) destroyRelic('💥 파괴됨\n+ 💰15', 15);
        if (r.id === 'garbage_truck' && r.age >= 5) destroyRelic('💥 파괴됨\n+ ❌1', 0, [], 1, 0);
        if (r.id === 'guild_whistle' && r.age >= 8) destroyRelic('💥 파괴됨\n+ 💰20', 20);
        if (r.id === 'novice_mage' && r.age >= 5) destroyRelic('💥 파괴됨\n+ 🔄2', 0, [], 0, 2);
        if (r.id === 'piggy_bank' && r.age >= 10) destroyRelic('💥 파괴됨\n+ 💰100', 100);
        if (r.id === 'greedy_rich' && r.age === 1) { finalExtraGold += 30; rEffects[idx] = '+ 💰30'; } 
        if (r.id === 'nun' && r.age >= 10) destroyRelic('💥 파괴됨', 0, ['agnes_bless']);
        if (r.id === 'angel_bow' && r.age >= 10) destroyRelic('💥 파괴됨', 0, ['angel']);
        if (r.id === 'great_demon_scroll' && r.age >= 3) destroyRelic('💥 파괴됨', 0, ['satan']);
      });

      setGameStats(p => ({ ...p, destroyedItems: p.destroyedItems + itemsDestroyedThisTurn }));

      const hasEffects = effResults.some(r => r !== null) || destSlots.some(d => d) || rEffects.some(r => r !== null) || rDestroyed.some(d => d);

      if (hasEffects) {
        setTurnState('effect_anim');
        setEffectResults(effResults);
        setDestroyedSlots(destSlots);
        setRelicEffectResults(rEffects);
        setDestroyedRelics(rDestroyed);
        
        if (finalExtraGold !== 0) setGold(g => g + finalExtraGold);
        if (finalExtraRemoves > 0) setRemoveCount(r => r + finalExtraRemoves);
        if (finalExtraSpins > 0) setSpinCount(s => s + finalExtraSpins);
        if (permGoldInc > 0) setBaseGoldBonus(b => b + permGoldInc);
        if (extraRelics > 0) {
          for(let i=0; i<extraRelics; i++) setEquippedRelics(prev => [...prev, createItem(getRandomRelic(prev))]);
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
          setRelicEffectResults(Array(currentRelics.length).fill(null));
          setDestroyedRelics(Array(currentRelics.length).fill(false));
          completeTurn(rToRemove);
        }, 2000);
      } else {
        completeTurn(rToRemove);
      }
    }, 2000);

    function completeTurn(removedRelics) {
      setEquippedRelics(prev => prev.filter(r => !removedRelics.includes(r.uid)));

      setDaysLeft(prevDays => {
        let newDays = prevDays - 1;
        setGold(currentGoldAmount => {
            if (newDays <= 0 && currentGoldAmount < targetGold) {
                setEquippedRelics(currentEq => {
                    const aristo = currentEq.find(r => r.id === 'aristocrat' && !removedRelics.includes(r.uid));
                    if (aristo) {
                        newDays = 1; 
                        return currentEq.filter(r => r.uid !== aristo.uid);
                    }
                    return currentEq;
                });
            }
            return currentGoldAmount;
        });
        setTurnState('finished');
        return newDays;
      });
    }
  }, [inventorySymbols, daysLeft, turnState, baseGoldBonus, equippedRelics, gameStats, targetGold]);

  const useReroll = () => { 
    if (spinCount > 0) { 
        setSpinCount(p => p - 1); 
        setEquippedRelics(p => p.map(r => r.id === 'time_mage' ? { ...r, stacks: r.stacks + 1 } : r));
        return true; 
    } 
    return false; 
  };
  
  const removeSymbol = (index) => {
    if (removeCount > 0 && inventorySymbols[index].id !== 'priest') {
      setInventorySymbols(p => { const n = [...p]; n.splice(index, 1); return n; });
      setRemoveCount(p => p - 1);
      setEquippedRelics(p => p.map(r => r.id === 'trash_bag' ? { ...r, stacks: r.stacks + 1 } : r));
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

  const startGame = (mult) => {
    setDifficulty(mult);
    setStage(1);
    setGold(0);
    setTargetGold(Math.floor(STAGE_DATA[0].target * mult));
    setDaysLeft(STAGE_DATA[0].turns);
    
    setInventorySymbols(getInitialDeck());
    setDisplaySlots(Array(20).fill(null));
    setRemoveCount(1);
    setSpinCount(1);
    setEquippedRelics([]);
    setBaseGoldBonus(0);
    setGameStats({ destroyedTrashBags: 0, destroyedTimeMages: 0, destroyedItems: 0 });
    setTurnState('idle');
  };

  const nextStage = () => {
    setGold(prev => prev - targetGold); 
    const nextStageNum = stage + 1;
    
    let nextTurns = 8;
    let nextTargetBase = 500 + (nextStageNum - 9) * 100; 

    if (nextStageNum <= 9) {
      nextTurns = STAGE_DATA[nextStageNum - 1].turns;
      nextTargetBase = STAGE_DATA[nextStageNum - 1].target;
    }

    setTargetGold(Math.floor(nextTargetBase * difficulty)); 
    setDaysLeft(nextTurns); 
    setRemoveCount(prev => prev + stage); 
    setSpinCount(prev => prev + stage);
    setStage(nextStageNum); 
    setDisplaySlots(Array(20).fill(null)); 
    setTurnState('idle');
  };

  const restartGame = () => {
    startGame(difficulty); 
  };

  const addRelic = (relic) => setEquippedRelics(prev => [...prev, createItem(relic)]);

  return { 
      stage, gold, targetGold, daysLeft, inventorySymbols, displaySlots,
      removeCount, spinCount, equippedRelics, isRemoveMode,
      turnState, setTurnState, turnResults, turnTotal, effectResults, destroyedSlots,
      relicResults, relicEffectResults, destroyedRelics, 
      spin, startGame, nextStage, restartGame, setInventorySymbols, removeSymbol, removeRelic, toggleRemoveMode, useReroll, addRelic
  };
};