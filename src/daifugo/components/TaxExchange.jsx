// src/daifugo/components/TaxExchange.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../LanguageContext';

const getSuitIcon = (suit) => ({ Spade: '♠️', Heart: '♥️', Diamond: '♦️', Club: '♣️', Joker: '🃏' }[suit] || '');
const getCardColor = (suit) => ['Heart', 'Diamond'].includes(suit) ? '#e74c3c' : '#2c3e50';

export default function TaxExchange({ roomId, roomData, myId }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const { t } = useLanguage();
  const me = roomData.players.find(p => p.id === myId);
  const taxCount = me.rank === t('rankDaifugo') ? 2 : (me.rank === t('rankFugo') ? 1 : 0);

  if (taxCount === 0 || me.taxPaid) {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <h2>{t('taxWait')}</h2>
          <p>{t('taxWaitDesc')}</p>
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
    const targetRank = me.rank === t('rankDaifugo') ? t('rankDaihinmin') : t('rankHinmin');
    const targetPlayerIdx = roomData.players.findIndex(p => p.rank === targetRank);
    const myIdx = roomData.players.findIndex(p => p.id === myId);

    const updatedPlayers = [...roomData.players];
    updatedPlayers[myIdx].hand = me.hand.filter(card => !selectedCards.find(sc => sc.id === card.id));
    updatedPlayers[myIdx].taxPaid = true; 

    if (targetPlayerIdx !== -1) {
      updatedPlayers[targetPlayerIdx].hand.push(...selectedCards);
      updatedPlayers[targetPlayerIdx].receivedMessage = { from: me.name, reason: t('reasonTax'), cards: selectedCards };
    }
    await updateDoc(doc(db, 'rooms', roomId), { players: updatedPlayers });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ color: '#f39c12' }}>{t('taxTitle')} ({me.rank})</h2>
        <p>{t('taxDesc')} <strong>{taxCount}</strong>{t('watashiDesc2')}</p>
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
          {taxCount}{t('taxBtn')}
        </button>
      </div>
    </div>
  );
}
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalStyle = { backgroundColor: '#fff', color: '#333', padding: '30px', borderRadius: '15px', textAlign: 'center', maxWidth: '90%', width: '500px' };