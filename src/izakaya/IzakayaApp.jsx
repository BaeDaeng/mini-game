import React, { useState } from 'react';
import EntryScreen from './EntryScreen';
import IzakayaRoom from './IzakayaRoom';
import './Izakaya.css';

export default function IzakayaApp() {
  const [userInfo, setUserInfo] = useState(null);

  // 뒤로가기 버튼 클릭 시 포털 메인으로 가거나, 입장 전 화면으로 가도록 처리
  const handleGoBack = () => {
    if (userInfo) {
      setUserInfo(null); // 방에서 나갈 때는 입장 화면으로 돌리기
    } else {
      window.location.href = '/'; // 최상단 메인으로 이동
    }
  };

  return (
    <div className="izakaya-container">
      <button className="back-btn" onClick={handleGoBack}>
        🔙 돌아가기
      </button>

      {!userInfo ? (
        <EntryScreen onEnter={setUserInfo} />
      ) : (
        <IzakayaRoom userInfo={userInfo} />
      )}
    </div>
  );
}