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
    this.mouseX = -1000; 
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

  toggleMobileMode = () => {
    this.setState((prevState) => {
      const newMode = !prevState.isMobileMode;
      if (newMode) {
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
    const TOP_MARGIN = 85; 

    const centerX = this.posX + btnW / 2;
    const centerY = this.posY + btnH / 2;

    const dist = Math.sqrt(Math.pow(this.mouseX - centerX, 2) + Math.pow(this.mouseY - centerY, 2));

    if (this.state.isMobileMode) {
      const speed = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
      const targetSpeed = 20; 
      
      if (speed === 0) {
        this.velX = targetSpeed;
        this.velY = targetSpeed;
      } else {
        this.velX = (this.velX / speed) * targetSpeed;
        this.velY = (this.velY / speed) * targetSpeed;
      }
    } else {
      if (dist < 180) {
        const angle = Math.atan2(centerY - this.mouseY, centerX - this.mouseX);
        const force = (180 - dist) * 0.2; 
        this.velX += Math.cos(angle) * force;
        this.velY += Math.sin(angle) * force;
      }
      this.velX *= 0.85;
      this.velY *= 0.85;
    }

    this.posX += this.velX;
    this.posY += this.velY;

    let hitWall = false; 

    if (this.posY <= TOP_MARGIN) {
      this.posY = TOP_MARGIN;
      hitWall = true;
      if (this.state.isMobileMode) this.velY = Math.abs(this.velY); 
      else this.velY *= -1.2;
    } else if (this.posY + btnH >= window.innerHeight) {
      this.posY = window.innerHeight - btnH;
      hitWall = true;
      if (this.state.isMobileMode) this.velY = -Math.abs(this.velY);
      else this.velY *= -1.2;
    }

    if (this.posX <= 0) {
      this.posX = 0;
      hitWall = true;
      if (this.state.isMobileMode) this.velX = Math.abs(this.velX);
      else this.velX *= -1.2;
    } else if (this.posX + btnW >= window.innerWidth) {
      this.posX = window.innerWidth - btnW;
      hitWall = true;
      if (this.state.isMobileMode) this.velX = -Math.abs(this.velX);
      else this.velX *= -1.2;
    }

    // 모바일 모드 랜덤 비틀기
    if (this.state.isMobileMode && hitWall) {
      const targetSpeed = 12; 
      let angle = Math.atan2(this.velY, this.velX); 
      const noise = (Math.random() - 0.5) * (Math.PI / 2);
      angle += noise;
      this.velX = Math.cos(angle) * targetSpeed;
      this.velY = Math.sin(angle) * targetSpeed;

      if (this.posY === TOP_MARGIN && this.velY < 0) this.velY = Math.abs(this.velY);
      if (this.posY === window.innerHeight - btnH && this.velY > 0) this.velY = -Math.abs(this.velY);
      if (this.posX === 0 && this.velX < 0) this.velX = Math.abs(this.velX);
      if (this.posX === window.innerWidth - btnW && this.velX > 0) this.velX = -Math.abs(this.velX);
    }

    // 🔥 핵심: PC 모드 "코너 탈출(Dash)" 로직 추가!
    const isNearLeft = this.posX <= 5;
    const isNearRight = this.posX + btnW >= window.innerWidth - 5;
    const isNearTop = this.posY <= TOP_MARGIN + 5;
    const isNearBottom = this.posY + btnH >= window.innerHeight - 5;
    
    // 버튼이 가로 벽과 세로 벽 양쪽에 모두 맞닿았을 때 (코너에 몰렸을 때)
    const isCornered = (isNearLeft || isNearRight) && (isNearTop || isNearBottom);

    if (!this.state.isMobileMode && isCornered) {
      const escapeSpeed = 28; // 확 도망가도록 속도를 강하게 줍니다.
      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;
      
      // 화면 중앙을 향하는 각도 계산
      let angleToCenter = Math.atan2(screenCenterY - this.posY, screenCenterX - this.posX);
      
      // 완벽히 중앙으로만 가면 예측 가능하므로 ±45도 랜덤하게 비틉니다.
      const noise = (Math.random() - 0.5) * (Math.PI / 2); 
      angleToCenter += noise;

      // 강력한 탈출 속도 적용
      this.velX = Math.cos(angleToCenter) * escapeSpeed;
      this.velY = Math.sin(angleToCenter) * escapeSpeed;
      
      // 코너에 계속 비벼지면서 갇히는 현상 방지를 위해 좌표를 살짝 안쪽으로 밀어줍니다.
      if (isNearLeft) this.posX = 15;
      if (isNearRight) this.posX = window.innerWidth - btnW - 15;
      if (isNearTop) this.posY = TOP_MARGIN + 15;
      if (isNearBottom) this.posY = window.innerHeight - btnH - 15;
    }

    if (this.btnRef.current) {
      this.btnRef.current.style.left = `${this.posX}px`;
      this.btnRef.current.style.top = `${this.posY}px`;
    }

    const nextHovered = dist < 70;
    if (this.state.isHovered !== nextHovered) {
      this.setState({ isHovered: nextHovered });
    }
  };

  handleSuccess = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    alert("🎯 잡았다! 대단해요!");
    this.setState({ successCount: this.state.successCount + 1 });
    this.velX = 0;
    this.velY = 0;

    if (this.btnRef.current) {
      this.btnRef.current.blur();
    }
  };

  render() {
    return (
      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#000', color: '#fff', position: 'relative' }}>
        
        <button 
          onClick={() => this.props.navigate('/')} 
          style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 16px', backgroundColor: '#3182f6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', zIndex: 10000, boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }}
        >
          ⬅️ 메인으로
        </button>

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
              <p>PC라시면 스페이스바도 작동합니다.</p>
              <p>모바일이시라면 우측 상단의<br/><strong style={{color:'#ff4757'}}>모바일 모드</strong>를 켜주세요!</p>
            </RS.CardBody>
          </RS.Card>
        </div>

        <button
          ref={this.btnRef}
          className="rainbow-btn"
          onClick={this.handleSuccess}
          onTouchStart={this.handleSuccess} 
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