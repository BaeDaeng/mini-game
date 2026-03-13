// src/card-games/spider/Spider.jsx
import React, { useState } from 'react';
import { createSpiderDeck, RANK_VALUES, isValidSequence, checkForCompletion } from './spiderLogic';
import { CARD_BACK_IMAGE } from '../utils/deck';
import './SpiderStyle.css';

export default function Spider({ goBack }) {
  const [difficulty, setDifficulty] = useState(0); // 0: 메뉴, 1: 초급, 2: 중급, 4: 상급
  const [tableau, setTableau] = useState(Array(10).fill([]));
  const [stock, setStock] = useState([]);
  const [completedSets, setCompletedSets] = useState(0);
  
  const [score, setScore] = useState(500);
  const [moves, setMoves] = useState(0);
  
  const [selected, setSelected] = useState(null); // { colIdx, rowIdx }

  // 💡 게임 시작 (카드 나누기)
  const initGame = (diff) => {
    const deck = createSpiderDeck(diff);
    let newTableau = Array(10).fill(null).map(() => []);
    
    // 처음에 54장 분배 (1~4열은 6장, 5~10열은 5장)
    for (let i = 0; i < 10; i++) {
      const cardCount = i < 4 ? 6 : 5;
      for (let j = 0; j < cardCount; j++) {
        const card = deck.pop();
        if (j === cardCount - 1) card.isFaceUp = true; // 맨 위 카드만 앞면
        newTableau[i].push(card);
      }
    }

    setTableau(newTableau);
    setStock(deck); // 남은 50장
    setCompletedSets(0);
    setScore(500);
    setMoves(0);
    setSelected(null);
    setDifficulty(diff);
  };

  // 💡 세트 완성 체크 (K~A)
  const processCompletion = (currentTableau) => {
    let newTableau = [...currentTableau];
    let setsFormed = 0;

    for (let i = 0; i < 10; i++) {
      while (checkForCompletion(newTableau[i])) {
        // 끝에서 13장 제거
        newTableau[i] = newTableau[i].slice(0, -13);
        setsFormed++;
        // 그 아래 있던 카드가 있다면 뒤집어줌
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

  // 💡 카드 클릭 핸들러 (두 번 클릭으로 이동)
  const handleCardClick = (colIdx, rowIdx) => {
    const col = tableau[colIdx];
    const card = col[rowIdx];
    if (!card.isFaceUp) return;

    // 이미 선택된 카드가 있을 경우 -> 이동 시도
    if (selected) {
      // 1. 같은 카드 클릭 시 선택 취소
      if (selected.colIdx === colIdx && selected.rowIdx === rowIdx) {
        setSelected(null);
        return;
      }

      // 2. 다른 열로 이동 시도
      const sourceCol = tableau[selected.colIdx];
      const movingCards = sourceCol.slice(selected.rowIdx);
      const targetTopCard = col[col.length - 1];

      // 타겟 카드가 움직이려는 카드보다 1 높은 숫자여야 함
      if (RANK_VALUES[targetTopCard.rank] === RANK_VALUES[movingCards[0].rank] + 1) {
        moveCards(selected.colIdx, selected.rowIdx, colIdx);
      } else {
        // 이동 불가능하면 새로 클릭한 카드를 선택 상태로 변경
        checkAndSelect(colIdx, rowIdx, col);
      }
    } 
    // 선택된 카드가 없을 경우 -> 선택 시도
    else {
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
    let newTableau = [...tableau];
    const movingCards = newTableau[fromColIdx].slice(fromRowIdx);
    
    // 타겟 열에 추가
    newTableau[toColIdx] = [...newTableau[toColIdx], ...movingCards];
    // 소스 열에서 제거
    newTableau[fromColIdx] = newTableau[fromColIdx].slice(0, fromRowIdx);
    
    // 소스 열의 맨 위 카드가 뒷면이면 앞면으로 뒤집기
    if (newTableau[fromColIdx].length > 0) {
      newTableau[fromColIdx][newTableau[fromColIdx].length - 1].isFaceUp = true;
    }

    // 이동 처리 및 점수 차감 (-1점)
    setMoves(prev => prev + 1);
    setScore(prev => prev - 1);
    setSelected(null);

    // 이동 후 세트가 완성되었는지 확인
    setTableau(processCompletion(newTableau));
  };

  // 💡 하단 덱 클릭 시 10장씩 분배
  const dealCards = () => {
    if (stock.length === 0) return;

    // 빈 열이 하나라도 있으면 분배 불가 룰 적용
    if (tableau.some(col => col.length === 0)) {
      alert("빈 열에는 적어도 1장 이상의 카드가 있어야 새 카드를 돌릴 수 있습니다.");
      return;
    }

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
    setTableau(processCompletion(newTableau)); // 돌린 직후 우연히 세트가 맞았을 수도 있음
  };

  // --- 렌더링 영역 ---

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
        <button className="card-back-btn" style={{position: 'static'}} onClick={() => setDifficulty(0)}>⬅️ 포기</button>
        <div className="spider-stats">
          <span>이동: {moves}</span>
          <span style={{ color: '#f1c40f' }}>점수: {score}</span>
        </div>
      </div>

      <div className="tableau-area">
        {tableau.map((col, colIdx) => (
          <div 
            key={colIdx} 
            className="tableau-col" 
            onClick={() => handleEmptyColClick(colIdx)}
          >
            {col.map((card, rowIdx) => {
              const isSelected = selected && selected.colIdx === colIdx && rowIdx >= selected.rowIdx;
              
              // 뒷면일 경우 카드 간격을 좁게, 앞면일 경우 넓게 설정
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

      {/* 🎇 승리 시 불꽃놀이 오버레이 🎇 */}
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