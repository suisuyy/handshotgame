import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { HandTrackingRef } from '../types';

interface HandAvatarProps {
  handPosRef: React.MutableRefObject<HandTrackingRef>;
}

const HandAvatar: React.FC<HandAvatarProps> = ({ handPosRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;
    const { x, y, z, isPinching, isPresent } = handPosRef.current;
    
    if (!isPresent) {
        meshRef.current.visible = false;
        return;
    }
    meshRef.current.visible = true;

    // Convert normalized (0-1) to viewport coords
    const targetX = (x - 0.5) * viewport.width;
    const targetY = -(y - 0.5) * viewport.height;
    // Z is already in world units from useVisionLoop
    const targetZ = z;

    meshRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.3);
    
    // Visual feedback for pinch
    const targetScale = isPinching ? 0.8 : 1;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.2));
    
    (meshRef.current.material as THREE.MeshBasicMaterial).color.set(isPinching ? '#ffff00' : '#00f0ff');
  });

  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshBasicMaterial color="#00f0ff" wireframe />
      <pointLight distance={5} intensity={2} color="#00f0ff" />
    </mesh>
  );
};

export default HandAvatar;