import React, { useRef, useEffect, useState, useCallback } from 'react';
import { generateSystemLog } from './services/geminiService';
import HUD from './components/HUD';
import LoadingScreen from './components/LoadingScreen';
import VideoOverlay from './components/VideoOverlay';
import GameScene from './components/GameScene';
import { useSystem } from './hooks/useSystem';
import { useWebcam } from './hooks/useWebcam';
import { useVisionLoop } from './hooks/useVisionLoop';

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [weapon, setWeapon] = useState('BLASTER');
  const [wave, setWave] = useState(1);

  // Initialize System (Logs & AI)
  const { isLoading, logs, addLog } = useSystem();
  
  // Initialize Webcam
  useWebcam(videoRef, canvasRef);

  // Run Vision Loop (State & Render)
  const { fps, headState, isInteracting, handPosRef } = useVisionLoop({ 
    videoRef, canvasRef, isLoading 
  });

  const handleScore = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  const handleGameState = useCallback((newHealth: number, currentWeapon: string, currentWave: number) => {
    setHealth(newHealth);
    setWeapon(currentWeapon);
    setWave(currentWave);
  }, []);

  // AI Log Logic
  useEffect(() => {
    if (isLoading) return;
    
    // Initial Greeting
    addLog("MARK VII HUD ONLINE", "success");

    // Reduced frequency to avoid 429 errors
    const interval = setInterval(async () => {
      const context = isInteracting 
        ? `Combat Mode. Wave: ${wave}. Weapon: ${weapon}. Hull: ${health}%.` 
        : "Standby. Systems Nominal.";
      
      const message = await generateSystemLog(context);
      addLog(message, 'analysis');
    }, 25000); // Increased to 25 seconds

    return () => clearInterval(interval);
  }, [isLoading, isInteracting, addLog, wave, weapon, health]);

  return (
    <div className="relative w-screen h-screen bg-black text-white overflow-hidden font-tech">
      {/* Layer 1: 2D Game World */}
      <GameScene 
        handPosRef={handPosRef} 
        onScore={handleScore} 
        onGameState={handleGameState}
        addLog={addLog}
      />

      {/* Layer 2: Hidden Real World (Tracking Only) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-0 pointer-events-none z-0"
        playsInline
        muted
      />
      
      {/* Layer 3: Skeleton Analysis (Canvas) - Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-30 mix-blend-screen"
      />
      
      {/* Layer 4: Overlays & HUD */}
      <VideoOverlay />
      
      {isLoading && <LoadingScreen />}
      
      <HUD 
        headState={headState} 
        logs={logs} 
        fps={fps} 
        score={score} 
        health={health}
        weapon={weapon}
        wave={wave}
      />
    </div>
  );
}