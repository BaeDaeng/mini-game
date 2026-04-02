import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function Player({ type = 'humanMaleA', position = [0, 5, 0] }) {
  const { scene } = useGLTF(`/models/players/${type}.glb`);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return (
    <RigidBody position={position} colliders="cuboid" enabledRotations={[false, true, false]}>
      <primitive object={clonedScene} />
    </RigidBody>
  );
}