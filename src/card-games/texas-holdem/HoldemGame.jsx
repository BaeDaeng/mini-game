// src/card-games/texas-holdem/HoldemGame.jsx
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore"; 
import { db } from "../../firebase";
import { createDeck, shuffleDeck, CARD_BACK_IMAGE } from '../utils/deck';
import { evaluateHand } from './holdemLogic';
import './HoldemStyle.css';

export default function HoldemGame({ roomCode, playerType, goBack }) {
  const [gameState, setGameState] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(50); // 💡 레이즈 미니멈 기본값 50으로 변경

  // 1. 실시간 방 데이터 동기화
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "yacht_rooms", roomCode), (docSnap) => {
      if (docSnap.exists()) setGameState(docSnap.data());
      else { 
        alert("장시간 입력이 없어 방이 폭파되었거나 게임이 종료되었습니다."); 
        goBack(); 
      }
    });
    return () => unsubscribe();
  }, [roomCode, goBack]);

  // 2. 5분 무입력 자동 폭파 백그라운드 타이머 (ESLint 경고 해결 및 최적화)
  const lastActive = gameState?.lastActive; 

  useEffect(() => {
    if (!lastActive) return;

    const interval = setInterval(async () => {
      const now = new Date().getTime();
      // 마지막 액션으로부터 5분(300,000 밀리초)이 경과했는지 확인
      if (now - lastActive > 5 * 60 * 1000) {
        try {
          // 파이어베이스 데이터베이스에서 방 문서를 완전히 삭제
          await deleteDoc(doc(db, "yacht_rooms", roomCode));
        } catch (error) {
          console.error("방 삭제 오류:", error);
        }
      }
    }, 10000); // 10초마다 검사 실행

    return () => clearInterval(interval);
  }, [lastActive, roomCode]);

  if (!gameState) return <div style={{color:'white', padding:'20px'}}>로딩 중...</div>;

  const isMyTurn = gameState.players[gameState.turnIdx]?.id === playerType && 
                   ['preflop', 'flop', 'turn', 'river'].includes(gameState.phase);
  const me = gameState.players.find(p => p.id === playerType);

  // ---------------- 1. 게임 시작 (초기화) ----------------
  const startHand = async () => {
    const newDeck = shuffleDeck(createDeck());
    const newPlayers = gameState.players.map(p => ({
      ...p,
      hand: p.money > 0 ? [newDeck.pop(), newDeck.pop()] : [],
      currentBet: 0,
      status: p.money > 0 ? 'active' : 'out',
      acted: false 
    }));

    const nextDealer = gameState.phase === 'lobby' ? 0 : (gameState.dealerIdx + 1) % newPlayers.length;
    let turnIdx = (nextDealer + 1) % newPlayers.length;
    while(newPlayers[turnIdx].status !== 'active') { turnIdx = (turnIdx + 1) % newPlayers.length; }
    
    let pot = 0;
    newPlayers.forEach(p => {
      if (p.status === 'active') { p.money -= 10; p.currentBet = 10; pot += 10; }
    });

    await updateDoc(doc(db, "yacht_rooms", roomCode), {
      status: 'playing', phase: 'preflop', deck: newDeck, communityCards: [],
      players: newPlayers, pot, currentBet: 10, dealerIdx: nextDealer, turnIdx,
      lastActive: new Date().getTime(), 
      lastWinner: null,
      resultLog: [],
      revealedHand: null,
      isShowdown: false 
    });
    setRaiseAmount(50); // 💡 새 라운드 시작 시 기본 레이즈 금액 50으로 초기화
  };

  // ---------------- 2. 베팅 액션 처리 ----------------
  const handleAction = async (actionType) => {
    if (!isMyTurn) return;
    
    let newPlayers = [...gameState.players];
    let player = newPlayers[gameState.turnIdx];
    let newPot = gameState.pot;
    let newCurrentBet = gameState.currentBet;

    if (actionType === 'fold') {
      player.status = 'folded';
    } 
    else if (actionType === 'call') {
      const callAmount = newCurrentBet - player.currentBet;
      const actualBet = Math.min(callAmount, player.money);
      player.money -= actualBet;
      player.currentBet += actualBet;
      newPot += actualBet;
    } 
    else if (actionType === 'raise') {
      const actualRaise = Math.min(raiseAmount, player.money);
      player.money -= actualRaise;
      player.currentBet += actualRaise;
      newPot += actualRaise;
      newCurrentBet = player.currentBet; 
      
      newPlayers.forEach(p => {
        if (p.id !== player.id && p.status === 'active') p.acted = false;
      });
    }

    player.acted = true; 

    let activePlayers = newPlayers.filter(p => p.status === 'active');
    let activeCount = activePlayers.length;

    if (activeCount === 1) {
      const winner = activePlayers[0];
      winner.money += newPot;
      await updateDoc(doc(db, "yacht_rooms", roomCode), {
        players: newPlayers, pot: 0, phase: 'muckOrShow',
        lastWinner: winner.name,
        lastActive: new Date().getTime() 
      });
      return;
    }

    let nextTurn = (gameState.turnIdx + 1) % newPlayers.length;
    while (newPlayers[nextTurn].status !== 'active' && activeCount > 1) {
      nextTurn = (nextTurn + 1) % newPlayers.length;
    }

    let newPhase = gameState.phase;
    let newCommCards = [...gameState.communityCards];
    let newDeck = [...gameState.deck];
    let isShowdown = gameState.isShowdown || false;

    const allActedAndMatched = activePlayers.every(p => p.acted && (p.currentBet === newCurrentBet || p.money === 0));

    if (allActedAndMatched) {
      if (gameState.phase === 'preflop') { newPhase = 'flop'; newCommCards.push(newDeck.pop(), newDeck.pop(), newDeck.pop()); }
      else if (gameState.phase === 'flop') { newPhase = 'turn'; newCommCards.push(newDeck.pop()); }
      else if (gameState.phase === 'turn') { newPhase = 'river'; newCommCards.push(newDeck.pop()); }
      else if (gameState.phase === 'river') { newPhase = 'showdown'; isShowdown = true; } 
      
      if (newPhase !== 'showdown') {
        newPlayers.forEach(p => { p.currentBet = 0; if(p.status === 'active') p.acted = false; });
        newCurrentBet = 0;
        
        nextTurn = (gameState.dealerIdx + 1) % newPlayers.length;
        while(newPlayers[nextTurn].status !== 'active') { nextTurn = (nextTurn + 1) % newPlayers.length; }
      }
    }

    await updateDoc(doc(db, "yacht_rooms", roomCode), {
      players: newPlayers, pot: newPot, currentBet: newCurrentBet,
      turnIdx: nextTurn, phase: newPhase, communityCards: newCommCards, deck: newDeck,
      isShowdown, 
      lastActive: new Date().getTime() 
    });
    setRaiseAmount(50); // 💡 액션 후 레이즈 입력창 50으로 초기화
  };

  // ---------------- 3. 올 폴드 시 승자의 패 공개 여부 ----------------
  const handleMuckOrShow = async (isShow) => {
    const survivers = gameState.players.filter(p => p.money > 0).length;
    await updateDoc(doc(db, "yacht_rooms", roomCode), {
      phase: survivers <= 1 ? 'gameOver' : 'waiting',
      revealedHand: isShow ? me.hand : null,
      resultLog: isShow ? [`${me.name}님이 승리 후 패를 당당하게 공개했습니다!`] : [`${me.name}님이 패를 숨기고 상금을 챙겼습니다. 😎`],
      lastActive: new Date().getTime() 
    });
  };

  // ---------------- 4. 쇼다운 (패 판정 및 승자 결정) ----------------
  const handleShowdown = async () => {
    let bestScore = -1;
    let winnerIdx = -1;
    let resultLog = [];

    gameState.players.forEach((p, idx) => {
      if (p.status === 'active') {
        const handData = evaluateHand([...p.hand, ...gameState.communityCards]);
        resultLog.push(`${p.name}: ${handData.name}`); 
        if (handData.score > bestScore) { bestScore = handData.score; winnerIdx = idx; }
      }
    });

    let newPlayers = [...gameState.players];
    newPlayers[winnerIdx].money += gameState.pot;
    const survivers = newPlayers.filter(p => p.money > 0).length;

    await updateDoc(doc(db, "yacht_rooms", roomCode), {
      players: newPlayers, pot: 0, 
      phase: survivers <= 1 ? 'gameOver' : 'waiting',
      lastWinner: newPlayers[winnerIdx].name,
      resultLog,
      lastActive: new Date().getTime() 
    });
  };

  // ---------------- 대기실 화면 ----------------
  if (gameState.phase === 'lobby') {
    return (
      <div className="card-menu-container">
        <button className="card-back-btn" onClick={goBack}>⬅️ 나가기</button>
        <h2 style={{color: '#f1c40f', fontSize: '3rem', margin: '0 0 10px 0'}}>방 코드: {roomCode}</h2>
        <p style={{fontSize: '1.2rem', marginBottom: '30px'}}>플레이어 접속 대기 중... ({gameState.players.length}/6)</p>
        <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px', maxWidth: '600px'}}>
          {gameState.players.map(p => (
            <div key={p.id} style={{background: 'rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 'bold'}}>
              {p.name} {p.id === playerType ? '(나)' : ''}
              {p.id === 'p1' && <span style={{fontSize: '0.8rem', color: '#e74c3c', display:'block'}}>👑 방장</span>}
            </div>
          ))}
        </div>
        {playerType === 'p1' ? (
          <button className="menu-btn" style={{background: gameState.players.length >= 2 ? '#27ae60' : '#7f8c8d'}}
            onClick={() => startHand()} disabled={gameState.players.length < 2}>
            {gameState.players.length >= 2 ? '게임 시작하기 🚀' : '최소 2명이 필요합니다'}
          </button>
        ) : (
          <div style={{fontSize: '1.2rem', color: '#3498db', fontWeight: 'bold', animation: 'pulse 1.5s infinite'}}>
            방장이 게임을 시작할 때까지 기다려주세요...
          </div>
        )}
      </div>
    );
  }

  // ---------------- 게임 테이블 화면 ----------------
  return (
    <div className="holdem-board">
      <button className="card-back-btn" onClick={goBack}>⬅️ 나가기</button>
      <button className="card-rule-btn" onClick={() => setShowRules(true)}>📖 족보 보기</button>

      <div className="table-center">
        <div className="pot-display">Total Pot: ${gameState.pot}</div>
        <div className="community-cards">
          {gameState.communityCards.map((c, i) => <img key={i} src={c.image} alt="커뮤니티" />)}
          {[...Array(Math.max(0, 5 - gameState.communityCards.length))].map((_, i) => (
             <img key={`back-${i}`} src={CARD_BACK_IMAGE} alt="뒷면" style={{opacity: 0.5}} />
          ))}
        </div>
      </div>

      <div className="players-container">
        {gameState.players.map((p, i) => {
          const shouldReveal = p.id === playerType 
                            || (gameState.isShowdown && p.status === 'active') 
                            || (gameState.revealedHand && p.name === gameState.lastWinner);

          return (
            <div key={i} className={`player-seat ${gameState.turnIdx === i ? 'active-turn' : ''} ${p.status}`}>
              <div>{p.name} {gameState.dealerIdx === i && <span className="dealer-button">D</span>}</div>
              <div style={{color: '#2ecc71', fontWeight:'bold'}}>${p.money}</div>
              <div style={{fontSize: '0.8rem'}}>Bet: ${p.currentBet}</div>
              <div className="player-cards">
                {p.hand.length > 0 ? (
                  shouldReveal
                    ? (p.id === playerType || gameState.isShowdown ? p.hand : gameState.revealedHand).map((c, j) => <img key={j} src={c.image} alt="카드" />)
                    : <><img src={CARD_BACK_IMAGE} alt="뒷면"/><img src={CARD_BACK_IMAGE} alt="뒷면"/></>
                ) : <span style={{fontSize:'0.8rem', color:'#95a5a6'}}>카드 없음</span>}
              </div>
              {p.status === 'folded' && <div style={{color:'red', fontSize:'0.8rem'}}>Fold</div>}
              {p.status === 'out' && <div style={{color:'black', fontSize:'0.9rem', fontWeight:'bold'}}>파산 ☠️</div>}
            </div>
          );
        })}
      </div>

      {/* 올 폴드 승리: Muck or Show 선택 창 */}
      {gameState.phase === 'muckOrShow' && (
        <div style={{position:'absolute', top:'40%', background:'rgba(0,0,0,0.9)', padding:'30px', borderRadius:'15px', zIndex: 100, textAlign:'center'}}>
          {me.name === gameState.lastWinner ? (
            <>
              <h2 style={{color:'#f1c40f', margin:'0 0 15px 0'}}>🎉 다른 유저들이 모두 도망갔습니다!</h2>
              <p style={{marginBottom:'20px', fontSize:'1.1rem'}}>상대방에게 승리의 패를 공개하시겠습니까?</p>
              <div style={{display:'flex', gap:'15px', justifyContent:'center'}}>
                <button className="holdem-btn btn-raise" onClick={() => handleMuckOrShow(true)}>당당하게 공개 (Show)</button>
                <button className="holdem-btn btn-fold" onClick={() => handleMuckOrShow(false)}>조용히 숨기기 (Muck)</button>
              </div>
            </>
          ) : (
            <h2 style={{color:'#3498db'}}>승자({gameState.lastWinner})가 패 공개 여부를 고민 중입니다...</h2>
          )}
        </div>
      )}

      {/* 상태 결과 모달 창 */}
      {(gameState.phase === 'waiting' || gameState.phase === 'showdown' || gameState.phase === 'gameOver') && (
        <div style={{marginTop: '30px', textAlign: 'center', background:'rgba(0,0,0,0.8)', padding:'20px', borderRadius:'10px'}}>
          
          {gameState.resultLog && gameState.resultLog.length > 0 && (
            <div style={{marginBottom:'20px', background:'rgba(255,255,255,0.1)', padding:'10px', borderRadius:'8px'}}>
              <h4 style={{margin:'0 0 10px 0', color:'#ecf0f1'}}>📜 이전 판 결과</h4>
              {gameState.resultLog.map((log, idx) => <div key={idx} style={{color:'#f1c40f'}}>{log}</div>)}
            </div>
          )}

          {gameState.phase === 'waiting' && gameState.players.length > 1 && gameState.players[0].id === playerType && (
            <button className="holdem-btn btn-call" onClick={startHand}>다음 판 시작하기 (Next Hand)</button>
          )}
          {gameState.phase === 'showdown' && (
            <div>
              <h3 style={{marginBottom:'15px'}}>승자 확인 시간! 👀</h3>
              {playerType === 'p1' && <button className="holdem-btn btn-raise" onClick={handleShowdown}>승패 판정 및 돈 분배</button>}
            </div>
          )}
          {gameState.phase === 'gameOver' && (
            <div>
              <h2 style={{color: '#f1c40f'}}>게임 종료!</h2>
              <h3>최종 우승자: {gameState.lastWinner} 🎉</h3>
              <button className="holdem-btn btn-fold" onClick={goBack}>메인으로</button>
            </div>
          )}
        </div>
      )}

      {/* 내 턴 액션 패널 */}
      {isMyTurn && (
        <div className="action-panel" style={{alignItems: 'center'}}>
          <button className="holdem-btn btn-fold" onClick={() => handleAction('fold')}>Fold (포기)</button>
          
          <button className="holdem-btn btn-call" onClick={() => handleAction('call')}>
            {gameState.currentBet - me.currentBet === 0 
              ? 'Check (넘기기)' 
              : `Call ($${gameState.currentBet - me.currentBet})`}
          </button>
          
          <div style={{display:'flex', alignItems:'center', background:'#34495e', padding:'5px', borderRadius:'8px', marginLeft:'10px'}}>
            <span style={{margin:'0 10px'}}>+$</span>
            {/* 💡 최소 레이즈 금액 50, 증감 폭도 50으로 수정 */}
            <input 
              type="number" 
              value={raiseAmount} 
              onChange={e => setRaiseAmount(Number(e.target.value))}
              min={50} max={me.money} step={50} 
              style={{width:'80px', padding:'8px', fontSize:'1rem', borderRadius:'5px', border:'none', textAlign:'center'}}
            />
            {/* 💡 조건검사 역시 최소 50으로 변경 */}
            <button className={`holdem-btn ${me.money >= raiseAmount && raiseAmount >= 50 ? 'btn-raise' : 'btn-disabled'}`} 
              style={{marginLeft:'10px'}}
              onClick={() => handleAction('raise')} 
              disabled={me.money < raiseAmount || raiseAmount < 50}>
              Raise
            </button>
          </div>
        </div>
      )}

      {/* 족보 보기 모달 */}
      {showRules && (
        <div className="card-rule-overlay" onClick={() => setShowRules(false)}>
          <div className="card-rule-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop: 0, color: '#2c3e50'}}>🃏 텍사스 홀덤 족보</h2>
            <ul style={{textAlign: 'left', lineHeight: '1.8', fontSize: '1rem', color: '#333'}}>
              <li><strong style={{color:'#e74c3c'}}>로얄 스트레이트 플러쉬:</strong> 무늬가 같은 10, J, Q, K, A</li>
              <li><strong style={{color:'#e67e22'}}>스트레이트 플러쉬:</strong> 무늬가 같은 연속된 5장</li>
              <li><strong style={{color:'#f1c40f'}}>포카드:</strong> 같은 숫자 4장</li>
              <li><strong>풀하우스:</strong> 같은 숫자 3장 + 2장</li>
              <li><strong>플러쉬:</strong> 무늬가 같은 카드 5장</li>
              <li><strong>스트레이트:</strong> 숫자가 연속된 카드 5장</li>
              <li><strong>트리플:</strong> 같은 숫자 3장</li>
              <li><strong>투페어:</strong> 같은 숫자가 두 쌍</li>
              <li><strong>원페어:</strong> 같은 숫자가 한 쌍</li>
              <li><strong>하이카드:</strong> 아무 족보도 없을 때 가장 높은 숫자</li>
            </ul>
            <button className="holdem-btn btn-fold" style={{width:'100%', marginTop: '10px'}} onClick={() => setShowRules(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}