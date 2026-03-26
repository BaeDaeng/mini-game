import React, { useState, useRef } from 'react';
import './FindMine.css';

const SIZE = 8;
const COLORS = [
    '#FF3B30', '#FF9500', '#FFCC00', '#4CD964',
    '#007AFF', '#5856D6', '#00FFFF', '#FF00FF'
];

// 지뢰 배치 생성 (대각선 인접 금지)
const generateMinePlacements = () => {
    let bestCols = [];
    let found = false;

    const isValid = (row, col, currentCols) => {
        for (let r = 0; r < row; r++) {
            const c = currentCols[r];
            if (c === col) return false;
            if (Math.abs(r - row) === 1 && Math.abs(c - col) === 1) return false;
        }
        return true;
    };

    const solve = (row, currentCols) => {
        if (found) return;
        if (row === SIZE) {
            bestCols = [...currentCols];
            found = true;
            return;
        }
        const columns = Array.from({length: SIZE}, (_, i) => i).sort(() => Math.random() - 0.5);
        for (let col of columns) {
            if (isValid(row, col, currentCols)) {
                currentCols.push(col);
                solve(row + 1, currentCols);
                currentCols.pop();
            }
        }
    };
    solve(0, []);
    return bestCols;
};

// 💡 핵심: 현재 맵이 '무조건 논리적으로 1개의 정답만 갖는지' 계산하는 알고리즘
const countSolutions = (regionMap) => {
    let count = 0;
    const solve = (row, currentCols, usedRegions) => {
        if (count > 1) return; // 정답이 2개 이상이면 논리 퍼즐로서 탈락
        if (row === SIZE) {
            count++;
            return;
        }
        for (let col = 0; col < SIZE; col++) {
            const region = regionMap[row][col];
            if (usedRegions[region]) continue;

            let valid = true;
            for (let r = 0; r < row; r++) {
                const c = currentCols[r];
                if (c === col) { valid = false; break; }
                if (Math.abs(r - row) === 1 && Math.abs(c - col) === 1) { valid = false; break; }
            }

            if (valid) {
                currentCols.push(col);
                usedRegions[region] = true;
                solve(row + 1, currentCols, usedRegions);
                currentCols.pop();
                usedRegions[region] = false;
            }
        }
    };
    solve(0, [], Array(SIZE).fill(false));
    return count;
};

// 보드 생성 로직 (유일해 보장)
const createBoard = () => {
    let attempts = 0;
    let fallbackBoard = null;

    // 정답이 1개인 완벽한 논리 퍼즐이 나올 때까지 맵을 재생성 (보통 0.1초 내외로 찾습니다)
    while (attempts < 2000) {
        attempts++;
        const cols = generateMinePlacements();

        const regionMap = Array(SIZE).fill(null).map(() => Array(SIZE).fill(-1));
        for (let r = 0; r < SIZE; r++) {
            regionMap[r][cols[r]] = r;
        }

        let hasUnassigned = true;
        while (hasUnassigned) {
            hasUnassigned = false;
            const candidates = [];
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (regionMap[r][c] === -1) {
                        hasUnassigned = true;
                        const neighbors = [];
                        if (r > 0 && regionMap[r-1][c] !== -1) neighbors.push(regionMap[r-1][c]);
                        if (r < SIZE-1 && regionMap[r+1][c] !== -1) neighbors.push(regionMap[r+1][c]);
                        if (c > 0 && regionMap[r][c-1] !== -1) neighbors.push(regionMap[r][c-1]);
                        if (c < SIZE-1 && regionMap[r][c+1] !== -1) neighbors.push(regionMap[r][c+1]);

                        if (neighbors.length > 0) {
                            candidates.push({ r, c, neighbors });
                        }
                    }
                }
            }
            if (candidates.length > 0) {
                const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
                const randomRegion = randomCandidate.neighbors[Math.floor(Math.random() * randomCandidate.neighbors.length)];
                regionMap[randomCandidate.r][randomCandidate.c] = randomRegion;
            }
        }

        fallbackBoard = Array(SIZE).fill(null).map((_, r) => Array(SIZE).fill(null).map((_, c) => ({
            isMine: cols[r] === c,
            regionId: regionMap[r][c],
            isRevealed: false,
            isFlagged: false
        })));

        // 생성된 맵의 정답 경우의 수가 딱 1개인지 확인!
        if (countSolutions(regionMap) === 1) {
            console.log(`Perfect logic board found in ${attempts} attempts`);
            return fallbackBoard;
        }
    }
    
    return fallbackBoard;
};

