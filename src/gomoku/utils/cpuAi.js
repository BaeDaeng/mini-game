// src/gomoku/utils/cpuAi.js
const BOARD_SIZE = 15;

export const getBestMove = (board, playerColor, cpuColor) => {
  const emptyIndices = board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((idx) => idx !== null);

  if (emptyIndices.length === 0) return null;

  // --- [개선 1] 첫 수 로직: 검은 돌(플레이어) 주변 8방향 탐색 ---
  const stonesOnBoard = board.filter(cell => cell !== null).length;
  if (stonesOnBoard === 1) {
    const playerMove = board.findIndex(cell => cell === playerColor);
    const px = playerMove % BOARD_SIZE;
    const py = Math.floor(playerMove / BOARD_SIZE);
    
    const nearMoves = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = px + dx, ny = py + dy;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          nearMoves.push(ny * BOARD_SIZE + nx);
        }
      }
    }
    return nearMoves[Math.floor(Math.random() * nearMoves.length)];
  }

  // --- [개선 2] 점수 체계 고도화 (가중치 폭 대폭 확대) ---
  const SCORE = {
    WIN: 10000000,          // 내가 두면 승리
    BLOCK_WIN: 5000000,     // 상대 4개 차단 (최우선)
    ATTACK_OPEN_4: 1000000, // 나의 열린 4개 형성
    BLOCK_OPEN_4: 800000,   // 상대의 열린 3개 차단 (4개 방지)
    BLOCK_GAP_3: 500000,    // 상대의 사잇수(C.CC) 차단
    ATTACK_OPEN_3: 100000,  // 나의 열린 3개 형성
    BLOCK_CLOSE_3: 1000,    // 한쪽 막힌 3개 (위험도 낮음)
    ADJACENT: 10            // 단순 인접
  };

  const scores = emptyIndices.map((index) => {
    let score = 0;
    const x = index % BOARD_SIZE;
    const y = Math.floor(index / BOARD_SIZE);
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

    directions.forEach(([dx, dy]) => {
      // 수비 및 공격 평가
      score += evaluatePoint(board, x, y, dx, dy, playerColor, true, SCORE);
      score += evaluatePoint(board, x, y, dx, dy, cpuColor, false, SCORE);
    });

    return { index, score };
  });

  const maxScore = Math.max(...scores.map((s) => s.score));
  const bestMoves = scores.filter((s) => s.score === maxScore);

  return bestMoves[Math.floor(Math.random() * bestMoves.length)].index;
};

const evaluatePoint = (board, x, y, dx, dy, color, isDefense, SCORE) => {
  const line = getLineString(board, x, y, dx, dy, color);
  let s = 0;

  if (isDefense) {
    // 1. 상대 4개 차단 (즉시 패배 방지)
    if (line.includes('CCCC')) return SCORE.BLOCK_WIN;
    
    // 2. 상대 열린 3 차단 (양쪽이 . 인 경우)
    if (line.includes('.CCC.')) s += SCORE.BLOCK_OPEN_4;
    
    // 3. 상대 사잇수 차단 (C.CC / CC.C / C.CCC 등)
    if (line.includes('C.CC') || line.includes('CC.C') || line.includes('CCC.C') || line.includes('C.CCC')) {
      s += SCORE.BLOCK_GAP_3;
    }

    // 4. 막힌 3 (위험도 낮음)
    if (line.includes('XCCC.') || line.includes('.CCCX')) s += SCORE.BLOCK_CLOSE_3;
  } else {
    // 공격 로직
    if (line.includes('CCCC')) s += SCORE.WIN;
    if (line.includes('.CCC.')) s += SCORE.ATTACK_OPEN_4;
    if (line.includes('CCC')) s += SCORE.ATTACK_OPEN_3;
  }
  return s;
};

const getLineString = (board, x, y, dx, dy, color) => {
  let s = 'C'; 
  for (let step = 1; step <= 4; step++) {
    const nx = x + dx * step, ny = y + dy * step;
    if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
      const cell = board[ny * BOARD_SIZE + nx];
      s += (cell === color ? 'C' : (cell === null ? '.' : 'X'));
    } else s += 'X';
  }
  for (let step = 1; step <= 4; step++) {
    const nx = x - dx * step, ny = y - dy * step;
    if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
      const cell = board[ny * BOARD_SIZE + nx];
      s = (cell === color ? 'C' : (cell === null ? '.' : 'X')) + s;
    } else s = 'X' + s;
  }
  return s;
};