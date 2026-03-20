import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

export default function Chat({ userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const [joinTime] = useState(() => Date.now()); 

  useEffect(() => {
    const q = query(collection(db, "izakaya_chat"), orderBy("createdAt", "desc"), limit(20));
    
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
    
    await addDoc(collection(db, "izakaya_chat"), {
      userName: userName, // 이름 정보 포함
      text: text,
      createdAt: serverTimestamp(),
      randomX: Math.random() * 60 + 20 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-messages-layer">
        {messages.map((msg) => (
          <IzakayaMessage key={msg.id} msg={msg} />
        ))}
      </div>
      
      <form onSubmit={sendMessage} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="술자리에서 한마디 뱉어보세요"
          maxLength={60}
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
}

function IzakayaMessage({ msg }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 15000); // 15초 뒤 제거
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="smoke-wrapper" style={{ left: `${msg.randomX}%` }}>
      <div className="izakaya-message">
        <span className="msg-name">({msg.userName}):</span> {msg.text}
      </div>
    </div>
  );
}