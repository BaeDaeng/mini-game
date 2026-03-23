// src/daifugo/components/Lobby.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { distributeCards } from '../utils/deck';
import { useLanguage } from '../LanguageContext';
import FullRuleBook from './FullRuleBook'; // 💡 룰북 컴포넌트 임포트

export default function Lobby({ onGameStart }) {
  const [step, setStep] = useState('menu');
  const [joinCode, setJoinCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [myId, setMyId] = useState('');
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [showFullRules, setShowFullRules] = useState(false); // 💡 모달 상태 관리
  
  const { t } = useLanguage(); 

  const createRoom = async () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const hostPlayer = { id: 'p1', name: '유저1', isCpu: false, hand: [], rank: '' };
    
    await setDoc(doc(db, 'rooms', code), {
      status: 'lobby', turn: 0, direction: -1, table: [],
      players: [hostPlayer], passCount: 0, isRevolution: false,
      is11Back: false, pendingAction: null
    });
    setRoomId(code); setMyId('p1'); setIsHost(true); setStep('waiting');
  };

  const joinRoom = async () => {
    if (!joinCode) return;
    const code = joinCode.toUpperCase();
    const roomSnap = await getDoc(doc(db, 'rooms', code));

    if (roomSnap.exists()) {
      const data = roomSnap.data();
      if (data.status === 'lobby' && data.players.length < 4) {
        const newPlayerId = `p${data.players.length + 1}`;
        const newPlayer = { id: newPlayerId, name: `유저${data.players.length + 1}`, isCpu: false, hand: [], rank: '' };
        await updateDoc(doc(db, 'rooms', code), { players: arrayUnion(newPlayer) });
        setRoomId(code); setMyId(newPlayerId); setIsHost(false); setStep('waiting');
      } else {
        alert("방이 꽉 찼거나 이미 시작되었습니다.");
      }
    } else {
      alert("존재하지 않는 코드입니다.");
    }
  };

  useEffect(() => {
    if (step !== 'waiting' || !roomId) return;
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPlayers(data.players);
        if (data.status === 'playing') onGameStart(roomId, myId);
      }
    });
    return () => unsubscribe();
  }, [step, roomId, onGameStart, myId]);

  const startGame = async () => {
    const currentPlayers = [...players];
    const missingCount = 4 - currentPlayers.length;

    for (let i = 0; i < missingCount; i++) {
      currentPlayers.push({ id: `cpu${i + 1}`, name: `CPU ${i + 1}`, isCpu: true, hand: [], rank: '' });
    }
    const { updatedPlayers, startingTurn } = distributeCards(currentPlayers);
    
    await updateDoc(doc(db, 'rooms', roomId), {
      players: updatedPlayers, turn: startingTurn, status: 'playing'
    });
  };

  if (step === 'waiting') {
    return (
      <div className="menu-container">
        <h2>{t('waitingRoom')}</h2>
        <div className="box" style={{ flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '15px' }}>
          <p style={{ fontSize: '1.2em' }}>{t('inviteCode')} <strong style={{ color: '#e74c3c', fontSize: '2em' }}>{roomId}</strong></p>
          <ul style={{ listStyle: 'none', padding: 0, width: '100%', textAlign: 'center' }}>
            {[0, 1, 2, 3].map(idx => (
              <li key={idx} style={{ margin: '10px 0', fontSize: '1.2em' }}>
                {players[idx] ? `👤 ${players[idx].name}` : t('emptySeat')}
              </li>
            ))}
          </ul>
        </div>
        {isHost ? (
          <button className="main-btn single" onClick={startGame} style={{ marginTop: '20px' }}>{t('startGame')}</button>
        ) : (
          <p style={{ marginTop: '20px' }}>{t('waitingHost')}</p>
        )}
      </div>
    );
  }

  return (
    <div className="menu-container" style={{ position: 'relative' }}>
      {/* 💡 초심자 가이드 (룰북) 버튼 (좌측 상단 고정) */}
      <button 
        className="back-btn" 
        onClick={() => setShowFullRules(true)} 
        style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 1000, background: '#e67e22' }}
      >
        {t('fullRuleBtn')}
      </button>

      <h1>{t('title')}</h1>
      <button className="main-btn single" onClick={createRoom}>{t('createRoom')}</button>
      <div className="box" style={{ flexDirection: 'column', marginTop: '20px' }}>
        <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder={t('enterCode')} maxLength={5} />
        <button className="main-btn multi" onClick={joinRoom}>{t('joinRoom')}</button>
      </div>

      {/* 💡 초심자 가이드 모달 */}
      {showFullRules && <FullRuleBook onClose={() => setShowFullRules(false)} />}
    </div>
  );
}