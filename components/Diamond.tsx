import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { HandTrackingRef } from '../types';

interface DiamondProps {
  initialPosition: [number, number, number];
  onCollect: () => void;
  handPosRef: React.MutableRefObject<HandTrackingRef>;
}

const Diamond: React.FC<DiamondProps> = ({ initialPosition, onCollect, handPosRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  const isHeld = useRef(false);
  const wasPinching = useRef(false);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const collected = useRef(false);
  
  const prevHandPos = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const hand = handPosRef.current;
    const isPinching = hand.isPresent && hand.isPinching;
    
    const handWorldX = (hand.x - 0.5) * viewport.width;
    const handWorldY = -(hand.y - 0.5) * viewport.height;
    const handWorldZ = hand.z;
    
    const currentHandVector = new THREE.Vector3(handWorldX, handWorldY, handWorldZ);

    if (isHeld.current) {
      // --- GRABBED STATE ---
      meshRef.current.position.lerp(currentHandVector, 0.4);
      
      meshRef.current.rotation.x += 0.1;
      meshRef.current.rotation.y += 0.1;

      const moveDelta = currentHandVector.clone().sub(prevHandPos.current);
      const safeDelta = Math.max(delta, 0.01);
      velocity.current.copy(moveDelta.multiplyScalar(1 / safeDelta).multiplyScalar(0.8));

      if (!isPinching) {
        isHeld.current = false;
      }

    } else {
      // --- FREE FALL ---
      velocity.current.y -= 9.8 * delta; 

      meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta));
      velocity.current.multiplyScalar(0.98);

      if (meshRef.current.position.y < -3.5) {
        meshRef.current.position.y = -3.5;
        velocity.current.y *= -0.6; 
        velocity.current.x *= 0.8; 
        velocity.current.z *= 0.8;
      }

      if (Math.abs(meshRef.current.position.x) > viewport.width / 2) {
         velocity.current.x *= -0.8;
         meshRef.current.position.x = Math.sign(meshRef.current.position.x) * (viewport.width / 2 - 0.1);
      }
      if (Math.abs(meshRef.current.position.z) > 15) {
          velocity.current.z *= -0.5;
          meshRef.current.position.z = Math.sign(meshRef.current.position.z) * 14;
      }

      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;

      // Cylinder Grab Check
      // Only trigger if user STARTS pinching this frame (Rising Edge)
      if (isPinching && !wasPinching.current) {
         const distXY = Math.sqrt(
             Math.pow(meshRef.current.position.x - currentHandVector.x, 2) + 
             Math.pow(meshRef.current.position.y - currentHandVector.y, 2)
         );
         const distZ = Math.abs(meshRef.current.position.z - currentHandVector.z);

         if (distXY < 1.0 && distZ < 4.0) { 
             isHeld.current = true;
             if (!collected.current) {
                 collected.current = true;
                 onCollect();
             }
         }
      }
    }

    prevHandPos.current.copy(currentHandVector);
    wasPinching.current = isPinching;
  });

  return (
      <mesh ref={meshRef} position={initialPosition}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshPhysicalMaterial 
            roughness={0} 
            metalness={0.2} 
            transmission={0.9} 
            thickness={2}
            color="#ff00ff" 
            emissive="#550055"
            emissiveIntensity={0.5}
        />
      </mesh>
  );
};

export default Diamond;