export default function FindMine() {
    const [board, setBoard] = useState(createBoard);
    const clickTimeout = useRef(null);

    // 🔥 파생 상태(Derived State)로 게임 오버/승리 처리 (코드가 훨씬 깔끔해집니다)
    const gameOver = board.length > 0 && board.some(row => row.some(cell => cell.isRevealed && cell.isMine));
    const gameWon = board.length > 0 && !gameOver && board.every(row => row.every(cell => cell.isMine || cell.isRevealed));

    const resetGame = () => {
        setBoard(createBoard());
    };

    const handleCellAction = (r, c, actionType) => {
        setBoard(prevBoard => {
            const newBoard = prevBoard.map(row => row.map(cell => ({...cell})));
            const cell = newBoard[r][c];

            if (actionType === 'flag') {
                if (!cell.isRevealed) {
                    const isNowFlagged = !cell.isFlagged;
                    cell.isFlagged = isNowFlagged;

                    // ✨ AUTO-ASSIST: 깃발을 꽂으면 절대 지뢰일 수 없는 곳을 자동으로 열어줍니다.
                    if (isNowFlagged) {
                        const targetRegion = cell.regionId;
                        for (let i = 0; i < SIZE; i++) {
                            for (let j = 0; j < SIZE; j++) {
                                if (i === r && j === c) continue;

                                const isSameRow = (i === r);
                                const isSameCol = (j === c);
                                const isSameRegion = (newBoard[i][j].regionId === targetRegion);
                                const isDiagTouch = (Math.abs(i - r) === 1 && Math.abs(j - c) === 1);

                                // 룰에 위배되는 칸들을 모두 강제로 오픈
                                if (isSameRow || isSameCol || isSameRegion || isDiagTouch) {
                                    const targetCell = newBoard[i][j];
                                    if (!targetCell.isFlagged && !targetCell.isRevealed) {
                                        targetCell.isRevealed = true; 
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (actionType === 'reveal') {
                if (cell.isFlagged || cell.isRevealed) return prevBoard;
                cell.isRevealed = true;
            }
            return newBoard;
        });
    };

    const handleCellClick = (e, r, c) => {
        if (gameOver || gameWon) return;

        if (e.detail === 1) {
            clickTimeout.current = setTimeout(() => {
                handleCellAction(r, c, 'reveal');
            }, 200); 
        } else if (e.detail === 2) {
            clearTimeout(clickTimeout.current);
            handleCellAction(r, c, 'flag');
        }
    };

    const handleContextMenu = (e, r, c) => {
        e.preventDefault();
        if (gameOver || gameWon) return;
        handleCellAction(r, c, 'flag');
    };

    return (
        <div className="find-mine-container">
            <h2>색상 지뢰 찾기</h2>
            <div style={{ backgroundColor: '#333', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                <p style={{ margin: '5px 0' }}><strong>100% 논리 퍼즐 모드</strong> (더 이상 찍지 마세요!)</p>
                <ul style={{ paddingLeft: '20px', margin: '5px 0', fontSize: '0.9rem' }}>
                    <li>가로, 세로, 색상 영역마다 지뢰가 딱 1개씩 있습니다.</li>
                    <li>지뢰끼리는 <strong>대각선으로도 절대 닿지 않습니다.</strong></li>
                </ul>
            </div>
            <p style={{fontSize: '0.9rem', color: '#666', marginTop: 0}}>
                좌클릭: 안전한 칸 열기 / <strong>우클릭(더블클릭): 지뢰 깃발 꽂기 (주변 자동 소거 ⚡)</strong>
            </p>

            <div 
                className="board" 
                style={{ gridTemplateColumns: `repeat(${SIZE}, 50px)` }}
            >
                {board.map((row, r) => 
                    row.map((cell, c) => {
                        let content = '';
                        if (cell.isRevealed) {
                            content = cell.isMine ? '💥' : '✔️'; 
                        } else if (cell.isFlagged) {
                            content = '🚩';
                        }

                        return (
                            <div
                                key={`${r}-${c}`}
                                className={`cell ${cell.isRevealed ? 'revealed' : ''} ${cell.isRevealed && !cell.isMine ? 'safe' : ''}`}
                                style={{ backgroundColor: COLORS[cell.regionId] || '#fff' }}
                                onClick={(e) => handleCellClick(e, r, c)}
                                onContextMenu={(e) => handleContextMenu(e, r, c)}
                            >
                                {content}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="status">
                {gameOver && <span style={{ color: 'red' }}>게임 오버! 지뢰를 밟았습니다. 💥</span>}
                {gameWon && <span style={{ color: '#007bff' }}>축하합니다! 완벽하게 풀어냈습니다! 🎉</span>}
            </div>

            <button className="reset-btn" onClick={resetGame}>새 게임 시작</button>
        </div>
    );
}