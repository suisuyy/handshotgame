import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { HandTrackingRef } from '../types';

interface SwordProps {
  handPosRef: React.MutableRefObject<HandTrackingRef>;
  initialPosition?: [number, number, number];
}

const Sword: React.FC<SwordProps> = ({ handPosRef, initialPosition = [0, 0, 0] }) => {
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
      // Tighter lerp (0.4) for responsive movement
      groupRef.current.position.lerp(handPos, 0.4);

      const currentVel = new THREE.Vector3()
          .subVectors(groupRef.current.position, prevPos.current)
          .divideScalar(Math.max(delta, 0.001));
      
      // Sword orientation logic - Dynamic swing
      const targetRotZ = -currentVel.x * 0.1; 
      const targetRotX = currentVel.y * 0.1;  

      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, 0.2);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.2);
      
      if (!isPinching) {
        isHeld.current = false;
        velocity.current.copy(currentVel).multiplyScalar(0.8); // Retain momentum
      }
    } else {
      // --- FREE FALL STATE ---
      velocity.current.y -= 9.8 * delta; 

      groupRef.current.position.add(velocity.current.clone().multiplyScalar(delta));

      if (groupRef.current.position.y < -2) {
        groupRef.current.position.y = -2;
        velocity.current.y *= -0.4; 
        velocity.current.x *= 0.6; 
        velocity.current.z *= 0.6;
      }
      
      // Lay flat when stopped
      if (groupRef.current.position.y <= -1.9 && velocity.current.length() < 0.1) {
           groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.PI/2, 0.1); 
           groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
      } else {
           groupRef.current.rotation.x += velocity.current.z * delta;
           groupRef.current.rotation.z -= velocity.current.x * delta;
      }

      // Check Pickup with Cylinder Logic
      // Only trigger if user STARTS pinching this frame (Rising Edge)
      if (isPinching && !wasPinching.current) {
         const distXY = Math.sqrt(
             Math.pow(groupRef.current.position.x - handPos.x, 2) + 
             Math.pow(groupRef.current.position.y - handPos.y, 2)
         );
         const distZ = Math.abs(groupRef.current.position.z - handPos.z);

         // If hand is visually over the item (XY < 1.0) and reasonably close in depth (Z < 4.0)
         if (distXY < 1.0 && distZ < 4.0) {
             isHeld.current = true;
             // Reset rotation when picked up for better grip feel
             groupRef.current.rotation.set(0,0,0);
         }
      }
    }

    prevPos.current.copy(groupRef.current.position);
    wasPinching.current = isPinching;
  });

  return (
    <group ref={groupRef} position={initialPosition}>
         <Trail 
            width={0.6} 
            length={4} 
            color="#ffffff" 
            attenuation={(t) => t * t}
         >
            {/* Blade */}
            <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[0.14, 2.5, 0.03]} />
                <meshStandardMaterial 
                    color="#e0e0e0" 
                    metalness={0.9} 
                    roughness={0.2}
                />
            </mesh>
         </Trail>
         
         {/* Crossguard */}
         <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.6, 0.08, 0.1]} />
            <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
         </mesh>

         {/* Hilt */}
         <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 0.8]} />
            <meshStandardMaterial color="#5d4037" roughness={0.9} />
         </mesh>
         
         {/* Pommel */}
         <mesh position={[0, -0.85, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
         </mesh>
    </group>
  );
};

export default Sword;