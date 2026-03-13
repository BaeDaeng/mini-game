// src/gomoku/index.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocalMode from './LocalMode';
import MultiMode from './MultiMode';
import CpuMode from './CpuMode';
import './GomokuStyle.css';

export default function GomokuEntry() {
  const [mode, setMode] = useState('menu');
  const navigate = useNavigate();

  if (mode === 'local') return <LocalMode goBack={() => setMode('menu')} />;
  if (mode === 'multi') return <MultiMode goBack={() => setMode('menu')} />;
  if (mode === 'cpu') return <CpuMode goBack={() => setMode('menu')} />; // CPU 모드 연결

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

      <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>⚫ 오목 ⚪</h1>
      <p style={{ color: '#bdc3c7', marginBottom: '30px' }}>5개의 돌을 먼저 연결하세요!</p>

      <button className="main-btn single" onClick={() => setMode('cpu')} style={{ backgroundColor: '#e67e22' }}>
        🖥️ CPU 대전
      </button>

      <button className="main-btn local" onClick={() => setMode('local')} style={{ backgroundColor: '#f39c12' }}>
        로컬 플레이 (1기기 2인용)
      </button>
      
      <button className="main-btn multi" onClick={() => setMode('multi')}>
        멀티 플레이 (온라인 대전)
      </button>
    </div>
  );
}