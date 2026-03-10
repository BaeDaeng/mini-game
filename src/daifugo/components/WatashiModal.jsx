// src/daifugo/components/WatashiModal.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../LanguageContext';
import { getNextActiveTurn } from '../utils/gameLogic';

const getSuitIcon = (suit) => ({ Spade: '♠️', Heart: '♥️', Diamond: '♦️', Club: '♣️', Joker: '🃏' }[suit] || '');
const getCardColor = (suit) => ['Heart', 'Diamond'].includes(suit) ? '#e74c3c' : '#2c3e50';

export default function WatashiModal({ roomId, roomData, myId }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const { t } = useLanguage();
  const me = roomData.players.find(p => p.id === myId);
  const isMyTurn = roomData.players[roomData.turn].id === myId;
  const cardsToPassCount = roomData.table.length;

  if (!isMyTurn) return <div style={overlayStyle}><div style={modalStyle}><h2>{t('watashiWait')}</h2><p>{t('watashiWaitDesc')}</p></div></div>;

  const toggleCardSelection = (card) => {
    setSelectedCards(prev => {
      if (prev.find(c => c.id === card.id)) return prev.filter(c => c.id !== card.id);
      if (prev.length >= cardsToPassCount) return prev;
      return [...prev, card];
    });
  };

  const submitWatashi = async () => {
    if (selectedCards.length !== cardsToPassCount) return;
    const updatedPlayers = [...roomData.players];
    updatedPlayers[roomData.turn].hand = me.hand.filter(card => !selectedCards.find(sc => sc.id === card.id));
    
    let nextTurn = getNextActiveTurn(roomData.turn, roomData.direction, 1, updatedPlayers);
    updatedPlayers[nextTurn].hand = [...updatedPlayers[nextTurn].hand, ...selectedCards];
    updatedPlayers[nextTurn].receivedMessage = { from: me.name, reason: 'watashi', cards: selectedCards };

    await updateDoc(doc(db, 'rooms', roomId), { players: updatedPlayers, pendingAction: null, turn: nextTurn });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ color: '#e74c3c' }}>{t('watashiTitle')}</h2>
        <p>{t('watashiDesc1')} <strong>{cardsToPassCount}</strong>{t('watashiDesc2')}</p>
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
        <button className="main-btn single" disabled={selectedCards.length !== cardsToPassCount} onClick={submitWatashi}>
          {cardsToPassCount}{t('watashiBtn')}
        </button>
      </div>
    </div>
  );
}
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalStyle = { backgroundColor: '#fff', color: '#333', padding: '30px', borderRadius: '15px', textAlign: 'center', maxWidth: '90%', width: '500px' };