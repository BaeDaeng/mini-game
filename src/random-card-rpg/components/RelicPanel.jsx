// src/random-card-rpg/components/RelicPanel.jsx
import React from 'react';

const getRelicBadge = (r) => {
  if (!r) return null;
  const age = r.age || 0;
  const stacks = r.stacks || 0;

  if (['trash_bag', 'time_mage'].includes(r.id)) return { text: `${stacks}/2`, type: 'stack' };
  if (r.id === 'light_spirit') return { text: `${stacks}/3`, type: 'stack' };
  if (r.id === 'trader') return { text: `${stacks}/3`, type: 'stack' };
  
  if (['bank', 'guild_safety', 'piggy_bank', 'nun', 'angel_bow'].includes(r.id)) return { text: `${age}/10`, type: 'turn' };
  if (['trash_can', 'garbage_truck', 'novice_mage'].includes(r.id)) return { text: `${age}/5`, type: 'turn' };
  if (r.id === 'guild_whistle') return { text: `${age}/8`, type: 'turn' };
  if (r.id === 'great_demon_scroll') return { text: `${age}/3`, type: 'turn' };
  if (r.id === 'greedy_rich') return { text: `${age}/1`, type: 'turn' };

  return null;
};

const RelicPanel = ({ equippedRelics, onRemoveRelic, isRemoveMode, onRelicClick, relicResults = [], relicEffectResults = [], destroyedRelics = [] }) => {
  return (
    <aside className="right-panel">
      <div 
        className="pixel-border" 
        style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '10px 15px', fontWeight: '800', fontSize: '1.2rem'
        }}
      >
        <span style={{ fontSize: '1.5rem', color: '#4da6ff' }}>🏺</span>
        <span>장착한 유물</span>
        <span style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#d4af37' }}>⚙️</span>
      </div>
      
      <div 
        className="pixel-border" 
        style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}
      >
        {equippedRelics.length === 0 && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            장착 중인 유물이 없습니다.
          </div>
        )}

        {equippedRelics.map((relic, index) => {
          const badgeInfo = getRelicBadge(relic);
          
          return (
            <div 
              key={index} 
              className={`relic-item ${isRemoveMode ? 'remove-mode' : ''}`} 
              onClick={() => {
                if (isRemoveMode) onRemoveRelic(index);
                else if (onRelicClick) onRelicClick(relic);
              }}
            >
              <div className={`relic-icon ${destroyedRelics[index] ? 'shake-and-fade' : ''}`} style={{ position: 'relative' }}>
                {relic.name.split(' ')[0]}
                
                {/* 뱃지 UI (축소 비율 적용) */}
                {badgeInfo && (
                  <div className={badgeInfo.type === 'stack' ? 'stack-badge' : 'turn-badge'} style={{ top: '-6px', right: '-10px', transform: 'scale(0.85)' }}>
                    {badgeInfo.text}
                  </div>
                )}
              </div>

              {/* 텍스트 크기와 여백 축소 */}
              <div className="relic-info" style={{ marginLeft: '12px' }}>
                <span className={`relic-name rarity-${relic.rarity}`} style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                  {relic.name.split(' ').slice(1).join(' ')}
                </span>
              </div>

              {/* 1단계: 유물 골드 플로팅 애니메이션 */}
              {relicResults[index] !== null && relicResults[index] !== undefined && (
                <div className={`floating-number ${relicResults[index] > 0 ? 'floating-positive' : 'floating-negative'}`} style={{ left: '15px', top: '2px', fontSize: '1.2rem' }}>
                  {relicResults[index] > 0 ? `+${relicResults[index]}` : relicResults[index]}
                </div>
              )}

              {/* 2단계: 파괴/효과 텍스트 연출 */}
              {relicEffectResults[index] && (
                <div className="floating-effect" style={{ left: '20px', fontSize: '1rem' }}>
                  {relicEffectResults[index]}
                </div>
              )}

              {isRemoveMode && (
                <div className="remove-overlay">❌</div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default RelicPanel;