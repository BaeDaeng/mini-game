import React, { useState } from 'react';

export default function EntryScreen({ onEnter }) {
  const [name, setName] = useState('');
  const [drink, setDrink] = useState('soju');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("이름을 입력해주세요!");
    
    // 고유 세션 ID 생성
    const sessionId = Math.random().toString(36).substring(2, 15);
    onEnter({ id: sessionId, name: name.trim(), drinkType: drink });
  };

  return (
    <div className="entry-screen">
      <h1 className="entry-title">JH 이자카야</h1>
      
      <form onSubmit={handleSubmit} className="entry-form">
        <input 
          type="text" 
          placeholder="본인의 이름을 적어주세요" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={10}
        />

        <div className="drink-selection">
          <label className="drink-label">
            <input 
              type="radio" 
              name="drink" 
              value="soju" 
              checked={drink === 'soju'} 
              onChange={() => setDrink('soju')} 
              style={{ display: 'none' }}
            />
            <span>🍶 소주</span>
          </label>

          <label className="drink-label">
            <input 
              type="radio" 
              name="drink" 
              value="beer" 
              checked={drink === 'beer'} 
              onChange={() => setDrink('beer')} 
              style={{ display: 'none' }}
            />
            <span>🍺 맥주</span>
          </label>
        </div>

        <button type="submit" className="entry-submit">이자카야 입장하기</button>
      </form>
    </div>
  );
}