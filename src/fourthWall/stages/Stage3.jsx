import React, { useState } from 'react';

export default function Stage3({ onClear }) {
  const [input, setInput] = useState('');

  // 유저가 이 텍스트를 복사(Ctrl+C)할 때 발동하는 이벤트
  const handleCopy = (e) => {
    e.preventDefault(); // 원래 텍스트가 복사되는 것을 막음
    e.clipboardData.setData('text/plain', 'OPEN_SESAME_999'); // 몰래 정답을 클립보드에 넣음
    alert("무언가 클립보드에 스며들었습니다...");
  };

  const handleSubmit = () => {
    if (input === 'OPEN_SESAME_999') {
      onClear();
    } else {
      alert("암호가 틀렸습니다.");
    }
  };

  return (
    <div className="fw-stage-box">
      <h2>[ 스테이지 3: 거짓말쟁이의 텍스트 ]</h2>
      
      <div 
        onCopy={handleCopy}
        style={{ margin: '30px 0', padding: '20px', background: '#333', cursor: 'text', userSelect: 'all' }}
      >
        "이 문장에는 암호가 없습니다. 복사해도 소용없습니다."
      </div>

      <input 
        type="text" 
        className="fw-input" 
        placeholder="암호를 붙여넣기(Ctrl+V) 하세요"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <br/>
      <button className="fw-btn" onClick={handleSubmit}>확인</button>
    </div>
  );
}