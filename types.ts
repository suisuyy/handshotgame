export interface Point {
  x: number;
  y: number;
  z: number;
}

export interface HandGestureState {
  isPinching: boolean;
  pinchDistance: number;
  handPosition: Point;
  rotationDelta: { x: number; y: number };
  scaleDelta: number;
}

export interface HeadTrackingState {
  detected: boolean;
  position: { x: number; y: number }; // Normalized 0-1
  tilt: number; // Radians
}

export interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'analysis' | 'success';
}

export interface HandTrackingRef {
  x: number;
  y: number;
  z: number;
  isPinching: boolean;
  isPresent: boolean;
}

export enum ControlMode {
  IDLE = 'IDLE',
  ROTATING = 'ROTATING',
  SCALING = 'SCALING'
}