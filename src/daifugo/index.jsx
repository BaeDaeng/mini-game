// src/daifugo/index.jsx
import React, { useState } from 'react';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import './DaifugoStyle.css';

export default function DaifugoEntry() {
  const [gameState, setGameState] = useState({ roomId: null, myId: null });

  // 로비에서 게임 시작 시 호출되는 함수
  const handleGameStart = (roomId, myId) => {
    setGameState({ roomId, myId });
  };

  return (
    <div className="daifugo-app">
      {/* roomId와 myId가 세팅되었다면 게임 화면으로, 아니면 로비 화면을 렌더링 */}
      {gameState.roomId && gameState.myId ? (
        <GameBoard roomId={gameState.roomId} myId={gameState.myId} />
      ) : (
        <Lobby onGameStart={handleGameStart} />
      )}
    </div>
  );
}