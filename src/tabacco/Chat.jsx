import React, { useState, useEffect } from 'react'; // useRef 제거
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  // 💡 수정된 부분: useRef 대신 useState 지연 초기화 사용
  // 컴포넌트가 처음 렌더링될 때 딱 한 번만 Date.now()를 실행하여 고정합니다.
  const [joinTime] = useState(() => Date.now()); 

  useEffect(() => {
    const q = query(collection(db, "tabacco_chat"), orderBy("createdAt", "desc"), limit(15));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          
          const msgTime = data.createdAt ? data.createdAt.toMillis() : Date.now();
          
          // 💡 수정된 부분: joinTime.current 대신 joinTime 사용
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
  }, [joinTime]); // 의존성 배열에 joinTime 추가

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const text = input;
    setInput(''); 
    
    await addDoc(collection(db, "tabacco_chat"), {
      text: text,
      createdAt: serverTimestamp(),
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
    <div
      className="smoke-message"
      style={{ left: `${msg.randomX}%` }}
    >
      {msg.text}
    </div>
  );
}