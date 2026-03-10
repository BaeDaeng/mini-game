// src/daifugo/components/TaxExchange.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const getSuitIcon = (suit) => ({ Spade: '♠️', Heart: '♥️', Diamond: '♦️', Club: '♣️', Joker: '🃏' }[suit] || '');
const getCardColor = (suit) => ['Heart', 'Diamond'].includes(suit) ? '#e74c3c' : '#2c3e50';

export default function TaxExchange({ roomId, roomData, myId }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const me = roomData.players.find(p => p.id === myId);
  const taxCount = me.rank === '대부호' ? 2 : (me.rank === '부호' ? 1 : 0);

  if (taxCount === 0 || me.taxPaid) {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <h2>세금 교환 대기 중...</h2>
          <p>대부호와 부호가 카드를 고르고 있습니다.</p>
        </div>
      </div>
    );
  }

  const toggleCardSelection = (card) => {
    setSelectedCards(prev => {
      if (prev.find(c => c.id === card.id)) return prev.filter(c => c.id !== card.id);
      if (prev.length >= taxCount) return prev;
      return [...prev, card];
    });
  };

  const submitTax = async () => {
    if (selectedCards.length !== taxCount) return;
    const targetRank = me.rank === '대부호' ? '대빈민' : '빈민';
    const targetPlayerIdx = roomData.players.findIndex(p => p.rank === targetRank);
    const myIdx = roomData.players.findIndex(p => p.id === myId);

    const updatedPlayers = [...roomData.players];
    updatedPlayers[myIdx].hand = me.hand.filter(card => !selectedCards.find(sc => sc.id === card.id));
    updatedPlayers[myIdx].taxPaid = true; 

    if (targetPlayerIdx !== -1) {
      updatedPlayers[targetPlayerIdx].hand.push(...selectedCards);
      // 💡 받는 사람에게 메시지 남기기
      updatedPlayers[targetPlayerIdx].receivedMessage = {
        from: me.name, reason: '세금 납부', cards: selectedCards
      };
    }

    await updateDoc(doc(db, 'rooms', roomId), { players: updatedPlayers });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ color: '#f39c12' }}>💰 세금 납부 ({me.rank})</h2>
        <p>빈민 계급에게 버릴 카드를 <strong>{taxCount}</strong>장 선택하세요.</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
          {me.hand.map(card => (
            <button key={card.id} onClick={() => toggleCardSelection(card)}
              style={{
                padding: '10px', fontSize: '16px', fontWeight: 'bold', color: getCardColor(card.suit), background: 'white',
                border: selectedCards.find(c => c.id === card.id) ? '3px solid #3498db' : '1px solid #bdc3c7',
                transform: selectedCards.find(c => c.id === card.id) ? 'translateY(-5px)' : 'none',
              }}>
              {card.suit === 'Joker' ? '🃏 Joker' : `${getSuitIcon(card.suit)} ${card.rank}`}
            </button>
          ))}
        </div>
        <button className="main-btn single" disabled={selectedCards.length !== taxCount} onClick={submitTax}>
          {taxCount}장 교환하기
        </button>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalStyle = { backgroundColor: '#fff', color: '#333', padding: '30px', borderRadius: '15px', textAlign: 'center', maxWidth: '90%', width: '500px' };