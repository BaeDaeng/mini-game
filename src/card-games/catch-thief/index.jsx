// src/card-games/catch-thief/index.jsx
import React, { useState } from 'react';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";

// 💡 1. 실제 파일명(CatchthiefGame)과 대소문자를 완벽하게 맞췄습니다.
import CatchThiefGame from './CatchThiefGame'; 
import '../CardGamesStyle.css';

const INACTIVITY_LIMIT = 5 * 60 * 1000;

export default function CatchThiefEntry({ goBack }) {
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [playerType, setPlayerType] = useState('');
  const [inGame, setInGame] = useState(false);
  
  // 방 생성용 설정 상태
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [direction, setDirection] = useState(1); // 1: 시계, -1: 반시계

  const createRoom = async () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = doc(db, "yacht_rooms", code);

    await setDoc(roomRef, {
      gameType: "catchthief",
      status: "waiting", phase: "lobby",
      players: [{ id: 'p1', name: '유저1', isCpu: false, hand: [], rank: null }],
      turnIdx: 0, 
      maxPlayers, direction, rankings: [],
      lastActive: new Date().getTime()
    });
    
    setRoomCode(code);
    setPlayerType('p1');
    setInGame(true);
  };

  const joinRoom = async () => {
    const code = inputCode.toUpperCase();
    if (code.length !== 5) return alert("5자리 코드를 입력하세요.");
    const roomRef = doc(db, "yacht_rooms", code);
    const snap = await getDoc(roomRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data.gameType !== "catchthief") return alert("도둑잡기 방이 아닙니다.");
      if (new Date().getTime() - data.lastActive > INACTIVITY_LIMIT) {
        await deleteDoc(roomRef);
        return alert("오래되어 폭파된 방입니다.");
      }
      if (data.players.length >= data.maxPlayers) return alert("방이 꽉 찼습니다.");
      if (data.phase !== 'lobby') return alert("이미 게임이 진행 중입니다.");

      const newPid = `p${data.players.length + 1}`;
      const newName = `유저${data.players.length + 1}`;
      const newPlayers = [...data.players, { id: newPid, name: newName, isCpu: false, hand: [], rank: null }];
      
      await updateDoc(roomRef, { players: newPlayers, lastActive: new Date().getTime() });
      setRoomCode(code);
      setPlayerType(newPid);
      setInGame(true);
    } else {
      alert("방이 존재하지 않습니다.");
    }
  };

  // 💡 2. <OldMaidGame /> 으로 되어있던 부분을 <CatchThiefGame /> 으로 수정했습니다.
  if (inGame) return <CatchThiefGame roomCode={roomCode} playerType={playerType} goBack={goBack} />;

  return (
    <div className="card-menu-container">
      <button className="card-back-btn" onClick={goBack}>⬅️ 뒤로가기</button>
      <h1 style={{color: '#9b59b6', fontSize: '3rem'}}>🃏 도둑잡기</h1>
      
      <div style={{marginTop: '30px', background: 'rgba(0,0,0,0.3)', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '400px'}}>
        <h3 style={{margin: '0 0 20px 0', color: '#f1c40f'}}>새 방 만들기</h3>
        
        {/* 💡 인원수 선택 UI 크게 개선 */}
        <div style={{marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <label style={{fontSize: '1.2rem'}}>참여 인원</label>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <button onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))} style={{padding: '5px 15px', fontSize: '1.2rem'}}>-</button>
            <span style={{fontSize: '1.5rem', fontWeight: 'bold', minWidth: '40px', textAlign: 'center'}}>{maxPlayers}명</span>
            <button onClick={() => setMaxPlayers(Math.min(8, maxPlayers + 1))} style={{padding: '5px 15px', fontSize: '1.2rem'}}>+</button>
          </div>
        </div>

        <div style={{marginBottom: '25px'}}>
          <label style={{display: 'block', marginBottom: '10px'}}>진행 방향</label>
          <select 
            value={direction} 
            onChange={e => setDirection(Number(e.target.value))}
            style={{width: '100%', padding: '10px', fontSize: '1.1rem', borderRadius: '10px'}}
          >
            <option value={1}>시계 방향 (오른쪽으로)</option>
            <option value={-1}>반시계 방향 (왼쪽으로)</option>
          </select>
        </div>
        
        <button className="menu-btn" style={{background: '#8e44ad', width: '100%'}} onClick={createRoom}>방 생성하기</button>
      </div>

      <div style={{marginTop: '30px', display: 'flex', gap: '10px'}}>
        <input style={{padding: '15px', fontSize: '1.2rem', borderRadius: '10px', border: 'none', width: '150px', textAlign: 'center'}}
          value={inputCode} onChange={(e) => setInputCode(e.target.value)} placeholder="코드 5자리" maxLength={5} />
        <button className="menu-btn" style={{width: 'auto', margin: 0, background: '#2980b9'}} onClick={joinRoom}>입장</button>
      </div>
    </div>
  );
}