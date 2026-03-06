import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import BrockBrick from './brock-brick/brock-brick'; // 기존 블럭깨기 컴포넌트
import CatchButton from './catch-the-button/catch-the-button'; // 기존 버튼잡기 컴포넌트
import './App.css';

// 메인 로비 화면 컴포넌트
const MainLobby = () => {
  const navigate = useNavigate();

  return (
    <div className="lobby-container">
      <header className="header">
        <h1>mini-game</h1>
      </header>

      <main className="game-grid">
        {/* 블럭깨기 카드 */}
        <div className="game-card" onClick={() => navigate('/brick')}>
          <div className="image-wrapper">
            {/* 이미지가 public/images 폴더에 있다고 가정합니다 */}
            <img src="/images/brock-brick.png" alt="블럭깨기 미리보기" />
          </div>
          <div className="card-info">
            <h2>블럭깨기</h2>
            <button className="start-btn">시작하기</button>
          </div>
        </div>

        {/* 버튼잡기 카드 */}
        <div className="game-card" onClick={() => navigate('/button')}>
          <div className="image-wrapper">
            <img src="/images/catch-the-button.png" alt="버튼잡기 미리보기" />
          </div>
          <div className="card-info">
            <h2>버튼잡기</h2>
            <button className="start-btn">시작하기</button>
          </div>
        </div>
      </main>
    </div>
  );
};

// 최상위 라우터 설정
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLobby />} />
        <Route path="/brick" element={<BrockBrick />} />
        <Route path="/button" element={<CatchButton />} />
      </Routes>
    </Router>
  );
};

export default App;