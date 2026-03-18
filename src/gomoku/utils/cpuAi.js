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

  // --- [개선 2] 점수 체계 고도화 (가중치 폭 대폭 확대 및 오목 기준 세분화) ---
  const SCORE = {
    WIN: 10000000,          // 오목 완성 (즉시 승리)
    BLOCK_WIN: 5000000,     // 상대 오목 방지 (즉시 패배 방지)
    ATTACK_OPEN_4: 1000000, // 나의 열린 4 형성 (필승)
    BLOCK_OPEN_4: 800000,   // 상대 열린 4 형성 방지 (상대 열린 3 양끝 차단)
    ATTACK_CLOSE_4: 100000, // 나의 닫힌 4 형성 (상대에게 방어 강요)
    ATTACK_OPEN_3: 50000,   // 나의 열린 3 형성
    BLOCK_CLOSE_4: 5000,    // 상대 닫힌 4 형성 방지 (막힌 3 차단 - 당장 안 위험하므로 우선순위 대폭 낮춤)
    BLOCK_OPEN_3: 4000,     // 상대 열린 3 형성 방지
    ATTACK_CLOSE_3: 500,    // 나의 닫힌 3 형성
    BLOCK_CLOSE_3: 100,     // 상대 닫힌 3 형성 방지
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

// --- [개선 3] 평가 로직 세분화 ---
const evaluatePoint = (board, x, y, dx, dy, color, isDefense, SCORE) => {
  const line = getLineString(board, x, y, dx, dy, color);
  let s = 0;

  // 1. 5목 (최우선: 승리 또는 즉시 패배 방어)
  if (line.includes('CCCCC')) {
    return isDefense ? SCORE.BLOCK_WIN : SCORE.WIN;
  }

  // 2. 열린 4 (양쪽이 비어있어 다음 턴에 무조건 승리)
  if (line.includes('.CCCC.')) {
    return isDefense ? SCORE.BLOCK_OPEN_4 : SCORE.ATTACK_OPEN_4;
  }

  // 3. 닫힌 4 (한쪽만 비어있는 4) 및 끊어진 4 (C.CCC, CC.CC 등)
  if (line.includes('CCCC') || line.includes('C.CCC') || line.includes('CC.CC') || line.includes('CCC.C')) {
    s += isDefense ? SCORE.BLOCK_CLOSE_4 : SCORE.ATTACK_CLOSE_4;
  }
  
  // 4. 열린 3 (양쪽이 비어있는 3) 및 끊어진 열린 3
  else if (line.includes('.CCC.') || line.includes('.C.CC.') || line.includes('.CC.C.')) {
    s += isDefense ? SCORE.BLOCK_OPEN_3 : SCORE.ATTACK_OPEN_3;
  }
  
  // 5. 닫힌 3 (한쪽이 막힌 3)
  else if (line.includes('CCC') || line.includes('C.CC') || line.includes('CC.C')) {
    s += isDefense ? SCORE.BLOCK_CLOSE_3 : SCORE.ATTACK_CLOSE_3;
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