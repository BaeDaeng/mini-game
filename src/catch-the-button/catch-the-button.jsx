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
      isHovered: false,
      isMobileMode: false // 모바일 모드 상태 추가
    };
    this.btnRef = React.createRef();
    this.posX = window.innerWidth / 2;
    this.posY = window.innerHeight / 2;
    this.velX = 0;
    this.velY = 0;
    this.mouseX = -1000; // 초기 마우스 위치를 화면 밖으로 설정
    this.mouseY = -1000;
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    this.tick(); 
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    cancelAnimationFrame(this.animationFrame);
  }

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

  // 모바일 모드 켜기/끄기
  toggleMobileMode = () => {
    this.setState((prevState) => {
      const newMode = !prevState.isMobileMode;
      if (newMode) {
        // 모바일 모드를 켤 때 랜덤한 방향으로 출발하게 힘을 줍니다.
        this.velX = 10 * (Math.random() > 0.5 ? 1 : -1);
        this.velY = 10 * (Math.random() > 0.5 ? 1 : -1);
      }
      return { isMobileMode: newMode };
    });
  };

  tick = () => {
    this.animationFrame = requestAnimationFrame(this.tick);

    const btnW = 100;
    const btnH = 40;
    const TOP_MARGIN = 85; // 상단 UI를 침범하지 않도록 설정한 투명한 벽

    const centerX = this.posX + btnW / 2;
    const centerY = this.posY + btnH / 2;

    const dist = Math.sqrt(Math.pow(this.mouseX - centerX, 2) + Math.pow(this.mouseY - centerY, 2));

    if (this.state.isMobileMode) {
      // 1. 모바일 모드: 일정한 속도로 계속 튕김 (마찰력 무시)
      const speed = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
      const targetSpeed = 20; // 버튼이 날아다니는 속도 (높일수록 어려워집니다)
      
      if (speed === 0) {
        this.velX = targetSpeed;
        this.velY = targetSpeed;
      } else {
        this.velX = (this.velX / speed) * targetSpeed;
        this.velY = (this.velY / speed) * targetSpeed;
      }
    } else {
      // 2. PC 모드: 마우스가 다가오면 도망감
      if (dist < 180) {
        const angle = Math.atan2(centerY - this.mouseY, centerX - this.mouseX);
        const force = (180 - dist) * 0.2; 
        this.velX += Math.cos(angle) * force;
        this.velY += Math.sin(angle) * force;
      }
      // PC 모드일 때만 마찰력을 적용해 천천히 멈추게 함
      this.velX *= 0.85;
      this.velY *= 0.85;
    }

    // 위치 업데이트
    this.posX += this.velX;
    this.posY += this.velY;

    // 3. 화면 밖 이탈 완벽 방지 (리사이즈 시에도 즉각 복귀)
    if (this.posY <= TOP_MARGIN) {
      this.posY = TOP_MARGIN; // 윗벽(85px)을 뚫고 나가면 강제로 끌어내림
      this.velY *= this.state.isMobileMode ? -1 : -1.2;
    } else if (this.posY + btnH >= window.innerHeight) {
      this.posY = window.innerHeight - btnH; // 바닥을 뚫으면 강제로 끌어올림
      this.velY *= this.state.isMobileMode ? -1 : -1.2;
    }

    if (this.posX <= 0) {
      this.posX = 0;
      this.velX *= this.state.isMobileMode ? -1 : -1.2;
    } else if (this.posX + btnW >= window.innerWidth) {
      this.posX = window.innerWidth - btnW;
      this.velX *= this.state.isMobileMode ? -1 : -1.2;
    }

    // DOM 직접 업데이트
    if (this.btnRef.current) {
      this.btnRef.current.style.left = `${this.posX}px`;
      this.btnRef.current.style.top = `${this.posY}px`;
    }

    const nextHovered = dist < 70;
    if (this.state.isHovered !== nextHovered) {
      this.setState({ isHovered: nextHovered });
    }
  };

  handleSuccess = () => {
    alert("🎯 잡았다! 대단해요!");
    this.setState({ successCount: this.state.successCount + 1 });
    // 잡았을 때 잠깐 멈춤
    this.velX = 0;
    this.velY = 0;
  };

  render() {
    return (
      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#000', color: '#fff', position: 'relative' }}>
        
        {/* 뒤로 가기 버튼 (위치 고정) */}
        <button 
          onClick={() => this.props.navigate('/')} 
          style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 16px', backgroundColor: '#3182f6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', zIndex: 10000, boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }}
        >
          ⬅️ 메인으로
        </button>

        {/* 모바일 모드 토글 버튼 추가 */}
        <button 
          onClick={this.toggleMobileMode} 
          style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px 16px', backgroundColor: this.state.isMobileMode ? '#ff4757' : '#2ed573', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', zIndex: 10000, boxShadow: '0 4px 6px rgba(0,0,0,0.5)', transition: 'background-color 0.3s' }}
        >
          {this.state.isMobileMode ? '📱 모바일 모드 (ON)' : '💻 PC 모드 (OFF)'}
        </button>

        <div style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
          <h1 style={{ color: 'cyan', margin: '0 0 10px 0' }}>CATCH THE BUTTON</h1>
          <h3>SCORE: {this.state.successCount}</h3>
        </div>

        <div className="d-flex justify-content-center align-items-center" style={{ height: '100%', pointerEvents: 'none' }}>
          <RS.Card style={{ width: '18rem', background: '#111', border: '1px solid #333', color: '#666', pointerEvents: 'auto' }}>
            <RS.CardBody className="text-center">
              <p>마우스가 닿으면 무조건 도망칩니다.</p>
              <p>모바일이시라면 우측 상단의<br/><strong style={{color:'#ff4757'}}>모바일 모드</strong>를 켜주세요!</p>
            </RS.CardBody>
          </RS.Card>
        </div>

        <button
          ref={this.btnRef}
          className="rainbow-btn"
          onClick={this.handleSuccess}
          onTouchStart={this.handleSuccess} // 모바일 터치 지원
          style={{
            position: 'absolute',
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

const App = () => {
  const navigate = useNavigate();
  return <CatchTheButtonGame navigate={navigate} />;
};

export default App;