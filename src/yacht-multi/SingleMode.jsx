// src/yacht-multi/SingleMode.jsx
import React, { useState } from 'react';
import { calculateScore, getInitialScores } from './yachtRules';

const CATEGORY_KEYS = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'choice', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yacht'
];

const CATEGORY_LABELS = {
  'ones': 'ones',
  'twos': 'twos',
  'threes': 'threes',
  'fours': 'fours',
  'fives': 'fives',
  'sixes': 'sixes',
  'choice': 'choice(5개 합)',
  'fourOfAKind': 'fourOfAKind(4개이상 같음)',
  'fullHouse': 'fullHouse(3개, 2개 같음)',
  'smallStraight': 'smallStraight(4개 연속:15점)',
  'largeStraight': 'largeStraight(5개 연속:30점)',
  'yacht': 'yacht(5개 같을때:50점)'
};

export default function SingleMode({ goBack }) {
  const [gameState, setGameState] = useState({
    turn: 1,
    dice: [1, 1, 1, 1, 1],
    kept: [false, false, false, false, false],
    rollCount: 3,
    scores: { p1: getInitialScores(), p2: getInitialScores() }
  });

  const getTotalScore = (scores) => {
    return Object.values(scores).reduce((total, score) => total + (score || 0), 0);
  };

  const rollDice = () => {
    if (gameState.rollCount === 0) return;
    const newDice = gameState.dice.map((d, i) => gameState.kept[i] ? d : Math.floor(Math.random() * 6) + 1);
    setGameState(prev => ({ ...prev, dice: newDice, rollCount: prev.rollCount - 1 }));
  };

  const toggleKeep = (index) => {
    if (gameState.rollCount === 3) return; 
    const newKept = [...gameState.kept];
    newKept[index] = !newKept[index];
    setGameState(prev => ({ ...prev, kept: newKept }));
  };

  const recordScore = (category) => {
    const activePlayer = gameState.turn === 1 ? 'p1' : 'p2';
    if (gameState.scores[activePlayer][category] !== null) return;

    const score = calculateScore(gameState.dice, category);
    setGameState(prev => ({
      turn: prev.turn === 1 ? 2 : 1,
      dice: [1, 1, 1, 1, 1],
      kept: [false, false, false, false, false],
      rollCount: 3,
      scores: {
        ...prev.scores,
        [activePlayer]: { ...prev.scores[activePlayer], [category]: score }
      }
    }));
  };

  // 💡 게임 다시 시작하기 로직
  const restartGame = () => {
    setGameState({
      turn: 1,
      dice: [1, 1, 1, 1, 1],
      kept: [false, false, false, false, false],
      rollCount: 3,
      scores: { p1: getInitialScores(), p2: getInitialScores() }
    });
  };

  // 💡 게임 종료 확인 로직
  const isGameOver = 
    Object.values(gameState.scores.p1).every(val => val !== null) && 
    Object.values(gameState.scores.p2).every(val => val !== null);

  const p1Total = getTotalScore(gameState.scores.p1);
  const p2Total = getTotalScore(gameState.scores.p2);

  // 💡 게임 종료 결과창 화면
  if (isGameOver) {
    let resultMessage = "";
    if (p1Total > p2Total) resultMessage = "1P 승리! 🏆";
    else if (p2Total > p1Total) resultMessage = "2P 승리! 🏆";
    else resultMessage = "무승부! 🤝";

    return (
      <div className="menu-container">
        <h1 style={{ fontSize: '3em', margin: '0' }}>게임 종료</h1>
        <h2 className="highlight" style={{ fontSize: '2.5em', margin: '20px 0' }}>{resultMessage}</h2>
        
        <div className="box" style={{ flexDirection: 'column', alignItems: 'center', fontSize: '1.5em', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px' }}>
          <p style={{ margin: '10px 0' }}>1P 총점: <strong>{p1Total}</strong></p>
          <p style={{ margin: '10px 0' }}>2P 총점: <strong>{p2Total}</strong></p>
        </div>

        <div className="box" style={{ flexDirection: 'column', marginTop: '30px' }}>
          <button className="main-btn single" onClick={restartGame}>다시 하기 (새 게임)</button>
          <button className="main-btn" onClick={goBack} style={{ background: '#95a5a6' }}>메인화면으로 돌아가기</button>
        </div>
      </div>
    );
  }

  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  return (
    <div className="game-board single-mode">
      <div className="header">
        <button className="back-btn" onClick={goBack} style={{position: 'absolute', top: '10px', left: '10px'}}>나가기</button>
        <h2 className="highlight" style={{marginTop: '30px'}}>{gameState.turn}P의 턴입니다</h2>
      </div>

      <div className="dice-area">
        <div className="dice-container">
          {gameState.dice.map((val, idx) => (
            <div 
              key={idx} 
              className={`dice ${gameState.kept[idx] ? 'kept' : ''}`}
              onClick={() => toggleKeep(idx)}
            >
              {diceFaces[val - 1]}
            </div>
          ))}
        </div>
        <button onClick={rollDice} disabled={gameState.rollCount === 0}>
          주사위 굴리기 (남은 횟수: {gameState.rollCount})
        </button>
      </div>

      <div className="score-area">
        <div className={`score-col ${gameState.turn === 1 ? 'active-board' : 'inactive-board'}`}>
          <h4>1P 점수판</h4>
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#e74c3c', marginBottom: '10px' }}>
            총점: {p1Total}점
          </div>
          {CATEGORY_KEYS.map(cat => {
            const isFilled = gameState.scores.p1[cat] !== null;
            const showPreview = !isFilled && gameState.turn === 1 && gameState.rollCount < 3;

            return (
              <button 
                key={cat} 
                onClick={() => recordScore(cat)} 
                disabled={gameState.turn !== 1 || isFilled || gameState.rollCount === 3}
              >
                <span style={{ fontSize: '0.85em' }}>{CATEGORY_LABELS[cat]}</span>
                <span>
                  {isFilled ? (
                    gameState.scores.p1[cat]
                  ) : showPreview ? (
                    <span style={{ color: '#3498db', fontWeight: 'bold' }}>{calculateScore(gameState.dice, cat)}</span>
                  ) : (
                    '-'
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className={`score-col ${gameState.turn === 2 ? 'active-board' : 'inactive-board'}`}>
          <h4>2P 점수판</h4>
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#e74c3c', marginBottom: '10px' }}>
            총점: {p2Total}점
          </div>
          {CATEGORY_KEYS.map(cat => {
            const isFilled = gameState.scores.p2[cat] !== null;
            const showPreview = !isFilled && gameState.turn === 2 && gameState.rollCount < 3;

            return (
              <button 
                key={cat} 
                onClick={() => recordScore(cat)} 
                disabled={gameState.turn !== 2 || isFilled || gameState.rollCount === 3}
              >
                <span style={{ fontSize: '0.85em' }}>{CATEGORY_LABELS[cat]}</span>
                <span>
                  {isFilled ? (
                    gameState.scores.p2[cat] 
                  ) : showPreview ? (
                    <span style={{ color: '#3498db', fontWeight: 'bold' }}>{calculateScore(gameState.dice, cat)}</span>
                  ) : (
                    '-'
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}