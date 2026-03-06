import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import BrockBrick from './brock-brick/brock-brick';
import CatchButton from './catch-the-button/catch-the-button';
import SuikaGame from './suika-game/suika-game'; 
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
        {/* 1. 블럭깨기 카드 */}
        <div className="game-card" onClick={() => navigate('/brick')}>
          <div className="image-wrapper">
            <img src="/images/brock-brick.png" alt="블럭깨기 미리보기" />
          </div>
          <div className="card-info">
            <h2>블럭깨기</h2>
            <button className="start-btn">시작하기</button>
          </div>
        </div>

        {/* 2. 버튼잡기 카드 */}
        <div className="game-card" onClick={() => navigate('/button')}>
          <div className="image-wrapper">
            <img src="/images/catch-the-button.png" alt="버튼잡기 미리보기" />
          </div>
          <div className="card-info">
            <h2>버튼잡기</h2>
            <button className="start-btn">시작하기</button>
          </div>
        </div>

        {/* 3. 호박게임 카드 */}
        <div className="game-card" onClick={() => navigate('/suika')}>
          <div className="image-wrapper">
            <img src="/images/suika-game.png" alt="호박게임 미리보기" />
          </div>
          <div className="card-info">
            <h2>호박게임</h2>
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
        <Route path="/suika" element={<SuikaGame />} />
      </Routes>
    </Router>
  );
};

export default App;