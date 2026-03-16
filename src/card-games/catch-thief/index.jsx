// src/card-games/catch-thief/index.jsx
import React, { useState } from 'react';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";

import CatchThiefGame from './CatchThiefGame'; 
import CatchThiefSpy from './CatchThiefSpy'; // 💡 스파이 모드 컴포넌트 추가
import '../CardGamesStyle.css';

const INACTIVITY_LIMIT = 5 * 60 * 1000;

export default function CatchThiefEntry({ goBack }) {
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [playerType, setPlayerType] = useState('');
  const [inGame, setInGame] = useState(false);
  
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [direction, setDirection] = useState(1);
  const [isSpyMode, setIsSpyMode] = useState(false); // 💡 스파이 모드 상태 추가
  const [joinedSpyMode, setJoinedSpyMode] = useState(false); // 입장한 방의 모드 저장

  const createRoom = async () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = doc(db, "yacht_rooms", code);

    await setDoc(roomRef, {
      gameType: "catchthief",
      status: "waiting", phase: "lobby",
      players: [{ id: 'p1', name: '유저1', isCpu: false, hand: [], rank: null }],
      turnIdx: 0, 
      maxPlayers, direction, rankings: [],
      isSpyMode, // 💡 DB에 스파이 모드 여부 저장
      lastActive: new Date().getTime()
    });
    
    setRoomCode(code);
    setPlayerType('p1');
    setJoinedSpyMode(isSpyMode);
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
      setJoinedSpyMode(data.isSpyMode || false); // 💡 입장 시 방의 모드를 불러옴
      setInGame(true);
    } else {
      alert("방이 존재하지 않습니다.");
    }
  };

  // 💡 모드에 따라 다른 컴포넌트 렌더링
  if (inGame) {
    if (joinedSpyMode) {
      return <CatchThiefSpy roomCode={roomCode} playerType={playerType} goBack={goBack} />;
    } else {
      return <CatchThiefGame roomCode={roomCode} playerType={playerType} goBack={goBack} />;
    }
  }

  return (
    <div className="card-menu-container">
      <button className="card-back-btn" onClick={goBack}>⬅️ 뒤로가기</button>
      <h1 style={{color: '#9b59b6', fontSize: '3rem'}}>🃏 도둑잡기</h1>
      
      <div style={{marginTop: '30px', background: 'rgba(0,0,0,0.3)', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '400px'}}>
        <h3 style={{margin: '0 0 20px 0', color: '#f1c40f'}}>새 방 만들기</h3>
        
        <div style={{marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <label style={{fontSize: '1.2rem'}}>참여 인원</label>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <button onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))} style={{padding: '5px 15px', fontSize: '1.2rem'}}>-</button>
            <span style={{fontSize: '1.5rem', fontWeight: 'bold', minWidth: '40px', textAlign: 'center'}}>{maxPlayers}명</span>
            <button onClick={() => setMaxPlayers(Math.min(8, maxPlayers + 1))} style={{padding: '5px 15px', fontSize: '1.2rem'}}>+</button>
          </div>
        </div>

        <div style={{marginBottom: '20px'}}>
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

        {/* 💡 스파이 모드 체크박스 추가 */}
        <div style={{marginBottom: '25px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px'}}>
          <label style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem'}}>
            <input 
              type="checkbox" 
              checked={isSpyMode} 
              onChange={e => setIsSpyMode(e.target.checked)} 
              style={{width: '20px', height: '20px', accentColor: '#e74c3c'}} 
            />
            🕵️ 스파이 모드 켜기
          </label>
          <p style={{fontSize: '0.9rem', color: '#bdc3c7', margin: '5px 0 0 30px'}}>
            조커가 제거되고, 아무도 모르는 무작위 일반 카드 1장이 스파이 역할을 합니다!
          </p>
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