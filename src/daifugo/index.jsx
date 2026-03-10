// src/daifugo/index.jsx
import React, { useState } from 'react';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import { LanguageProvider, useLanguage } from './LanguageContext'; // 💡 언어 컨텍스트 추가
import './DaifugoStyle.css';

// 💡 실제 게임 화면 컴포넌트 (언어 변경 버튼 포함)
function DaifugoAppContent() {
  const [gameState, setGameState] = useState({ roomId: null, myId: null });
  const { toggleLanguage, t } = useLanguage();

  const handleGameStart = (roomId, myId) => {
    setGameState({ roomId, myId });
  };

  return (
    <div className="daifugo-app" style={{ position: 'relative' }}>
      {/* 💡 우측 상단 언어 변경 버튼 */}
      <button 
        onClick={toggleLanguage}
        style={{
          position: 'absolute', top: '15px', right: '15px', zIndex: 1000,
          padding: '8px 12px', background: '#34495e', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        {t('langBtn')}
      </button>

      {gameState.roomId && gameState.myId ? (
        <GameBoard roomId={gameState.roomId} myId={gameState.myId} />
      ) : (
        <Lobby onGameStart={handleGameStart} />
      )}
    </div>
  );
}

// 최상단은 Provider로 감싸기
export default function DaifugoEntry() {
  return (
    <LanguageProvider>
      <DaifugoAppContent />
    </LanguageProvider>
  );
}