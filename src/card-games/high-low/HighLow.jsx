// src/card-games/high-low/HighLow.jsx
import React, { useState, useEffect } from 'react';
import { createDeck, shuffleDeck, CARD_BACK_IMAGE } from '../utils/deck';

// 카드의 숫자 가치 계산 (A를 14로 가장 높게 설정)
const getCardValue = (rank) => {
  if (rank === 'ace') return 14;
  if (rank === 'king') return 13;
  if (rank === 'queen') return 12;
  if (rank === 'jack') return 11;
  return parseInt(rank);
};

export default function HighLow({ goBack }) {
  const [deck, setDeck] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [nextCard, setNextCard] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0); // 💡 최고 점수 상태 추가
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('High 또는 Low를 선택하세요!');
  const [showRules, setShowRules] = useState(false); // 💡 룰 모달 상태 추가

  const initGame = () => {
    const newDeck = shuffleDeck(createDeck());
    setCurrentCard(newDeck.pop());
    setDeck(newDeck);
    setNextCard(null);
    setScore(0);
    setGameOver(false);
    setMessage('High 또는 Low를 선택하세요!');
  };

  useEffect(() => {
    // eslint-disable-next-line
    initGame();
  }, []);

  const handleGuess = (guess) => {
    if (gameOver || deck.length === 0) return;

    const drawnCard = deck.pop();
    setNextCard(drawnCard);
    setDeck([...deck]);

    const currValue = getCardValue(currentCard.rank);
    const nextValue = getCardValue(drawnCard.rank);

    let isCorrect = false;
    if (guess === 'high' && nextValue > currValue) isCorrect = true;
    if (guess === 'low' && nextValue < currValue) isCorrect = true;

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      
      // 💡 정답을 맞혔을 때 최고 점수 갱신 확인
      if (newScore > highScore) {
        setHighScore(newScore);
      }

      setMessage('정답입니다! 👏 다음 카드를 예측해보세요.');
      setTimeout(() => {
        setCurrentCard(drawnCard);
        setNextCard(null);
      }, 1000);
    } else {
      setMessage(nextValue === currValue ? '비겼습니다! (틀림 처리) 😢' : '틀렸습니다! 게임 오버 ☠️');
      setGameOver(true);
    }
  };

  if (!currentCard) return <div>카드 섞는 중...</div>;

  return (
    <div className="card-game-board">
      <button className="card-back-btn" onClick={goBack}>⬅️ 나가기</button>
      
      {/* 💡 우측 상단 룰북 버튼 추가 */}
      <button className="card-rule-btn" onClick={() => setShowRules(true)}>📖 룰 보기</button>

      <h2>🔼 High & Low 🔽</h2>
      
      {/* 💡 현재 점수 및 최고 점수 표시 영역 */}
      <div className="card-info" style={{ textAlign: 'center', padding: '15px 30px' }}>
        <div style={{ fontSize: '1.3em', marginBottom: '8px' }}>현재 점수: <strong>{score}</strong> 점</div>
        <div style={{ fontSize: '1.05em', color: '#f1c40f' }}>🏆 최고 기록: <strong>{highScore}</strong> 점</div>
      </div>
      
      <p className="card-message">{message}</p>

      <div className="card-display-area">
        <div className="card-slot">
          <p>현재 카드</p>
          <img src={currentCard.image} alt="현재 카드" className="playing-card" />
        </div>
        <div className="card-slot">
          <p>다음 카드</p>
          <img 
            src={nextCard ? nextCard.image : CARD_BACK_IMAGE} 
            alt="다음 카드" 
            className="playing-card" 
          />
        </div>
      </div>

      {!gameOver ? (
        <div className="card-actions">
          <button className="card-btn high" onClick={() => handleGuess('high')}>업 (High) ⬆️</button>
          <button className="card-btn low" onClick={() => handleGuess('low')}>다운 (Low) ⬇️</button>
        </div>
      ) : (
        <button className="card-btn start" onClick={initGame}>다시 하기 🔄</button>
      )}

      {/* 💡 하이앤로우 룰 모달 */}
      {showRules && (
        <div className="card-rule-overlay" onClick={() => setShowRules(false)}>
          <div className="card-rule-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#2c3e50', marginTop: 0 }}>🔼 High & Low 기본 룰</h2>
            <div className="card-rule-content">
              <ul>
                <li><strong>목표:</strong> 다음에 나올 카드의 숫자가 현재 카드보다 높을지(High), 낮을지(Low) 맞히는 게임입니다.</li>
                <li><strong>숫자 크기:</strong> 2가 가장 낮고, A(에이스)가 가장 높습니다.<br/>
                  <span style={{ fontSize: '0.9em', color: '#7f8c8d' }}>(2 &lt; 3 &lt; ... &lt; 10 &lt; J &lt; Q &lt; K &lt; A)</span>
                </li>
                <li><strong>업 (High):</strong> 다음 카드가 더 <strong>클</strong> 것이라고 예상할 때 누릅니다.</li>
                <li><strong>다운 (Low):</strong> 다음 카드가 더 <strong>작을</strong> 것이라고 예상할 때 누릅니다.</li>
                <li><strong>무승부:</strong> 다음 카드가 현재 카드와 숫자가 같으면 <strong>틀린 것으로 간주</strong>되어 즉시 게임 오버됩니다.</li>
                <li>연속으로 정답을 맞혀 <strong>최고 기록(High Score)</strong>을 경신해 보세요!</li>
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