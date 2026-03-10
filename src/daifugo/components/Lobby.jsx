import { distributeCards } from '../utils/deck';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // 🔥 firebase.js 파일이 필요합니다.
import { doc, setDoc, getDoc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';

export default function Lobby({ onGameStart }) {
  const [step, setStep] = useState('menu'); // 'menu' | 'waiting'
  const [joinCode, setJoinCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [myId, setMyId] = useState('');
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  // 1️⃣ 방 만들기 (유저 1)
  const createRoom = async () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const hostPlayer = { id: 'p1', name: '유저1', isCpu: false, hand: [], rank: '' };
    
    await setDoc(doc(db, 'rooms', code), {
      status: 'lobby',
      turn: 0,
      direction: -1,
      table: [],
      players: [hostPlayer],
      passCount: 0,
      isRevolution: false,
      is11Back: false,
      pendingAction: null
    });

    setRoomId(code);
    setMyId('p1');
    setIsHost(true);
    setStep('waiting');
  };

  // 2️⃣ 코드로 입장하기 (유저 2, 3, 4)
  const joinRoom = async () => {
    if (!joinCode) return;
    const code = joinCode.toUpperCase();
    const roomRef = doc(db, 'rooms', code);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      const data = roomSnap.data();
      if (data.status === 'lobby' && data.players.length < 4) {
        const newPlayerId = `p${data.players.length + 1}`;
        const newPlayer = { id: newPlayerId, name: `유저${data.players.length + 1}`, isCpu: false, hand: [], rank: '' };
        
        await updateDoc(roomRef, {
          players: arrayUnion(newPlayer)
        });

        setRoomId(code);
        setMyId(newPlayerId);
        setIsHost(false);
        setStep('waiting');
      } else {
        alert("방이 꽉 찼거나 이미 게임이 시작되었습니다.");
      }
    } else {
      alert("존재하지 않는 코드입니다.");
    }
  };

  // 3️⃣ 대기실 실시간 리스너 및 게임 시작 감지
  useEffect(() => {
    if (step !== 'waiting' || !roomId) return;

    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPlayers(data.players);

        // 방장이 게임을 시작해서 status가 playing이 되면 GameBoard로 넘어갑니다.
        if (data.status === 'playing') {
          onGameStart(roomId, myId);
        }
      }
    });

    return () => unsubscribe();
  }, [step, roomId, onGameStart, myId]);

  // 4️⃣ 게임 시작하기 (방장 전용) - 빈자리에 CPU 채우기
  const startGame = async () => {
  const currentPlayers = [...players];
  const missingCount = 4 - currentPlayers.length;

  for (let i = 0; i < missingCount; i++) {
    currentPlayers.push({
      id: `cpu${i + 1}`, name: `CPU ${i + 1}`, isCpu: true, hand: [], rank: ''
    });
  }

  // 💡 추가된 부분: 카드를 섞고 분배, 스페이드 3을 가진 사람의 턴을 받아옴
  const { updatedPlayers, startingTurn } = distributeCards(currentPlayers);
  
  await updateDoc(doc(db, 'rooms', roomId), {
    players: updatedPlayers,
    turn: startingTurn, // 스페이드 3 주인이 먼저 시작
    status: 'playing'
  });
};

  if (step === 'waiting') {
    return (
      <div className="menu-container">
        <h2>대기실</h2>
        <div className="box" style={{ flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '15px' }}>
          <p style={{ fontSize: '1.2em' }}>초대 코드: <strong style={{ color: '#e74c3c', fontSize: '2em' }}>{roomId}</strong></p>
          <ul style={{ listStyle: 'none', padding: 0, width: '100%', textAlign: 'center' }}>
            {[0, 1, 2, 3].map(idx => (
              <li key={idx} style={{ margin: '10px 0', fontSize: '1.2em' }}>
                {players[idx] ? `👤 ${players[idx].name}` : '🪑 빈자리 (시작 시 CPU로 대체)'}
              </li>
            ))}
          </ul>
        </div>
        {isHost ? (
          <button className="main-btn single" onClick={startGame} style={{ marginTop: '20px' }}>게임 시작하기</button>
        ) : (
          <p style={{ marginTop: '20px' }}>방장이 시작하기를 기다리고 있습니다...</p>
        )}
      </div>
    );
  }

  return (
    <div className="menu-container">
      <h1>대부호 (Daifugo)</h1>
      <button className="main-btn single" onClick={createRoom}>새 방 만들기 (방장)</button>
      
      <div className="box" style={{ flexDirection: 'column', marginTop: '20px' }}>
        <input 
          value={joinCode} 
          onChange={(e) => setJoinCode(e.target.value)} 
          placeholder="5자리 코드 입력" 
          maxLength={5}
        />
        <button className="main-btn multi" onClick={joinRoom}>코드로 입장하기</button>
      </div>
    </div>
  );
}