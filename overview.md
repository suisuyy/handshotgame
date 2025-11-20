# Project Overview: JARVIS HUD

## Status
Current Phase: **Arcade Shooter Integration**
The application has been transformed into a **2D Space Shooter** controlled via AR hand gestures. The user pilots a ship using hand coordinates, fires varied weapons with pinch gestures, and utilizes special abilities with open-hand gestures. The aesthetic is a "Cute & Clean" neon sci-fi style.

## Core Features
- **Hand Tracking Control**: 
  - **Move**: Hand X/Y maps to ship position.
  - **Fire**: Pinch (Index+Thumb) activates primary weapon.
  - **Special**: Open hand activates auto-targeting Lightning (consumes Energy).
- **Game Mechanics**:
  - **Weapons**: 4 switchable types (Blaster, Spread, Laser, Missile) via powerups.
  - **Enemies**: 3 types (Basic, Chaser, Tank) with cute geometric designs.
  - **Score & Health**: Real-time HUD tracking.
- **Visuals**:
  - Canvas-based particle systems (explosions, trails).
  - Parallax starfield background.
  - Clean neon HUD overlay.
- **AI System**: Gemini-powered system logs providing combat analysis.

## Project Structure

### Root
- `index.html`: Entry point.
- `index.tsx`: React Entry point.
- `App.tsx`: Main controller, manages GameScene and HUD state.
- `types.ts`: Shared TypeScript interfaces.

### Components
- `components/GameScene.tsx`: **Core Game Loop**. Handles all 2D rendering, physics, and game logic (Shooter).
- `components/HUD.tsx`: Updated 2D UI layer showing Score, Health, Weapon, and Logs.
- `components/VideoOverlay.tsx`: Subtle CRT/Scanline effect.
- `components/LoadingScreen.tsx`: Initial loading state.
- *(Deprecated/Unused)*: `Sword.tsx`, `Cup.tsx`, `Diamond.tsx`, `HandAvatar.tsx` (Files exist but logic moved to 2D Canvas).

### Services
- `services/visionService.ts`: MediaPipe setup.
- `services/geminiService.ts`: Google GenAI integration.
- `services/renderUtils.ts`: Canvas drawing utilities for debug skeleton.

### Hooks
- `hooks/useVisionLoop.ts`: Main vision processing loop.
- `hooks/useSystem.ts`: AI/Log management.
- `hooks/useWebcam.ts`: Camera setup.

## Key Tech Stack
- React 19
- HTML5 Canvas (2D Context) for Game Engine
- MediaPipe Tasks Vision
- Google GenAI SDK
- TailwindCSS