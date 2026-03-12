// src/card-games/blackjack/Blackjack.jsx
import React, { useState, useEffect } from 'react';
import { createDeck, shuffleDeck, CARD_BACK_IMAGE } from '../utils/deck';

const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;
  hand.forEach(card => {
    if (['jack', 'queen', 'king'].includes(card.rank)) value += 10;
    else if (card.rank === 'ace') { value += 11; aces += 1; }
    else value += parseInt(card.rank);
  });
  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }
  return value;
};

export default function Blackjack({ goBack }) {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameState, setGameState] = useState('betting'); // betting, playing, dealerTurn, gameOver
  const [message, setMessage] = useState('게임을 시작하세요!');
  const [showRules, setShowRules] = useState(false); // 💡 룰 모달 상태

  // 💡 전적 관리 상태 추가
  const [stats, setStats] = useState({
    wins: 0,
    losses: 0,
    draws: 0,
    winStreak: 0,
    loseStreak: 0
  });

  // 💡 승패 기록 처리 함수
  const handleGameEnd = (result) => {
    setStats(prev => {
      const newStats = { ...prev };
      if (result === 'win') {
        newStats.wins += 1;
        newStats.winStreak += 1;
        newStats.loseStreak = 0;
      } else if (result === 'lose') {
        newStats.losses += 1;
        newStats.loseStreak += 1;
        newStats.winStreak = 0;
      } else {
        newStats.draws += 1;
        newStats.winStreak = 0;
        newStats.loseStreak = 0;
      }
      return newStats;
    });
  };

  const startGame = () => {
    const newDeck = shuffleDeck(createDeck());
    setPlayerHand([newDeck.pop(), newDeck.pop()]);
    setDealerHand([newDeck.pop(), newDeck.pop()]);
    setDeck(newDeck);
    setGameState('playing');
    setMessage('히트(Hit) 할까요, 스탠드(Stand) 할까요?');
  };

  const hit = () => {
    const newHand = [...playerHand, deck.pop()];
    setPlayerHand(newHand);
    setDeck([...deck]);

    if (calculateHandValue(newHand) > 21) {
      setMessage('Bust! 21을 초과했습니다. 딜러 승리! ☠️');
      setGameState('gameOver');
      handleGameEnd('lose'); // 💡 패배 기록
    }
  };

  const stand = () => {
    setGameState('dealerTurn');
    setMessage('딜러가 카드를 오픈합니다... 🃏');
  };

  // 딜러 턴 애니메이션 및 결과 판정
  useEffect(() => {
    if (gameState !== 'dealerTurn') return;

    const timer = setTimeout(() => {
      const dealerValue = calculateHandValue(dealerHand);

      if (dealerValue < 17 && deck.length > 0) {
        const newDeck = [...deck];
        const nextCard = newDeck.pop();
        setDealerHand(prev => [...prev, nextCard]);
        setDeck(newDeck);
      } else {
        const playerValue = calculateHandValue(playerHand);

        if (dealerValue > 21) {
          setMessage('딜러 Bust! 플레이어 승리! 🎉');
          handleGameEnd('win');
        } else if (dealerValue > playerValue) {
          setMessage('딜러 승리! 😢');
          handleGameEnd('lose');
        } else if (dealerValue < playerValue) {
          setMessage('플레이어 승리! 🎉');
          handleGameEnd('win');
        } else {
          setMessage('무승부 (Push)! 🤝');
          handleGameEnd('draw');
        }
        setGameState('gameOver');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, dealerHand, deck, playerHand]);

  return (
    <div className="card-game-board">
      <button className="card-back-btn" onClick={goBack}>⬅️ 나가기</button>
      
      {/* 💡 우측 상단 룰북 버튼 추가 */}
      <button className="card-rule-btn" onClick={() => setShowRules(true)}>📖 룰 보기</button>

      <h2>♠️ 블랙잭 ♥️</h2>
      <p className="card-message">{message}</p>

      <div className="hand-area">
        <h3>
          딜러의 패 
          {gameState === 'playing' && dealerHand.length > 0
            ? ` (점수: ${calculateHandValue([dealerHand[0]])} + ?)`
            : gameState !== 'betting' && dealerHand.length > 0
              ? ` (점수: ${calculateHandValue(dealerHand)})`
              : ''}
        </h3>
        <div className="card-row">
          {dealerHand.map((card, idx) => (
            <img 
              key={idx} 
              src={gameState === 'playing' && idx === 1 ? CARD_BACK_IMAGE : card.image} 
              alt="딜러 카드" 
              className="playing-card" 
            />
          ))}
        </div>
      </div>

      <div className="hand-area">
        <h3>
          나의 패 
          {gameState !== 'betting' && playerHand.length > 0 
            ? ` (점수: ${calculateHandValue(playerHand)})` 
            : ''}
        </h3>
        <div className="card-row">
          {playerHand.map((card, idx) => (
            <img key={idx} src={card.image} alt="내 카드" className="playing-card" />
          ))}
        </div>
      </div>

      <div className="card-actions">
        {gameState === 'betting' && <button className="card-btn start" onClick={startGame}>게임 시작 🃏</button>}
        {gameState === 'playing' && (
          <>
            <button className="card-btn hit" onClick={hit}>히트 (Hit) ➕</button>
            <button className="card-btn stand" onClick={stand}>스탠드 (Stand) 🛑</button>
          </>
        )}
        {gameState === 'gameOver' && <button className="card-btn start" onClick={startGame}>다시 하기 🔄</button>}
      </div>

      {/* 💡 전적 표시 UI 추가 */}
      <div className="stats-display">
        <p>📊 총 {stats.wins}승 {stats.draws}무 {stats.losses}패</p>
        {stats.winStreak > 0 && <p className="streak win">🔥 {stats.winStreak}연승 중!</p>}
        {stats.loseStreak > 0 && <p className="streak lose">😢 {stats.loseStreak}연패 중...</p>}
      </div>

      {/* 💡 블랙잭 룰 모달 */}
      {showRules && (
        <div className="card-rule-overlay" onClick={() => setShowRules(false)}>
          <div className="card-rule-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#2c3e50', marginTop: 0 }}>♠️ 블랙잭 기본 룰</h2>
            <div className="card-rule-content">
              <ul>
                <li><strong>목표:</strong> 카드의 합을 <strong>21</strong>에 가깝게 만들되, 21을 넘기면 안 됩니다.</li>
                <li><strong>숫자 계산:</strong>
                  <ul>
                    <li>2~10은 쓰여진 숫자 그대로 계산합니다.</li>
                    <li>J, Q, K는 모두 <strong>10</strong>으로 계산합니다.</li>
                    <li>A(에이스)는 <strong>1 또는 11</strong> 중 유리한 쪽으로 자동 계산됩니다.</li>
                  </ul>
                </li>
                <li><strong>히트(Hit):</strong> 카드를 1장 더 받습니다. 21을 넘기면(Bust) 즉시 패배합니다.</li>
                <li><strong>스탠드(Stand):</strong> 카드를 그만 받고 딜러와 점수를 겨룹니다.</li>
                <li><strong>딜러의 규칙:</strong> 딜러는 점수 합이 <strong>17 이상이 될 때까지 무조건</strong> 카드를 더 뽑아야 합니다.</li>
              </ul>
            </div>
            <button className="card-btn start" style={{ marginTop: '20px', width: '100%' }} onClick={() => setShowRules(false)}>
              확인 (닫기)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}