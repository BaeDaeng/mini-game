import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { OrbitControls } from '@react-three/drei';
import Stage from './components/physics/Stage';
import Player from './components/physics/Player';
import './styles/game.css';

export default function RagdollGame() {
  return (
    <div className="ragdoll-game-wrapper">
      {/* UI 레이어 */}
      <div className="ragdoll-ui-container">
        <h1 className="game-title">흐느적 대환장 난투극</h1>
      </div>

      {/* 3D 캔버스 레이어 */}
      <Canvas shadows camera={{ position: [0, 10, 20], fov: 45 }}>
        <Suspense fallback={null}>
          <Physics debug> {/* debug 속성을 넣으면 물리 충돌 영역이 선으로 보입니다 */}
            <Stage />
            <Player type="humanMaleA" position={[0, 5, 0]} />
          </Physics>
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}