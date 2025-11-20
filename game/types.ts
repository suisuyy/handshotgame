export type WeaponType = 'BLASTER' | 'SPREAD' | 'LASER' | 'MISSILE';

export interface Entity { 
  x: number; 
  y: number; 
  vx: number; 
  vy: number; 
  radius: number; 
  color: string; 
  id: number; 
  hp: number; 
  maxHp: number; 
}

export interface Enemy extends Entity { 
  type: 'DRONE' | 'INTERCEPTOR' | 'TANK' | 'BOSS'; 
  shootTimer: number; 
  scoreValue: number; 
}

export interface Bullet { 
  x: number; 
  y: number; 
  vx: number; 
  vy: number; 
  radius: number; 
  color: string; 
  id: number; 
  dmg: number; 
  type: 'PLAYER' | 'ENEMY'; 
  behavior?: 'homing'; 
}

export interface Particle { 
  x: number; 
  y: number; 
  vx: number; 
  vy: number; 
  life: number; 
  maxLife: number; 
  color: string; 
  size: number; 
  type: 'SPARK' | 'SMOKE' | 'GLOW'; 
}

export interface FloatingText { 
  x: number; 
  y: number; 
  text: string; 
  life: number; 
  color: string; 
  vy: number; 
}

export interface Powerup extends Entity { 
  weapon: WeaponType; 
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

export interface PlayerState {
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    weapon: WeaponType;
    energy: number;
    invulnerable: number;
    lastFire: number;
    targetId: number | null;
}

export interface GameState {
    wave: number;
    waveTimer: number;
    spawning: boolean;
    shake: number;
    flash: number;
}

export const WEAPONS: Record<WeaponType, { name: string; color: string; cooldown: number; damage: number }> = {
  BLASTER: { name: 'REPULSOR', color: '#fbbf24', cooldown: 6, damage: 15 },
  SPREAD: { name: 'MICRO-ROCKETS', color: '#22d3ee', cooldown: 12, damage: 10 },
  LASER: { name: 'UNIBEAM', color: '#10b981', cooldown: 3, damage: 4 },
  MISSILE: { name: 'SMART-BOMB', color: '#ec4899', cooldown: 25, damage: 50 },
};