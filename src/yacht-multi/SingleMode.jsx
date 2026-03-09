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
        {/* 1P 점수판 */}
        <div className={`score-col ${gameState.turn === 1 ? 'active-board' : 'inactive-board'}`}>
          <h4>1P 점수판</h4>
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#e74c3c', marginBottom: '10px' }}>
            총점: {getTotalScore(gameState.scores.p1)}점
          </div>
          {CATEGORY_KEYS.map(cat => (
            <button 
              key={cat} 
              onClick={() => recordScore(cat)} 
              disabled={gameState.turn !== 1 || gameState.scores.p1[cat] !== null || gameState.rollCount === 3}
            >
              <span style={{ fontSize: '0.85em' }}>{CATEGORY_LABELS[cat]}</span>
              <span>{gameState.scores.p1[cat] !== null ? gameState.scores.p1[cat] : '-'}</span>
            </button>
          ))}
        </div>

        {/* 2P 점수판 */}
        <div className={`score-col ${gameState.turn === 2 ? 'active-board' : 'inactive-board'}`}>
          <h4>2P 점수판</h4>
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#e74c3c', marginBottom: '10px' }}>
            총점: {getTotalScore(gameState.scores.p2)}점
          </div>
          {CATEGORY_KEYS.map(cat => (
            <button 
              key={cat} 
              onClick={() => recordScore(cat)} 
              disabled={gameState.turn !== 2 || gameState.scores.p2[cat] !== null || gameState.rollCount === 3}
            >
              <span style={{ fontSize: '0.85em' }}>{CATEGORY_LABELS[cat]}</span>
              <span>{gameState.scores.p1[cat] !== null ? gameState.scores.p1[cat] : '-'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}