// 슬롯 머신 격자 UI
import React from 'react';

const getBadgeInfo = (slot) => {
  if (!slot) return null;
  const id = slot.id;
  const age = slot.age || 0;
  const stacks = slot.stacks || 0;

  // 진행도(나머지 연산) 표시 헬퍼: 7턴 주기일 때 0/7 -> 1/7 ... -> 7/7 로 표시되게 함
  const getCyclicTurn = (a, cycle) => a === 0 ? 0 : (a % cycle === 0 ? cycle : a % cycle);

  // 1. 스택 기반 아이템 (현재 스택 / 목표 스택)
  if (['blessing', 'heal', 'dragon'].includes(id)) return { text: `${stacks}/2`, type: 'stack' };
  if (['monastery', 'gabriel', 'satan'].includes(id)) return { text: `${stacks}/4`, type: 'stack' };

  // 2. 반복 턴 기반 아이템 (현재 진행도 / 주기)
  if (['zenaris_curse'].includes(id)) return { text: `${getCyclicTurn(age, 2)}/2`, type: 'turn' };
  if (['cain_curse', 'goddess_light'].includes(id)) return { text: `${getCyclicTurn(age, 4)}/4`, type: 'turn' };
  if (['slime', 'priest', 'heretic'].includes(id)) return { text: `${getCyclicTurn(age, 7)}/7`, type: 'turn' };

  // 3. 일회성 턴 기반 아이템 (현재 나이 / 파괴 나이)
  if (['dark_potion', 'mana_potion', 'haste_potion', 'chaos_potion', 'ultimate_potion'].includes(id)) return { text: `${age}/1`, type: 'turn' };
  if (['tempted_priest', 'ghost', 'undead', 'lemonade', 'vampire_essence', 'gold_ingot'].includes(id)) return { text: `${age}/3`, type: 'turn' };
  if (['undead_baby_dragon', 'undead_dragon', 'altar'].includes(id)) return { text: `${age}/4`, type: 'turn' };
  if (['great_bless'].includes(id)) return { text: `${age}/5`, type: 'turn' };
  if (['high_potion'].includes(id)) return { text: `${age}/10`, type: 'turn' };
  if (['gold_dragon_egg'].includes(id)) return { text: `${age}/25`, type: 'turn' };

  return null;
};

const SlotGrid = ({ slots, onSlotClick, turnResults = [], effectResults = [], destroyedSlots = [] }) => {
  return (
    <div className="grid-frame pixel-border cream-bg">
      {slots.map((slot, index) => {
        const badgeInfo = getBadgeInfo(slot);
        return (
          <div 
            key={index} 
            className="grid-item"
            onClick={() => { if (slot && onSlotClick) onSlotClick(slot); }}
            style={{ cursor: slot ? 'pointer' : 'default' }}
          >
            {slot ? (
              <div className={`symbol-wrapper ${destroyedSlots[index] ? 'shake-and-fade' : ''}`} title={slot.name}>
                <span className="symbol-icon">{slot.name.split(' ')[0]}</span>
                <span className={`symbol-name-small rarity-${slot.rarity}`}>
                  {slot.name.split(' ').slice(1).join(' ')}
                </span>
                
                {/* 통합 뱃지 UI (스택/턴) */}
                {badgeInfo && (
                  <div className={badgeInfo.type === 'stack' ? 'stack-badge' : 'turn-badge'}>
                    {badgeInfo.text}
                  </div>
                )}
              </div>
            ) : (
              <span style={{ opacity: 0.05 }}>?</span>
            )}

            {/* 1단계: 골드 플로팅 애니메이션 */}
            {turnResults[index] !== null && turnResults[index] !== undefined && (
              <div className={`floating-number ${turnResults[index] > 0 ? 'floating-positive' : 'floating-negative'}`}>
                {turnResults[index] > 0 ? `+${turnResults[index]}` : turnResults[index]}
              </div>
            )}

            {/* 2단계: 아이템 상호작용(효과) 텍스트 연출 */}
            {effectResults[index] && (
              <div className="floating-effect">
                {effectResults[index]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SlotGrid;