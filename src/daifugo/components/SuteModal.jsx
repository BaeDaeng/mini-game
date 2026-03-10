// src/daifugo/components/SuteModal.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../LanguageContext';

const getSuitIcon = (suit) => ({ Spade: '♠️', Heart: '♥️', Diamond: '♦️', Club: '♣️', Joker: '🃏' }[suit] || '');
const getCardColor = (suit) => ['Heart', 'Diamond'].includes(suit) ? '#e74c3c' : '#2c3e50';

export default function SuteModal({ roomId, roomData, myId }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const { t } = useLanguage();
  const me = roomData.players.find(p => p.id === myId);
  const isMyTurn = roomData.players[roomData.turn].id === myId;
  const discardCount = roomData.table.length;

  if (!isMyTurn) {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <h2>{t('suteWait')}</h2>
          <p>{t('suteWaitDesc')}</p>
        </div>
      </div>
    );
  }

  const toggleCardSelection = (card) => {
    setSelectedCards(prev => {
      if (prev.find(c => c.id === card.id)) return prev.filter(c => c.id !== card.id);
      if (prev.length >= discardCount) return prev;
      return [...prev, card];
    });
  };

  const submitSute = async () => {
    if (selectedCards.length !== discardCount) return;
    const myNewHand = me.hand.filter(card => !selectedCards.find(sc => sc.id === card.id));
    let nextTurn = (roomData.turn + roomData.direction) % 4;
    if (nextTurn < 0) nextTurn += 4;
    const updatedPlayers = [...roomData.players];
    updatedPlayers[roomData.turn].hand = myNewHand;
    
    let newStatus = roomData.status;
    if (myNewHand.length === 0) {
      const finishedCount = updatedPlayers.filter(p => p.rank).length;
      updatedPlayers[roomData.turn].rank = [t('rankDaifugo'), t('rankFugo'), t('rankHinmin')][finishedCount];
      if (finishedCount + 1 === 3) {
        updatedPlayers.find(p => p.hand.length > 0).rank = t('rankDaihinmin');
        newStatus = 'game_over';
      }
    }
    await updateDoc(doc(db, 'rooms', roomId), { players: updatedPlayers, pendingAction: null, turn: nextTurn, status: newStatus });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ color: '#8e44ad' }}>{t('suteTitle')}</h2>
        <p>{t('suteDesc')} <strong>{discardCount}</strong>{t('watashiDesc2')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
          {me.hand.map(card => (
            <button key={card.id} onClick={() => toggleCardSelection(card)}
              style={{
                padding: '10px', fontSize: '18px', fontWeight: 'bold', color: getCardColor(card.suit), background: 'white',
                border: selectedCards.find(c => c.id === card.id) ? '3px solid #3498db' : '1px solid #bdc3c7',
                transform: selectedCards.find(c => c.id === card.id) ? 'translateY(-5px)' : 'none',
              }}>
              {card.suit === 'Joker' ? '🃏 Joker' : `${getSuitIcon(card.suit)} ${card.rank}`}
            </button>
          ))}
        </div>
        <button className="main-btn single" disabled={selectedCards.length !== discardCount} onClick={submitSute}>
          {discardCount}{t('suteBtn')}
        </button>
      </div>
    </div>
  );
}
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalStyle = { backgroundColor: '#fff', color: '#333', padding: '30px', borderRadius: '15px', textAlign: 'center', maxWidth: '90%', width: '500px' };