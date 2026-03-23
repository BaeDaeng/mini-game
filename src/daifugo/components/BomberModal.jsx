// src/daifugo/components/BomberModal.jsx
import React, { useState } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../LanguageContext';
import { getNextActiveTurn } from '../utils/gameLogic';

export default function BomberModal({ roomId, roomData, myId }) {
  const [selectedRanks, setSelectedRanks] = useState([]);
  const { t } = useLanguage();
  const isMyTurn = roomData.players[roomData.turn]?.id === myId;
  const targetRanksList = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
  const me = roomData.players.find(p => p.id === myId);
  const bomberCount = roomData.table.length; 

  if (!isMyTurn) return <div style={overlayStyle}><div style={modalStyle}><h2>{t('bombWait')}</h2><p>{t('bombWaitDesc')}</p></div></div>;

  const toggleRankSelection = (rank) => {
    setSelectedRanks(prev => {
      if (prev.includes(rank)) return prev.filter(r => r !== rank); 
      if (prev.length >= bomberCount) return prev; 
      return [...prev, rank]; 
    });
  };

  const submitBomber = async () => {
    if (selectedRanks.length !== bomberCount) return;

    const updatedPlayers = roomData.players.map(player => ({
      ...player, 
      hand: player.hand.filter(card => !selectedRanks.includes(card.rank)), 
      receivedMessage: { from: me.name, reason: 'bomber', rank: selectedRanks.join(', ') }
    }));
    
    let newStatus = roomData.status;
    
    // 💡 여러 명의 손패가 동시에 털릴 수 있으므로 전체 검사
    updatedPlayers.forEach((p, idx) => {
      if (p.hand.length === 0 && !p.rank) {
        const finishedCount = updatedPlayers.filter(bp => bp.rank).length;
        updatedPlayers[idx].rank = ['Daifugo', 'Fugo', 'Hinmin'][finishedCount];
      }
    });
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
        <h2 style={{ color: '#e74c3c' }}>{t('bombTitle')}</h2>
        <p>{t('bombDesc1')} <strong>{bomberCount}</strong>{t('bombDesc2')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
          {targetRanksList.map(rank => (
            <button key={rank} onClick={() => toggleRankSelection(rank)}
              style={{ 
                padding: '10px 15px', fontSize: '18px', fontWeight: 'bold', 
                backgroundColor: selectedRanks.includes(rank) ? '#e74c3c' : '#34495e', 
                color: 'white', border: selectedRanks.includes(rank) ? '2px solid #c0392b' : '2px solid transparent', 
                borderRadius: '5px', cursor: 'pointer',
                transform: selectedRanks.includes(rank) ? 'translateY(-5px)' : 'none',
                transition: '0.2s'
              }}>
              {rank}
            </button>
          ))}
        </div>
        <button className="main-btn single" disabled={selectedRanks.length !== bomberCount} onClick={submitBomber}>
          {bomberCount}{t('bombBtn')}
        </button>
      </div>
    </div>
  );
}
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalStyle = { backgroundColor: '#fff', color: '#333', padding: '30px', borderRadius: '15px', textAlign: 'center', maxWidth: '90%', width: '400px' };