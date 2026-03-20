import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const [joinTime] = useState(() => Date.now()); 

  useEffect(() => {
    const q = query(collection(db, "tabacco_chat"), orderBy("createdAt", "desc"), limit(15));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const msgTime = data.createdAt ? data.createdAt.toMillis() : Date.now();
          
          if (msgTime >= joinTime) {
            const newMsg = { id: change.doc.id, ...data };
            
            setMessages(prev => {
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      });
    });
    
    return () => unsubscribe();
  }, [joinTime]); 

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const text = input;
    setInput(''); 
    
    await addDoc(collection(db, "tabacco_chat"), {
      text: text,
      createdAt: serverTimestamp(),
      // 💡 화면 양 끝에 너무 붙지 않도록 20% ~ 80% 사이에서 등장하게 수정
      randomX: Math.random() * 60 + 20 
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
          placeholder="말을 뱉어보세요 (10초 뒤 사라집니다)"
          maxLength={50}
        />
        <button type="submit">보내기</button>
      </form>
    </div>
  );
}

function SmokeMessage({ msg }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000); 
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    // 💡 래퍼를 추가하여 화면 밖으로 나가지 않게 X좌표 중앙 정렬
    <div className="smoke-wrapper" style={{ left: `${msg.randomX}%` }}>
      <div className="smoke-message">{msg.text}</div>
    </div>
  );
}