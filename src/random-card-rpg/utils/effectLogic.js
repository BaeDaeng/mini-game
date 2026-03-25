// src/random-card-rpg/utils/effectLogic.js

export const processBoardEffects = (board, relicEffects) => {
  const effectResults = Array(20).fill(null);
  const destroyedSlots = Array(20).fill(false);
  
  const itemsToAdd = [];
  const uidsToRemove = [];
  const stackUpdates = {};
  const goldUpdates = {}; // 개별 아이템 영구 골드 상승용
  const mutations = {};
  
  let extraGold = 0;
  let extraRemoves = 0;
  let extraSpins = 0;
  let extraRelics = 0;

  let lightSpiritEvents = 0;
  let itemsDestroyedThisTurn = 0;

  const getAdjacentIndices = (index) => {
    const adj = [];
    const row = Math.floor(index / 5);
    const col = index % 5;
    
    for (let r = Math.max(0, row - 1); r <= Math.min(3, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(4, col + 1); c++) {
        if (r === row && c === col) continue; 
        adj.push(r * 5 + c);
      }
    }
    return adj;
  };

  const addFloatingText = (index, text) => {
    if (effectResults[index]) effectResults[index] += `\n${text}`;
    else effectResults[index] = text;
  };

  const destroyTarget = (targetIdx, targetItem, byPriest = false) => {
    if (relicEffects.lich && targetItem.id === 'undead') return false; 

    if (!destroyedSlots[targetIdx]) {
      destroyedSlots[targetIdx] = true;
      uidsToRemove.push(targetItem.uid);
      addFloatingText(targetIdx, `💥 파괴됨`);
      itemsDestroyedThisTurn++;
      
      if (relicEffects.hammer && Math.random() < 0.10) { extraGold += 3; addFloatingText(targetIdx, '+ 💰 3 (해머)'); }
      if (byPriest && relicEffects.training) { extraGold += 4; addFloatingText(targetIdx, '+ 💰 4 (훈련)'); }
      if (relicEffects.elderDragon && ['elf', 'dwarf'].includes(targetItem.id)) { extraGold += 3; addFloatingText(targetIdx, '+ 💰 3 (원로 용)'); }
      if (relicEffects.graveRobber && ['tomb', 'cemetery'].includes(targetItem.id)) { extraGold += 4; addFloatingText(targetIdx, '+ 💰 4 (도굴)'); }
      if (relicEffects.lightSpirit && ['zenaris_bless', 'agnes_bless', 'echidna_bless'].includes(targetItem.id)) { lightSpiritEvents++; }
      
      return true;
    }
    return false;
  };

  board.forEach((item, index) => {
    if (!item || destroyedSlots[index]) return;

    const adjs = getAdjacentIndices(index);
    const age = item.age || 0;
    const isSpinCycle = (cycle) => age > 0 && age % cycle === 0;

    const isCurse = ['zenaris_curse', 'agnes_curse', 'echidna_curse', 'lurutia_curse', 'cain_curse'].includes(item.id);
    if (relicEffects.belial && isCurse) return;

    if (relicEffects.lichSpellbook && ['tomb', 'cemetery', 'skeleton'].includes(item.id) && Math.random() < 0.25) {
      destroyTarget(index, item);
      return; 
    }

    if (item.id === 'slime' && isSpinCycle(7)) { itemsToAdd.push('slime'); addFloatingText(index, '+ 💧 슬라임'); }
    if (item.id === 'zenaris_curse' && isSpinCycle(2)) { extraGold -= 1; addFloatingText(index, '- 💰 1'); }
    if (item.id === 'cain_curse' && isSpinCycle(4)) { extraGold -= 5; addFloatingText(index, '- 💰 5'); }
    if (item.id === 'goddess_light' && isSpinCycle(4)) { extraGold += 14; addFloatingText(index, '+ 💰 14'); }
    if (item.id === 'dragon_egg' && Math.random() < 0.07 * relicEffects.dragonEvoMult) { mutations[item.uid] = 'baby_dragon'; addFloatingText(index, '✨ 진화!'); }
    if (item.id === 'prayer' && Math.random() < 0.01 * relicEffects.prayerEvoMult) { mutations[item.uid] = 'cain_bless'; addFloatingText(index, '✨ 응답!'); }
    if (item.id === 'baby_dragon' && Math.random() < 0.07 * relicEffects.dragonEvoMult) { mutations[item.uid] = 'dragon'; addFloatingText(index, '✨ 진화!'); }
    if (item.id === 'agnes_curse' && Math.random() < 0.20) { itemsToAdd.push('coin'); addFloatingText(index, '+ 🪙 코인'); }
    if (item.id === 'echidna_curse' && Math.random() < 0.10) { extraGold -= 4; addFloatingText(index, '- 💰 4'); }
    if (item.id === 'echidna_bless' && Math.random() < 0.10) { extraGold += 3; addFloatingText(index, '+ 💰 3'); }
    if (item.id === 'dwarf' && Math.random() < 0.10) { itemsToAdd.push('lemonade'); addFloatingText(index, '+ 🍋 레모네이드'); }
    if (item.id === 'elf' && Math.random() < 0.10 * relicEffects.elfEvoMult) { mutations[item.uid] = 'elf_chief'; addFloatingText(index, '✨ 진화!'); }
    if (item.id === 'angel' && Math.random() < 0.10) { mutations[item.uid] = 'gabriel'; addFloatingText(index, '✨ 진화!'); }
    if (item.id === 'gold_baby_dragon' && Math.random() < 0.04 * relicEffects.dragonEvoMult) { mutations[item.uid] = 'hades'; addFloatingText(index, '✨ 하데스 강림!'); }
    if (item.id === 'lurutia_curse' && Math.random() < 0.10) { itemsToAdd.push('coin'); itemsToAdd.push('coin'); addFloatingText(index, '+ 🪙 2코인'); }
    if (item.id === 'skeleton' && Math.random() < 0.10) { itemsToAdd.push('undead'); addFloatingText(index, '+ 🧟 언데드'); }
    if (item.id === 'priest' && isSpinCycle(7)) { itemsToAdd.push('blessing'); addFloatingText(index, '+ 💫 축복'); }
    if (item.id === 'heretic' && isSpinCycle(7)) { itemsToAdd.push('heretic'); addFloatingText(index, '+ 👺 이단자'); }
    if (item.id === 'altar') { itemsToAdd.push('blessing'); addFloatingText(index, '+ 💫 축복'); }

    const destroySelfAt = (turns) => { if (age >= turns) destroyTarget(index, item); };
    if (['tempted_priest', 'ghost', 'undead', 'lemonade', 'vampire_essence', 'gold_ingot'].includes(item.id)) destroySelfAt(3);
    if (['undead_baby_dragon', 'undead_dragon', 'altar'].includes(item.id)) destroySelfAt(4);
    if (item.id === 'great_bless') destroySelfAt(5);
    if (item.id === 'high_potion') destroySelfAt(10);
    if (['dark_potion', 'mana_potion', 'haste_potion', 'chaos_potion', 'ultimate_potion'].includes(item.id)) destroySelfAt(1);
    if (item.id === 'gold_dragon_egg' && age >= 25) { mutations[item.uid] = 'gold_baby_dragon'; addFloatingText(index, '✨ 부화!'); }

    if (item.id === 'fairy') { adjs.forEach(a => { if (board[a] && ['blessing', 'great_bless'].includes(board[a].id)) { extraGold += 1; addFloatingText(index, '+ 💰 1'); } }); }
    if (item.id === 'agnes_bless') { adjs.forEach(a => { if (board[a] && board[a].id === 'agnes_bless') { extraGold += 1; addFloatingText(index, '+ 💰 1'); } }); }
    if (item.id === 'church') { adjs.forEach(a => { if (board[a] && board[a].id === 'believer') { extraGold += 2; addFloatingText(index, '+ 💰 2'); } }); }
    if (item.id === 'gargoyle') { adjs.forEach(a => { if (board[a] && ['zenaris_curse', 'agnes_curse', 'echidna_curse'].includes(board[a].id)) { extraGold += 1; addFloatingText(index, '+ 💰 1'); } }); }
    if (item.id === 'demon_worshiper') { adjs.forEach(a => { if (board[a] && ['heretic', 'gargoyle'].includes(board[a].id)) { extraGold += 2; addFloatingText(index, '+ 💰 2'); } }); }
    if (item.id === 'elf_chief') { adjs.forEach(a => { if (board[a] && ['half_elf', 'dwarf', 'elf'].includes(board[a].id)) { extraGold += 2; addFloatingText(index, '+ 💰 2'); } }); }
    if (item.id === 'archbishop') { adjs.forEach(a => { if (board[a] && ['agnes_bless', 'echidna_bless', 'lurutia_bless'].includes(board[a].id)) { extraGold += 1; addFloatingText(index, '+ 💰 1'); } }); }
    
    if (item.id === 'vampire') { 
      adjs.forEach(a => { 
        if (board[a] && ['priest', 'inquisitor'].includes(board[a].id)) { 
          itemsToAdd.push('vampire_essence'); 
          addFloatingText(index, '+ 🩸 정수'); 
        } 
      }); 
    }

    if (item.id === 'lucifer') {
      adjs.forEach(a => { 
        const b = board[a];
        if (b && b.id.includes('_bless')) { 
          mutations[b.uid] = b.id.replace('_bless', '_curse'); 
          addFloatingText(a, '💀 타락!'); 
          if (relicEffects.lightSpirit && ['zenaris_bless', 'agnes_bless', 'echidna_bless'].includes(b.id)) lightSpiritEvents++;
        }
      });
    }
    
    if (item.id === 'necromancer') {
      adjs.forEach(a => {
        if (board[a]?.id === 'baby_dragon') { mutations[board[a].uid] = 'undead_baby_dragon'; addFloatingText(a, '🦴 언데드화'); }
        if (board[a]?.id === 'dragon') { mutations[board[a].uid] = 'undead_dragon'; addFloatingText(a, '☠️ 언데드화'); }
      });
    }

    if (['blessing', 'monastery', 'heal'].includes(item.id)) {
      let targetCount = 0;
      adjs.forEach(a => {
        if (board[a] && ((item.id === 'blessing' || item.id === 'heal') && board[a].id === 'priest' || item.id === 'monastery' && board[a].id === 'zenaris_bless')) {
          targetCount++;
        }
      });
      if (targetCount > 0) {
        const newStacks = (item.stacks || 0) + targetCount;
        stackUpdates[item.uid] = newStacks;
        addFloatingText(index, `스택 +${targetCount}`);

        if (item.id === 'blessing' && newStacks >= 2) {
          destroyTarget(index, item);
          const r = ['zenaris_bless', 'agnes_bless', 'echidna_bless'];
          itemsToAdd.push(r[Math.floor(Math.random() * r.length)]);
        }
        if (item.id === 'monastery' && newStacks >= 4) destroyTarget(index, item);
        if (item.id === 'heal' && newStacks >= 2) {
          destroyTarget(index, item);
          if (Math.random() < 0.25) { extraGold += 1; addFloatingText(index, '+ 💰 1'); }
        }
      }
    }

    if (item.id === 'abyss_orb') {
      if (adjs.length > 0 && adjs.every(a => board[a] !== null && !destroyedSlots[a])) destroyTarget(index, item);
    }
    if (item.id === 'egg_thief') {
      const hasDragon = adjs.some(a => board[a] && ['dragon', 'hades'].includes(board[a].id));
      if (hasDragon) destroyTarget(index, item);
    }

    const tryDestroy = (targets, onSuccess, isPriest = false) => {
      let count = 0;
      adjs.forEach(a => {
        if (board[a] && targets.includes(board[a].id) && !destroyedSlots[a]) {
          if (destroyTarget(a, board[a], isPriest)) count++;
        }
      });
      if (count > 0 && onSuccess) onSuccess(count);
    };

    if (item.id === 'priest') tryDestroy(['slime', 'heretic'], null, true);
    if (item.id === 'abbot') tryDestroy(['tomb', 'cemetery', 'skeleton']);
    if (item.id === 'egg_thief') tryDestroy(['dragon_egg', 'gold_dragon_egg'], (c) => { extraGold += c * 10; addFloatingText(index, `+ 💰 ${c*10}`); });
    if (item.id === 'great_spirit') tryDestroy(['zenaris_bless', 'agnes_bless', 'echidna_bless'], (c) => { extraGold += c * 4; addFloatingText(index, `+ 💰 ${c*4}`); });
    if (item.id === 'succubus') tryDestroy(['priest'], (c) => { for(let i=0; i<c; i++) itemsToAdd.push('tempted_priest'); });
    if (item.id === 'inquisitor') tryDestroy(['heretic'], (c) => { for(let i=0; i<c; i++) itemsToAdd.push('believer'); });
    if (item.id === 'undead_king') tryDestroy(['heretic', 'believer', 'abbot', 'necromancer'], (c) => { for(let i=0; i<c; i++) itemsToAdd.push('skeleton'); });
    if (item.id === 'mammon') tryDestroy(['believer', 'heretic', 'inquisitor', 'demon_worshiper'], (c) => { for(let i=0; i<c; i++) itemsToAdd.push('gold_ingot'); });
    if (item.id === 'demon_cult') tryDestroy(['heretic'], (c) => { for(let i=0; i<c; i++) { if(Math.random()<0.25) itemsToAdd.push('cain_curse'); } });
    
    // 십자가 로직 완벽 수정: 해당 십자가의 자체 영구 골드를 올려줌
    if (item.id === 'cross') {
      tryDestroy(['zenaris_curse', 'agnes_curse', 'echidna_curse', 'lurutia_curse', 'cain_curse'], (c) => {
        const currentGold = item.gold !== undefined ? item.gold : 2; // 십자가 기본 골드는 2
        goldUpdates[item.uid] = currentGold + c;
        addFloatingText(index, `영구 골드+${c}!`);
      });
    }
    
    if (item.id === 'michael') tryDestroy(['imp', 'gargoyle', 'vampire', 'succubus'], (c) => { 
        const r = ['agnes_bless', 'echidna_bless', 'lurutia_bless'];
        for(let i=0; i<c; i++) itemsToAdd.push(r[Math.floor(Math.random() * r.length)]); 
    });

    if (item.id === 'dragon') {
      tryDestroy(['half_elf', 'dwarf', 'elf'], (c) => {
        const newStacks = (item.stacks || 0) + c;
        stackUpdates[item.uid] = newStacks;
        if (newStacks >= 2) { mutations[item.uid] = 'gold_baby_dragon'; addFloatingText(index, '✨ 진화!'); }
      });
    }
    if (item.id === 'gabriel') {
      tryDestroy(['imp', 'gargoyle', 'vampire', 'succubus'], (c) => {
        const newStacks = (item.stacks || 0) + c;
        stackUpdates[item.uid] = newStacks;
        if (newStacks >= 4) { mutations[item.uid] = 'michael'; addFloatingText(index, '✨ 미카엘 강림!'); }
      });
    }
    if (item.id === 'satan') {
      tryDestroy(['heretic', 'believer', 'abbot', 'necromancer', 'inquisitor', 'archbishop'], (c) => {
        extraGold += c * 20; addFloatingText(index, `+ 💰 ${c*20}`);
        const newStacks = (item.stacks || 0) + c;
        stackUpdates[item.uid] = newStacks;
        if (newStacks >= 4) destroyTarget(index, item);
      });
    }
    
    if (item.id === 'hades') {
      tryDestroy(['dwarf', 'elf', 'elf_chief'], () => {
        let colGold = 0;
        const col = index % 5;
        for(let i=0; i<4; i++) {
          const s = board[col + i*5];
          if (s && s.gold) colGold += s.gold;
        }
        extraGold += colGold;
        addFloatingText(index, `+ 💰 ${colGold} (세로줄 2배)`);
      });
    }
  });

  board.forEach((item, index) => {
    if (item && destroyedSlots[index]) {
      if (['slime', 'heretic', 'heal', 'vampire_essence'].includes(item.id)) { extraGold += 4; addFloatingText(index, '+ 💰 4'); }
      if (item.id === 'lemonade') { extraGold += 5; addFloatingText(index, '+ 💰 5'); }
      if (item.id === 'monastery') { extraGold += 6; addFloatingText(index, '+ 💰 6'); }
      if (item.id === 'abyss_orb') { const g = Math.floor(Math.random()*5)+8; extraGold += g; addFloatingText(index, `+ 💰 ${g}`); }
      
      if (item.id === 'tomb') itemsToAdd.push('undead');
      if (item.id === 'cemetery') { itemsToAdd.push('undead'); itemsToAdd.push('undead'); }
      if (item.id === 'skeleton') { for(let i=0; i<5; i++) itemsToAdd.push('undead'); addFloatingText(index, '🦴 쏟아지는 뼈'); }
      if (item.id === 'tempted_priest') itemsToAdd.push('priest');
      if (item.id === 'great_bless') { itemsToAdd.push('blessing'); itemsToAdd.push('blessing'); }
      
      if (item.id === 'high_potion') { extraRelics += 1; addFloatingText(index, '🎁 유물 획득!'); }
      if (item.id === 'dark_potion') { extraRemoves += 1; addFloatingText(index, '❌ 제거 획득'); }
      if (item.id === 'haste_potion') { extraSpins += 1; addFloatingText(index, '🔄 스핀 획득'); }
      if (item.id === 'chaos_potion') { extraRemoves += 1; extraSpins += 1; addFloatingText(index, '❌🔄 획득'); }
      
      if (item.id === 'mana_potion') {
        const specialPool = ['skeleton', 'lurutia_bless', 'dragon', 'gold_baby_dragon', 'elf_chief', 'lurutia_curse', 'chaos_potion', 'undead_dragon', 'mammon', 'gold_ingot', 'lucifer', 'gabriel', 'demon_cult', 'cross', 'altar', 'archbishop'];
        itemsToAdd.push(specialPool[Math.floor(Math.random() * specialPool.length)]);
        addFloatingText(index, '✨ 마력 폭발');
      }
      
      if (item.id === 'ultimate_potion') { 
        let lineGold = 0;
        const row = Math.floor(index / 5);
        const col = index % 5;
        for(let i=0; i<5; i++) { const s = board[row*5 + i]; if (s && s.gold && i !== col) lineGold += s.gold; }
        for(let i=0; i<4; i++) { const s = board[col + i*5]; if (s && s.gold && i !== row) lineGold += s.gold; }
        extraGold += lineGold; 
        addFloatingText(index, `+ 💰 ${lineGold} (십자 2배)`); 
      }
    }
  });

  return { effectResults, destroyedSlots, itemsToAdd, uidsToRemove, stackUpdates, goldUpdates, mutations, extraGold, extraRemoves, extraSpins, extraRelics, lightSpiritEvents, itemsDestroyedThisTurn };
};