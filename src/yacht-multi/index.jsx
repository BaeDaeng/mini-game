// src/yacht-multi/index.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SoloMode from './SoloMode';
import LocalMode from './LocalMode';
import MultiMode from './MultiMode';
import './YachtStyle.css';

export default function YachtGameEntry() {
  const [mode, setMode] = useState('menu'); // 'menu', 'solo', 'local', 'multi'
  const navigate = useNavigate();

  if (mode === 'solo') return <SoloMode goBack={() => setMode('menu')} />;
  if (mode === 'local') return <LocalMode goBack={() => setMode('menu')} />;
  if (mode === 'multi') return <MultiMode goBack={() => setMode('menu')} />;

  return (
    <div className="menu-container" style={{ position: 'relative' }}>
      
      <button onClick={() => navigate('/')} 
        style={{ 
          position: 'absolute', top: '20px', left: '20px', padding: '10px 16px', backgroundColor: '#3182f6', 
          color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', 
          zIndex: 10000, boxShadow: '0 4px 6px rgba(0,0,0,0.5)' 
        }}
      >
        ⬅️ 메인으로
      </button>

      <h1>야추 다이스 (Yacht Dice)</h1>

      {/* css 파일에 정의된 .single 클래스를 적용하여 초록색 버튼으로 표시 */}
      <button className="main-btn single" onClick={() => setMode('solo')}>
        솔로 플레이 (혼자하기)
      </button>
      
      {/* 로컬 플레이 버튼은 주황색으로 인라인 지정 */}
      <button className="main-btn local" onClick={() => setMode('local')} style={{ backgroundColor: '#f39c12' }}>
        로컬 플레이 (1기기 2인용)
      </button>
      
      {/* css 파일에 정의된 .multi 클래스를 적용하여 빨간색 버튼으로 표시 */}
      <button className="main-btn multi" onClick={() => setMode('multi')}>
        멀티 플레이 (온라인 대전)
      </button>
    </div>
  );
}