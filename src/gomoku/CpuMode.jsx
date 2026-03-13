import React, { useState, useEffect, useCallback } from 'react';
import { createEmptyBoard, checkWin, checkDraw } from './utils/gomokuLogic';
import { getBestMove } from './utils/cpuAi';

export default function CpuMode({ goBack }) {
  const [board, setBoard] = useState(createEmptyBoard());
  const [turn, setTurn] = useState('black'); // 플레이어: 흑, CPU: 백
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);

  const makeCpuMove = useCallback(() => {
    if (winner) return;

    // AI가 판단한 최적의 수 가져오기
    const bestIndex = getBestMove(board, 'black', 'white');

    if (bestIndex !== null) {
      const newBoard = [...board];
      newBoard[bestIndex] = 'white';
      setBoard(newBoard);
      setLastMove(bestIndex);

      if (checkWin(newBoard, bestIndex, 'white')) {
        setWinner('white');
      } else if (checkDraw(newBoard)) {
        setWinner('draw');
      } else {
        setTurn('black');
      }
    }
  }, [board, winner]);

  // CPU 턴일 때 자동 실행
  useEffect(() => {
    if (turn === 'white' && !winner) {
      const timer = setTimeout(() => {
        makeCpuMove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, winner, makeCpuMove]);

  const handleCellClick = (index) => {
    if (winner || board[index] || turn === 'white') return;

    const newBoard = [...board];
    newBoard[index] = 'black';
    setBoard(newBoard);
    setLastMove(index);

    if (checkWin(newBoard, index, 'black')) {
      setWinner('black');
    } else if (checkDraw(newBoard)) {
      setWinner('draw');
    } else {
      setTurn('white');
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
          <div className="turn-indicator" style={{ 
            background: turn === 'black' ? '#2c3e50' : '#ecf0f1', 
            color: turn === 'black' ? 'white' : 'black' 
          }}>
            {turn === 'black' ? '⚫ 내 차례' : '⚪ CPU가 수 읽는 중...'}
          </div>
        ) : (
          <div style={{ color: '#f1c40f', fontSize: '1.5em', fontWeight: 'bold' }}>
            {winner === 'draw' ? '무승부!' : (winner === 'black' ? '당신이 이겼어요! 🎉' : 'CPU 승리! 🤖')}
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

      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <button className="main-btn single" onClick={resetGame}>다시 하기</button>
        <button className="main-btn multi" onClick={goBack}>메인 메뉴</button>
      </div>
    </div>
  );
}