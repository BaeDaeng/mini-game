import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, query, where, onSnapshot } from 'firebase/firestore';
import Cigarette from './Cigarette';
import Chat from './Chat';
import './TabaccoRoom.css'; 

export default function TabaccoRoom() { 
  const [totalPuffMs, setTotalPuffMs] = useState(0);
  const [onlineCount, setOnlineCount] = useState(1);
  
  // 💡 담배 종류 상태 (기본값: 클래식)
  const [cigType, setCigType] = useState('cig-classic');

  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem('tabacco_session_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('tabacco_session_id', id);
    }
    return id;
  });

  useEffect(() => {
    const presenceRef = doc(db, 'tabacco_presence', sessionId);
    
    const updatePresence = async () => {
      try {
        await setDoc(presenceRef, { lastActive: Date.now() }, { merge: true });
      } catch (e) {
        console.error("접속 상태 업데이트 실패: ", e);
      }
    };

    updatePresence(); 
    const interval = setInterval(updatePresence, 20000); 

    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    const q = query(
      collection(db, 'tabacco_presence'), 
      where('lastActive', '>', Date.now() - 60000)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOnlineCount(snapshot.size || 1);
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}분 ${s}초`;
  };

  // 💡 담배 바꾸기 함수 (클래식 -> 멘솔 -> 시가 순환)
  const handleChangeCigarette = () => {
    setCigType(prev => {
      if (prev === 'cig-classic') return 'cig-menthol';
      if (prev === 'cig-menthol') return 'cig-cigar';
      return 'cig-classic';
    });
  };

  // 💡 메인으로 가기 함수
  const handleGoMain = () => {
    // react-router-dom을 사용 중이시라면 useNavigate의 navigate('/')로 변경하세요!
    window.location.href = '/'; 
  };

  return (
    <div className="tabacco-room">
      {/* 좌측 상단 컨트롤 패널 */}
      <div className="top-left-controls">
        <button className="nav-btn" onClick={handleGoMain}>🏠 메인으로</button>
        <button className="nav-btn" onClick={handleChangeCigarette}>🔄 담배 바꾸기</button>
      </div>

      <div className="top-right-stats">
        <div className="stat-line">
          🟢 동시 접속자: <span className="stat-highlight">{onlineCount}</span> 명
        </div>
        <div className="stat-line">
          🚬 담배 태운 시간: <span className="stat-highlight">{formatTime(totalPuffMs)}</span>
        </div>
      </div>

      {/* 담배 종류(type)를 Props로 넘겨줍니다 */}
      <Cigarette setTotalPuffMs={setTotalPuffMs} type={cigType} />
      <Chat />
    </div>
  );
}