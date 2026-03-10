// src/daifugo/components/BomberModal.jsx
import React from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../LanguageContext';
import { getNextActiveTurn } from '../utils/gameLogic';

export default function BomberModal({ roomId, roomData, myId }) {
  const { t } = useLanguage();
  const isMyTurn = roomData.players[roomData.turn].id === myId;
  const targetRanks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
  const me = roomData.players.find(p => p.id === myId);

  if (!isMyTurn) {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <h2>{t('bombWait')}</h2><p>{t('bombWaitDesc')}</p>
        </div>
      </div>
    );
  }

  const submitBomber = async (targetRank) => {
    const updatedPlayers = roomData.players.map(player => ({
      ...player, hand: player.hand.filter(card => card.rank !== targetRank), receivedMessage: { from: me.name, reason: t('reason12'), rank: targetRank }
    }));
    
    // 💡 고스트 방지: 터진 카드가 마지막 카드였을 때 계급 부여
    let newStatus = roomData.status;
    updatedPlayers.forEach((p, idx) => {
      if (p.hand.length === 0 && !p.rank) {
        const finishedCount = updatedPlayers.filter(bp => bp.rank).length;
        updatedPlayers[idx].rank = [t('rankDaifugo'), t('rankFugo'), t('rankHinmin')][finishedCount];
      }
    });
    if (updatedPlayers.filter(p => p.rank).length >= 3) {
      updatedPlayers.find(p => !p.rank).rank = t('rankDaihinmin'); newStatus = 'game_over';
    }

    let nextTurn = getNextActiveTurn(roomData.turn, roomData.direction, 1, updatedPlayers);
    await updateDoc(doc(db, 'rooms', roomId), { players: updatedPlayers, pendingAction: null, turn: nextTurn, status: newStatus });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ color: '#e74c3c' }}>{t('bombTitle')}</h2><p>{t('bombDesc')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
          {targetRanks.map(rank => (
            <button key={rank} onClick={() => submitBomber(rank)}
              style={{ padding: '10px 15px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {rank}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalStyle = { backgroundColor: '#fff', color: '#333', padding: '30px', borderRadius: '15px', textAlign: 'center', maxWidth: '90%', width: '400px' };