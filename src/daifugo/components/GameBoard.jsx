// src/daifugo/components/GameBoard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { isValidPlay, getNextActiveTurn, sortHand } from '../utils/gameLogic';
import { getCpuBestPlay, getCpuWeakestCards, getCpuBomberTarget } from '../utils/cpuAi';
import { distributeCards } from '../utils/deck';
import WatashiModal from './WatashiModal';
import BomberModal from './BomberModal';
import RuleBook from './RuleBook';
import TaxExchange from './TaxExchange';

// 💡 카드 모양 및 색상 도우미
const getSuitIcon = (suit) => ({ Spade: '♠️', Heart: '♥️', Diamond: '♦️', Club: '♣️', Joker: '🃏' }[suit] || '');
const getCardColor = (suit) => ['Heart', 'Diamond'].includes(suit) ? '#e74c3c' : '#2c3e50';

export default function GameBoard({ roomId, myId }) {
  const [roomData, setRoomData] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      if (docSnap.exists()) {
        setRoomData(docSnap.data());
      } else {
        // 💡 방 문서가 데이터베이스에서 삭제(폭파)되었을 때의 처리
        alert('⏳ 5분간 입력이 없어 방이 폭파되었습니다.');
        window.location.reload(); // 페이지를 새로고침하여 로비(메인)로 돌려보냄
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // 💣 1.5️⃣ 5분 무응답 방 폭파 타이머 (방장 전용)
  useEffect(() => {
    // 오직 방장(p1)의 브라우저에서만 타이머가 돌아갑니다.
    if (!roomData || myId !== 'p1') return;

    // 5분(300,000 밀리초) 뒤에 실행되는 폭파 스크립트
    const explosionTimer = setTimeout(async () => {
      try {
        await deleteDoc(doc(db, 'rooms', roomId)); // Firebase에서 방 데이터 완전 삭제
      } catch (error) {
        console.error("방 폭파 중 에러 발생:", error);
      }
    }, 5 * 60 * 1000); 

    // 💡 핵심: roomData가 변경될 때마다(누군가 카드를 내거나 턴이 넘어갈 때마다)
    // 기존 타이머를 취소하고 다시 처음부터 5분을 잽니다.
    return () => clearTimeout(explosionTimer);
  }, [roomData, myId, roomId]);

  // 🤖 CPU 자동화
  useEffect(() => {
    if (!roomData || myId !== 'p1') return;

    // 세금 교환 자동화
    if (roomData.status === 'tax_exchange') {
      const updatedPlayers = [...roomData.players];
      const isTaxDone = updatedPlayers.every(p => p.rank === '빈민' || p.rank === '대빈민' || p.taxPaid);
      if (isTaxDone) { updateDoc(doc(db, 'rooms', roomId), { status: 'playing' }); return; }

      let changed = false;
      roomData.players.forEach((p, i) => {
         if (p.isCpu && !p.taxPaid && (p.rank === '대부호' || p.rank === '부호')) {
             const count = p.rank === '대부호' ? 2 : 1;
             const targetRank = p.rank === '대부호' ? '대빈민' : '빈민';
             const targetIdx = updatedPlayers.findIndex(op => op.rank === targetRank);

             const worstCards = getCpuWeakestCards(updatedPlayers[i].hand, count, false, false);
             updatedPlayers[i].hand = updatedPlayers[i].hand.filter(c => !worstCards.find(wc => wc.id === c.id));
             updatedPlayers[i].taxPaid = true;

             if (targetIdx !== -1) {
                 updatedPlayers[targetIdx].hand.push(...worstCards);
                 // 💡 받은 사람에게 알림
                 updatedPlayers[targetIdx].receivedMessage = { from: p.name, reason: '세금 납부', cards: worstCards };
             }
             changed = true;
         }
      });
      if (changed) updateDoc(doc(db, 'rooms', roomId), { players: updatedPlayers });
      return;
    }

    if (roomData.status !== 'playing') return;
    const currentPlayer = roomData.players[roomData.turn];
    if (!currentPlayer || !currentPlayer.isCpu) return;

    const cpuTimer = setTimeout(async () => {
      let nextTurn = roomData.turn, newIsRevolution = roomData.isRevolution, newIs11Back = roomData.is11Back;
      let newPendingAction = roomData.pendingAction, newTable = roomData.table, newPassCount = roomData.passCount, newStatus = roomData.status;
      const updatedPlayers = [...roomData.players];

      if (newPendingAction === 'bomber') {
        const targetRank = getCpuBomberTarget(currentPlayer.hand, newIsRevolution, newIs11Back);
        const bombedPlayers = updatedPlayers.map(p => ({ ...p, hand: p.hand.filter(c => c.rank !== targetRank) }));
        await updateDoc(doc(db, 'rooms', roomId), { players: bombedPlayers, pendingAction: null, turn: getNextActiveTurn(roomData.turn, roomData.direction, 1, bombedPlayers) });
        return;
      }

      if (newPendingAction === 'watashi') {
        const passedCards = getCpuWeakestCards(currentPlayer.hand, roomData.table.length, newIsRevolution, newIs11Back);
        updatedPlayers[roomData.turn].hand = currentPlayer.hand.filter(c => !passedCards.find(pc => pc.id === c.id));
        let targetTurn = getNextActiveTurn(roomData.turn, roomData.direction, 1, updatedPlayers);
        updatedPlayers[targetTurn].hand = [...updatedPlayers[targetTurn].hand, ...passedCards];
        
        // 💡 받은 사람에게 알림
        updatedPlayers[targetTurn].receivedMessage = { from: currentPlayer.name, reason: '7 와타시', cards: passedCards };

        if (updatedPlayers[roomData.turn].hand.length === 0) {
          const finishedCount = updatedPlayers.filter(p => p.rank).length;
          updatedPlayers[roomData.turn].rank = ['대부호', '부호', '빈민'][finishedCount];
          if (finishedCount + 1 === 3) { updatedPlayers.find(p => p.hand.length > 0).rank = '대빈민'; newStatus = 'game_over'; }
        }
        await updateDoc(doc(db, 'rooms', roomId), { players: updatedPlayers, pendingAction: null, turn: targetTurn, status: newStatus });
        return;
      }

      const selectedCards = getCpuBestPlay(currentPlayer.hand, roomData.table, newIsRevolution, newIs11Back);
      if (selectedCards.length > 0) {
        updatedPlayers[roomData.turn].hand = currentPlayer.hand.filter(c => !selectedCards.find(sc => sc.id === c.id));
        newTable = selectedCards; newPassCount = 0;
        const playedRank = selectedCards.find(c => c.rank !== 'Joker')?.rank || 'Joker';
        let skipCount = 1;

        if (selectedCards.length >= 4) newIsRevolution = !newIsRevolution;
        if (playedRank === 'J') newIs11Back = true;
        if (playedRank === '5') skipCount += selectedCards.length;
        
        const isHandEmpty = updatedPlayers[roomData.turn].hand.length === 0;
        if (!isHandEmpty) {
          if (playedRank === '7') { newPendingAction = 'watashi'; skipCount = 0; } 
          else if (playedRank === 'Q') { newPendingAction = 'bomber'; skipCount = 0; }
        }

        if (isHandEmpty) {
          const finishedCount = updatedPlayers.filter(p => p.rank).length;
          updatedPlayers[roomData.turn].rank = ['대부호', '부호', '빈민'][finishedCount];
          if (finishedCount + 1 === 3) { updatedPlayers.find(p => p.hand.length > 0).rank = '대빈민'; newStatus = 'game_over'; }
        }

        if (newStatus !== 'game_over' && skipCount > 0) nextTurn = getNextActiveTurn(roomData.turn, roomData.direction, skipCount, updatedPlayers);
      } else {
        newPassCount += 1;
        nextTurn = getNextActiveTurn(roomData.turn, roomData.direction, 1, updatedPlayers);
        if (newPassCount >= updatedPlayers.filter(p => p.hand.length > 0).length - 1) { newTable = []; newPassCount = 0; newIs11Back = false; }
      }
      await updateDoc(doc(db, 'rooms', roomId), { table: newTable, players: updatedPlayers, turn: nextTurn, passCount: newPassCount, isRevolution: newIsRevolution, is11Back: newIs11Back, pendingAction: newPendingAction, status: newStatus });
    }, 1500);
    return () => clearTimeout(cpuTimer);
  }, [roomData, myId, roomId]);

  if (!roomData) return <div className="menu-container">로딩 중...</div>;

  const me = roomData.players.find(p => p.id === myId);
  const isMyTurn = roomData.players[roomData.turn]?.id === myId;

  // 💡 알림 끄기 로직
  const clearReceivedMessage = async () => {
    const updatedPlayers = roomData.players.map(p => p.id === myId ? { ...p, receivedMessage: null } : p);
    await updateDoc(doc(db, 'rooms', roomId), { players: updatedPlayers });
  };

  const toggleCardSelection = (card) => {
    setSelectedCards(prev => prev.find(c => c.id === card.id) ? prev.filter(c => c.id !== card.id) : [...prev, card]);
  };

  const playCards = async () => {
    if (!isValidPlay(selectedCards, roomData.table, roomData.isRevolution, roomData.is11Back)) { alert('규칙에 맞지 않아 낼 수 없는 카드입니다!'); return; }
    const updatedPlayers = [...roomData.players];
    updatedPlayers[roomData.turn].hand = me.hand.filter(card => !selectedCards.find(sc => sc.id === card.id));

    let nextTurn = roomData.turn, newIsRevolution = roomData.isRevolution, newIs11Back = roomData.is11Back, newPendingAction = roomData.pendingAction, skipCount = 1, newStatus = roomData.status;
    const playedRank = selectedCards.find(c => c.rank !== 'Joker')?.rank || 'Joker';

    if (selectedCards.length >= 4) newIsRevolution = !newIsRevolution;
    if (playedRank === 'J') newIs11Back = true;
    if (playedRank === '5') skipCount += selectedCards.length;

    const isHandEmpty = updatedPlayers[roomData.turn].hand.length === 0;
    if (!isHandEmpty) {
      if (playedRank === '7') { newPendingAction = 'watashi'; skipCount = 0; } 
      else if (playedRank === 'Q') { newPendingAction = 'bomber'; skipCount = 0; }
    }

    if (isHandEmpty) {
      const finishedCount = updatedPlayers.filter(p => p.rank).length;
      updatedPlayers[roomData.turn].rank = ['대부호', '부호', '빈민'][finishedCount];
      if (finishedCount + 1 === 3) { updatedPlayers.find(p => p.hand.length > 0).rank = '대빈민'; newStatus = 'game_over'; }
    }
    if (newStatus !== 'game_over' && skipCount > 0) nextTurn = getNextActiveTurn(roomData.turn, roomData.direction, skipCount, updatedPlayers);

    await updateDoc(doc(db, 'rooms', roomId), { table: selectedCards, players: updatedPlayers, turn: nextTurn, passCount: 0, isRevolution: newIsRevolution, is11Back: newIs11Back, pendingAction: newPendingAction, status: newStatus });
    setSelectedCards([]);
  };

  const passTurn = async () => {
    let newPassCount = roomData.passCount + 1;
    let nextTurn = getNextActiveTurn(roomData.turn, roomData.direction, 1, roomData.players);
    let newTable = roomData.table, newIs11Back = roomData.is11Back;
    if (newPassCount >= roomData.players.filter(p => p.hand.length > 0).length - 1) { newTable = []; newPassCount = 0; newIs11Back = false; }
    await updateDoc(doc(db, 'rooms', roomId), { turn: nextTurn, passCount: newPassCount, table: newTable, is11Back: newIs11Back });
    setSelectedCards([]);
  };

  const startNextGame = async () => {
    const { updatedPlayers, startingTurn } = distributeCards(roomData.players.map(p => ({ ...p, hand: [], taxPaid: false })));
    const daihinminIdx = updatedPlayers.findIndex(p => p.rank === '대빈민'), hinminIdx = updatedPlayers.findIndex(p => p.rank === '빈민');
    const daifugoIdx = updatedPlayers.findIndex(p => p.rank === '대부호'), fugoIdx = updatedPlayers.findIndex(p => p.rank === '부호');

    if (daihinminIdx !== -1 && daifugoIdx !== -1) {
       const bestCards = sortHand(updatedPlayers[daihinminIdx].hand, false, false).slice(-2);
       updatedPlayers[daihinminIdx].hand = updatedPlayers[daihinminIdx].hand.filter(c => !bestCards.includes(c));
       updatedPlayers[daifugoIdx].hand.push(...bestCards);
       // 💡 받은 사람 알림
       updatedPlayers[daifugoIdx].receivedMessage = { from: updatedPlayers[daihinminIdx].name, reason: '강제 세금 징수 (최고 패)', cards: bestCards };
    }
    if (hinminIdx !== -1 && fugoIdx !== -1) {
       const bestCards = sortHand(updatedPlayers[hinminIdx].hand, false, false).slice(-1);
       updatedPlayers[hinminIdx].hand = updatedPlayers[hinminIdx].hand.filter(c => !bestCards.includes(c));
       updatedPlayers[fugoIdx].hand.push(...bestCards);
       // 💡 받은 사람 알림
       updatedPlayers[fugoIdx].receivedMessage = { from: updatedPlayers[hinminIdx].name, reason: '강제 세금 징수 (최고 패)', cards: bestCards };
    }
    await updateDoc(doc(db, 'rooms', roomId), { status: 'tax_exchange', players: updatedPlayers, turn: startingTurn, table: [], passCount: 0, isRevolution: false, is11Back: false, pendingAction: null });
  };

  const canSubmit = isMyTurn && selectedCards.length > 0 && !roomData.pendingAction && !me.receivedMessage;
  const canPass = isMyTurn && !roomData.pendingAction && !me.receivedMessage;

  if (roomData.status === 'game_over') {
    const sortedPlayers = [...roomData.players].sort((a,b) => ({ '대부호':1, '부호':2, '빈민':3, '대빈민':4 }[a.rank] - { '대부호':1, '부호':2, '빈민':3, '대빈민':4 }[b.rank]));
    return (
      <div className="menu-container">
        <h1 style={{ fontSize: '3em', marginBottom: '10px' }}>게임 종료! 🏆</h1>
        <div className="box" style={{ flexDirection: 'column', padding: '20px', background: 'rgba(0,0,0,0.5)', borderRadius: '15px' }}>
          {sortedPlayers.map((p, i) => (
            <div key={p.id} style={{ fontSize: '1.5em', margin: '15px 0', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #7f8c8d', paddingBottom: '10px' }}>
              <span>{i+1}등. {p.name}</span>
              <strong style={{ color: p.rank === '대부호' ? '#f1c40f' : (p.rank === '대빈민' ? '#e74c3c' : 'white') }}>{p.rank}</strong>
            </div>
          ))}
        </div>
        {myId === 'p1' ? (<button className="main-btn single" style={{marginTop: '20px'}} onClick={startNextGame}>다음 판 시작하기 (자동 헌납)</button>) : (<p style={{ marginTop: '20px' }}>방장이 다음 판을 준비하고 있습니다...</p>)}
      </div>
    );
  }

  if (me.hand.length === 0 && roomData.status === 'playing') {
    return (
      <div className="menu-container">
        <h2>축하합니다! 카드를 모두 털어냈습니다! 👏</h2>
        <p>다른 사람들의 게임이 끝날 때까지 대기합니다...</p>
        <p style={{ marginTop: '20px', color: '#f1c40f' }}>현재 확정 계급: <strong>{me.rank}</strong></p>
      </div>
    );
  }

  return (
    <div className="game-board">
      {/* 💡 우측 상단 4인 미니맵 */}
      <div className="mini-map-container">
        {roomData.players.map((p, idx) => (
          <div key={p.id} className={`mini-player ${roomData.turn === idx ? 'active' : ''}`}>
            {p.name} {p.hand.length}장
          </div>
        ))}
      </div>

      <div className="header" style={{ position: 'relative' }}>
        <button className="back-btn" onClick={() => setShowRules(true)} style={{ position: 'absolute', top: 0, left: '10px' }}>📖 룰</button>
        <h2 className="highlight">{roomData.isRevolution ? '🔥 혁명 상태 🔥' : (roomData.is11Back ? '⚡ 11 백 상태 ⚡' : '일반 상태')}</h2>
      </div>

      {/* 💡 내 차례 알림 배너 */}
      {isMyTurn && <div className="my-turn-banner">내 차례입니다! 카드를 내주세요!</div>}

      {/* 💡 받은 카드 알림 모달 */}
      {me.receivedMessage && (
        <div className="received-overlay">
          <div className="received-modal">
            <h3 style={{ color: '#2980b9' }}>🎉 새로운 카드 획득!</h3>
            <p><strong>{me.receivedMessage.from}</strong>님으로부터 ({me.receivedMessage.reason}) 카드를 받았습니다.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
              {me.receivedMessage.cards.map(c => (
                <div key={c.id} style={{ padding: '10px', fontSize: '20px', fontWeight: 'bold', background: '#ecf0f1', border: '2px solid #bdc3c7', borderRadius: '5px', color: getCardColor(c.suit) }}>
                  {c.suit === 'Joker' ? '🃏 Joker' : `${getSuitIcon(c.suit)} ${c.rank}`}
                </div>
              ))}
            </div>
            <button className="main-btn" style={{ background: '#3498db' }} onClick={clearReceivedMessage}>확인했습니다</button>
          </div>
        </div>
      )}

      {showRules && <RuleBook onClose={() => setShowRules(false)} />}
      {roomData.status === 'tax_exchange' && <TaxExchange roomId={roomId} roomData={roomData} myId={myId} />}

      <div className="dice-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: '15px', margin: '10px 0' }}>
        <h3 style={{ color: '#2c3e50', margin: '10px 0' }}>바닥 카드</h3>
        {roomData.table.length > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {roomData.table.map((card, idx) => (
              <div key={idx} style={{ padding: '10px 20px', background: 'white', border: '2px solid #333', borderRadius: '5px', fontSize: '24px', fontWeight: 'bold', color: getCardColor(card.suit) }}>
                {card.suit === 'Joker' ? '🃏 Joker' : `${getSuitIcon(card.suit)} ${card.rank}`}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#7f8c8d' }}>바닥이 비어 있습니다.</p>
        )}
      </div>

      <div className="score-area" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ textAlign: 'center', margin: 0 }}>내 카드</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
          {me?.hand?.map((card, idx) => (
             <button key={idx} onClick={() => toggleCardSelection(card)} 
                style={{ 
                  padding: '10px', fontSize: '18px', fontWeight: 'bold', color: getCardColor(card.suit),
                  border: selectedCards.find(c => c.id === card.id) ? '3px solid #3498db' : '1px solid #bdc3c7',
                  transform: selectedCards.find(c => c.id === card.id) ? 'translateY(-10px)' : 'none', transition: '0.2s'
                }}>
               {card.suit === 'Joker' ? '🃏 Joker' : `${getSuitIcon(card.suit)} ${card.rank}`}
             </button>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button className="main-btn single" disabled={!canSubmit} onClick={playCards}>제출하기</button>
        <button className="main-btn" style={{ background: '#95a5a6' }} disabled={!canPass} onClick={passTurn}>패스</button>
      </div>

      {roomData.pendingAction === 'watashi' && !me.receivedMessage && <WatashiModal roomId={roomId} roomData={roomData} myId={myId} />}
      {roomData.pendingAction === 'bomber' && !me.receivedMessage && <BomberModal roomId={roomId} roomData={roomData} myId={myId} />}
    </div>
  );
}