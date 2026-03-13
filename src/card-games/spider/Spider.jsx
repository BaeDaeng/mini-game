// src/card-games/spider/Spider.jsx
import React, { useState } from 'react';
import { createSpiderDeck, RANK_VALUES, isValidSequence, checkForCompletion } from './spiderLogic';
import { CARD_BACK_IMAGE } from '../utils/deck';
import './SpiderStyle.css';

export default function Spider({ goBack }) {
  const [difficulty, setDifficulty] = useState(0); 
  const [tableau, setTableau] = useState(Array(10).fill(null).map(() => []));
  const [stock, setStock] = useState([]);
  const [completedSets, setCompletedSets] = useState(0);
  
  const [score, setScore] = useState(500);
  const [moves, setMoves] = useState(0);
  
  const [selected, setSelected] = useState(null); 
  
  // 💡 실행 취소를 위한 히스토리 (과거 상태 저장) 상태 추가
  const [history, setHistory] = useState([]);

  // 💡 현재 상태를 히스토리에 백업하는 함수 (조작이 일어나기 직전에 호출됨)
  const saveState = () => {
    setHistory(prev => [...prev, {
      // 깊은 복사(Deep Copy)를 통해 참조 끊기 (과거 상태 오염 완벽 방지)
      tableau: JSON.parse(JSON.stringify(tableau)),
      stock: JSON.parse(JSON.stringify(stock)),
      completedSets,
      score, // 당시의 점수 백업
      moves  // 당시의 이동 횟수 백업
    }]);
  };

  // 💡 실행 취소 기능 동작
  const handleUndo = () => {
    if (history.length === 0) return;
    
    // 가장 최근의 과거 상태 꺼내기
    const lastState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1)); // 꺼낸 히스토리는 배열에서 삭제
    
    // 테이블 및 덱 상태 복구
    setTableau(lastState.tableau);
    setStock(lastState.stock);
    setCompletedSets(lastState.completedSets);
    
    // 💡 규칙: 실행 취소도 1번의 조작이므로 과거 점수에서 -1점, 과거 이동 횟수에서 +1회 처리
    setMoves(lastState.moves + 1);
    setScore(lastState.score - 1);
    setSelected(null);
  };

  // 게임 시작 (카드 나누기)
  const initGame = (diff) => {
    const deck = createSpiderDeck(diff);
    let newTableau = Array(10).fill(null).map(() => []);
    
    for (let i = 0; i < 10; i++) {
      const cardCount = i < 4 ? 6 : 5;
      for (let j = 0; j < cardCount; j++) {
        const card = deck.pop();
        if (j === cardCount - 1) card.isFaceUp = true; 
        newTableau[i].push(card);
      }
    }

    setTableau(newTableau);
    setStock(deck); 
    setCompletedSets(0);
    setScore(500);
    setMoves(0);
    setSelected(null);
    setHistory([]); // 💡 게임 다시 시작 시 히스토리도 초기화
    setDifficulty(diff);
  };

  // 세트 완성 체크 (K~A)
  const processCompletion = (currentTableau) => {
    let newTableau = [...currentTableau];
    let setsFormed = 0;

    for (let i = 0; i < 10; i++) {
      while (checkForCompletion(newTableau[i])) {
        newTableau[i] = newTableau[i].slice(0, -13);
        setsFormed++;
        if (newTableau[i].length > 0) {
          newTableau[i][newTableau[i].length - 1].isFaceUp = true;
        }
      }
    }

    if (setsFormed > 0) {
      setCompletedSets(prev => prev + setsFormed);
      setScore(prev => prev + (setsFormed * 100)); // 완성마다 100점 추가
    }
    return newTableau;
  };

  // 카드 클릭 핸들러
  const handleCardClick = (colIdx, rowIdx) => {
    const col = tableau[colIdx];
    const card = col[rowIdx];
    if (!card.isFaceUp) return;

    if (selected) {
      if (selected.colIdx === colIdx && selected.rowIdx === rowIdx) {
        setSelected(null);
        return;
      }

      const sourceCol = tableau[selected.colIdx];
      const movingCards = sourceCol.slice(selected.rowIdx);
      const targetTopCard = col[col.length - 1];

      if (RANK_VALUES[targetTopCard.rank] === RANK_VALUES[movingCards[0].rank] + 1) {
        moveCards(selected.colIdx, selected.rowIdx, colIdx);
      } else {
        checkAndSelect(colIdx, rowIdx, col);
      }
    } else {
      checkAndSelect(colIdx, rowIdx, col);
    }
  };

  // 빈 열 클릭 시 처리
  const handleEmptyColClick = (colIdx) => {
    if (selected && tableau[colIdx].length === 0) {
      moveCards(selected.colIdx, selected.rowIdx, colIdx);
    }
  };

  // 무늬가 같고 내림차순인지 확인 후 선택
  const checkAndSelect = (colIdx, rowIdx, col) => {
    const cardsToSelect = col.slice(rowIdx);
    if (isValidSequence(cardsToSelect)) {
      setSelected({ colIdx, rowIdx });
    }
  };

  // 실제 카드 이동 처리
  const moveCards = (fromColIdx, fromRowIdx, toColIdx) => {
    saveState(); // 💡 카드 이동 직전에 현재 상태를 백업합니다.

    let newTableau = [...tableau];
    const movingCards = newTableau[fromColIdx].slice(fromRowIdx);
    
    newTableau[toColIdx] = [...newTableau[toColIdx], ...movingCards];
    newTableau[fromColIdx] = newTableau[fromColIdx].slice(0, fromRowIdx);
    
    if (newTableau[fromColIdx].length > 0) {
      newTableau[fromColIdx][newTableau[fromColIdx].length - 1].isFaceUp = true;
    }

    setMoves(prev => prev + 1);
    setScore(prev => prev - 1);
    setSelected(null);
    setTableau(processCompletion(newTableau));
  };

  // 하단 덱 클릭 시 분배
  const dealCards = () => {
    if (stock.length === 0) return;

    if (tableau.some(col => col.length === 0)) {
      alert("빈 열에는 적어도 1장 이상의 카드가 있어야 새 카드를 돌릴 수 있습니다.");
      return;
    }

    saveState(); // 💡 카드 배분 직전에 현재 상태를 백업합니다.

    let newTableau = [...tableau];
    let newStock = [...stock];

    for (let i = 0; i < 10; i++) {
      if (newStock.length > 0) {
        const card = newStock.pop();
        card.isFaceUp = true;
        newTableau[i].push(card);
      }
    }

    setStock(newStock);
    setMoves(prev => prev + 1);
    setScore(prev => prev - 1);
    setSelected(null);
    setTableau(processCompletion(newTableau)); 
  };

  // --- 렌더링 ---

  if (difficulty === 0) {
    return (
      <div className="card-menu-container">
        <button className="card-back-btn" onClick={goBack}>⬅️ 나가기</button>
        <h1 style={{ fontSize: '3rem', color: '#ecf0f1' }}>🕸️ 스파이더</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>도전할 난이도를 선택하세요.</p>
        <button className="menu-btn" style={{ background: '#27ae60' }} onClick={() => initGame(1)}>🟢 초급 (♠ 1짝패)</button>
        <button className="menu-btn" style={{ background: '#e67e22' }} onClick={() => initGame(2)}>🟡 중급 (♠, ♥ 2짝패)</button>
        <button className="menu-btn" style={{ background: '#c0392b' }} onClick={() => initGame(4)}>🔴 상급 (모든 짝패)</button>
      </div>
    );
  }

  return (
    <div className="spider-board">
      <div className="spider-header">
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="card-back-btn" style={{position: 'static'}} onClick={() => setDifficulty(0)}>⬅️ 포기</button>
          
          {/* 💡 실행 취소 버튼 UI */}
          <button 
            onClick={handleUndo} 
            disabled={history.length === 0}
            style={{
              padding: '8px 12px', background: history.length === 0 ? '#7f8c8d' : '#3498db', 
              color: 'white', border: 'none', borderRadius: '8px', cursor: history.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold'
            }}
          >
            ↩️ 실행 취소
          </button>
        </div>
        
        <div className="spider-stats">
          <span>이동: {moves}</span>
          <span style={{ color: '#f1c40f' }}>점수: {score}</span>
        </div>
      </div>

      <div className="tableau-area">
        {tableau.map((col, colIdx) => (
          <div key={colIdx} className="tableau-col" onClick={() => handleEmptyColClick(colIdx)}>
            {col.map((card, rowIdx) => {
              const isSelected = selected && selected.colIdx === colIdx && rowIdx >= selected.rowIdx;
              const topOffset = col.slice(0, rowIdx).reduce((acc, curr) => acc + (curr.isFaceUp ? 25 : 10), 0);

              return (
                <div 
                  key={card.id} 
                  className={`spider-card-wrapper ${isSelected ? 'selected' : ''}`}
                  style={{ top: `${topOffset}px`, zIndex: rowIdx }}
                  onClick={(e) => { e.stopPropagation(); handleCardClick(colIdx, rowIdx); }}
                >
                  <img src={card.isFaceUp ? card.image : CARD_BACK_IMAGE} alt="card" />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="spider-footer">
        <div className="completed-area">
          {[...Array(completedSets)].map((_, i) => (
            <div key={i} className="completed-pile">
              <img src={`/cards/king_${difficulty === 1 ? 'spades' : 'hearts'}_white.png`} alt="완성" />
            </div>
          ))}
        </div>
        
        <div className="stock-area">
          {[...Array(Math.ceil(stock.length / 10))].map((_, i) => (
            <div key={i} className="stock-pile" onClick={dealCards}>
              <img src={CARD_BACK_IMAGE} alt="덱" />
            </div>
          ))}
        </div>
      </div>

      {completedSets === 8 && (
        <div className="victory-overlay">
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework"></div>
          <h1>승리! 🎉</h1>
          <h2 style={{ color: 'white', marginTop: '20px' }}>최종 점수: {score}점</h2>
          <button className="menu-btn" style={{ marginTop: '30px' }} onClick={() => setDifficulty(0)}>
            메뉴로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
}