import React, { useState } from 'react';
import SingleMode from './SingleMode';
import MultiMode from './MultiMode';
import './YachtStyle.css';

export default function YachtGameEntry() {
  const [mode, setMode] = useState('menu'); // 'menu', 'single', 'multi'

  if (mode === 'single') return <SingleMode goBack={() => setMode('menu')} />;
  if (mode === 'multi') return <MultiMode goBack={() => setMode('menu')} />;

  return (
    <div className="menu-container">
      <h1>야추 다이스 (Yacht Dice)</h1>
      
      {/* className에 'single' 추가 */}
      <button className="main-btn single" onClick={() => setMode('single')}>
        싱글 플레이 (1기기 2인용)
      </button>
      
      {/* 기존 multi 유지 */}
      <button className="main-btn multi" onClick={() => setMode('multi')}>
        멀티 플레이 (온라인 대전)
      </button>
    </div>
  );
}