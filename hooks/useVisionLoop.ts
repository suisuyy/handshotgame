import { useEffect, useRef, useState } from 'react';
import { getFaceLandmarker, getHandLandmarker } from '../services/visionService';
import { calculateScreenMapping, drawHandSkeleton } from '../services/renderUtils';
import { HeadTrackingState, Point, HandTrackingRef } from '../types';

const distance = (p1: Point, p2: Point) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
};

interface UseVisionLoopProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    isLoading: boolean;
}

export const useVisionLoop = ({ videoRef, canvasRef, isLoading }: UseVisionLoopProps) => {
  const requestRef = useRef<number | null>(null);
  const [fps, setFps] = useState(0);
  const [headState, setHeadState] = useState<HeadTrackingState>({
    detected: false,
    position: { x: 0.5, y: 0.5 },
    tilt: 0
  });
  const [isInteracting, setIsInteracting] = useState(false);
  
  // Shared ref for 3D scene to access hand position and gesture state
  const handPosRef = useRef<HandTrackingRef>({ 
      x: 0.5, 
      y: 0.5, 
      z: 0, 
      isPinching: false, 
      isPresent: false 
  });

  const previousTimeRef = useRef<number | null>(null);
  const lastFpsUpdateRef = useRef<number>(0);
  
  // Pinch debounce state
  const pinchCounter = useRef(0);

  useEffect(() => {
    if (isLoading) return;

    const animate = (time: number) => {
        if (previousTimeRef.current !== null) {
            const deltaTime = time - previousTimeRef.current;
            if (time - lastFpsUpdateRef.current > 500) {
                setFps(Math.round(1000 / deltaTime));
                lastFpsUpdateRef.current = time;
            }
        }
        previousTimeRef.current = time;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video && !video.paused && video.videoWidth > 0 && canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                 const { toScreen } = calculateScreenMapping(video, canvas);
                 
                 ctx.clearRect(0, 0, canvas.width, canvas.height);

                 // Face Tracking
                 const faceLandmarker = getFaceLandmarker();
                 if (faceLandmarker) {
                    const result = faceLandmarker.detectForVideo(video, performance.now());
                    if (result.faceLandmarks.length > 0) {
                        const landmarks = result.faceLandmarks[0];
                        const nose = landmarks[1];
                        setHeadState({
                            detected: true,
                            position: { x: 1 - nose.x, y: nose.y },
                            tilt: (result.faceBlendshapes[0]?.categories?.find(c => c.categoryName === 'headPitch')?.score || 0)
                        });
                    } else {
                        setHeadState(prev => ({ ...prev, detected: false }));
                    }
                 }

                 // Hand Tracking
                 const handLandmarker = getHandLandmarker();
                 let isPhysicallyPinching = false;
                 
                 if (handLandmarker) {
                    const result = handLandmarker.detectForVideo(video, performance.now());
                    
                    // Draw skeleton for visual feedback
                    for (const landmarks of result.landmarks) {
                        // Calculate pinch locally for visualization
                        const d = distance(landmarks[4], landmarks[8]);
                        const isPinchingVisually = d < 0.08;
                        drawHandSkeleton(ctx, landmarks, toScreen, isPinchingVisually);
                    }

                    if (result.landmarks.length > 0) {
                        const hand = result.landmarks[0];
                        const indexTip = hand[8]; 
                        const thumbTip = hand[4];
                        const wrist = hand[0];
                        const middleMCP = hand[9];
                        
                        // 1. Calculate Pinch State with relaxed threshold
                        const pinchDist = distance(thumbTip, indexTip);
                        // Increased from 0.06 to 0.08 for easier grabbing
                        isPhysicallyPinching = pinchDist < 0.08; 

                        // 2. Calculate Center of Interaction (Midpoint of pinch)
                        const pinchX = (indexTip.x + thumbTip.x) / 2;
                        const pinchY = (indexTip.y + thumbTip.y) / 2;

                        // 3. Estimate Depth (Z)
                        // Calculate hand size relative to frame
                        const handSize = Math.sqrt(
                            Math.pow(wrist.x - middleMCP.x, 2) + 
                            Math.pow(wrist.y - middleMCP.y, 2)
                        );

                        // Inverted Z Mapping:
                        // Larger hand (closer to cam) -> More Negative Z (Deeper in scene)
                        // Smaller hand (farther from cam) -> More Positive Z (Closer to viewer/camera)
                        // Calibration: 
                        // Size 0.05 (Far) -> Z = 8 (Near Camera)
                        // Size 0.20 (Close) -> Z = -4 (In Scene)
                        // This enables "Reaching In" logic
                        const zDepth = 12 - (handSize * 80);
                        const clampedZ = Math.max(-10, Math.min(10, zDepth));

                        // Pinch Debounce Logic
                        if (isPhysicallyPinching) {
                             pinchCounter.current = Math.min(pinchCounter.current + 2, 10);
                        } else {
                             pinchCounter.current = Math.max(pinchCounter.current - 1, 0);
                        }
                        
                        // Consider "pinching" if counter is high enough
                        const smoothedPinch = pinchCounter.current > 0;

                        // Update Ref for 3D Scene
                        handPosRef.current = { 
                            x: 1 - pinchX, 
                            y: pinchY, 
                            z: clampedZ, 
                            isPinching: smoothedPinch,
                            isPresent: true
                        };

                    } else {
                        // Signal lost tracking
                        handPosRef.current.isPresent = false;
                        pinchCounter.current = 0;
                    }
                 }
                 setIsInteracting(handPosRef.current.isPinching);
            }
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoading, videoRef, canvasRef]);

  return { fps, headState, isInteracting, handPosRef };
};