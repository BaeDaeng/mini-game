// src/yacht-multi/SoloMode.jsx
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

export default function SoloMode({ goBack }) {
  // 💡 상태를 1인용으로 단순화 (turn, p2 점수 제거)
  const [gameState, setGameState] = useState({
    dice: [1, 1, 1, 1, 1],
    kept: [false, false, false, false, false],
    rollCount: 3,
    scores: getInitialScores()
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
    // 이미 점수가 기록된 항목이면 무시
    if (gameState.scores[category] !== null) return;

    const score = calculateScore(gameState.dice, category);
    setGameState(prev => ({
      dice: [1, 1, 1, 1, 1],
      kept: [false, false, false, false, false],
      rollCount: 3,
      scores: { ...prev.scores, [category]: score }
    }));
  };

  // 💡 게임 다시 시작하기 로직
  const restartGame = () => {
    setGameState({
      dice: [1, 1, 1, 1, 1],
      kept: [false, false, false, false, false],
      rollCount: 3,
      scores: getInitialScores()
    });
  };

  // 💡 게임 종료 확인 로직 (모든 카테고리가 채워졌는지 확인)
  const isGameOver = Object.values(gameState.scores).every(val => val !== null);
  const totalScore = getTotalScore(gameState.scores);

  // 💡 게임 종료 결과창 화면 (승패 없이 최종 점수만 표시)
  if (isGameOver) {
    return (
      <div className="menu-container">
        <h1 style={{ fontSize: '3em', margin: '0' }}>게임 종료</h1>
        <h2 className="highlight" style={{ fontSize: '2.5em', margin: '20px 0' }}>수고하셨습니다! 👏</h2>
        
        <div className="box" style={{ flexDirection: 'column', alignItems: 'center', fontSize: '1.5em', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px' }}>
          <p style={{ margin: '10px 0' }}>최종 점수: <strong style={{ color: '#e74c3c' }}>{totalScore}</strong>점</p>
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
        <h2 className="highlight" style={{marginTop: '30px'}}>솔로 플레이</h2>
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

      <div className="score-area" style={{ justifyContent: 'center' }}>
        {/* 💡 1인용이므로 중앙에 배치되도록 스타일 조정 가능 */}
        <div className="score-col active-board">
          <h4>점수판</h4>
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#e74c3c', marginBottom: '10px' }}>
            현재 총점: {totalScore}점
          </div>
          {CATEGORY_KEYS.map(cat => {
            const isFilled = gameState.scores[cat] !== null;
            const showPreview = !isFilled && gameState.rollCount < 3;

            return (
              <button 
                key={cat} 
                onClick={() => recordScore(cat)} 
                disabled={isFilled || gameState.rollCount === 3}
              >
                <span style={{ fontSize: '0.85em' }}>{CATEGORY_LABELS[cat]}</span>
                <span>
                  {isFilled ? (
                    gameState.scores[cat]
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