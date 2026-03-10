// src/daifugo/index.jsx
import React, { useState } from 'react';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import { LanguageProvider, useLanguage } from './LanguageContext';
import './DaifugoStyle.css';

function DaifugoAppContent() {
  const [gameState, setGameState] = useState({ roomId: null, myId: null });
  const { toggleLanguage, t } = useLanguage();

  const handleGameStart = (roomId, myId) => {
    setGameState({ roomId, myId });
  };

  // 💡 현재 게임 화면에 진입했는지 여부를 확인하는 변수
  const isPlaying = gameState.roomId && gameState.myId;

  return (
    <div className="daifugo-app" style={{ position: 'relative' }}>
      
      {/* 💡 isPlaying이 아닐 때(로비/대기실일 때)만 언어 변경 버튼을 보여줍니다 */}
      {!isPlaying && (
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
      )}

      {isPlaying ? (
        <GameBoard roomId={gameState.roomId} myId={gameState.myId} />
      ) : (
        <Lobby onGameStart={handleGameStart} />
      )}
    </div>
  );
}

export default function DaifugoEntry() {
  return (
    <LanguageProvider>
      <DaifugoAppContent />
    </LanguageProvider>
  );
}