// src/daifugo/components/WatashiModal.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const getSuitIcon = (suit) => ({ Spade: '♠️', Heart: '♥️', Diamond: '♦️', Club: '♣️', Joker: '🃏' }[suit] || '');
const getCardColor = (suit) => ['Heart', 'Diamond'].includes(suit) ? '#e74c3c' : '#2c3e50';

export default function WatashiModal({ roomId, roomData, myId }) {
  const [selectedCards, setSelectedCards] = useState([]);

  const me = roomData.players.find(p => p.id === myId);
  const isMyTurn = roomData.players[roomData.turn].id === myId;
  const cardsToPassCount = roomData.table.length;

  if (!isMyTurn) {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <h2>7 와타시 발동!</h2>
          <p>현재 턴인 플레이어가 넘겨줄 카드를 고르고 있습니다...</p>
        </div>
      </div>
    );
  }

  const toggleCardSelection = (card) => {
    setSelectedCards(prev => {
      if (prev.find(c => c.id === card.id)) return prev.filter(c => c.id !== card.id);
      if (prev.length >= cardsToPassCount) return prev;
      return [...prev, card];
    });
  };

  const submitWatashi = async () => {
    if (selectedCards.length !== cardsToPassCount) return;

    const myNewHand = me.hand.filter(card => !selectedCards.find(sc => sc.id === card.id));
    let nextTurn = (roomData.turn + roomData.direction) % 4;
    if (nextTurn < 0) nextTurn += 4;

    const updatedPlayers = [...roomData.players];
    updatedPlayers[roomData.turn].hand = myNewHand;
    updatedPlayers[nextTurn].hand = [...updatedPlayers[nextTurn].hand, ...selectedCards];
    
    // 💡 받는 사람에게 메시지 남기기
    updatedPlayers[nextTurn].receivedMessage = {
      from: me.name, reason: '7 와타시', cards: selectedCards
    };

    await updateDoc(doc(db, 'rooms', roomId), {
      players: updatedPlayers, pendingAction: null, turn: nextTurn
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ color: '#e74c3c' }}>7 와타시 (건네기)</h2>
        <p>다음 사람에게 넘겨줄 카드를 <strong>{cardsToPassCount}</strong>장 선택하세요.</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
          {me.hand.map(card => (
            <button key={card.id} onClick={() => toggleCardSelection(card)}
              style={{
                padding: '10px', fontSize: '18px', fontWeight: 'bold',
                color: getCardColor(card.suit), background: 'white',
                border: selectedCards.find(c => c.id === card.id) ? '3px solid #3498db' : '1px solid #bdc3c7',
                transform: selectedCards.find(c => c.id === card.id) ? 'translateY(-5px)' : 'none',
              }}>
              {card.suit === 'Joker' ? '🃏 Joker' : `${getSuitIcon(card.suit)} ${card.rank}`}
            </button>
          ))}
        </div>
        <button className="main-btn single" disabled={selectedCards.length !== cardsToPassCount} onClick={submitWatashi}>
          {cardsToPassCount}장 넘겨주기
        </button>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalStyle = { backgroundColor: '#fff', color: '#333', padding: '30px', borderRadius: '15px', textAlign: 'center', maxWidth: '90%', width: '500px' };