// src/daifugo/components/RuleBook.jsx
import React from 'react';

export default function RuleBook({ onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0, color: '#e74c3c' }}>📖 간략 룰북</h3>
        <ul style={{ lineHeight: '1.8', textAlign: 'left', marginBottom: '20px' }}>
          <li><strong>혁명:</strong> 같은 카드 4장 (서열 뒤집힘, 3이 최강)</li>
          <li><strong>5 스킵:</strong> 낸 장수만큼 다음 사람 턴 건너뜀</li>
          <li><strong>7 와타시:</strong> 낸 장수만큼 다음 사람에게 쓸모없는 카드 넘김</li>
          <li><strong>12 봄버:</strong> 지정한 숫자를 게임에서 완전히 파괴 (Q)</li>
          <li><strong>스페이드3 가에시:</strong> 조커 단독 출격 시 제압 가능</li>
          <li><strong>11 백:</strong> 이번 바닥 한정으로 혁명 상태 (J)</li>
        </ul>
        <button 
          className="main-btn" 
          onClick={onClose} 
          style={{ background: '#34495e', width: '100%' }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
  display: 'flex', justifyContent: 'center', alignItems: 'center'
};
const modalStyle = {
  backgroundColor: '#fff', color: '#333', padding: '20px', 
  borderRadius: '10px', width: '80%', maxWidth: '400px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
};