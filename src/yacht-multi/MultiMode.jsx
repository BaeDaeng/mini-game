// src/yacht-multi/MultiMode.jsx
import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { calculateScore, getInitialScores } from './yachtRules';

const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5분 (밀리초 단위)

const CATEGORY_KEYS = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'choice', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yacht'
];

const CATEGORY_LABELS = {
  'ones': 'ones',
  'twos': 'twos',
  'threes': 'threes',
  'fours': 'fours',
  'fives': 'fives',
  'sixes': 'sixes',
  'choice': 'choice(5개 합)',
  'fourOfAKind': 'fourOfAKind(4개이상 같음)',
  'fullHouse': 'fullHouse(3개, 2개 같음)',
  'smallStraight': 'smallStraight(4개 연속:15점)',
  'largeStraight': 'largeStraight(5개 연속:30점)',
  'yacht': 'yacht(5개 같을때:50점)'
};

export default function MultiMode({ goBack }) {
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [playerType, setPlayerType] = useState(0); 
  const [gameState, setGameState] = useState(null);

  const getTotalScore = (scores) => {
    return Object.values(scores).reduce((total, score) => total + (score || 0), 0);
  };

  const createRoom = async () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = doc(db, "yacht_rooms", code);

    try {
      await setDoc(roomRef, {
        status: "waiting",
        turn: 1,
        dice: [1, 1, 1, 1, 1],
        kept: [false, false, false, false, false],
        rollCount: 3,
        scores: { p1: getInitialScores(), p2: getInitialScores() },
        lastActive: new Date().getTime()
      });
      setRoomCode(code);
      setPlayerType(1);
    } catch (error) {
      console.error("방 생성 실패:", error);
      alert("데이터베이스 연결에 실패했습니다.");
    }
  };

  const joinRoom = async () => {
    if (inputCode.trim().length !== 5) {
      alert("게임코드 5자리를 정확히 입력해주세요.");
      return;
    }

    const code = inputCode.toUpperCase();
    const roomRef = doc(db, "yacht_rooms", code);

    try {
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        const data = roomSnap.data();
        
        if (new Date().getTime() - data.lastActive > INACTIVITY_LIMIT) {
          alert("오래되어 삭제된 방입니다.");
          await deleteDoc(roomRef);
          return;
        }

        if (data.status === "waiting") {
          await updateDoc(roomRef, { 
            status: "playing",
            lastActive: new Date().getTime()
          });
          setRoomCode(code);
          setPlayerType(2);
        } else {
          alert("이미 게임이 진행 중이거나 존재하지 않는 코드입니다.");
        }
      } else {
        alert("존재하지 않는 코드입니다");
      }
    } catch (error) {
      console.error("방 접속 에러:", error);
      alert("존재하지 않는 코드입니다");
    }
  };

  // 💡 방 나가기 (데이터베이스에서 방 삭제)
  const exitRoom = async () => {
    if (roomCode) {
      await deleteDoc(doc(db, "yacht_rooms", roomCode)).catch(() => {});
    }
    goBack(); // index.jsx 메인 화면으로 돌아가기
  };

  // 💡 게임 다시 시작하기 (같은 방에서 데이터만 초기화)
  const restartGame = async () => {
    if (gameState.turn !== playerType) return; // 중복 클릭 방지 (안전장치)
    await updateDoc(doc(db, "yacht_rooms", roomCode), {
      turn: 1,
      dice: [1, 1, 1, 1, 1],
      kept: [false, false, false, false, false],
      rollCount: 3,
      scores: { p1: getInitialScores(), p2: getInitialScores() },
      lastActive: new Date().getTime()
    });
  };

  useEffect(() => {
    if (!roomCode) return;
    const roomRef = doc(db, "yacht_rooms", roomCode);
    
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data());
      } else {
        alert("방이 만료되었거나 상대방이 나갔습니다.");
        setRoomCode('');
        setGameState(null);
        goBack();
      }
    });
    return () => unsubscribe();
  }, [roomCode, goBack]);

  useEffect(() => {
    if (!gameState || !roomCode) return;

    const timeSinceLastActive = new Date().getTime() - gameState.lastActive;
    const timeLeft = INACTIVITY_LIMIT - timeSinceLastActive;

    if (timeLeft <= 0) {
      deleteDoc(doc(db, "yacht_rooms", roomCode)).catch(() => console.log("이미 삭제됨"));
      return;
    }

    const timer = setTimeout(() => {
      deleteDoc(doc(db, "yacht_rooms", roomCode)).catch(() => console.log("삭제 에러"));
    }, timeLeft);

    return () => clearTimeout(timer);
  }, [gameState, roomCode]);

  const rollDice = async () => {
    if (gameState.turn !== playerType || gameState.rollCount === 0) return;
    const newDice = gameState.dice.map((d, i) => gameState.kept[i] ? d : Math.floor(Math.random() * 6) + 1);
    await updateDoc(doc(db, "yacht_rooms", roomCode), {
      dice: newDice,
      rollCount: gameState.rollCount - 1,
      lastActive: new Date().getTime()
    });
  };

  const toggleKeep = async (index) => {
    if (gameState.turn !== playerType || gameState.rollCount === 3) return;
    const newKept = [...gameState.kept];
    newKept[index] = !newKept[index];
    await updateDoc(doc(db, "yacht_rooms", roomCode), { 
      kept: newKept,
      lastActive: new Date().getTime() 
    });
  };

  const recordScore = async (category) => {
    if (gameState.turn !== playerType) return;
    const myKey = playerType === 1 ? 'p1' : 'p2';
    if (gameState.scores[myKey][category] !== null) return; 

    const score = calculateScore(gameState.dice, category);
    const newScores = { ...gameState.scores };
    newScores[myKey][category] = score;

    await updateDoc(doc(db, "yacht_rooms", roomCode), {
      scores: newScores,
      turn: playerType === 1 ? 2 : 1, 
      dice: [1, 1, 1, 1, 1], 
      kept: [false, false, false, false, false],
      rollCount: 3,
      lastActive: new Date().getTime()
    });
  };

  if (!roomCode) {
    return (
      <div className="menu-container">
        <h2>멀티 플레이 접속</h2>
        <div className="box">
          <button className="main-btn" onClick={createRoom}>새로운 방 만들기</button>
        </div>
        <div className="box">
          <input 
            value={inputCode} 
            onChange={(e) => setInputCode(e.target.value)} 
            placeholder="게임코드 5자리" 
            maxLength={5}
          />
          <button className="main-btn multi" style={{padding: '10px'}} onClick={joinRoom}>입장</button>
        </div>
        <button className="back-btn" onClick={goBack}>메인으로 돌아가기</button>
      </div>
    );
  }

  if (gameState?.status === "waiting") {
    return (
      <div className="menu-container">
        <h2>게임 코드: {roomCode}</h2>
        <p className="pulse-text">다른 플레이어를 기다리는 중...</p>
        <button className="back-btn" onClick={exitRoom} style={{marginTop: '30px'}}>방 폭파하고 나가기</button>
      </div>
    );
  }

  if (!gameState) return <div>로딩 중...</div>;

  // 💡 게임 종료 확인 로직
  const isGameOver = 
    Object.values(gameState.scores.p1).every(val => val !== null) && 
    Object.values(gameState.scores.p2).every(val => val !== null);

  const p1Total = getTotalScore(gameState.scores.p1);
  const p2Total = getTotalScore(gameState.scores.p2);

  // 💡 게임 종료 결과창 화면
  if (isGameOver) {
    let resultMessage = "";
    if (p1Total > p2Total) resultMessage = "1P 승리! 🏆";
    else if (p2Total > p1Total) resultMessage = "2P 승리! 🏆";
    else resultMessage = "무승부! 🤝";

    return (
      <div className="menu-container">
        <h1 style={{ fontSize: '3em', margin: '0' }}>게임 종료</h1>
        <h2 className="highlight" style={{ fontSize: '2.5em', margin: '20px 0' }}>{resultMessage}</h2>
        
        <div className="box" style={{ flexDirection: 'column', alignItems: 'center', fontSize: '1.5em', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px' }}>
          <p style={{ margin: '10px 0' }}>1P 총점: <strong>{p1Total}</strong></p>
          <p style={{ margin: '10px 0' }}>2P 총점: <strong>{p2Total}</strong></p>
        </div>

        <div className="box" style={{ flexDirection: 'column', marginTop: '30px' }}>
          <button className="main-btn" onClick={restartGame}>다시 하기 (새 게임)</button>
          <button className="main-btn multi" onClick={exitRoom}>메인화면으로 돌아가기</button>
        </div>
      </div>
    );
  }

  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  const isMyTurn = gameState.turn === playerType;

  return (
    <div className="game-board">
      <div className="header">
        <button className="back-btn" onClick={exitRoom} style={{position: 'absolute', top: '10px', left: '10px'}}>나가기</button>
        <h2>방: {roomCode} ({playerType}P)</h2>
        <h3 className={isMyTurn ? 'highlight' : ''}>
          {isMyTurn ? '내 턴입니다!' : '상대방 턴을 기다리는 중...'}
        </h3>
      </div>

      <div className="dice-area">
        <div className="dice-container">
          {gameState.dice.map((val, idx) => (
            <div 
              key={idx} 
              className={`dice ${gameState.kept[idx] ? 'kept' : ''}`}
              onClick={() => toggleKeep(idx)}
            >
              {diceFaces[val - 1]}
            </div>
          ))}
        </div>
        <button onClick={rollDice} disabled={!isMyTurn || gameState.rollCount === 0}>
          주사위 굴리기 (남은 횟수: {gameState.rollCount})
        </button>
      </div>

      <div className="score-area">
        <div className={`score-col ${gameState.turn === 1 ? 'active-board' : 'inactive-board'}`}>
          <h4>1P 점수판 {playerType === 1 ? '(나)' : ''}</h4>
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#e74c3c', marginBottom: '10px' }}>
            총점: {p1Total}점
          </div>
          {CATEGORY_KEYS.map(cat => {
            const isFilled = gameState.scores.p1[cat] !== null;
            const showPreview = !isFilled && gameState.turn === 1 && gameState.rollCount < 3;
            
            return (
              <button 
                key={cat} 
                onClick={() => recordScore(cat)} 
                disabled={playerType !== 1 || gameState.turn !== 1 || isFilled || gameState.rollCount === 3}
              >
                <span style={{ fontSize: '0.85em' }}>{CATEGORY_LABELS[cat]}</span>
                <span>
                  {isFilled ? (
                    gameState.scores.p1[cat]
                  ) : showPreview ? (
                    <span style={{ color: '#3498db', fontWeight: 'bold' }}>{calculateScore(gameState.dice, cat)}</span>
                  ) : (
                    '-'
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className={`score-col ${gameState.turn === 2 ? 'active-board' : 'inactive-board'}`}>
          <h4>2P 점수판 {playerType === 2 ? '(나)' : ''}</h4>
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#e74c3c', marginBottom: '10px' }}>
            총점: {p2Total}점
          </div>
          {CATEGORY_KEYS.map(cat => {
            const isFilled = gameState.scores.p2[cat] !== null;
            const showPreview = !isFilled && gameState.turn === 2 && gameState.rollCount < 3;

            return (
              <button 
                key={cat} 
                onClick={() => recordScore(cat)} 
                disabled={playerType !== 2 || gameState.turn !== 2 || isFilled || gameState.rollCount === 3}
              >
                <span style={{ fontSize: '0.85em' }}>{CATEGORY_LABELS[cat]}</span>
                <span>
                  {isFilled ? (
                    gameState.scores.p2[cat] 
                  ) : showPreview ? (
                    <span style={{ color: '#3498db', fontWeight: 'bold' }}>{calculateScore(gameState.dice, cat)}</span>
                  ) : (
                    '-'
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}