// src/gomoku/utils/gomokuLogic.js

const BOARD_SIZE = 15;

// 빈 바둑판 생성 (크기 225의 1차원 배열)
export const createEmptyBoard = () => Array(BOARD_SIZE * BOARD_SIZE).fill(null);

// 5목 승리 체크
export const checkWin = (board, lastMoveIndex, color) => {
  if (lastMoveIndex === null) return false;

  const x = lastMoveIndex % BOARD_SIZE;
  const y = Math.floor(lastMoveIndex / BOARD_SIZE);

  // 4가지 방향: 가로, 세로, 대각선(\), 대각선(/)
  const directions = [
    [1, 0], [0, 1], [1, 1], [1, -1]
  ];

  for (let [dx, dy] of directions) {
    let count = 1;

    // 양방향 탐색
    for (let step = 1; step < 5; step++) {
      const nx = x + dx * step;
      const ny = y + dy * step;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny * BOARD_SIZE + nx] === color) count++;
      else break;
    }
    for (let step = 1; step < 5; step++) {
      const nx = x - dx * step;
      const ny = y - dy * step;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny * BOARD_SIZE + nx] === color) count++;
      else break;
    }

    if (count >= 5) return true;
  }
  return false;
};

// 무승부 체크 (빈 칸이 없는지)
export const checkDraw = (board) => !board.includes(null);