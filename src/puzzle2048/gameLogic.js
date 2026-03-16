// 고유 ID를 가진 타일 객체 생성
const createTile = (val) => ({
  id: Math.random().toString(36).substring(2, 9), // 리액트 key로 사용할 고유 ID
  val,
  isNew: true,
  isMerged: false
});

export const initializeBoard = () => {
  let board = Array(4).fill(null).map(() => Array(4).fill(null));
  board = addRandomTile(board);
  board = addRandomTile(board);
  return board;
};

export const addRandomTile = (board) => {
  const emptyCoords = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === null) emptyCoords.push({ r, c });
    }
  }
  if (emptyCoords.length === 0) return board;

  const { r, c } = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = createTile(Math.random() < 0.9 ? 2 : 4);
  return newBoard;
};

const slideAndMergeRow = (row) => {
  // 1. 빈 칸(null) 제거 및 애니메이션 플래그 초기화
  let arr = row.filter(val => val !== null).map(tile => ({ ...tile, isNew: false, isMerged: false }));
  let scoreGained = 0;
  
  // 2. 인접한 같은 숫자 병합
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] !== null && arr[i].val === arr[i + 1].val) {
      arr[i] = {
        id: arr[i].id, // 타겟 타일의 ID를 유지해야 자연스럽게 합쳐지는 위치로 이동함
        val: arr[i].val * 2,
        isNew: false,
        isMerged: true
      };
      scoreGained += arr[i].val;
      arr[i + 1] = null;
    }
  }
  
  // 3. 병합 후 생긴 빈칸 제거 및 4칸으로 다시 맞추기
  arr = arr.filter(val => val !== null);
  while (arr.length < 4) arr.push(null);
  
  return { newRow: arr, scoreGained };
};

const rotateLeft = (matrix) => matrix[0].map((val, index) => matrix.map(row => row[row.length - 1 - index]));
const rotateRight = (matrix) => matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());

export const moveBoard = (board, direction) => {
  let newBoard = board.map(row => [...row]);
  let totalScoreGained = 0;

  const processRows = (matrix, isReverse = false) => {
    return matrix.map(row => {
      const targetRow = isReverse ? [...row].reverse() : row;
      const { newRow, scoreGained } = slideAndMergeRow(targetRow);
      totalScoreGained += scoreGained;
      return isReverse ? newRow.reverse() : newRow;
    });
  };

  if (direction === 'ArrowLeft') newBoard = processRows(newBoard, false);
  else if (direction === 'ArrowRight') newBoard = processRows(newBoard, true);
  else if (direction === 'ArrowUp') {
    newBoard = rotateLeft(newBoard);
    newBoard = processRows(newBoard, false);
    newBoard = rotateRight(newBoard);
  } else if (direction === 'ArrowDown') {
    newBoard = rotateRight(newBoard);
    newBoard = processRows(newBoard, false);
    newBoard = rotateLeft(newBoard);
  }

  return { newBoard, scoreGained: totalScoreGained };
};

// 보드에 실제 움직임이 있었는지 체크 (숫자 배열 비교)
export const hasBoardChanged = (board1, board2) => {
  for(let r=0; r<4; r++) {
    for(let c=0; c<4; c++) {
      if (board1[r][c]?.val !== board2[r][c]?.val) return true;
    }
  }
  return false;
};

export const checkGameOver = (board) => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === null) return false;
      if (c < 3 && board[r][c+1] !== null && board[r][c].val === board[r][c + 1].val) return false;
      if (r < 3 && board[r+1][c] !== null && board[r][c].val === board[r + 1][c].val) return false;
    }
  }
  return true;
};