import { useInventoryStore } from '../store/useInventoryStore';
import { ITEM_TYPES } from '../constants/itemTypes';

export default function CombatScreen() {
  // 🌟 currentStage와 nextStage를 가져옵니다.
  const { player, enemy, gameState, turn, endTurn, items, draftsRemaining, currentStage, nextStage } = useInventoryStore();

  let exDamage = 0, exRecovery = 0, exArmor = 0;
  Object.values(items).forEach(item => {
    if (item.isPlaced) {
      const stats = ITEM_TYPES[item.typeKey].levels[item.level - 1].stats;
      if (stats.damage) exDamage += stats.damage;
      if (stats.recovery) exRecovery += stats.recovery;
      if (stats.armor) exArmor += stats.armor;
    }
  });

  if (!enemy) return null;

  return (
    <div className="combat-panel">
      <h2>STAGE {currentStage} - TURN {turn}</h2> {/* 🌟 스테이지 번호 표시 */}
      
      <div className="battlefield">
        {/* 플레이어 */}
        <div className="entity">
          <div className="shape-player" />
          <div className="status-bar">
            <div>나 (Player)</div>
            <div className="hp-text">HP: {player.hp} / {player.maxHp}</div>
            <div className="armor-text">방어구: {player.armor}</div>
          </div>
        </div>

        {/* 적 */}
        <div className="entity">
          <div className="shape-enemy" />
          <div className="status-bar">
            <div>{enemy.name}</div>
            <div className="hp-text">HP: {enemy.hp} / {enemy.maxHp}</div>
            <div className="atk-text">공격력: {enemy.atk}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#9ca3af' }}>
        <strong>가방 효과 예상치:</strong><br/>
        데미지: <span style={{color:'#f87171'}}>+{exDamage}</span> | 
        방어 획득: <span style={{color:'#94a3b8'}}>+{exArmor}</span> | 
        회복: <span style={{color:'#4ade80'}}>+{exRecovery}</span>
      </div>

      {/* 🌟 승리 시 '다음 스테이지' 버튼으로 변경 */}
      {gameState === 'victory' ? (
        <button className="btn-end-turn" style={{ backgroundColor: '#3b82f6', color: 'white' }} onClick={nextStage}>
          전리품 획득 및 다음 스테이지로 ➔
        </button>
      ) : (
        <button 
          className="btn-end-turn" 
          onClick={endTurn}
          disabled={gameState !== 'playing' || draftsRemaining > 0}
        >
          {draftsRemaining > 0 ? '아이템을 먼저 고르세요' : '턴 종료'}
        </button>
      )}

      {gameState === 'defeat' && (
        <div className="overlay-msg msg-defeat">
          사망했습니다... 패배.<br/>
          <button style={{ marginTop: '10px', padding: '10px', cursor: 'pointer' }} onClick={() => window.location.reload()}>
            처음부터 다시
          </button>
        </div>
      )}
    </div>
  );
}