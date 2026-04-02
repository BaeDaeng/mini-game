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
import CardGamePortal from './card-games/index.jsx';
import RhythmGame from './rhythm-game/rhythm.jsx';
import Puzzle2048 from './puzzle2048/index.jsx';
import FourthWall from './fourthWall/index.jsx';
import Tabacco from './tabacco/TabaccoRoom.jsx';
import IzakayaApp from './izakaya/IzakayaApp.jsx';
import RandomCardRpg from './random-card-rpg/components/MainLayout.jsx';
import FindMine from './find-mine/FindMine.jsx';
import InventoryPuzzle from './inventory-puzzle/GameStart.jsx';
import AntSimulator from './ant-simulator/index.jsx';
import RagdollGame from './ragdoll-game/RagdollGame.jsx';
import './App.css'; 

// 메인 로비 화면 컴포넌트
const MainLobby = () => {
  const navigate = useNavigate();
  
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
    { path: '/cards', title: '카드게임모음', icon: '🃏', img: '/images/card-games.png', color: '#8e44ad' },
    { path: '/rhythm', title: '리듬게임', icon: '🎶', img: '/images/rhythm-game.png', color: '#3d3c3d' },
    { path: '/p2048', title: '2048', icon: '🧩', img: '/images/puzzle2048.png', color: '#e7e992' },
    { path: '/fourthwall', title: '제4의벽(PC)', icon: '🧩', img: '/images/fourthWall.png', color: '#e7e992' },
    { path: '/tabacco', title: '온라인 흡연실', icon: '🚬', img: '/images/tabacco.png', color: '#f5b164' },
    { path: '/izakaya', title: '이자카야', icon: '🍻', img: '/images/izakaya.png', color: '#5c3202' },
    { path: '/randomcardrpg', title: '랜덤카드RPG', icon: '📇', img: '/images/random-card-rpg.png', color: '#30680f', disabled: true },
    { path: '/findmine', title: '색상 지뢰 찾기', icon: '💣', img: '/images/find-mine.png', color: '#589aaa', disabled: true },
    { path: '/inventorypuzzle', title: '인벤토리 로그라이크', icon: '💼', img: '/images/inventory-puzzle.png', color: '#812b03', disabled: true },
    { path: '/antsimulator', title: '개미 시뮬레이터', icon: '🐜', img: '/images/ant-simulator.png', color: '#812b03', disabled: true },
    { path: '/ragdollgame', title: '레그돌 전투', icon: '🐜', img: '/images/ragdoll-game.png', color: '#d42d27', disabled: true },
  ];

  return (
    <div className="vapor-container">
      {/* 배경에 흐르는 텍스트 애니메이션 */}
      <div className="bg-scroll-text">CYBERSPACE // DISTORTION // REALITY_ERROR // FUTURE_NOSTALGIA</div>
      
      {/* 스캔라인 오버레이 */}
      <div className="vapor-overlay"></div>
      
      <header className="vapor-header">
        <div className="header-titles" onClick={() => navigate('/')}>
          <h1 className="main-logo">MINI-GAME</h1>
        </div>
      </header>

      {/* 테두리와 카드 리스트를 함께 묶어주는 래퍼 */}
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

      <footer className="vapor-footer">
        <div className="coord">latest update 26.04.02</div>
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
        <Route path="/cards" element={<CardGamePortal />} />
        <Route path="/rhythm" element={<RhythmGame />} />
        <Route path="/p2048" element={<Puzzle2048 />} />
        <Route path="/fourthwall" element={<FourthWall />} />
        <Route path="/tabacco" element={<Tabacco />} />
        <Route path="/izakaya" element={<IzakayaApp />} />
        <Route path="/randomcardrpg" element={<RandomCardRpg />} />
        <Route path="/findmine" element={<FindMine />} />
        <Route path="/inventorypuzzle" element={<InventoryPuzzle />} />
        <Route path="/antsimulator" element={<AntSimulator />} />
        <Route path="/ragdollgame" element={<RagdollGame />} />
      </Routes>
    </Router>
  );
};

export default App;