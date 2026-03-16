import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeBoard, addRandomTile, moveBoard, checkGameOver, hasBoardChanged } from './gameLogic';
import './puzzle2048.css';

export default function Puzzle2048() {
  const [board, setBoard] = useState(initializeBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const pointerStart = useRef({ x: 0, y: 0 });

  const processMove = useCallback((directionKey) => {
    if (gameOver) return;

    const { newBoard, scoreGained } = moveBoard(board, directionKey);

    if (hasBoardChanged(board, newBoard)) {
      const boardWithNewTile = addRandomTile(newBoard);
      setBoard(boardWithNewTile);
      setScore(prev => prev + scoreGained);

      if (checkGameOver(boardWithNewTile)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver]);

  // 1. 키보드 이벤트
  const handleKeyDown = useCallback((e) => {
    const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!allowedKeys.includes(e.key)) return;
    
    e.preventDefault(); 
    processMove(e.key);
  }, [processMove]);

  // 2. 전체 화면 드래그 시작 (useCallback으로 감싸서 useEffect 최적화)
  const handlePointerDown = useCallback((e) => {
    // 버튼 클릭 등 다른 UI 조작을 방해하지 않기 위해 e.preventDefault()는 생략합니다.
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    pointerStart.current = { x: clientX, y: clientY };
  }, []);

  // 3. 전체 화면 드래그 종료 및 방향 계산
  const handlePointerUp = useCallback((e) => {
    if (!pointerStart.current.x || !pointerStart.current.y) return;

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    const deltaX = clientX - pointerStart.current.x;
    const deltaY = clientY - pointerStart.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        processMove(deltaX > 0 ? 'ArrowRight' : 'ArrowLeft');
      } else {
        processMove(deltaY > 0 ? 'ArrowDown' : 'ArrowUp');
      }
    }

    pointerStart.current = { x: 0, y: 0 };
  }, [processMove]);

  // 4. 이벤트 리스너를 window 전역에 등록
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);
    // 모바일 환경을 위한 터치 이벤트 추가
    window.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [handleKeyDown, handlePointerDown, handlePointerUp]);

  const handleReset = () => {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
  };

  const activeTiles = [];
  board.forEach((row, r) => {
    row.forEach((tile, c) => {
      if (tile !== null) activeTiles.push({ ...tile, r, c });
    });
  });

  return (
    // 최상위 컨테이너에 touch-action: none을 주어 모바일에서 전체 화면 스크롤링을 방지합니다.
    <div className="puzzle-container" style={{ touchAction: 'none', userSelect: 'none' }}>
      <div className="header">
        <button className="reset-btn" onClick={handleReset}>New Game</button>
        <div className="scoreboard">
          <div className="score-title">Score</div>
          <div className="score-value">{score}</div>
        </div>
      </div>
      
      {/* 이제 board-wrapper에는 마우스 이벤트가 필요 없습니다 */}
      <div className="board-wrapper">
        {gameOver && (
          <div className="game-over-overlay">
            <h2>Game Over!</h2>
            <button className="reset-btn" onClick={handleReset}>Try Again</button>
          </div>
        )}

        <div className="grid-bg">
          {Array(16).fill(null).map((_, i) => (
            <div key={i} className="grid-cell"></div>
          ))}
        </div>

        <div className="tile-container">
          {activeTiles.map((tile) => {
            const x = 10 + tile.c * 90;
            const y = 10 + tile.r * 90;
            const bgClass = `tile-${tile.val}`;
            const textClass = tile.val >= 100 ? 'tile-small-text' : '';
            const animClass = tile.isNew ? 'tile-new' : tile.isMerged ? 'tile-merged' : '';

            return (
              <div
                key={tile.id}
                className={`tile-wrapper ${animClass}`}
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <div className={`tile-inner ${bgClass} ${textClass}`}>
                  {tile.val}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}