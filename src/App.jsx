import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import BrockBrick from './brock-brick/brock-brick';
import CatchButton from './catch-the-button/catch-the-button';
import SuikaGame from './suika-game/suika-game'; 
import StackBlock from './stack-the-block/stack-the-block';
import BalloonUp from './balloon-up/balloon-up';
import RaccoonSurvival from './raccoon-survival/raccoon-survival';
import YachtMulti from './yacht-multi/index.jsx';
import Daifugo from './daifugo/index.jsx';
import './App.css';

// 메인 로비 화면 컴포넌트
const MainLobby = () => {
  const navigate = useNavigate();

  return (
    <div className="lobby-container">
      <header className="header">
        <h1>Mini-Game</h1>
        <h2>Swipe Up!!! 아래에도 있어요</h2>
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

        {/* 4. 무한쌓기 카드 */}
        <div className="game-card" onClick={() => navigate('/stackb')}>
          <div className="image-wrapper">
            <img src="/images/stack-the-block.png" alt="무한쌓기 미리보기" />
          </div>
          <div className="card-info">
            <h2>무한쌓기</h2>
            <button className="start-btn">시작하기</button>
          </div>
        </div>

        {/* 5. 풍선띄우기 카드 */}
        <div className="game-card" onClick={() => navigate('/balloon')}>
          <div className="image-wrapper">
            <img src="/images/balloon-up.png" alt="풍선띄우기 미리보기" />
          </div>
          <div className="card-info">
            <h2>풍선띄우기</h2>
            <button className="start-btn">시작하기</button>
          </div>
        </div>

        {/* 6. 라쿤서바이벌 카드 */}
        <div className="game-card" onClick={() => navigate('/raccoon')}>
          <div className="image-wrapper">
            <img src="/images/raccoon-survival.png" alt="라쿤서바이벌 미리보기" />
          </div>
          <div className="card-info">
            <h2>라쿤서바이벌</h2>
            <button className="start-btn">시작하기</button>
          </div>
        </div>

        {/* 7. 야추! 카드 */}
        <div className="game-card" onClick={() => navigate('/yacht')}>
          <div className="image-wrapper">
            <img src="/images/yacht-multi.png" alt="야추! 멀티! 미리보기" />
          </div>
          <div className="card-info">
            <h2>야추! 멀티!</h2>
            <button className="start-btn">시작하기</button>
          </div>
        </div>

        {/* 8. 다이후고 카드 */}
        <div className="game-card" onClick={() => navigate('/daifugo')}>
          <div className="image-wrapper">
            <img src="/images/daifugo.png" alt="대부호 카드게임 미리보기" />
          </div>
          <div className="card-info">
            <h2>대부호 카드게임</h2>
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
        <Route path="/stackb" element={<StackBlock />} />
        <Route path="/balloon" element={<BalloonUp />} />
        <Route path="/raccoon" element={<RaccoonSurvival />} />
        <Route path="/yacht" element={<YachtMulti />} />
        <Route path="/daifugo" element={<Daifugo />} />
      </Routes>
    </Router>
  );
};

export default App;