import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import BrockBrick from './brock-brick/brock-brick.jsx';
import CatchButton from './catch-the-button/catch-the-button.jsx';
import SuikaGame from './suika-game/suika-game.jsx'; 
import StackBlock from './stack-the-block/stack-the-block.jsx';
import BalloonUp from './balloon-up/balloon-up.jsx';
import RaccoonSurvival from './raccoon-survival/raccoon-survival.jsx';
import YachtMulti from './yacht-multi/index.jsx';
import Daifugo from './daifugo/index.jsx';
import Gomoku from './gomoku/index.jsx';
import Superhot from './superhot/superhot.jsx';
import './App.css'; // 설정하신 CSS 파일명으로 맞춰주세요

// 메인 로비 화면 컴포넌트
const MainLobby = () => {
  const navigate = useNavigate();
  
  // 기존 이미지 경로를 포함한 게임 데이터 배열
  const games = [
    { path: '/brick', title: '블럭깨기', icon: '🧱', img: '/images/brock-brick.png', color: '#ff00ff' },
    { path: '/button', title: '버튼잡기', icon: '🎯', img: '/images/catch-the-button.png', color: '#00ffff' },
    { path: '/suika', title: '호박게임', icon: '🎃', img: '/images/suika-game.png', color: '#ffff00' },
    { path: '/stackb', title: '무한쌓기', icon: '🏗️', img: '/images/stack-the-block.png', color: '#00ff00' },
    { path: '/balloon', title: '풍선띄우기', icon: '🎈', img: '/images/balloon-up.png', color: '#ff00aa' },
    { path: '/raccoon', title: '라쿤서바이벌', icon: '🦝', img: '/images/raccoon-survival.png', color: '#ff8800' },
    { path: '/yacht', title: '야추! 멀티!', icon: '🎲', img: '/images/yacht-multi.png', color: '#ffffff' },
    { path: '/daifugo', title: '대부호 카드', icon: '🃏', img: '/images/daifugo.png', color: '#ff0055' },
    { path: '/gomoku', title: '오목', icon: '⚫', img: '/images/gomoku.png', color: '#aaaaaa' },
    { path: '/superhot', title: '슈퍼핫(PC)', icon: '🔥', img: '/images/superhot.png', color: '#ff4d00' },
  ];

  return (
    <div className="vapor-container">
      {/* 배경에 흐르는 텍스트 애니메이션 */}
      <div className="bg-scroll-text">CYBERSPACE // DISTORTION // REALITY_ERROR // FUTURE_NOSTALGIA</div>
      
      {/* 스캔라인 오버레이 */}
      <div className="vapor-overlay"></div>
      
      <header className="vapor-header">
        {/* GLITCH_OS 제거, MINI-GAME 텍스트 추가 */}
        <div className="header-titles" onClick={() => navigate('/')}>
          <h1 className="main-logo">MINI-GAME</h1>
        </div>
      </header>

      {/* 🔥 여기에 grid-wrapper와 grid-pixel-frame을 추가하여 감싸줍니다 🔥 */}
      <div className="grid-wrapper">
        <div className="grid-pixel-frame"></div>
        
        <main className="vapor-grid">
          {games.map((game, index) => (
            <div 
              key={index} 
              className="vapor-card" 
              style={{"--accent": game.color}}
              onClick={() => navigate(game.path)}
            >
              {/* 사진 썸네일 영역 */}
              <div className="vapor-image-wrapper">
                <img src={game.img} alt={`${game.title} 미리보기`} />
                <div className="image-overlay"></div>
              </div>

              {/* 카드 텍스트 및 시작 버튼 영역 */}
              <div className="vapor-card-content">
                <div className="vapor-info">
                  <h3>{game.icon}{game.title}</h3>
                  <div className="vapor-bar"></div>
                </div>
                <button className="start-btn">시작하기</button>
                {/* 우측 하단 01, 02 포맷팅 */}
                <div className="index-num">{String(index + 1).padStart(2, '0')}</div>
              </div>
            </div>
          ))}
        </main>
      </div>
      {/* 🔥 래퍼 닫기 🔥 */}

      <footer className="vapor-footer">
        <div className="coord">latest update 26.03.12</div>
        <div className="warning">🔖BAEJAEHUN</div>
      </footer>
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
        <Route path="/gomoku" element={<Gomoku />} />
        <Route path="/superhot" element={<Superhot />} />
      </Routes>
    </Router>
  );
};

export default App;