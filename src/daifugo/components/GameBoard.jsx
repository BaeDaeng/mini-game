// src/daifugo/components/GameBoard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { isValidPlay, getNextActiveTurn, sortHand } from '../utils/gameLogic';
import { getCpuBestPlay, getCpuWeakestCards, getCpuBomberTarget } from '../utils/cpuAi';
import { distributeCards } from '../utils/deck';
import { useLanguage } from '../LanguageContext';
import WatashiModal from './WatashiModal';
import BomberModal from './BomberModal';
import SuteModal from './SuteModal';
import RuleBook from './RuleBook';
import TaxExchange from './TaxExchange';

const getSuitIcon = (suit) => ({ Spade: '♠️', Heart: '♥️', Diamond: '♦️', Club: '♣️', Joker: '🃏' }[suit] || '');
const getCardColor = (suit) => ['Heart', 'Diamond'].includes(suit) ? '#e74c3c' : '#2c3e50';

export default function GameBoard({ roomId, myId }) {
  const [roomData, setRoomData] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const { t, lang } = useLanguage();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      if (docSnap.exists()) { setRoomData(docSnap.data()); } 
      else { alert('⏳ 방 폭파됨 (5분 무응답)'); window.location.reload(); }
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (!roomData || myId !== 'p1') return;
    const explosionTimer = setTimeout(async () => {
      try { 
        await deleteDoc(doc(db, 'rooms', roomId)); 
      } catch(error) {
        console.error("방 삭제 에러:", error); // 💡 에러를 콘솔에 출력하도록 수정
      }
    }, 5 * 60 * 1000); 
    return () => clearTimeout(explosionTimer);
  }, [roomData, myId, roomId]);

  useEffect(() => {
    if (!roomData || myId !== 'p1') return;
    if (roomData.status === 'tax_exchange') {
      const updatedPlayers = [...roomData.players];
      const isTaxDone = updatedPlayers.every(p => p.rank === t('rankHinmin') || p.rank === t('rankDaihinmin') || p.taxPaid);
      if (isTaxDone) { updateDoc(doc(db, 'rooms', roomId), { status: 'playing' }); return; }

      let changed = false;
      roomData.players.forEach((p, i) => {
         if (p.isCpu && !p.taxPaid && (p.rank === t('rankDaifugo') || p.rank === t('rankFugo'))) {
             const count = p.rank === t('rankDaifugo') ? 2 : 1;
             const targetRank = p.rank === t('rankDaifugo') ? t('rankDaihinmin') : t('rankHinmin');
             const targetIdx = updatedPlayers.findIndex(op => op.rank === targetRank);
             const worstCards = getCpuWeakestCards(updatedPlayers[i].hand, count, false, false);
             updatedPlayers[i].hand = updatedPlayers[i].hand.filter(c => !worstCards.find(wc => wc.id === c.id));
             updatedPlayers[i].taxPaid = true;
             if (targetIdx !== -1) {
                 updatedPlayers[targetIdx].hand.push(...worstCards);
                 // 💡 DB에는 안전한 상수(tax) 저장
                 updatedPlayers[targetIdx].receivedMessage = { from: p.name, reason: 'tax', cards: worstCards };
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
      try { // 💡 에러 발생 시 방지
        let nextTurn = roomData.turn, newIsRevolution = roomData.isRevolution, newIs11Back = roomData.is11Back;
        let newPendingAction = roomData.pendingAction, newTable = roomData.table, newPassCount = roomData.passCount, newStatus = roomData.status;
        const updatedPlayers = [...roomData.players];

        if (newPendingAction === 'bomber') {
          const targetRank = getCpuBomberTarget(currentPlayer.hand, newIsRevolution, newIs11Back);
          const bombedPlayers = updatedPlayers.map(p => ({ 
            ...p, hand: p.hand.filter(c => c.rank !== targetRank),
            receivedMessage: { from: currentPlayer.name, reason: 'bomber', rank: targetRank }
          }));
          
          bombedPlayers.forEach((p, idx) => {
            if (p.hand.length === 0 && !p.rank) {
              const finishedCount = bombedPlayers.filter(bp => bp.rank).length;
              bombedPlayers[idx].rank = [t('rankDaifugo'), t('rankFugo'), t('rankHinmin')][finishedCount];
            }
          });
          if (bombedPlayers.filter(p => p.rank).length >= 3) {
            bombedPlayers.find(p => !p.rank).rank = t('rankDaihinmin'); newStatus = 'game_over';
          }
          await updateDoc(doc(db, 'rooms', roomId), { players: bombedPlayers, pendingAction: null, turn: getNextActiveTurn(roomData.turn, roomData.direction, 1, bombedPlayers), status: newStatus });
          return;
        }

        if (newPendingAction === 'sute' || newPendingAction === 'watashi') {
          const actionCards = getCpuWeakestCards(currentPlayer.hand, roomData.table.length, newIsRevolution, newIs11Back);
          updatedPlayers[roomData.turn].hand = currentPlayer.hand.filter(c => !actionCards.find(ac => ac.id === c.id));
          let targetTurn = getNextActiveTurn(roomData.turn, roomData.direction, 1, updatedPlayers);
          
          if (newPendingAction === 'watashi') {
            updatedPlayers[targetTurn].hand = [...updatedPlayers[targetTurn].hand, ...actionCards];
            updatedPlayers[targetTurn].receivedMessage = { from: currentPlayer.name, reason: 'watashi', cards: actionCards };
          }
          if (updatedPlayers[roomData.turn].hand.length === 0) {
            const finishedCount = updatedPlayers.filter(p => p.rank).length;
            updatedPlayers[roomData.turn].rank = [t('rankDaifugo'), t('rankFugo'), t('rankHinmin')][finishedCount];
            if (finishedCount + 1 === 3) { updatedPlayers.find(p => p.hand.length > 0).rank = t('rankDaihinmin'); newStatus = 'game_over'; }
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
          
          if (playedRank === '8') { newTable = []; newPassCount = 0; newIs11Back = false; skipCount = 0; } 
          else if (playedRank === '10') { newPendingAction = 'sute'; skipCount = 0; } 
          else if (playedRank === '7') { newPendingAction = 'watashi'; skipCount = 0; } 
          else if (playedRank === 'Q') { newPendingAction = 'bomber'; skipCount = 0; }

          const isHandEmpty = updatedPlayers[roomData.turn].hand.length === 0;

          if (isHandEmpty) {
            newPendingAction = null; 
            skipCount = 1; 
            const finishedCount = updatedPlayers.filter(p => p.rank).length;
            updatedPlayers[roomData.turn].rank = [t('rankDaifugo'), t('rankFugo'), t('rankHinmin')][finishedCount];
            if (finishedCount + 1 === 3) { updatedPlayers.find(p => p.hand.length > 0).rank = t('rankDaihinmin'); newStatus = 'game_over'; }
          }
          if (newStatus !== 'game_over' && skipCount > 0) nextTurn = getNextActiveTurn(roomData.turn, roomData.direction, skipCount, updatedPlayers);
        } else {
          newPassCount += 1;
          nextTurn = getNextActiveTurn(roomData.turn, roomData.direction, 1, updatedPlayers);
          if (newPassCount >= updatedPlayers.filter(p => p.hand.length > 0).length - 1) { newTable = []; newPassCount = 0; newIs11Back = false; }
        }
        await updateDoc(doc(db, 'rooms', roomId), { table: newTable, players: updatedPlayers, turn: nextTurn, passCount: newPassCount, isRevolution: newIsRevolution, is11Back: newIs11Back, pendingAction: newPendingAction, status: newStatus });
      } catch (err) { console.error("CPU Error:", err); }
    }, 1500);
    return () => clearTimeout(cpuTimer);
  }, [roomData, myId, roomId, t]);

  if (!roomData) return <div className="menu-container">Loading...</div>;

  const me = roomData.players.find(p => p.id === myId);
  const isMyTurn = roomData.players[roomData.turn]?.id === myId;

  const clearReceivedMessage = async () => {
    const updatedPlayers = roomData.players.map(p => p.id === myId ? { ...p, receivedMessage: null } : p);
    await updateDoc(doc(db, 'rooms', roomId), { players: updatedPlayers });
  };
  const toggleCardSelection = (card) => {
    setSelectedCards(prev => prev.find(c => c.id === card.id) ? prev.filter(c => c.id !== card.id) : [...prev, card]);
  };

  const playCards = async () => {
    if (!isValidPlay(selectedCards, roomData.table, roomData.isRevolution, roomData.is11Back)) { alert(t('invalidPlay')); return; }
    const updatedPlayers = [...roomData.players];
    updatedPlayers[roomData.turn].hand = me.hand.filter(card => !selectedCards.find(sc => sc.id === card.id));

    let nextTurn = roomData.turn, newIsRevolution = roomData.isRevolution, newIs11Back = roomData.is11Back, newPendingAction = roomData.pendingAction;
    let skipCount = 1, newStatus = roomData.status, newTable = selectedCards, newPassCount = 0;
    const playedRank = selectedCards.find(c => c.rank !== 'Joker')?.rank || 'Joker';

    if (selectedCards.length >= 4) newIsRevolution = !newIsRevolution;
    if (playedRank === 'J') newIs11Back = true;
    if (playedRank === '5') skipCount += selectedCards.length;

    if (playedRank === '8') { newTable = []; newPassCount = 0; newIs11Back = false; skipCount = 0; } 
    else if (playedRank === '10') { newPendingAction = 'sute'; skipCount = 0; } 
    else if (playedRank === '7') { newPendingAction = 'watashi'; skipCount = 0; } 
    else if (playedRank === 'Q') { newPendingAction = 'bomber'; skipCount = 0; }

    const isHandEmpty = updatedPlayers[roomData.turn].hand.length === 0;
    if (isHandEmpty) {
      newPendingAction = null;
      skipCount = 1;
      const finishedCount = updatedPlayers.filter(p => p.rank).length;
      updatedPlayers[roomData.turn].rank = [t('rankDaifugo'), t('rankFugo'), t('rankHinmin')][finishedCount];
      if (finishedCount + 1 === 3) { updatedPlayers.find(p => p.hand.length > 0).rank = t('rankDaihinmin'); newStatus = 'game_over'; }
    }
    if (newStatus !== 'game_over' && skipCount > 0) nextTurn = getNextActiveTurn(roomData.turn, roomData.direction, skipCount, updatedPlayers);

    await updateDoc(doc(db, 'rooms', roomId), { table: newTable, players: updatedPlayers, turn: nextTurn, passCount: newPassCount, isRevolution: newIsRevolution, is11Back: newIs11Back, pendingAction: newPendingAction, status: newStatus });
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
    const daihinminIdx = updatedPlayers.findIndex(p => p.rank === t('rankDaihinmin')), hinminIdx = updatedPlayers.findIndex(p => p.rank === t('rankHinmin'));
    const daifugoIdx = updatedPlayers.findIndex(p => p.rank === t('rankDaifugo')), fugoIdx = updatedPlayers.findIndex(p => p.rank === t('rankFugo'));

    if (daihinminIdx !== -1 && daifugoIdx !== -1) {
       const bestCards = sortHand(updatedPlayers[daihinminIdx].hand, false, false).slice(-2);
       updatedPlayers[daihinminIdx].hand = updatedPlayers[daihinminIdx].hand.filter(c => !bestCards.includes(c));
       updatedPlayers[daifugoIdx].hand.push(...bestCards);
       updatedPlayers[daifugoIdx].receivedMessage = { from: updatedPlayers[daihinminIdx].name, reason: 'tax_force', cards: bestCards };
    }
    if (hinminIdx !== -1 && fugoIdx !== -1) {
       const bestCards = sortHand(updatedPlayers[hinminIdx].hand, false, false).slice(-1);
       updatedPlayers[hinminIdx].hand = updatedPlayers[hinminIdx].hand.filter(c => !bestCards.includes(c));
       updatedPlayers[fugoIdx].hand.push(...bestCards);
       updatedPlayers[fugoIdx].receivedMessage = { from: updatedPlayers[hinminIdx].name, reason: 'tax_force', cards: bestCards };
    }
    await updateDoc(doc(db, 'rooms', roomId), { status: 'tax_exchange', players: updatedPlayers, turn: startingTurn, table: [], passCount: 0, isRevolution: false, is11Back: false, pendingAction: null });
  };

  const canSubmit = isMyTurn && selectedCards.length > 0 && !roomData.pendingAction && !me.receivedMessage;
  const canPass = isMyTurn && !roomData.pendingAction && !me.receivedMessage;
  const ccwIndices = [1, 2, 0, 3]; 

  // 💡 번역 처리기
  const reasonText = (reason) => {
    return { 'bomber': t('reason12'), 'watashi': t('reason7'), 'tax': t('reasonTax'), 'tax_force': t('reasonTaxForce') }[reason] || reason;
  };

  if (roomData.status === 'game_over') {
    const sortedPlayers = [...roomData.players].sort((a,b) => ({ [t('rankDaifugo')]:1, [t('rankFugo')]:2, [t('rankHinmin')]:3, [t('rankDaihinmin')]:4 }[a.rank] - { [t('rankDaifugo')]:1, [t('rankFugo')]:2, [t('rankHinmin')]:3, [t('rankDaihinmin')]:4 }[b.rank]));
    return (
      <div className="menu-container">
        <h1 style={{ fontSize: '3em', marginBottom: '10px' }}>{t('gameOverTitle')}</h1>
        <div className="box" style={{ flexDirection: 'column', padding: '20px', background: 'rgba(0,0,0,0.5)', borderRadius: '15px' }}>
          {sortedPlayers.map((p, i) => (
            <div key={p.id} style={{ fontSize: '1.5em', margin: '15px 0', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #7f8c8d', paddingBottom: '10px' }}>
              <span>{i+1}. {p.name}</span>
              <strong style={{ color: p.rank === t('rankDaifugo') ? '#f1c40f' : (p.rank === t('rankDaihinmin') ? '#e74c3c' : 'white') }}>{p.rank}</strong>
            </div>
          ))}
        </div>
        {myId === 'p1' ? (<button className="main-btn single" style={{marginTop: '20px'}} onClick={startNextGame}>{t('nextGameBtn')}</button>) : (<p style={{ marginTop: '20px' }}>{t('waitingNext')}</p>)}
      </div>
    );
  }

  return (
    <div className="game-board">
      <div className="mini-map-container">
        {ccwIndices.map(idx => {
          const p = roomData.players[idx];
          if(!p) return null;
          return (
            <div key={p.id} className={`mini-player ${roomData.turn === idx ? 'active' : ''}`}>
              {p.name} {p.hand.length}
            </div>
          );
        })}
      </div>

      <div className="header" style={{ position: 'relative' }}>
        <button className="back-btn" onClick={() => setShowRules(true)} style={{ position: 'absolute', top: 0, left: '10px' }}>{t('ruleBtn')}</button>
        <h2 className="highlight">{roomData.isRevolution ? t('stateRev') : (roomData.is11Back ? t('state11') : t('stateNormal'))}</h2>
      </div>
      {isMyTurn && <div className="my-turn-banner">{t('myTurnBanner')}</div>}

      {/* 💡 에러 방지 처리된 통합 알림 모달 */}
      {me.receivedMessage && (
        <div className="received-overlay">
          <div className="received-modal">
            {me.receivedMessage.reason === 'bomber' ? (
              <>
                <h3 style={{ color: '#e74c3c' }}>{t('bombAlertTitle')}</h3>
                <p><strong>{me.receivedMessage.from}</strong>{t('bombAlertMsg1')} <strong>{me.receivedMessage.rank}</strong> {t('bombAlertMsg2')}</p>
              </>
            ) : (
              <>
                <h3 style={{ color: '#2980b9' }}>{t('newCardTitle')}</h3>
                <p><strong>{me.receivedMessage.from}</strong>{t('from')}{reasonText(me.receivedMessage.reason)}{t('receivedMsg')}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
                  {/* ?.map을 사용하여 카드가 없어도 에러가 나지 않음 */}
                  {me.receivedMessage.cards?.map(c => (
                    <div key={c.id} style={{ padding: '10px', fontSize: '20px', fontWeight: 'bold', background: '#ecf0f1', border: '2px solid #bdc3c7', borderRadius: '5px', color: getCardColor(c.suit) }}>
                      {c.suit === 'Joker' ? '🃏 Joker' : `${getSuitIcon(c.suit)} ${c.rank}`}
                    </div>
                  ))}
                </div>
              </>
            )}
            <button className="main-btn" style={{ background: '#3498db', marginTop: '15px' }} onClick={clearReceivedMessage}>{t('confirmBtn')}</button>
          </div>
        </div>
      )}

      {showRules && <RuleBook onClose={() => setShowRules(false)} />}
      {roomData.status === 'tax_exchange' && <TaxExchange roomId={roomId} roomData={roomData} myId={myId} />}

      <div className="dice-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: '15px', margin: '10px 0' }}>
        <h3 style={{ color: '#2c3e50', margin: '10px 0' }}>{t('tableCard')}</h3>
        {roomData.table.length > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {roomData.table.map((card, idx) => (
              <div key={idx} style={{ padding: '10px 20px', background: 'white', border: '2px solid #333', borderRadius: '5px', fontSize: '24px', fontWeight: 'bold', color: getCardColor(card.suit) }}>
                {card.suit === 'Joker' ? '🃏 Joker' : `${getSuitIcon(card.suit)} ${card.rank}`}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#7f8c8d' }}>{t('tableEmpty')}</p>
        )}
      </div>

      {me.hand.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ color: '#f1c40f', margin: '0 0 10px 0' }}>{t('clearedTitle')}</h2>
          <p style={{ margin: 0 }}>{t('clearedDesc')}</p>
          <p style={{ marginTop: '15px', fontSize: '1.2em' }}>{t('currentRank')} <strong style={{ color: '#e74c3c', marginLeft: '5px' }}>{me.rank}</strong></p>
        </div>
      ) : (
        <>
          <div className="score-area" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ textAlign: 'center', margin: 0 }}>
              {lang === 'ko' ? `${me?.name}의 카드` : `${me?.name}の手札`}
            </h4>
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
            <button className="main-btn single" disabled={!canSubmit} onClick={playCards}>{t('submitBtn')}</button>
            <button className="main-btn" style={{ background: '#95a5a6' }} disabled={!canPass} onClick={passTurn}>{t('passBtn')}</button>
          </div>
        </>
      )}

      {roomData.pendingAction === 'watashi' && !me.receivedMessage && <WatashiModal roomId={roomId} roomData={roomData} myId={myId} />}
      {roomData.pendingAction === 'bomber' && !me.receivedMessage && <BomberModal roomId={roomId} roomData={roomData} myId={myId} />}
      {roomData.pendingAction === 'sute' && !me.receivedMessage && <SuteModal roomId={roomId} roomData={roomData} myId={myId} />}
    </div>
  );
}