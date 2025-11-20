import React, { useRef, useEffect } from 'react';
import { HandTrackingRef, SystemLog } from '../types';
import { Enemy, Bullet, Particle, Powerup, FloatingText, Star, PlayerState, GameState, WEAPONS, WeaponType } from '../game/types';
import { renderGame } from '../game/renderSystem';

interface GameSceneProps {
  handPosRef: React.MutableRefObject<HandTrackingRef>;
  onScore: (points: number) => void;
  onGameState: (health: number, weapon: string, wave: number) => void;
  addLog: (msg: string, type: SystemLog['type']) => void;
}

export default function GameScene({ handPosRef, onScore, onGameState, addLog }: GameSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // --- GAME STATE ---
  const gameState = useRef<GameState>({
    wave: 0, // Start at 0 so logic triggers Wave 1 immediately
    waveTimer: 0,
    spawning: false, // Start false to allow "Wave Complete" check to run
    shake: 0,
    flash: 0,
  });

  const playerRef = useRef<PlayerState>({
    x: 0, y: 0, 
    hp: 100, maxHp: 100,
    weapon: 'BLASTER',
    energy: 100,
    invulnerable: 0,
    lastFire: 0,
    targetId: null
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const textsRef = useRef<FloatingText[]>([]);
  const starsRef = useRef<Star[]>([]);
  
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    function initStars(w: number, h: number) {
      starsRef.current = Array.from({ length: 150 }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 4 + 0.5,
        brightness: Math.random()
      }));
    }

    const addShake = (amount: number) => {
      gameState.current.shake = Math.min(gameState.current.shake + amount, 30);
    };

    const addText = (x: number, y: number, text: string, color: string = '#fff') => {
      textsRef.current.push({ x, y, text, life: 1.0, color, vy: -1 - Math.random() });
    };

    const spawnExplosion = (x: number, y: number, color: string, size: number) => {
      const count = size * 5;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (size / 3) + 1;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0, maxLife: 1.0,
          color: i % 2 === 0 ? color : '#ffffff',
          size: Math.random() * 3 + 1,
          type: 'SPARK'
        });
      }
      for (let i = 0; i < size; i++) {
        particlesRef.current.push({
           x: x + (Math.random()-0.5)*20, y: y + (Math.random()-0.5)*20,
           vx: (Math.random()-0.5), vy: (Math.random()-0.5),
           life: 1.5, maxLife: 1.5,
           color: '#555555', size: Math.random() * 10 + 5,
           type: 'SMOKE'
        });
      }
    };

    const spawnWave = () => {
       const wave = gameState.current.wave;
       const budget = wave * 10 + 10;
       let spent = 0;
       
       addLog(`WARNING: INCOMING WAVE ${wave}`, 'warning');
       addText(canvas.width/2, canvas.height/3, `WAVE ${wave}`, '#ffff00');

       const spawnEnemy = () => {
          if (spent >= budget) {
             gameState.current.spawning = false;
             return;
          }

          const w = canvas.width;
          const typeRoll = Math.random();
          let enemyType: Enemy['type'] = 'DRONE';
          let cost = 1;

          if (wave % 5 === 0 && spent === 0) {
             enemyType = 'BOSS';
             cost = budget;
          } else {
             if (typeRoll < 0.6) { enemyType = 'DRONE'; cost = 2; }
             else if (typeRoll < 0.85) { enemyType = 'INTERCEPTOR'; cost = 4; }
             else { enemyType = 'TANK'; cost = 8; }
          }

          if (spent + cost <= budget) {
             spent += cost;
             const x = Math.random() * (w - 100) + 50;
             
             let hp = 0, radius = 0, color = '', speed = 0;
             if (enemyType === 'DRONE') { hp = 20 + wave*2; radius = 15; color = '#10b981'; speed = 2; }
             if (enemyType === 'INTERCEPTOR') { hp = 15 + wave*2; radius = 12; color = '#a855f7'; speed = 4; }
             if (enemyType === 'TANK') { hp = 80 + wave*10; radius = 25; color = '#f97316'; speed = 1; }
             if (enemyType === 'BOSS') { hp = 500 + wave*50; radius = 60; color = '#ef4444'; speed = 0.5; }

             enemiesRef.current.push({
                id: Math.random(), x, y: -radius * 2,
                vx: (Math.random()-0.5) * speed, vy: speed,
                radius, color, hp, maxHp: hp, type: enemyType,
                shootTimer: Math.random() * 100, scoreValue: cost * 10
             });
             setTimeout(spawnEnemy, 500);
          } else {
            gameState.current.spawning = false;
          }
       };
       spawnEnemy();
    };

    const loop = () => {
      frameRef.current++;
      const w = canvas.width;
      const h = canvas.height;
      const hand = handPosRef.current;

      // Spawning System
      if (enemiesRef.current.length === 0 && !gameState.current.spawning) {
         if (gameState.current.waveTimer === 0) gameState.current.waveTimer = 60; // Short initial delay
         gameState.current.waveTimer--;
         if (gameState.current.waveTimer <= 0) {
            gameState.current.wave++;
            gameState.current.spawning = true;
            spawnWave();
            if (gameState.current.wave > 1) {
                playerRef.current.hp = Math.min(playerRef.current.hp + 20, playerRef.current.maxHp);
            }
            onGameState(playerRef.current.hp, playerRef.current.weapon, gameState.current.wave);
         }
      }

      // Player Movement
      const tx = hand.x * w;
      const ty = hand.y * h;
      playerRef.current.x += (tx - playerRef.current.x) * 0.15;
      playerRef.current.y += (ty - playerRef.current.y) * 0.15;
      playerRef.current.x = Math.max(20, Math.min(w-20, playerRef.current.x));
      playerRef.current.y = Math.max(20, Math.min(h-20, playerRef.current.y));

      if (playerRef.current.energy < 100) playerRef.current.energy += 0.5;
      if (playerRef.current.invulnerable > 0) playerRef.current.invulnerable--;

      // Player Shooting
      if (hand.isPinching && hand.isPresent) {
         const wp = WEAPONS[playerRef.current.weapon];
         if (frameRef.current - playerRef.current.lastFire > wp.cooldown) {
            playerRef.current.lastFire = frameRef.current;
            const px = playerRef.current.x;
            const py = playerRef.current.y;
            
            if (playerRef.current.weapon === 'BLASTER') {
               bulletsRef.current.push({ x: px, y: py-20, vx: 0, vy: -15, radius: 4, color: wp.color, id: Math.random(), dmg: wp.damage, type: 'PLAYER' });
            } else if (playerRef.current.weapon === 'SPREAD') {
               [-0.2, 0, 0.2].forEach(a => {
                  bulletsRef.current.push({ x: px, y: py-20, vx: Math.sin(a)*12, vy: -Math.cos(a)*12, radius: 3, color: wp.color, id: Math.random(), dmg: wp.damage, type: 'PLAYER' });
               });
            } else if (playerRef.current.weapon === 'LASER') {
               bulletsRef.current.push({ x: px, y: py-30, vx: 0, vy: -25, radius: 3, color: wp.color, id: Math.random(), dmg: wp.damage, type: 'PLAYER' });
            } else if (playerRef.current.weapon === 'MISSILE') {
               bulletsRef.current.push({ x: px-15, y: py, vx: -3, vy: -5, radius: 6, color: wp.color, id: Math.random(), dmg: wp.damage, type: 'PLAYER', behavior: 'homing' });
               bulletsRef.current.push({ x: px+15, y: py, vx: 3, vy: -5, radius: 6, color: wp.color, id: Math.random(), dmg: wp.damage, type: 'PLAYER', behavior: 'homing' });
            }
         }
      }

      // Special Ability
      if (!hand.isPinching && hand.isPresent && playerRef.current.energy > 10) {
          const target = enemiesRef.current.find(e => Math.hypot(e.x - playerRef.current.x, e.y - playerRef.current.y) < 300);
          if (target) {
             playerRef.current.energy -= 1;
             if (frameRef.current % 4 === 0) {
                target.hp -= 5;
                addText(target.x, target.y, "5", "#a855f7");
                spawnExplosion(target.x, target.y, '#a855f7', 1);
             }
          }
      }

      // Update Entities
      enemiesRef.current.forEach(e => {
         e.y += e.vy;
         e.x += e.vx;
         if (e.x < e.radius || e.x > w - e.radius) e.vx *= -1;
         if (e.y > h + 50) e.hp = -1;
         if (e.type === 'INTERCEPTOR') e.x += (playerRef.current.x - e.x) * 0.02;
         
         e.shootTimer++;
         const fireRate = e.type === 'BOSS' ? 30 : e.type === 'TANK' ? 80 : 120;
         if (e.shootTimer > fireRate) {
            e.shootTimer = 0;
            if (e.type === 'DRONE') {
               bulletsRef.current.push({ x: e.x, y: e.y+e.radius, vx: 0, vy: 5, radius: 4, color: '#ef4444', id: Math.random(), dmg: 10, type: 'ENEMY' });
            } else if (e.type === 'TANK' || e.type === 'BOSS') {
               [-0.3, 0, 0.3].forEach(a => {
                  bulletsRef.current.push({ x: e.x, y: e.y+e.radius, vx: Math.sin(a)*5, vy: Math.cos(a)*5, radius: 5, color: '#ef4444', id: Math.random(), dmg: 15, type: 'ENEMY' });
               });
            }
         }
      });

      bulletsRef.current.forEach(b => {
         b.x += b.vx;
         b.y += b.vy;
         if (b.behavior === 'homing' && enemiesRef.current.length > 0) {
            const t = enemiesRef.current[0];
            const angle = Math.atan2(t.y - b.y, t.x - b.x);
            b.vx += Math.cos(angle) * 0.8;
            b.vy += Math.sin(angle) * 0.8;
            if (Math.hypot(b.vx, b.vy) > 10) { b.vx *= 0.9; b.vy *= 0.9; }
         }
      });
      
      // Update Particles (Explosions)
      particlesRef.current.forEach(p => {
         p.x += p.vx;
         p.y += p.vy;
         p.life -= 0.02;
      });

      // Update Texts
      textsRef.current.forEach(t => {
         t.y += t.vy;
         t.life -= 0.02;
      });
      
      // Update Powerups
      powerupsRef.current.forEach(p => {
         p.y += p.vy;
      });

      // Collisions
      if (playerRef.current.invulnerable === 0) {
         bulletsRef.current.forEach(b => {
            if (b.type === 'ENEMY' && Math.hypot(b.x - playerRef.current.x, b.y - playerRef.current.y) < 20) {
               playerRef.current.hp -= b.dmg;
               playerRef.current.invulnerable = 30;
               b.dmg = 0;
               addShake(10);
               gameState.current.flash = 5;
               addText(playerRef.current.x, playerRef.current.y, `-${b.dmg}`, '#ff0000');
               spawnExplosion(playerRef.current.x, playerRef.current.y, '#ff0000', 5);
            }
         });
         enemiesRef.current.forEach(e => {
             if (Math.hypot(e.x - playerRef.current.x, e.y - playerRef.current.y) < e.radius + 15) {
                 playerRef.current.hp -= 20;
                 playerRef.current.invulnerable = 40;
                 addShake(15);
                 gameState.current.flash = 10;
                 e.hp -= 50;
                 spawnExplosion(playerRef.current.x, playerRef.current.y, '#ff0000', 8);
             }
         });
      }

      bulletsRef.current.forEach(b => {
         if (b.type === 'PLAYER') {
            enemiesRef.current.forEach(e => {
               if (b.dmg > 0 && e.hp > 0 && Math.hypot(b.x - e.x, b.y - e.y) < e.radius + b.radius) {
                  e.hp -= b.dmg;
                  b.dmg = 0;
                  spawnExplosion(b.x, b.y, b.color, 1);
                  addText(e.x, e.y - 20, `${Math.round(Math.random()*10 + 10)}`, '#ffff00');
                  
                  if (e.hp <= 0) {
                     onScore(e.scoreValue);
                     addShake(e.type === 'BOSS' || e.type === 'TANK' ? 10 : 2);
                     spawnExplosion(e.x, e.y, e.color, e.radius/2);
                     if (Math.random() < 0.15 || e.type === 'BOSS') {
                         const types: WeaponType[] = ['BLASTER', 'SPREAD', 'LASER', 'MISSILE'];
                         powerupsRef.current.push({
                             x: e.x, y: e.y, vx: 0, vy: 1, radius: 15, color: '#fff', id: Math.random(),
                             weapon: types[Math.floor(Math.random() * types.length)], hp: 1, maxHp: 1
                         });
                     }
                  }
               }
            });
         }
      });
      
      powerupsRef.current.forEach((p, i) => {
         if (Math.hypot(p.x - playerRef.current.x, p.y - playerRef.current.y) < 30) {
            playerRef.current.weapon = p.weapon;
            addLog(`WEAPON SYSTEM: ${WEAPONS[p.weapon].name}`, 'success');
            addText(playerRef.current.x, playerRef.current.y - 40, WEAPONS[p.weapon].name, p.color);
            // Mark for removal
            p.hp = -1;
         }
      });

      // Filter out dead entities
      bulletsRef.current = bulletsRef.current.filter(b => b.dmg > 0 && b.y > -50 && b.y < h + 50 && b.x > -50 && b.x < w + 50);
      enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      textsRef.current = textsRef.current.filter(t => t.life > 0);
      powerupsRef.current = powerupsRef.current.filter(p => p.hp > 0 && p.y < h + 50);
      
      starsRef.current.forEach(s => { s.y += s.speed + (gameState.current.shake > 0 ? 2 : 0); if(s.y>h)s.y=0; });
      if (gameState.current.shake > 0) gameState.current.shake *= 0.9;
      if (gameState.current.flash > 0) gameState.current.flash--;

      if (playerRef.current.hp <= 0) {
          playerRef.current.hp = 100;
          gameState.current.wave = 0; // Reset to 0 to trigger loop logic
          gameState.current.spawning = false;
          enemiesRef.current = [];
          bulletsRef.current = [];
          addLog("SYSTEM CRITICAL. REBOOTING...", 'error');
          onScore(-1000);
      }

      if (frameRef.current % 30 === 0) {
         onGameState(playerRef.current.hp, playerRef.current.weapon, gameState.current.wave);
      }

      renderGame(
        ctx, w, h, frameRef.current, gameState.current, playerRef.current, hand,
        {
            enemies: enemiesRef.current,
            bullets: bulletsRef.current,
            particles: particlesRef.current,
            powerups: powerupsRef.current,
            texts: textsRef.current,
            stars: starsRef.current
        }
      );

      requestAnimationFrame(loop);
    };

    const anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
  }, [handPosRef, onScore, onGameState, addLog]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-10 touch-none" />;
}