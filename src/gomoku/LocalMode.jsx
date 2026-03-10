// src/gomoku/LocalMode.jsx
import React, { useState } from 'react';
import { createEmptyBoard, checkWin, checkDraw } from './utils/gomokuLogic';

export default function LocalMode({ goBack }) {
  const [board, setBoard] = useState(createEmptyBoard());
  const [turn, setTurn] = useState('black');
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);

  const handleCellClick = (index) => {
    if (winner || board[index]) return; // 이미 승부가 났거나 돌이 있으면 무시

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);
    setLastMove(index);

    if (checkWin(newBoard, index, turn)) {
      setWinner(turn);
    } else if (checkDraw(newBoard)) {
      setWinner('draw');
    } else {
      setTurn(turn === 'black' ? 'white' : 'black');
    }
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setTurn('black');
    setWinner(null);
    setLastMove(null);
  };

  return (
    <div className="gomoku-container">
      <div className="info-panel">
        {!winner ? (
          <div className="turn-indicator" style={{ background: turn === 'black' ? '#2c3e50' : '#ecf0f1', color: turn === 'black' ? 'white' : 'black' }}>
            {turn === 'black' ? '⚫ 흑돌 차례' : '⚪ 백돌 차례'}
          </div>
        ) : (
          <div style={{ color: '#f1c40f', fontSize: '1.5em' }}>
            {winner === 'draw' ? '무승부!' : `${winner === 'black' ? '⚫ 흑돌' : '⚪ 백돌'} 승리! 🎉`}
          </div>
        )}
      </div>

      <div className="gomoku-board-wrapper">
        <div className="gomoku-board">
          {board.map((cell, index) => (
            <div key={index} className="board-cell" onClick={() => handleCellClick(index)}>
              {cell && (
                <div className={`stone ${cell} ${lastMove === index ? 'last-move' : ''}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {winner && (
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <button className="main-btn single" onClick={resetGame}>다시하기</button>
          <button className="main-btn" style={{ background: '#95a5a6' }} onClick={goBack}>돌아가기</button>
        </div>
      )}

      {!winner && <button className="back-btn" onClick={goBack} style={{ marginTop: '20px' }}>포기하고 나가기</button>}
    </div>
  );
}