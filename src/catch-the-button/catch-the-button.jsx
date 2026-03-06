import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './catch-the-button.css';
import * as RS from 'reactstrap';

class CatchTheButtonGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      successCount: 0,
      isHovered: false
    };
    // DOM에 직접 접근하기 위한 변수들
    this.btnRef = React.createRef();
    this.posX = window.innerWidth / 2;
    this.posY = window.innerHeight / 2;
    this.velX = 0;
    this.velY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    // 윈도우 크기가 바뀔 때 대응
    window.addEventListener('resize', this.handleResize);
    this.tick(); 
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.handleResize);
    cancelAnimationFrame(this.animationFrame);
  }

  handleResize = () => {
    // 화면이 갑자기 커지거나 작아지면 위치 재조정
    if (this.posX > window.innerWidth) this.posX = window.innerWidth - 110;
    if (this.posY > window.innerHeight) this.posY = window.innerHeight - 50;
  };

  handleMouseMove = (e) => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  };

  handleKeyDown = (e) => {
    if (e.code === 'Space' && this.state.isHovered) {
      e.preventDefault();
      this.handleSuccess();
    }
  };

  tick = () => {
    this.animationFrame = requestAnimationFrame(this.tick);

    const btnW = 100;
    const btnH = 40;
    const centerX = this.posX + btnW / 2;
    const centerY = this.posY + btnH / 2;

    // 1. 마우스와의 거리 계산
    const dist = Math.sqrt(Math.pow(this.mouseX - centerX, 2) + Math.pow(this.mouseY - centerY, 2));

    // 2. 도망 로직 (거리가 180px 이내면 도망)
    if (dist < 180) {
      const angle = Math.atan2(centerY - this.mouseY, centerX - this.mouseX);
      const force = (180 - dist) * 0.2; 
      this.velX += Math.cos(angle) * force;
      this.velY += Math.sin(angle) * force;
    }

    // 3. 벽 튕기기 (실시간 창 크기 기준)
    if (this.posX + this.velX < 0 || this.posX + this.velX + btnW > window.innerWidth) {
      this.velX *= -1.2; 
    }
    if (this.posY + this.velY < 0 || this.posY + this.velY + btnH > window.innerHeight) {
      this.velY *= -1.2;
    }

    // 4. 위치 업데이트 및 마찰력
    this.posX += this.velX;
    this.posY += this.velY;
    this.velX *= 0.85;
    this.velY *= 0.85;

    // 5. [핵심] 리액트 State가 아니라 DOM 스타일을 직접 변경 (F12 무시)
    if (this.btnRef.current) {
      this.btnRef.current.style.left = `${this.posX}px`;
      this.btnRef.current.style.top = `${this.posY}px`;
    }

    // 6. 판정만 State로 업데이트 (HIT! 글자 변경용)
    const nextHovered = dist < 70;
    if (this.state.isHovered !== nextHovered) {
      this.setState({ isHovered: nextHovered });
    }
  };

  handleSuccess = () => {
    alert("🎯 잡았다! 대단해요!");
    this.setState({ successCount: this.state.successCount + 1 });
    this.velX = 0;
    this.velY = 0;
  };

  render() {
    return (
      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#000', color: '#fff', position: 'relative' }}>
        
        {/* 뒤로 가기 버튼 추가 */}
        <button 
          onClick={() => this.props.navigate('/')} 
          style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 16px', backgroundColor: '#3182f6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', zIndex: 10000, boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }}
        >
          ⬅️ 메인으로
        </button>

        <div style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
          <h1 style={{ color: 'cyan' }}>CATCH THE BUTTON</h1>
          <h3>SCORE: {this.state.successCount}</h3>
        </div>

        <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
          <RS.Card style={{ width: '16rem', background: '#111', border: '1px solid #333', color: '#666' }}>
            <RS.CardBody className="text-center">
              <p>마우스가 닿으면 무조건 도망칩니다.</p>
              <p>스페이스바를 연타하세요!</p>
            </RS.CardBody>
          </RS.Card>
        </div>

        <button
          ref={this.btnRef}
          className="rainbow-btn"
          onClick={this.handleSuccess}
          style={{
            position: 'fixed',
            width: '100px',
            height: '40px',
            zIndex: 9999,
            borderRadius: '10px',
            transition: 'transform 0.1s',
            transform: `scale(${this.state.isHovered ? 1.3 : 1})`,
            fontSize: '14px'
          }}
        >
          {this.state.isHovered ? 'HIT!' : 'Catch'}
        </button>
      </div>
    );
  }
}

// React Router Hooks를 Class Component에서 사용하기 위한 Wrapper
const App = () => {
  const navigate = useNavigate();
  return <CatchTheButtonGame navigate={navigate} />;
};

export default App;