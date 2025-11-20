import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { HandTrackingRef } from '../types';

interface CupProps {
  handPosRef: React.MutableRefObject<HandTrackingRef>;
  initialPosition?: [number, number, number];
}

const Cup: React.FC<CupProps> = ({ handPosRef, initialPosition = [2, -1, 0] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  
  const isHeld = useRef(false);
  const wasPinching = useRef(false);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const prevPos = useRef(new THREE.Vector3(...initialPosition));
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const hand = handPosRef.current;
    const isPinching = hand.isPresent && hand.isPinching;
    
    const handWorldX = (hand.x - 0.5) * viewport.width;
    const handWorldY = -(hand.y - 0.5) * viewport.height;
    const handWorldZ = hand.z;

    const handPos = new THREE.Vector3(handWorldX, handWorldY, handWorldZ);

    if (isHeld.current) {
      // --- HELD STATE ---
      groupRef.current.position.lerp(handPos, 0.4);

      const currentVel = new THREE.Vector3()
          .subVectors(groupRef.current.position, prevPos.current)
          .divideScalar(Math.max(delta, 0.001));
      
      // Tilt slightly when moving
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -currentVel.x * 0.1, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, currentVel.y * 0.1, 0.1);
      
      if (!isPinching) {
        isHeld.current = false;
        velocity.current.copy(currentVel).multiplyScalar(0.8);
      }
    } else {
      // --- FREE FALL STATE ---
      velocity.current.y -= 9.8 * delta; 

      groupRef.current.position.add(velocity.current.clone().multiplyScalar(delta));

      // Floor Collision
      if (groupRef.current.position.y < -2) {
        groupRef.current.position.y = -2;
        velocity.current.y *= -0.5; 
        velocity.current.x *= 0.6; 
        velocity.current.z *= 0.6;
      }
      
      // Upright stability
      if (Math.abs(velocity.current.y) < 0.1 && groupRef.current.position.y <= -1.9) {
          groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
          groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
      } else {
          groupRef.current.rotation.x += velocity.current.z * delta;
          groupRef.current.rotation.z -= velocity.current.x * delta;
      }

      // Cylinder Grab Check
      // Only trigger if user STARTS pinching this frame (Rising Edge)
      if (isPinching && !wasPinching.current) {
         const distXY = Math.sqrt(
             Math.pow(groupRef.current.position.x - handPos.x, 2) + 
             Math.pow(groupRef.current.position.y - handPos.y, 2)
         );
         const distZ = Math.abs(groupRef.current.position.z - handPos.z);

         if (distXY < 0.8 && distZ < 4.0) {
             isHeld.current = true;
         }
      }
    }

    prevPos.current.copy(groupRef.current.position);
    wasPinching.current = isPinching;
  });

  return (
    <group ref={groupRef} position={initialPosition}>
         {/* Mug Body */}
         <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.5, 32]} />
            <meshStandardMaterial color="#8d6e63" roughness={0.8} />
         </mesh>
         
         {/* Handle */}
         <mesh position={[0.25, 0.25, 0]} rotation={[0, 0, Math.PI/2]}>
            <torusGeometry args={[0.12, 0.04, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#5d4037" roughness={0.9} />
         </mesh>

         {/* Liquid */}
         <mesh position={[0, 0.45, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <circleGeometry args={[0.2, 32]} />
            <meshStandardMaterial color="#3e2723" roughness={0.2} metalness={0.1} />
         </mesh>
    </group>
  );
};

export default Cup;