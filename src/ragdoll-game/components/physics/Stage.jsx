import React, { useMemo } from 'react';
import { useGLTF, OrbitControls } from '@react-three/drei';

// =======================================================
// 1. 모델을 배치하기 위한 재사용 가능한 컴포넌트 (기존 placeModel 함수 역할)
// =======================================================
const Model = ({ fileName, position, scale = 1, rotationY = 0 }) => {
  // public/models/maps/ 경로에서 glb 파일을 로드합니다.
  const { scene } = useGLTF(`/models/maps/${fileName}.glb`);

  // 똑같은 모델(예: 잔디 패치)을 여러 번 쓸 때 오류가 나지 않도록 scene을 복제(clone)합니다.
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // 그림자 적용 (useMemo 안에서 한 번만 처리)
  useMemo(() => {
    clonedScene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      scale={[scale, scale, scale]}
      rotation={[0, rotationY, 0]}
    />
  );
};

// =======================================================
// 2. 전체 맵(스테이지)을 구성하는 메인 컴포넌트
// =======================================================
export default function Stage() {
  return (
    <>
      {/* 화면을 마우스로 돌려볼 수 있게 해줌 */}
      <OrbitControls />

      {/* 조명 설정 (자연스러운 캠핑장 느낌) */}
      <ambientLight intensity={0.6} color={0xffffff} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={0.8}
        color={0xffffff}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* 🏕️ 여기서부터 모델을 배치합니다! */}
      {/* [중앙 메인 캠프 구역] */}
      <Model fileName="tent" position={[0, 0, -3]} />
      <Model fileName="bedroll" position={[0, 0.1, -3]} />
      <Model fileName="campfire-pit" position={[0, 0, 1.5]} />
      <Model fileName="tree-log" position={[0, 0, 3]} rotationY={Math.PI / 2} />

      {/* [작업 및 수납 구역 (오른쪽)] */}
      <Model fileName="workbench" position={[4, 0, -1]} rotationY={-Math.PI / 4} />
      <Model fileName="chest" position={[3.5, 0, 1]} rotationY={-Math.PI / 6} />
      <Model fileName="barrel" position={[5, 0, 0]} />
      <Model fileName="barrel-open" position={[5.5, 0, -0.8]} />

      {/* [자연 환경 구역 (주변 배경)] */}
      <Model fileName="tree-tall" position={[-5, 0, -5]} scale={1.2} />
      <Model fileName="tree" position={[6, 0, -6]} rotationY={Math.PI / 3} />
      <Model fileName="tree-autumn" position={[-6, 0, 4]} scale={1.1} />
      <Model fileName="rock-a" position={[-4, 0, 2]} />
      <Model fileName="rock-b" position={[5, 0, 5]} scale={1.5} rotationY={Math.PI / 2} />

      {/* [바닥 (잔디 패치)] */}
      <Model fileName="patch-grass-large" position={[0, 0, 0]} scale={3} />
      <Model fileName="patch-grass-large" position={[-5, 0, 0]} scale={3} />
      <Model fileName="patch-grass-large" position={[5, 0, 0]} scale={3} />
    </>
  );
}