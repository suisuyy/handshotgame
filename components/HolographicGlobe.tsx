import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface HolographicGlobeProps {
  rotationDelta: { x: number; y: number };
  scale: number;
  isInteracting: boolean;
}

const HolographicGlobe: React.FC<HolographicGlobeProps> = ({ rotationDelta, scale, isInteracting }) => {
  const groupRef = useRef<THREE.Group>(null);
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Smooth interpolation state
  const currentScale = useRef(1);
  const targetScale = useRef(1);

  useEffect(() => {
    targetScale.current = scale;
  }, [scale]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Base auto-rotation
      if (!isInteracting) {
         groupRef.current.rotation.y += 0.002;
      } else {
         // Apply manual rotation from gestures
         // Invert X input for intuitive drag
         groupRef.current.rotation.y += rotationDelta.x * 5 * delta; 
         groupRef.current.rotation.x += rotationDelta.y * 5 * delta;
      }
      
      // Smooth scale transition
      currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, delta * 5);
      groupRef.current.scale.setScalar(currentScale.current);

      // Pulse effect for atmosphere
      if (atmosphereRef.current) {
         (atmosphereRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner Wireframe Globe */}
      <Sphere ref={globeRef} args={[1.5, 32, 32]}>
        <meshBasicMaterial 
          color="#00f0ff" 
          wireframe 
          transparent 
          opacity={0.3} 
        />
      </Sphere>

      {/* Outer Glow Shell */}
      <Sphere ref={atmosphereRef} args={[1.6, 32, 32]}>
        <meshBasicMaterial 
          color="#00a8a8" 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      
      {/* Random Data Points / Satellites */}
      {Array.from({ length: 8 }).map((_, i) => (
         <Satellite key={i} index={i} />
      ))}
    </group>
  );
};

const Satellite: React.FC<{ index: number }> = ({ index }) => {
  const ref = useRef<THREE.Mesh>(null);
  const speed = 0.2 + Math.random() * 0.5;
  const offset = Math.random() * Math.PI * 2;
  const radius = 1.8 + Math.random() * 0.5;

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime * speed + offset;
      // Orbit logic
      ref.current.position.set(
          Math.sin(time) * radius,
          Math.cos(time * 0.8) * radius,
          Math.sin(time * 1.2) * radius
      );
      ref.current.rotation.set(time, time, time);
    }
  });

  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.05, 0]} />
      <meshBasicMaterial color="#ffffff" wireframe />
    </mesh>
  );
}

export default HolographicGlobe;