// src/card-games/catch-thief/CatchThiefSpy.jsx
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore"; 
import { db } from "../../firebase";
import { createSpyDeck, removePairs } from './catchThiefLogic'; 
import { CARD_BACK_IMAGE } from '../utils/deck';
import './CatchThiefStyle.css'; 

const getNextActivePlayerIdx = (currentIdx, currentPlayers, direction) => {
  let nextIdx = (currentIdx + direction) % currentPlayers.length;
  if (nextIdx < 0) nextIdx += currentPlayers.length;
  
  while (currentPlayers[nextIdx].rank !== null && currentPlayers.filter(p=>p.rank===null).length > 1) {
    nextIdx = (nextIdx + direction) % currentPlayers.length;
    if (nextIdx < 0) nextIdx += currentPlayers.length;
  }
  return nextIdx;
};

export default function CatchThiefSpy({ roomCode, playerType, goBack }) {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "yacht_rooms", roomCode), (docSnap) => {
      if (docSnap.exists()) setGameState(docSnap.data());
      else { alert("방이 폭파되었거나 종료되었습니다."); goBack(); }
    });
    return () => unsubscribe();
  }, [roomCode, goBack]);

  const lastActive = gameState?.lastActive; 
  useEffect(() => {
    if (!lastActive) return;
    const interval = setInterval(async () => {
      if (new Date().getTime() - lastActive > 5 * 60 * 1000) {
        try { 
          await deleteDoc(doc(db, "yacht_rooms", roomCode)); 
        } catch(error) { 
          // 💡 no-empty, no-unused-vars 에러 해결을 위해 로그 추가
          console.error("방 삭제 오류:", error); 
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [lastActive, roomCode]);

  const amIHost = playerType === 'p1';

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
      let updatedHand = removePairs(currentPlayer.hand);
      for (let i = updatedHand.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [updatedHand[i], updatedHand[j]] = [updatedHand[j], updatedHand[i]];
      }
      currentPlayer.hand = updatedHand;

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
        survivers[0].rank = '스파이 발각'; 
        newRankings.push(survivers[0].name + " 🕵️");
        
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

  if (!gameState) return <div style={{color:'white', padding:'20px'}}>로딩 중...</div>;

  const isMyTurn = gameState.players[gameState.turnIdx]?.id === playerType && gameState.phase === 'playing';
  const targetTurnIdx = getNextActivePlayerIdx(gameState.turnIdx, gameState.players, gameState.direction);

  const startGame = async () => {
    let newPlayers = gameState.players.map(p => ({ ...p, hand: [], rank: null }));
    
    let cpuCount = newPlayers.filter(p => p.isCpu).length + 1;
    while (newPlayers.length < gameState.maxPlayers) {
      newPlayers.push({ id: `cpu${cpuCount}`, name: `Cpu${cpuCount}`, isCpu: true, hand: [], rank: null });
      cpuCount++;
    }

    const deck = createSpyDeck(); 
    
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

  if (gameState.phase === 'lobby') {
    return (
      <div className="card-menu-container">
        <button className="card-back-btn" onClick={goBack}>⬅️ 나가기</button>
        <h2 style={{color: '#e74c3c', fontSize: '3rem'}}>🕵️ 방 코드: {roomCode}</h2>
        <p style={{color: '#f1c40f', fontWeight: 'bold'}}>스파이 모드 활성화됨 (조커 없음)</p>
        <p>설정 인원: {gameState.maxPlayers}명 | 방향: {gameState.direction === 1 ? '시계 ↻' : '반시계 ↺'}</p>
        <div style={{margin: '20px 0'}}>
          {gameState.players.map(p => (
             <div key={p.id} style={{fontSize: '1.2rem'}}>{p.name} {p.id === playerType ? '(나)' : ''}</div>
          ))}
        </div>
        {amIHost ? (
          <button className="menu-btn" style={{background: '#c0392b'}} onClick={startGame}>스파이 잡기 시작!</button>
        ) : (
          <p>방장이 시작할 때까지 기다려주세요...</p>
        )}
      </div>
    );
  }

  return (
    <div className="catch-thief-board">
      <button className="card-back-btn" onClick={goBack}>⬅️ 나가기</button>
      <h2 style={{textAlign:'center', color:'#e74c3c', margin:0}}>🕵️ 도둑잡기 (스파이 모드) 🕵️</h2>
      
      <div style={{textAlign:'center', marginTop:'10px'}}>
        {gameState.phase === 'animating' ? (
          <h3 style={{color: '#f1c40f'}}>카드 확인 및 짝 맞추는 중... ⏳</h3>
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
                <div className="rank-badge" style={{background: p.rank === '스파이 발각' ? '#e74c3c' : '#f1c40f', color: p.rank === '스파이 발각' ? 'white' : 'black'}}>
                  {p.rank === '스파이 발각' ? '🕵️ 패배' : `🏆 ${p.rank}위`}
                </div>
              ) : (
                <div className={`player-hand ${isMyTurn && isTarget ? 'clickable' : ''}`}>
                  {p.hand.map((card, cIdx) => {
                    const isDrawnCard = card.id === gameState.drawnCardId;
                    const isCurrentTurnMe = gameState.players[gameState.turnIdx]?.id === playerType;
                    const shouldShow = isMe || gameState.phase === 'gameOver' || (isDrawnCard && isCurrentTurnMe);

                    return (
                      <img 
                        key={card.id} 
                        src={shouldShow ? card.image : CARD_BACK_IMAGE} 
                        alt="card"
                        className={isDrawnCard ? 'drawn-highlight' : ''}
                        onClick={() => { if (isMyTurn && isTarget && gameState.phase === 'playing') handleDrawCard(i, cIdx); }}
                        style={{
                          cursor: (isMyTurn && isTarget) ? 'pointer' : 'default',
                          opacity: (isDrawnCard && !isCurrentTurnMe) ? 0.5 : 1
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {gameState.phase === 'gameOver' && (
        <div style={{position:'fixed', top:'30%', left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.9)', padding:'40px', borderRadius:'20px', textAlign:'center', zIndex:100}}>
          <h1 style={{color: '#e74c3c', fontSize:'3rem'}}>🕵️ 스파이 발각!</h1>
          <div style={{margin:'20px 0', fontSize:'1.5rem', lineHeight:'1.8'}}>
            {gameState.rankings.map((name, i) => (
              <div key={i} style={{color: i === gameState.rankings.length - 1 ? '#e74c3c' : 'white'}}>
                {i === gameState.rankings.length - 1 ? '🕵️ 범인:' : `🏆 ${i + 1}위:`} {name}
              </div>
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