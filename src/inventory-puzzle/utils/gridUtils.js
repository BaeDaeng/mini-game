/**
 * 1. 2차원 배열(Shape) 시계방향 90도 회전
 */
export const rotateShape = (shape) => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }
  return rotated;
};

/**
 * 2. 배치 검증 및 충돌/머지 대상 확인 (Core Logic)
 * * @param {number[][]} grid - 현재 인벤토리 배열 (0: 빈칸, -1: 장애물, 문자열: 아이템ID)
 * @param {number[][]} shape - 배치할 아이템의 2차원 배열
 * @param {number} startRow - 놓으려는 그리드의 행(y) 좌표
 * @param {number} startCol - 놓으려는 그리드의 열(x) 좌표
 * @param {string|null} ignoreItemId - 드래그 중인 자기 자신의 ID (원래 있던 자리와 충돌 무시)
 * @returns {Object} 결과 객체 { status: 'place' | 'merge' | 'invalid', targetId?: string }
 */
export const checkPlacement = (grid, shape, startRow, startCol, ignoreItemId = null) => {
  let overlappedItems = new Set(); // 겹친 아이템들의 ID를 중복 없이 저장

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      // 아이템의 실제 형태(1)가 있는 부분만 그리드와 대조
      if (shape[r][c] === 1) {
        const targetRow = startRow + r;
        const targetCol = startCol + c;

        // [실패 조건 1] 맵 밖으로 삐져나감
        if (
          targetRow < 0 || targetRow >= grid.length ||
          targetCol < 0 || targetCol >= grid[0].length
        ) {
          return { status: 'invalid', reason: 'out_of_bounds' };
        }

        const cellValue = grid[targetRow][targetCol];

        // 빈 공간(0)이 아니고, 자기 자신(ignoreItemId)도 아닌 경우
        if (cellValue !== 0 && cellValue !== ignoreItemId) {
          // [실패 조건 2] 들어갈 수 없는 장애물(-1)과 겹침
          if (cellValue === -1) {
            return { status: 'invalid', reason: 'blocked' }; 
          }
          
          // 다른 아이템과 겹친 경우 Set에 ID 추가
          overlappedItems.add(cellValue);
        }
      }
    }
  }

  // [성공 조건 1] 겹친 게 하나도 없다면 -> 완벽한 빈 공간 (배치 가능)
  if (overlappedItems.size === 0) {
    return { status: 'place' };
  }

  // [성공 조건 2] 겹친 아이템이 정확히 1개라면 -> 머지(Merge) 후보
  // 주의: 레벨업이 가능한지(같은 종류, 같은 레벨인지)는 Store에서 targetId를 가지고 최종 판단함.
  if (overlappedItems.size === 1) {
    const targetId = [...overlappedItems][0];
    return { status: 'merge', targetId };
  }

  // [실패 조건 3] 2개 이상의 아이템과 동시에 겹침 -> 배치 불가
  return { status: 'invalid', reason: 'multiple_overlap' };
};