// src/daifugo/components/SuteModal.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../LanguageContext';
import { getNextActiveTurn } from '../utils/gameLogic';

const getSuitIcon = (suit) => ({ Spade: '♠️', Heart: '♥️', Diamond: '♦️', Club: '♣️', Joker: '🃏' }[suit] || '');
const getCardColor = (suit) => ['Heart', 'Diamond'].includes(suit) ? '#e74c3c' : '#2c3e50';

export default function SuteModal({ roomId, roomData, myId }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const { t } = useLanguage();
  const me = roomData.players.find(p => p.id === myId);
  const isMyTurn = roomData.players[roomData.turn]?.id === myId;
  
  // 💡 내가 가진 카드보다 버려야 할 카드가 많으면, 가진 것만 버립니다.
  const discardCount = Math.min(roomData.table.length, me?.hand?.length || 0);

  if (!isMyTurn) return <div style={overlayStyle}><div style={modalStyle}><h2>{t('suteWait')}</h2><p>{t('suteWaitDesc')}</p></div></div>;

  const toggleCardSelection = (card) => {
    setSelectedCards(prev => {
      if (prev.find(c => c.id === card.id)) return prev.filter(c => c.id !== card.id);
      if (prev.length >= discardCount) return prev;
      return [...prev, card];
    });
  };

  const submitSute = async () => {
    if (selectedCards.length !== discardCount) return;
    const updatedPlayers = [...roomData.players];
    updatedPlayers[roomData.turn].hand = me.hand.filter(card => !selectedCards.find(sc => sc.id === card.id));
    
    let newStatus = roomData.status;
    
    // 💡 버리고 나서 카드를 모두 털었다면 랭크 부여
    if (updatedPlayers[roomData.turn].hand.length === 0 && !updatedPlayers[roomData.turn].rank) {
      const finishedCount = updatedPlayers.filter(p => p.rank).length;
      updatedPlayers[roomData.turn].rank = ['Daifugo', 'Fugo', 'Hinmin'][finishedCount];
    }
    if (updatedPlayers.filter(p => p.rank).length >= 3) {
      const lastPlayer = updatedPlayers.find(p => !p.rank);
      if (lastPlayer) lastPlayer.rank = 'Daihinmin';
      newStatus = 'game_over';
    }

    let nextTurn = getNextActiveTurn(roomData.turn, roomData.direction, 1, updatedPlayers);
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