import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // 최근 15개 메시지만 가져오도록 쿼리 설정
    const q = query(collection(db, "tabacco_chat"), orderBy("createdAt", "desc"), limit(15));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // docChanges()를 사용해 '새로 추가된' 메시지만 필터링합니다.
      // 이렇게 해야 처음 방에 들어왔을 때 옛날 메시지들이 한꺼번에 솟구치는 걸 방지할 수 있습니다.
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newMsg = { id: change.doc.id, ...change.doc.data() };
          
          setMessages(prev => {
            // 중복 방지
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      });
    });
    
    return () => unsubscribe();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const text = input;
    setInput(''); // 입력창 초기화
    
    await addDoc(collection(db, "tabacco_chat"), {
      text: text,
      createdAt: serverTimestamp(),
      // 화면 가로축 기준으로 10% ~ 80% 사이 랜덤한 위치에서 메시지가 올라가게 설정
      randomX: Math.random() * 70 + 10 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-messages-layer">
        {messages.map((msg) => (
          <SmokeMessage key={msg.id} msg={msg} />
        ))}
      </div>
      
      <form onSubmit={sendMessage} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="말을 뱉어보세요"
          maxLength={50}
        />
        <button type="submit">보내기</button>
      </form>
    </div>
  );
}

// 개별 채팅 메시지 (10초 후 DOM에서 자동 삭제)
function SmokeMessage({ msg }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000); // 정확히 10초 뒤에 화면에서 렌더링 해제
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="smoke-message"
      style={{ left: `${msg.randomX}%` }}
    >
      {msg.text}
    </div>
  );
}