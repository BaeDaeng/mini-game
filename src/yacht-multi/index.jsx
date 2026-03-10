// src/yacht-multi/index.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SoloMode from './SoloMode';
import LocalMode from './LocalMode';
import MultiMode from './MultiMode';
import './YachtStyle.css';

export default function YachtGameEntry() {
  const [mode, setMode] = useState('menu'); // 'menu', 'solo', 'local', 'multi'
  const [showRules, setShowRules] = useState(false); // 💡 룰북 모달 상태 추가
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

      {/* 💡 새로 추가된 우측 상단 룰북 버튼 */}
      <button onClick={() => setShowRules(true)} 
        style={{ 
          position: 'absolute', top: '20px', right: '20px', padding: '10px 16px', backgroundColor: '#e67e22', 
          color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', 
          zIndex: 10000, boxShadow: '0 4px 6px rgba(0,0,0,0.5)' 
        }}
      >
        📖 룰 보기
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

      {/* 💡 초심자용 룰북 모달 */}
      {showRules && (
        <div className="rule-overlay">
          <div className="rule-modal">
            <h2 style={{ color: '#e74c3c', marginTop: 0, textAlign: 'center' }}>🎲 야추 다이스 초보자 가이드</h2>
            
            <div className="rule-content">
              <p style={{ fontSize: '1.1em' }}><strong>🎯 승리 조건:</strong> 주사위 5개를 굴려 족보를 완성하고, 게임이 끝났을 때 <strong>가장 높은 점수</strong>를 얻으면 승리합니다!</p>
              
              <h3>1. 게임 진행 (내 턴)</h3>
              <ul>
                <li>주사위 5개를 굴립니다. <strong>(한 턴에 최대 3번까지 굴릴 수 있습니다.)</strong></li>
                <li>원하는 주사위는 클릭해서 <strong>'킵(Keep)'</strong>하고, 나머지 주사위만 다시 굴려 원하는 조합을 만듭니다.</li>
                <li>3번을 다 굴렸거나 원하는 눈이 나왔다면, 점수판의 <strong>빈칸 중 하나를 선택해 점수를 기록</strong>합니다.</li>
                <li><span style={{ color: '#e74c3c', fontWeight: 'bold' }}>주의:</span> 원하는 족보가 안 나왔어도, 무조건 한 칸에는 점수(또는 0점)를 희생해서 기록해야 턴이 넘어갑니다!</li>
              </ul>

              <h3>2. 점수판 (족보) 설명</h3>
              <ul>
                <li><strong>Aces ~ Sixes (1~6):</strong> 해당 숫자가 나온 주사위 눈의 합계만 점수가 됩니다. <br/><span style={{fontSize: '0.9em', color: '#e67e22', fontWeight: 'bold'}}>* 이 6개 항목의 점수 합이 63점 이상이면 보너스 +35점을 받습니다!</span></li>
                <li><strong>Choice (초이스):</strong> 조건 없이 주사위 5개의 눈을 모두 합친 점수입니다. (안전빵 용도)</li>
                <li><strong>4 of a Kind (포카인드):</strong> 같은 숫자가 4개 이상일 때, 주사위 5개의 눈을 모두 합친 점수입니다.</li>
                <li><strong>Full House (풀하우스):</strong> 같은 숫자 3개 + 같은 숫자 2개 조합일 때, 주사위 5개의 눈을 모두 합친 점수입니다.</li>
                <li><strong>Small Straight (스몰 스트레이트):</strong> 주사위 4개가 연속된 숫자일 때 (예: 1-2-3-4). <strong>15점 고정</strong>입니다.</li>
                <li><strong>Large Straight (라지 스트레이트):</strong> 주사위 5개가 연속된 숫자일 때 (예: 1-2-3-4-5). <strong>30점 고정</strong>입니다.</li>
                <li><strong>Yacht (야추):</strong> 주사위 5개가 모두 같은 숫자일 때. <strong>50점 고정!</strong> 최고의 족보입니다.</li>
              </ul>
            </div>

            <button className="main-btn" style={{ background: '#34495e', marginTop: '15px', width: '100%', padding: '12px' }} onClick={() => setShowRules(false)}>
              확인했습니다 (닫기)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}