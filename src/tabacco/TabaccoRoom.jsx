import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, query, where, onSnapshot } from 'firebase/firestore';
import Cigarette from './Cigarette';
import Chat from './Chat';
import './TabaccoRoom.css'; 

export default function TabaccoRoom() { 
  const [totalPuffMs, setTotalPuffMs] = useState(0);
  const [onlineCount, setOnlineCount] = useState(1);

  // 세션 스토리지에 ID가 있으면 그걸 쓰고, 없으면 새로 만들어서 저장 (새로고침 방어)
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

  return (
    <div className="tabacco-room">
      <div className="top-right-stats">
        <div className="stat-line">
          🟢 동시 접속자: <span className="stat-highlight">{onlineCount}</span> 명
        </div>
        <div className="stat-line">
          🚬 담배 태운 시간: <span className="stat-highlight">{formatTime(totalPuffMs)}</span>
        </div>
      </div>

      <Cigarette setTotalPuffMs={setTotalPuffMs} />
      <Chat />
    </div>
  );
}