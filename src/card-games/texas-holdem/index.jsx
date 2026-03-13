// src/card-games/texas-holdem/index.jsx
import React, { useState } from 'react';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import HoldemGame from './HoldemGame';
import '../CardGamesStyle.css';

const INACTIVITY_LIMIT = 5 * 60 * 1000;

export default function HoldemEntry({ goBack }) {
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [playerType, setPlayerType] = useState(''); 
  const [inGame, setInGame] = useState(false);

  const createRoom = async () => {
    // 5자리 영어+숫자 랜덤 코드 생성
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = doc(db, "yacht_rooms", code);

    await setDoc(roomRef, {
      status: "waiting", 
      phase: "lobby", // 💡 게임 시작 전 '대기실' 페이즈
      players: [{ id: 'p1', name: '유저1', money: 10000, hand: [], currentBet: 0, status: 'active' }],
      deck: [], communityCards: [], pot: 0, currentBet: 0, dealerIdx: 0, turnIdx: 0,
      lastActive: new Date().getTime()
    });
    
    setRoomCode(code);
    setPlayerType('p1'); // 방장은 p1
    setInGame(true);
  };

  const joinRoom = async () => {
    const code = inputCode.toUpperCase();
    if (code.length !== 5) return alert("5자리 코드를 입력하세요.");
    const roomRef = doc(db, "yacht_rooms", code);
    const snap = await getDoc(roomRef);

    if (snap.exists()) {
      const data = snap.data();
      if (new Date().getTime() - data.lastActive > INACTIVITY_LIMIT) {
        await deleteDoc(roomRef);
        return alert("오래되어 삭제된 방입니다.");
      }
      if (data.players.length >= 6) return alert("방이 꽉 찼습니다 (최대 6명).");
      
      // 💡 방이 대기실(lobby) 상태일 때만 입장 가능
      if (data.phase !== 'lobby') return alert("이미 게임이 진행 중인 방입니다.");

      const newPid = `p${data.players.length + 1}`;
      const newName = `유저${data.players.length + 1}`;
      
      const newPlayers = [...data.players, { id: newPid, name: newName, money: 10000, hand: [], currentBet: 0, status: 'active' }];
      
      await updateDoc(roomRef, { players: newPlayers, lastActive: new Date().getTime() });
      setRoomCode(code);
      setPlayerType(newPid);
      setInGame(true);
    } else {
      alert("방이 존재하지 않습니다.");
    }
  };

  if (inGame) return <HoldemGame roomCode={roomCode} playerType={playerType} goBack={goBack} />;

  return (
    <div className="card-menu-container">
      <button className="card-back-btn" onClick={goBack}>⬅️ 뒤로가기</button>
      <h1 style={{color: '#27ae60', fontSize: '3rem'}}>TEXAS HOLD'EM</h1>
      <p>최대 6인까지 즐길 수 있는 텍사스 홀덤입니다.</p>

      <div style={{marginTop: '30px'}}>
        <button className="menu-btn" style={{background: '#c0392b'}} onClick={createRoom}>새로운 방 만들기</button>
      </div>

      <div style={{marginTop: '30px', display: 'flex', gap: '10px'}}>
        <input 
          style={{padding: '10px', fontSize: '1.2rem', borderRadius: '8px', border: 'none', width: '150px', textAlign: 'center'}}
          value={inputCode} onChange={(e) => setInputCode(e.target.value)} placeholder="코드 5자리" maxLength={5} 
        />
        <button className="menu-btn" style={{width: 'auto', margin: 0, background: '#2980b9'}} onClick={joinRoom}>입장하기</button>
      </div>
    </div>
  );
}