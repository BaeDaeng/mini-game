// src/card-games/index.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Blackjack from './blackjack/Blackjack';
import HighLow from './high-low/HighLow';
import HoldemEntry from './texas-holdem/index';
import Spider from './spider/Spider';
import CatchThief from './catch-thief/index';
import './CardGamesStyle.css';

export default function CardGamePortal() {
  const [activeGame, setActiveGame] = useState('menu'); // 'menu', 'blackjack', 'highlow'
  const navigate = useNavigate();

  // 하위 게임에서 '메뉴로 가기'를 눌렀을 때 실행될 함수
  const goToMenu = () => setActiveGame('menu');

  if (activeGame === 'blackjack') return <Blackjack goBack={goToMenu} />;
  if (activeGame === 'highlow') return <HighLow goBack={goToMenu} />;
  if (activeGame === 'holdem') return <HoldemEntry goBack={goToMenu} />;
  if (activeGame === 'spider') return <Spider goBack={goToMenu} />;
  if (activeGame === 'catchthief') return <CatchThief goBack={goToMenu} />;

  return (
    <div className="card-menu-container">
      <button 
        onClick={() => navigate('/')} 
        style={{
          position: 'absolute', top: '20px', left: '20px',
          padding: '10px 16px', background: '#34495e', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        ⬅️메인으로
      </button>

      <h1 style={{ fontSize: '3rem', color: '#f1c40f', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
        CASINO GAMES
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '40px' }}>즐기고 싶은 카드 게임을 선택하세요.</p>

      <button className="menu-btn" style={{background: '#000000'}} onClick={() => setActiveGame('blackjack')}>
        ♠️ 블랙잭 (Blackjack)
      </button>
      <button className="menu-btn" style={{background: '#9c1a0b'}} onClick={() => setActiveGame('highlow')}>
        🔼 하이 & 로우 (High & Low)
      </button>
      <button className="menu-btn" style={{background: '#4c4fec'}} onClick={() => setActiveGame('holdem')}>
        🤠 텍사스 홀덤 (멀티)
      </button>
      <button className="menu-btn" style={{background: '#117930'}} onClick={() => setActiveGame('spider')}>
        🕸️ 스파이더 카드놀이
      </button>
      <button className="menu-btn" style={{background: '#9b59b6'}} onClick={() => setActiveGame('catchthief')}>
          🃏 도둑잡기 (멀티+CPU)
      </button>
    </div>
  );
}