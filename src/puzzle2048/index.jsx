import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeBoard, addRandomTile, moveBoard, checkGameOver, hasBoardChanged } from './gameLogic';
import './puzzle2048.css';

export default function Puzzle2048() {
  const [board, setBoard] = useState(initializeBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // 드래그 시작 좌표를 기억할 Ref (렌더링을 유발하지 않게 useRef 사용)
  const pointerStart = useRef({ x: 0, y: 0 });

  // 키보드와 드래그 이벤트에서 공통으로 사용할 핵심 이동 로직
  const processMove = useCallback((directionKey) => {
    if (gameOver) return;

    const { newBoard, scoreGained } = moveBoard(board, directionKey);

    // 보드에 실제 변화가 일어났을 때만 처리
    if (hasBoardChanged(board, newBoard)) {
      const boardWithNewTile = addRandomTile(newBoard);
      setBoard(boardWithNewTile);
      setScore(prev => prev + scoreGained);

      if (checkGameOver(boardWithNewTile)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver]);

  // 1. 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((e) => {
    const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!allowedKeys.includes(e.key)) return;
    
    e.preventDefault(); // 스크롤 방지
    processMove(e.key);
  }, [processMove]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 2. 드래그(터치/마우스) 시작 핸들러
  const handlePointerDown = (e) => {
    // 터치스크린(모바일)인지 마우스(PC)인지 구분해서 좌표 획득
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    pointerStart.current = { x: clientX, y: clientY };
  };

  // 3. 드래그(터치/마우스) 종료 핸들러 및 방향 계산
  const handlePointerUp = (e) => {
    if (!pointerStart.current.x || !pointerStart.current.y) return;

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    // x, y축으로 이동한 거리 계산
    const deltaX = clientX - pointerStart.current.x;
    const deltaY = clientY - pointerStart.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // 오작동 방지: 30px 이상 드래그했을 때만 의도적인 스와이프로 판정
    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        // 가로 이동 거리가 더 길면 좌우 스와이프
        processMove(deltaX > 0 ? 'ArrowRight' : 'ArrowLeft');
      } else {
        // 세로 이동 거리가 더 길면 상하 스와이프
        processMove(deltaY > 0 ? 'ArrowDown' : 'ArrowUp');
      }
    }

    // 다음 동작을 위해 좌표 초기화
    pointerStart.current = { x: 0, y: 0 };
  };

  const handleReset = () => {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
  };

  // 렌더링용 배열 평탄화
  const activeTiles = [];
  board.forEach((row, r) => {
    row.forEach((tile, c) => {
      if (tile !== null) activeTiles.push({ ...tile, r, c });
    });
  });

  return (
    <div className="puzzle-container">
      <div className="header">
        <button className="reset-btn" onClick={handleReset}>New Game</button>
        <div className="scoreboard">
          <div className="score-title">Score</div>
          <div className="score-value">{score}</div>
        </div>
      </div>
      
      <div 
        className="board-wrapper"
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
        style={{ 
          touchAction: 'none', // 모바일에서 드래그 시 화면이 스크롤되는 현상 방지
          userSelect: 'none'   // PC에서 마우스 드래그 시 텍스트가 블록 지정되는 현상 방지
        }}
      >
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