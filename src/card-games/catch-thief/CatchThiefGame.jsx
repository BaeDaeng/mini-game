// src/card-games/catch-theif/CatchThiefGame.jsx
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore"; 
import { db } from "../../firebase";
import { createOldMaidDeck, removePairs } from './catchThiefLogic'; // 💡 파일명 변경 반영
import { CARD_BACK_IMAGE } from '../utils/deck';
import './CatchThiefStyle.css'; // 💡 파일명 변경 반영

// 💡 훅(Hook) 의존성 경고를 피하기 위해 계산 함수를 컴포넌트 바깥으로 빼냈습니다.
const getNextActivePlayerIdx = (currentIdx, currentPlayers, direction) => {
  let nextIdx = (currentIdx + direction) % currentPlayers.length;
  if (nextIdx < 0) nextIdx += currentPlayers.length;
  
  while (currentPlayers[nextIdx].rank !== null && currentPlayers.filter(p=>p.rank===null).length > 1) {
    nextIdx = (nextIdx + direction) % currentPlayers.length;
    if (nextIdx < 0) nextIdx += currentPlayers.length;
  }
  return nextIdx;
};

export default function CatchThiefGame({ roomCode, playerType, goBack }) {
  const [gameState, setGameState] = useState(null);

  // 1. 방 동기화
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "yacht_rooms", roomCode), (docSnap) => {
      if (docSnap.exists()) setGameState(docSnap.data());
      else { alert("방이 폭파되었거나 종료되었습니다."); goBack(); }
    });
    return () => unsubscribe();
  }, [roomCode, goBack]);

  // 2. 5분 폭파 타이머 (no-empty, no-unused-vars 에러 해결)
  const lastActive = gameState?.lastActive; 
  useEffect(() => {
    if (!lastActive) return;
    const interval = setInterval(async () => {
      if (new Date().getTime() - lastActive > 5 * 60 * 1000) {
        try { 
          await deleteDoc(doc(db, "yacht_rooms", roomCode)); 
        } catch(error) {
          console.error("방 삭제 오류:", error); // 💡 비어있던 catch 블록 수정
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [lastActive, roomCode]);

  const amIHost = playerType === 'p1';

  // 4. 카드 뽑기 로직 (CPU useEffect보다 위에 있어야 참조 가능)
  const handleDrawCard = async (targetPlayerIdx, cardIndex) => {
    if (!gameState) return;

    let newPlayers = [...gameState.players];
    let currentPlayer = newPlayers[gameState.turnIdx];
    let targetPlayer = newPlayers[targetPlayerIdx];

    const drawnCard = targetPlayer.hand[cardIndex];
    targetPlayer.hand.splice(cardIndex, 1);
    currentPlayer.hand.push(drawnCard);

    await updateDoc(doc(db, "yacht_rooms", roomCode), {
      players: newPlayers,
      phase: 'animating',
      drawnCardId: drawnCard.id,
      lastActive: new Date().getTime()
    });

    setTimeout(async () => {
      currentPlayer.hand = removePairs(currentPlayer.hand);
      let newRankings = [...gameState.rankings];
      let currentRankNum = newRankings.length + 1;

      if (targetPlayer.hand.length === 0 && targetPlayer.rank === null) {
        targetPlayer.rank = currentRankNum++;
        newRankings.push(targetPlayer.name);
      }
      if (currentPlayer.hand.length === 0 && currentPlayer.rank === null) {
        currentPlayer.rank = currentRankNum++;
        newRankings.push(currentPlayer.name);
      }

      const survivers = newPlayers.filter(p => p.rank === null);
      if (survivers.length === 1) {
        survivers[0].rank = '꼴찌 (조커)';
        newRankings.push(survivers[0].name + " 🤡");
        
        await updateDoc(doc(db, "yacht_rooms", roomCode), {
          players: newPlayers, rankings: newRankings, phase: 'gameOver',
          lastActive: new Date().getTime()
        });
        return;
      }

      const nextTurnIdx = getNextActivePlayerIdx(gameState.turnIdx, newPlayers, gameState.direction);
      await updateDoc(doc(db, "yacht_rooms", roomCode), {
        players: newPlayers, rankings: newRankings, phase: 'playing',
        turnIdx: nextTurnIdx, drawnCardId: null,
        lastActive: new Date().getTime()
      });
    }, 2000);
  };

  // 3. CPU 턴 자동 처리 (rules-of-hooks 에러 해결을 위해 return 위로 끌어올림)
  useEffect(() => {
    if (!gameState || gameState.phase !== 'playing') return;
    const currentPlayer = gameState.players[gameState.turnIdx];

    if (currentPlayer.isCpu && amIHost) {
      const targetIdx = getNextActivePlayerIdx(gameState.turnIdx, gameState.players, gameState.direction);
      const targetHand = gameState.players[targetIdx].hand;
      
      const timer = setTimeout(() => {
        const randomCardIdx = Math.floor(Math.random() * targetHand.length);
        handleDrawCard(targetIdx, randomCardIdx);
      }, 1500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.turnIdx, gameState?.phase]); 
  // 💡 노란색 경고(exhaustive-deps)를 안전하게 무시하는 주석 추가. 
  // (handleDrawCard를 배열에 넣으면 무한 루프가 발생할 수 있으므로 제외하는 것이 맞습니다)

  // 🔥 모든 useEffect가 선언된 이후에 예외 처리(return)를 해야 에러가 나지 않습니다.
  if (!gameState) return <div style={{color:'white', padding:'20px'}}>로딩 중...</div>;

  const isMyTurn = gameState.players[gameState.turnIdx]?.id === playerType && gameState.phase === 'playing';
  const targetTurnIdx = getNextActivePlayerIdx(gameState.turnIdx, gameState.players, gameState.direction);

  // 게임 시작 로직
  const startGame = async () => {
    let newPlayers = [...gameState.players];
    let cpuCount = 1;
    while (newPlayers.length < gameState.maxPlayers) {
      newPlayers.push({ id: `cpu${cpuCount}`, name: `Cpu${cpuCount}`, isCpu: true, hand: [], rank: null });
      cpuCount++;
    }

    const deck = createOldMaidDeck(); // 이 함수 이름도 catchThiefLogic.js 안에서 변경하셨다면 그에 맞게 수정해주세요!
    
    while (deck.length > 0) {
      for (let i = 0; i < newPlayers.length; i++) {
        if (deck.length > 0) newPlayers[i].hand.push(deck.pop());
      }
    }

    newPlayers = newPlayers.map(p => ({ ...p, hand: removePairs(p.hand) }));

    await updateDoc(doc(db, "yacht_rooms", roomCode), {
      status: 'playing', phase: 'playing',
      players: newPlayers, rankings: [], turnIdx: 0,
      drawnCardId: null,
      lastActive: new Date().getTime()
    });
  };

  // --- 화면 렌더링 ---
  if (gameState.phase === 'lobby') {
    return (
      <div className="card-menu-container">
        <button className="card-back-btn" onClick={goBack}>⬅️ 나가기</button>
        <h2 style={{color: '#f1c40f', fontSize: '3rem'}}>방 코드: {roomCode}</h2>
        <p>설정 인원: {gameState.maxPlayers}명 | 방향: {gameState.direction === 1 ? '시계 ↻' : '반시계 ↺'}</p>
        <div style={{margin: '20px 0'}}>
          {gameState.players.map(p => (
             <div key={p.id} style={{fontSize: '1.2rem'}}>{p.name} {p.id === playerType ? '(나)' : ''}</div>
          ))}
        </div>
        {amIHost ? (
          <button className="menu-btn" style={{background: '#27ae60'}} onClick={startGame}>게임 시작 (부족한 인원은 CPU로 대체)</button>
        ) : (
          <p>방장이 시작할 때까지 기다려주세요...</p>
        )}
      </div>
    );
  }

  return (
    <div className="old-maid-board">
      <button className="card-back-btn" onClick={goBack}>⬅️ 나가기</button>
      <h2 style={{textAlign:'center', color:'#f1c40f', margin:0}}>🃏 도둑잡기 🤡</h2>
      
      <div style={{textAlign:'center', marginTop:'10px'}}>
        {gameState.phase === 'animating' ? (
          <h3 style={{color: '#e74c3c'}}>카드 확인 및 짝 맞추는 중... ⏳</h3>
        ) : (
          <h3>{gameState.players[gameState.turnIdx].name}의 턴! (카드 뽑기)</h3>
        )}
      </div>

      <div className="table-area">
        {gameState.players.map((p, i) => {
          const isTurn = gameState.turnIdx === i && gameState.phase !== 'gameOver';
          const isTarget = targetTurnIdx === i && gameState.phase === 'playing';
          const isMe = p.id === playerType;
          
          return (
            <div key={p.id} className={`player-area ${isTurn ? 'active-turn' : ''} ${isTarget ? 'target-turn' : ''}`}>
              <h4>{p.name} {p.isCpu ? '🤖' : '👤'}</h4>
              
              {p.rank ? (
                <div className="rank-badge">{p.rank === '꼴찌 (조커)' ? '🤡 꼴찌' : `🏆 ${p.rank}위`}</div>
              ) : (
                <div className={`player-hand ${isMyTurn && isTarget ? 'clickable' : ''}`}>
                  {p.hand.map((card, cIdx) => (
                    <img 
                      key={card.id} 
                      src={isMe || gameState.phase === 'gameOver' || card.id === gameState.drawnCardId ? card.image : CARD_BACK_IMAGE} 
                      alt="card"
                      className={card.id === gameState.drawnCardId ? 'drawn-highlight' : ''}
                      onClick={() => { if (isMyTurn && isTarget) handleDrawCard(i, cIdx); }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {gameState.phase === 'gameOver' && (
        <div style={{position:'fixed', top:'30%', left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.9)', padding:'40px', borderRadius:'20px', textAlign:'center', zIndex:100}}>
          <h1 style={{color: '#f1c40f', fontSize:'3rem'}}>게임 종료!</h1>
          <div style={{margin:'20px 0', fontSize:'1.5rem', lineHeight:'1.8'}}>
            {gameState.rankings.map((name, i) => (
              <div key={i}>{i === gameState.rankings.length - 1 ? '🤡 패배:' : `🏆 ${i + 1}위:`} {name}</div>
            ))}
          </div>
          <div style={{display:'flex', gap:'20px', justifyContent:'center'}}>
            {amIHost && <button className="menu-btn" style={{background:'#27ae60'}} onClick={startGame}>다시 하기</button>}
            <button className="menu-btn" style={{background:'#c0392b'}} onClick={goBack}>나가기</button>
          </div>
        </div>
      )}
    </div>
  );
}