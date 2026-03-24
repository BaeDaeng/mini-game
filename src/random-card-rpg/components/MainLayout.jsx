// 전체 레이아웃
import React, { useState } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { getRandomChoices } from '../data/symbols';
import SlotGrid from './SlotGrid';
import LeftPanel from './LeftPanel';
import RelicPanel from './RelicPanel';
import SymbolModal from './SymbolModal';
import InventoryModal from './InventoryModal';
import '../GameStyle.css';

const MainLayout = () => {
  const engine = useGameEngine();
  const [isSymbolModalOpen, setIsSymbolModalOpen] = useState(false);
  const [choices, setChoices] = useState([]);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  const handleSpin = () => {
    engine.spin();
    setChoices(getRandomChoices(3));
    setTimeout(() => setIsSymbolModalOpen(true), 500); // 연출을 위한 약간의 지연
  };

  const selectSymbol = (symbol) => {
    engine.setInventorySymbols(prev => [...prev, symbol]);
    setIsSymbolModalOpen(false);
  };

  return (
    <div className="game-layout">
      <LeftPanel 
          daysLeft={engine.daysLeft}
          gold={engine.gold}
          targetGold={engine.targetGold}
          X_count={engine.X_count}
          onToggleRemoveMode={engine.toggleRemoveMode}
          isRemoveMode={engine.isRemoveMode}
          onOpenInventory={() => setIsInventoryModalOpen(true)}
      />
      
      <main className="center-grid">
        <SlotGrid slots={engine.displaySlots} />
        <button className="btn-center pixel-border wooden-bg" onClick={handleSpin} disabled={engine.daysLeft <= 0}>
          섞기
        </button>
        {isSymbolModalOpen && <SymbolModal isOpen={isSymbolModalOpen} choices={choices} onSelect={selectSymbol} />}
        {isInventoryModalOpen && <InventoryModal 
            isOpen={isInventoryModalOpen} 
            onClose={() => setIsInventoryModalOpen(false)}
            inventorySymbols={engine.inventorySymbols}
            inventoryRelics={engine.inventoryRelics}
            onEquipRelic={engine.equipRelic}
        />}
      </main>

      <RelicPanel 
          equippedRelics={engine.equippedRelics} 
          onRemoveRelic={engine.removeRelic}
          isRemoveMode={engine.isRemoveMode}
      />
    </div>
  );
};

export default MainLayout;