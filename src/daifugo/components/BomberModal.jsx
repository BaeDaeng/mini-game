// src/daifugo/components/BomberModal.jsx
import React from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function BomberModal({ roomId, roomData, myId }) {
  const isMyTurn = roomData.players[roomData.turn].id === myId;
  const targetRanks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

  if (!isMyTurn) {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <h2>12 봄버 대기 중...</h2>
          <p>현재 턴인 플레이어가 파괴할 숫자를 고르고 있습니다.</p>
        </div>
      </div>
    );
  }

  const submitBomber = async (targetRank) => {
    const updatedPlayers = roomData.players.map(player => {
      // 지정된 숫자가 아닌 카드만 손패에 남김 (지정된 숫자는 파괴됨)
      const newHand = player.hand.filter(card => card.rank !== targetRank);
      return { ...player, hand: newHand };
    });

    let nextTurn = (roomData.turn + roomData.direction) % 4;
    if (nextTurn < 0) nextTurn += 4;

    await updateDoc(doc(db, 'rooms', roomId), {
      players: updatedPlayers,
      pendingAction: null,
      turn: nextTurn
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ color: '#e74c3c' }}>💣 12 봄버 (Q)</h2>
        <p>게임에서 완전히 파괴할 숫자를 하나 선택하세요!</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
          {targetRanks.map(rank => (
            <button 
              key={rank}
              onClick={() => submitBomber(rank)}
              style={{
                padding: '10px 15px', fontSize: '18px', fontWeight: 'bold',
                backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {rank}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
  display: 'flex', justifyContent: 'center', alignItems: 'center'
};
const modalStyle = {
  backgroundColor: '#fff', color: '#333', padding: '30px', 
  borderRadius: '15px', textAlign: 'center', maxWidth: '90%', width: '400px'
};