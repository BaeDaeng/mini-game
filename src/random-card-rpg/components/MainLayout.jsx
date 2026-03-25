// src/random-card-rpg/components/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { useGameEngine, createItem } from '../hooks/useGameEngine';
import { SYMBOLS, getRandomSymbol } from '../data/symbols';
import { RELICS, getRandomRelic } from '../data/relics';
import SlotGrid from './SlotGrid';
import LeftPanel from './LeftPanel';
import RelicPanel from './RelicPanel';
import SymbolModal from './SymbolModal';
import ItemDetailModal from './ItemDetailModal';
import InventoryModal from './InventoryModal';
import RemoveModal from './RemoveModal';
import '../GameStyle.css';

const MainLayout = () => {
  const [screen, setScreen] = useState('main');
  const engine = useGameEngine();

  const [isSymbolModalOpen, setIsSymbolModalOpen] = useState(false);
  const [isRelicModalOpen, setIsRelicModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const [choices, setChoices] = useState([]);
  const [relicChoices, setRelicChoices] = useState([]);
  const [detailItem, setDetailItem] = useState(null);

  const handleSpinClick = () => {
    engine.spin();
  };

  useEffect(() => {
    if (engine.turnState === 'finished') {
      engine.setTurnState('idle');

      if (engine.daysLeft <= 0) {
        if (engine.gold >= engine.targetGold) {
          engine.nextStage();
          setRelicChoices([getRandomRelic(engine.equippedRelics)]);
          setIsRelicModalOpen(true);
        } else {
          alert("파산했습니다. 처음 화면으로 돌아갑니다.");
          setScreen('main'); // 게임 오버 시 난이도를 다시 고를 수 있게 메인 화면으로 이동
        }
      } else {
        setChoices([
          getRandomSymbol(engine.stage, engine.inventorySymbols),
          getRandomSymbol(engine.stage, engine.inventorySymbols),
          getRandomSymbol(engine.stage, engine.inventorySymbols)
        ]);
        setIsSymbolModalOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.turnState]);

  const handleReroll = () => {
    if (engine.useReroll()) {
      setChoices([
        getRandomSymbol(engine.stage, engine.inventorySymbols), 
        getRandomSymbol(engine.stage, engine.inventorySymbols), 
        getRandomSymbol(engine.stage, engine.inventorySymbols)
      ]);
    }
  };

  const handleStartGame = (difficultyMult) => {
    engine.startGame(difficultyMult);
    setScreen('game');
  };

  if (screen === 'main') {
    return (
      <div className="game-layout" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '4rem', color: '#fff', textShadow: '2px 2px #000', marginBottom: '20px' }}>랜덤 카드 모험</h1>
        <button className="btn-yellow pixel-border" style={{ fontSize: '2rem', width: '300px', margin: '10px' }} onClick={() => setScreen('difficulty')}>게임 시작</button>
        <button className="btn-yellow pixel-border" style={{ fontSize: '2rem', width: '300px', margin: '10px' }} onClick={() => setScreen('dictionary')}>도감</button>
      </div>
    );
  }

  // ⭐️ 추가된 난이도 선택 화면
  if (screen === 'difficulty') {
    return (
      <div className="game-layout" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '3rem', color: '#fff', textShadow: '2px 2px #000', marginBottom: '30px' }}>난이도 선택</h1>
        <button className="btn-yellow pixel-border" style={{ fontSize: '2rem', width: '400px', margin: '10px' }} onClick={() => handleStartGame(1)}>🌱 일반 (목표 1배)</button>
        <button className="btn-yellow pixel-border" style={{ fontSize: '2rem', width: '400px', margin: '10px' }} onClick={() => handleStartGame(1.25)}>⚔️ 숙련 (목표 1.25배)</button>
        <button className="btn-yellow pixel-border" style={{ fontSize: '2rem', width: '400px', margin: '10px' }} onClick={() => handleStartGame(1.5)}>🔥 고수 (목표 1.5배)</button>
        <button className="btn-yellow pixel-border" style={{ fontSize: '1.5rem', width: '200px', margin: '30px 10px 10px 10px', background: '#ccc' }} onClick={() => setScreen('main')}>돌아가기</button>
      </div>
    );
  }

  if (screen === 'dictionary') {
    return (
      <div className="game-layout" style={{ flexDirection: 'column', overflowY: 'auto' }}>
        <button className="btn-yellow pixel-border" onClick={() => setScreen('main')} style={{ width: '150px' }}>돌아가기</button>
        <h2>아이템 도감</h2>
        <div className="dict-grid">
          {SYMBOLS.map((s, i) => (
            <div key={i} className={`dict-item rarity-${s.rarity}`} onClick={() => setDetailItem(s)}>
              <div style={{ fontSize: '2rem' }}>{s.name.split(' ')[0]}</div>
              <div>{s.name.split(' ').slice(1).join(' ')}</div>
            </div>
          ))}
        </div>
        <h2 style={{ marginTop: '30px' }}>유물 도감</h2>
        <div className="dict-grid">
          {RELICS.map((r, i) => (
            <div key={i} className={`dict-item rarity-${r.rarity}`} onClick={() => setDetailItem({ ...r, isRelic: true })}>
              <div style={{ fontSize: '2rem' }}>{r.name.split(' ')[0]}</div>
              <div>{r.name.split(' ').slice(1).join(' ')}</div>
            </div>
          ))}
        </div>
        <ItemDetailModal item={detailItem} isRelic={detailItem?.isRelic} onClose={() => setDetailItem(null)} onItemClick={setDetailItem} />
      </div>
    );
  }

  return (
    <div className="game-layout">
      <LeftPanel
        {...engine}
        onOpenInventory={() => setIsInventoryModalOpen(true)}
        onOpenRemoveModal={() => setIsRemoveModalOpen(true)}
      />

      <main className="center-grid">
        <div className="scroll-wrapper pixel-border">
          <div style={{ position: 'absolute', top: '-15px', left: '20px', background: '#5a3c22', color: 'white', padding: '5px 15px', fontWeight: 'bold' }}>STAGE {engine.stage}</div>

          <SlotGrid
            slots={engine.displaySlots}
            onSlotClick={item => setDetailItem(item)}
            turnResults={engine.turnResults}
            effectResults={engine.effectResults}
            destroyedSlots={engine.destroyedSlots}
          />

          {engine.turnTotal !== null && (
            <div style={{
              position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
              fontSize: '4rem', fontWeight: 'bold', color: engine.turnTotal >= 0 ? '#4CAF50' : '#F44336',
              textShadow: '3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 5px 5px 10px rgba(0,0,0,0.5)',
              zIndex: 50, pointerEvents: 'none', animation: 'floatUp 2s ease-out forwards'
            }}>
              {engine.turnTotal > 0 ? `+${engine.turnTotal}G` : `${engine.turnTotal}G`}
            </div>
          )}
        </div>

        <button
          className="btn-yellow btn-center pixel-border"
          onClick={handleSpinClick}
          disabled={engine.daysLeft <= 0 || engine.turnState !== 'idle'}
        >
          섞기
        </button>

        {isRemoveModalOpen && (
          <RemoveModal
            isOpen={isRemoveModalOpen}
            onClose={() => setIsRemoveModalOpen(false)}
            inventorySymbols={engine.inventorySymbols}
            removeCount={engine.removeCount}
            onRemove={engine.removeSymbol}
          />
        )}

        <SymbolModal
          isOpen={isSymbolModalOpen}
          choices={choices}
          spinCount={engine.spinCount}
          onReroll={handleReroll}
          onSelect={s => { engine.setInventorySymbols(p => [...p, createItem(s)]); setIsSymbolModalOpen(false); }}
          onItemClick={setDetailItem}
          onSkip={() => setIsSymbolModalOpen(false)}
        />

        {isInventoryModalOpen && (
          <InventoryModal
            isOpen={isInventoryModalOpen}
            onClose={() => setIsInventoryModalOpen(false)}
            inventorySymbols={engine.inventorySymbols}
            inventoryRelics={engine.inventoryRelics || []}
            onEquipRelic={engine.equipRelic}
            onItemClick={setDetailItem}
          />
        )}

        {isRelicModalOpen && (
          <div className="modal-overlay open"><div className="modal-content">
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>스테이지 클리어 보상 (유물)</h2>
            <div className="choice-list">
              {relicChoices.map((r, i) => (
                <div key={i} className="dict-item pixel-border" onClick={() => { engine.addRelic(r); setIsRelicModalOpen(false); }}>
                  <div style={{ fontSize: '3rem' }}>{r.name.split(' ')[0]}</div>
                  <div className={`rarity-${r.rarity}`} style={{ fontWeight: 'bold', marginTop: '10px' }}>{r.name.split(' ').slice(1).join(' ')}</div>
                </div>
              ))}
            </div>
          </div></div>
        )}

        <ItemDetailModal item={detailItem} isRelic={detailItem?.isRelic} onClose={() => setDetailItem(null)} onItemClick={setDetailItem} />
      </main>

      <RelicPanel
        equippedRelics={engine.equippedRelics}
        onRelicClick={r => setDetailItem({ ...r, isRelic: true })}
        isRemoveMode={engine.isRemoveMode}
        onRemoveRelic={engine.removeRelic}
        relicResults={engine.relicResults}
        relicEffectResults={engine.relicEffectResults}
        destroyedRelics={engine.destroyedRelics}
      />
    </div>
  );
};

export default MainLayout;