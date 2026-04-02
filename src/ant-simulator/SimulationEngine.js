// src/ant-simulator/SimulationEngine.js

export class SimulationEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    // 시뮬레이션 설정
    this.antCount = 1500; // 개미 수
    this.cellSize = 4; // 페로몬 그리드 해상도 (픽셀)
    this.gridCols = Math.ceil(this.width / this.cellSize);
    this.gridRows = Math.ceil(this.height / this.cellSize);
    
    // 페로몬 맵 (1D 배열로 메모리 및 속도 최적화)
    this.foodPheromones = new Float32Array(this.gridCols * this.gridRows);
    this.homePheromones = new Float32Array(this.gridCols * this.gridRows);
    
    // 환경 설정
    this.nest = { x: this.width / 2, y: this.height / 2, radius: 30 };
    this.foods = [];
    this.ants = [];
    this.isRunning = true;
    this.animationId = null;

    this.init();
  }

  init() {
    // 먹이 생성
    this.spawnFood();
    this.spawnFood();
    this.spawnFood();

    // 개미 생성
    for (let i = 0; i < this.antCount; i++) {
      this.ants.push({
        x: this.nest.x,
        y: this.nest.y,
        angle: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 0.5,
        hasFood: false,
        wanderStrength: 0.2
      });
    }

    this.loop();
  }

  spawnFood() {
    const padding = 50;
    this.foods.push({
      x: padding + Math.random() * (this.width - padding * 2),
      y: padding + Math.random() * (this.height - padding * 2),
      radius: 20,
      amount: 1000 // 먹이 잔량
    });
  }

  getGridIndex(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    if (col < 0 || col >= this.gridCols || row < 0 || row >= this.gridRows) return -1;
    return row * this.gridCols + col;
  }

  sensePheromone(ant, angleOffset, type) {
    const sensorDist = 22; // 더듬이 길이 (페로몬 감지 거리)
    const sensorX = ant.x + Math.cos(ant.angle + angleOffset) * sensorDist;
    const sensorY = ant.y + Math.sin(ant.angle + angleOffset) * sensorDist;
    const idx = this.getGridIndex(sensorX, sensorY);
    
    if (idx === -1) return 0;
    return type === 'food' ? this.foodPheromones[idx] : this.homePheromones[idx];
  }

  update() {
    // 1. 페로몬 증발 (Decay)
    for (let i = 0; i < this.foodPheromones.length; i++) {
      this.foodPheromones[i] *= 0.99; // 먹이 페로몬 증발률
      this.homePheromones[i] *= 0.995; // 집 페로몬 증발률
    }

    // 2. 개미 로직 업데이트
    for (let i = this.ants.length - 1; i >= 0; i--) {
      const ant = this.ants[i];
      const idx = this.getGridIndex(ant.x, ant.y);

      if (ant.hasFood) {
        // [먹이가 있을 때] -> 집으로 돌아감
        if (idx !== -1) this.foodPheromones[idx] = Math.min(this.foodPheromones[idx] + 10, 255); // 먹이 페로몬 뿌리기

        const dx = this.nest.x - ant.x;
        const dy = this.nest.y - ant.y;
        const distToNest = Math.sqrt(dx * dx + dy * dy);

        if (distToNest < this.nest.radius) {
          ant.hasFood = false;
          ant.angle += Math.PI; // 뒤로 돌기
        } else {
          // 집 방향으로 직진
          const targetAngle = Math.atan2(dy, dx);
          ant.angle += (targetAngle - ant.angle) * 0.1; 
        }
      } else {
        // [먹이가 없을 때] -> 먹이를 찾음
        if (idx !== -1) this.homePheromones[idx] = Math.min(this.homePheromones[idx] + 2, 255); // 집 페로몬 뿌리기

        // 시야(Vision) 체크
        let seeFood = false;
        for (let j = 0; j < this.foods.length; j++) {
          const food = this.foods[j];
          if (food.amount <= 0) continue;
          
          const dx = food.x - ant.x;
          const dy = food.y - ant.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // 먹이가 시야 반경(45픽셀) 안에 들어오면
          if (dist < 45 + food.radius) {
            // 타겟을 향해 부드럽게 방향을 틂 (Steering)
            const targetAngle = Math.atan2(dy, dx);
            ant.angle += (targetAngle - ant.angle) * 0.2; 
            seeFood = true;
            break;
          }
        }

        // 시야에 먹이가 없을 때만 페로몬 탐색
        if (!seeFood) {
          // 센서 각도를 약간 더 넓게 벌림 (-0.6, 0.6)
          const left = this.sensePheromone(ant, -0.6, 'food');
          const center = this.sensePheromone(ant, 0, 'food');
          const right = this.sensePheromone(ant, 0.6, 'food');

          if (center > left && center > right) {
            // 정면 냄새가 제일 강하면 직진
          } else if (left > right) {
            ant.angle -= 0.25; // 좌회전
          } else if (right > left) {
            ant.angle += 0.25; // 우회전
          } else {
            // 아무 냄새도 없으면 무작위 방황
            ant.angle += (Math.random() - 0.5) * ant.wanderStrength;
          }
        }

        // 먹이 획득 판정
        for (let j = 0; j < this.foods.length; j++) {
          const food = this.foods[j];
          if (food.amount <= 0) continue;
          const dx = food.x - ant.x;
          const dy = food.y - ant.y;
          if (dx * dx + dy * dy < food.radius * food.radius) {
            ant.hasFood = true;
            ant.angle += Math.PI; // 뒤로 돌기
            food.amount--;
            break;
          }
        }
      }

      // 이동
      ant.x += Math.cos(ant.angle) * ant.speed;
      ant.y += Math.sin(ant.angle) * ant.speed;

      // 벽 충돌 (화면 밖으로 나가지 않게)
      if (ant.x < 0 || ant.x > this.width) { ant.angle = Math.PI - ant.angle; ant.x = Math.max(0, Math.min(this.width, ant.x)); }
      if (ant.y < 0 || ant.y > this.height) { ant.angle = -ant.angle; ant.y = Math.max(0, Math.min(this.height, ant.y)); }
    }

    // 소진된 먹이 제거 및 리스폰
    this.foods = this.foods.filter(f => f.amount > 0);
    if (this.foods.length < 3 && Math.random() < 0.005) {
      this.spawnFood();
    }
  }

  draw() {
    // 배경 초기화
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 페로몬 렌더링 (최적화를 위해 직접 픽셀을 그리지 않고, 일정 농도 이상만 사각형으로 그림)
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const idx = r * this.gridCols + c;
        const foodPhero = this.foodPheromones[idx];
        
        if (foodPhero > 5) {
          this.ctx.fillStyle = `rgba(0, 255, 100, ${foodPhero / 255})`;
          this.ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
        }
      }
    }

    // 개미집 그리기
    this.ctx.beginPath();
    this.ctx.arc(this.nest.x, this.nest.y, this.nest.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#4444ff';
    this.ctx.fill();
    this.ctx.strokeStyle = '#6666ff';
    this.ctx.stroke();

    // 먹이 그리기
    this.foods.forEach(food => {
      this.ctx.beginPath();
      this.ctx.arc(food.x, food.y, food.radius * (food.amount / 1000), 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffcc00';
      this.ctx.fill();
    });

    // 개미 그리기
    this.ctx.fillStyle = '#ffffff';
    for (let i = 0; i < this.ants.length; i++) {
      const ant = this.ants[i];
      this.ctx.fillStyle = ant.hasFood ? '#ff5555' : '#ffffff';
      this.ctx.fillRect(ant.x, ant.y, 2, 2);
    }
  }

  loop = () => {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.isRunning = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}