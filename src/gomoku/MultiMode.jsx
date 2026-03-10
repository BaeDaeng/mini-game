// src/gomoku/MultiMode.jsx
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { createEmptyBoard, checkWin, checkDraw } from './utils/gomokuLogic';

export default function MultiMode({ goBack }) {
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [gameState, setGameState] = useState(null);
  const [myColor, setMyColor] = useState(null);

  // 1️⃣ 실시간 게임 데이터 구독 및 방 폭파 감지
  useEffect(() => {
    if (!roomCode) return;
    const unsubscribe = onSnapshot(doc(db, 'gomoku_rooms', roomCode), (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data());
      } else {
        alert("⏳ 5분간 입력이 없거나 방장이 나가서 방이 폭파되었습니다.");
        setRoomCode(''); setGameState(null); setMyColor(null);
      }
    });
    return () => unsubscribe();
  }, [roomCode]);

  // 💣 2️⃣ 5분 무응답 방 폭파 타이머 (방장인 흑돌 전용)
  useEffect(() => {
    // 오직 방장(흑돌)의 브라우저에서만 타이머가 돌아갑니다.
    if (!gameState || !roomCode || myColor !== 'black') return;

    // 5분(300,000 밀리초) 뒤에 실행되는 폭파 스크립트
    const explosionTimer = setTimeout(async () => {
      try { 
        await deleteDoc(doc(db, 'gomoku_rooms', roomCode)); 
      } catch (error) { 
        console.error("방 폭파 에러:", error); 
      }
    }, 5 * 60 * 1000); 

    // 💡 누군가 돌을 두어 gameState가 변할 때마다 5분 타이머 리셋
    return () => clearTimeout(explosionTimer);
  }, [gameState, myColor, roomCode]);

  const createRoom = async () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    await setDoc(doc(db, 'gomoku_rooms', code), {
      status: 'waiting', turn: 'black', board: createEmptyBoard(),
      winner: null, lastMove: null, players: { black: 'host' }
    });
    setRoomCode(code); setMyColor('black');
  };

  const joinRoom = async () => {
    if (!inputCode) return;
    const code = inputCode.toUpperCase();
    const roomRef = doc(db, 'gomoku_rooms', code);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists() && roomSnap.data().status === 'waiting') {
      await updateDoc(roomRef, {
        status: 'playing', 'players.white': 'guest'
      });
      setRoomCode(code); setMyColor('white');
    } else {
      alert("존재하지 않는 방이거나 이미 게임이 시작되었습니다.");
    }
  };

  const exitRoom = async () => {
    if (roomCode) {
      try { 
        await deleteDoc(doc(db, 'gomoku_rooms', roomCode)); 
      } catch (error) {
        console.error("방 삭제 에러:", error);
      }
    }
    goBack();
  };

  const handleCellClick = async (index) => {
    if (gameState.winner || gameState.status !== 'playing') return;
    if (gameState.turn !== myColor || gameState.board[index]) return;

    const newBoard = [...gameState.board];
    newBoard[index] = myColor;
    
    let nextTurn = myColor === 'black' ? 'white' : 'black';
    let newWinner = null;

    if (checkWin(newBoard, index, myColor)) {
      newWinner = myColor;
    } else if (checkDraw(newBoard)) {
      newWinner = 'draw';
    }

    await updateDoc(doc(db, 'gomoku_rooms', roomCode), {
      board: newBoard, turn: nextTurn, lastMove: index, winner: newWinner
    });
  };

  const resetGame = async () => {
    await updateDoc(doc(db, 'gomoku_rooms', roomCode), {
      board: createEmptyBoard(), turn: 'black', lastMove: null, winner: null
    });
  };

  // 로비 화면
  if (!roomCode) {
    return (
      <div className="menu-container">
        <h2>멀티 플레이 접속</h2>
        <div className="box">
          <button className="main-btn single" onClick={createRoom}>새로운 방 만들기</button>
        </div>
        <div className="box">
          <input 
            value={inputCode} onChange={(e) => setInputCode(e.target.value)} 
            placeholder="게임코드 5자리" maxLength={5}
          />
          <button className="main-btn multi" style={{padding: '10px'}} onClick={joinRoom}>입장</button>
        </div>
        <button className="back-btn" onClick={goBack} style={{marginTop: '20px'}}>메인으로 돌아가기</button>
      </div>
    );
  }

  // 대기실 화면
  if (gameState?.status === "waiting") {
    return (
      <div className="menu-container">
        <h2>게임 코드: <strong style={{color: '#e74c3c'}}>{roomCode}</strong></h2>
        <p className="pulse-text">다른 플레이어를 기다리는 중...</p>
        <button className="back-btn" onClick={exitRoom} style={{marginTop: '30px'}}>방 폭파하고 나가기</button>
      </div>
    );
  }

  // 본 게임 화면
  return (
    <div className="gomoku-container">
      <div className="info-panel">
        <p style={{ margin: '0 0 10px 0', fontSize: '0.8em', color: '#bdc3c7' }}>나는 <strong>{myColor === 'black' ? '⚫ 흑돌' : '⚪ 백돌'}</strong> 입니다</p>
        
        {!gameState?.winner ? (
          <div className="turn-indicator" style={{ background: gameState?.turn === 'black' ? '#2c3e50' : '#ecf0f1', color: gameState?.turn === 'black' ? 'white' : 'black' }}>
            {gameState?.turn === myColor ? '내 차례입니다!' : '상대방의 턴입니다...'}
          </div>
        ) : (
          <div style={{ color: '#f1c40f', fontSize: '1.5em' }}>
            {gameState.winner === 'draw' ? '무승부!' : `${gameState.winner === myColor ? '당신의 승리! 🎉' : '당신의 패배... 💀'}`}
          </div>
        )}
      </div>

      <div className="gomoku-board-wrapper">
        <div className="gomoku-board">
          {gameState?.board.map((cell, index) => (
            <div key={index} className="board-cell" onClick={() => handleCellClick(index)}>
              {cell && (
                <div className={`stone ${cell} ${gameState.lastMove === index ? 'last-move' : ''}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {gameState?.winner && (
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          {myColor === 'black' ? (
            <button className="main-btn single" onClick={resetGame}>다시하기 (방장)</button>
          ) : (
            <p style={{ alignSelf: 'center', color: '#bdc3c7' }}>방장이 재시작을 준비 중입니다...</p>
          )}
          <button className="main-btn" style={{ background: '#e74c3c' }} onClick={exitRoom}>방 나가기</button>
        </div>
      )}

      {!gameState?.winner && <button className="back-btn" onClick={exitRoom} style={{ marginTop: '20px' }}>나가기 (기권)</button>}
    </div>
  );
}