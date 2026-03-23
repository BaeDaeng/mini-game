// App.jsx에서 불러올 메인 컴포넌트
import React, { useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { getRandomChoices } from './data/symbols';
import SlotGrid from './components/SlotGrid';
import StatBar from './components/StatBar';
import SymbolModal from './components/SymbolModal';
import './GameStyle.css';

const GameMain = () => {
  const engine = useGameEngine();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [choices, setChoices] = useState([]);

  const handleSpin = () => {
    engine.spin();
    setChoices(getRandomChoices(3));
    setTimeout(() => setIsModalOpen(true), 500); // 연출을 위한 약간의 지연
  };

  const selectSymbol = (symbol) => {
    engine.setInventory(prev => [...prev, symbol]);
    setIsModalOpen(false);
  };

  return (
    <div className="game-container">
      <StatBar gold={engine.gold} rent={engine.rent} daysLeft={engine.daysLeft} />
      
      <SlotGrid slots={engine.displaySlots} />

      <div className="controls">
        <button className="spin-btn" onClick={handleSpin} disabled={engine.daysLeft <= 0}>
          SPIN! ({engine.daysLeft}일 남음)
        </button>
      </div>

      {isModalOpen && <SymbolModal choices={choices} onSelect={selectSymbol} />}

      {engine.daysLeft === 0 && (
        <div className="result-overlay">
          <h2>{engine.gold >= engine.rent ? "🎉 계약 연장 성공!" : "🏚️ 쫓겨났습니다..."}</h2>
          <button onClick={() => window.location.reload()}>다시 시작</button>
        </div>
      )}
    </div>
  );
};

export default GameMain;