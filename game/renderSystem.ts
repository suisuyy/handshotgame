import { HandTrackingRef } from '../types';
import { Enemy, Bullet, Particle, Powerup, FloatingText, Star, PlayerState, GameState, WEAPONS } from './types';

export const renderGame = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    frame: number,
    gameState: GameState,
    player: PlayerState,
    hand: HandTrackingRef,
    entities: {
        enemies: Enemy[];
        bullets: Bullet[];
        particles: Particle[];
        powerups: Powerup[];
        texts: FloatingText[];
        stars: Star[];
    }
) => {
    const { enemies, bullets, particles, powerups, texts, stars } = entities;

    // Clear Screen
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    // Screen Shake Apply
    ctx.save();
    if (gameState.shake > 0) {
        const dx = (Math.random() - 0.5) * gameState.shake;
        const dy = (Math.random() - 0.5) * gameState.shake;
        ctx.translate(dx, dy);
    }
    
    // Screen Flash
    if (gameState.flash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${gameState.flash * 0.05})`;
        ctx.fillRect(-20, -20, w+40, h+40);
    }

    // Background Stars (Parallax)
    stars.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.brightness})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
        ctx.fill();
    });

    // Particles (Bottom Layer)
    particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Powerups
    powerups.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(frame * 0.05);
        ctx.fillStyle = WEAPONS[p.weapon].color;
        ctx.shadowColor = WEAPONS[p.weapon].color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(15, 0);
        ctx.lineTo(0, 15);
        ctx.lineTo(-15, 0);
        ctx.fill();
        ctx.restore();
    });

    // Enemies
    enemies.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);
        
        // Health Bar
        const hpPct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-15, -e.radius - 15, 30, 4);
        ctx.fillStyle = e.hp < e.maxHp * 0.3 ? '#ef4444' : '#10b981'; // Red if low, Green if high
        ctx.fillRect(-15, -e.radius - 15, 30 * hpPct, 4);

        // Shadow/Glow Setup
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 15;
        
        if (e.type === 'DRONE') {
            // --- SCOUT DRONE (Arrow/Dart Shape) ---
            // Body Color
            ctx.fillStyle = '#1f2937'; 
            ctx.strokeStyle = e.color;
            ctx.lineWidth = 2;
            
            // Main Hull
            ctx.beginPath();
            // Pointing down (movement direction)
            ctx.moveTo(0, e.radius); 
            ctx.lineTo(e.radius * 0.8, -e.radius * 0.6);
            // Engine notch
            ctx.lineTo(0, -e.radius * 0.2); 
            ctx.lineTo(-e.radius * 0.8, -e.radius * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Engine Core
            ctx.fillStyle = e.color;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, -e.radius * 0.2, e.radius * 0.2, 0, Math.PI*2);
            ctx.fill();

        } else if (e.type === 'INTERCEPTOR') {
            // --- UFO INTERCEPTOR (Saucer Shape) ---
            const angle = frame * 0.1;
            
            // Main Saucer Body
            ctx.fillStyle = '#3b0764'; // Deep Purple
            ctx.strokeStyle = e.color;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.ellipse(0, 0, e.radius, e.radius * 0.4, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
            
            // Glass Dome
            ctx.fillStyle = 'rgba(168, 85, 247, 0.9)'; // Light Purple
            ctx.beginPath();
            ctx.ellipse(0, -e.radius * 0.15, e.radius * 0.5, e.radius * 0.35, 0, Math.PI, 0);
            ctx.fill();
            
            // Spinning Lights
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 5;
            for(let i=0; i<4; i++) {
                // Calculate positions on the rim ellipse
                const theta = angle + (i * Math.PI / 2);
                const lx = Math.cos(theta) * (e.radius * 0.7);
                const ly = Math.sin(theta) * (e.radius * 0.25);
                
                // Only draw if "in front" (roughly) or simple layering
                ctx.beginPath();
                ctx.arc(lx, ly, 2, 0, Math.PI*2);
                ctx.fill();
            }

        } else if (e.type === 'TANK' || e.type === 'BOSS') {
            // --- DREADNOUGHT (Blocky/Heavy) ---
            const r = e.radius;
            
            ctx.fillStyle = '#27272a'; // Dark Metal
            ctx.strokeStyle = e.color;
            ctx.lineWidth = 3;

            // Complex Hull Shape
            ctx.beginPath();
            ctx.moveTo(-r * 0.6, -r);
            ctx.lineTo(r * 0.6, -r);
            ctx.lineTo(r, -r * 0.3);
            ctx.lineTo(r, r * 0.6);
            ctx.lineTo(r * 0.4, r);
            ctx.lineTo(-r * 0.4, r);
            ctx.lineTo(-r, r * 0.6);
            ctx.lineTo(-r, -r * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Armor Plating Details
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-r * 0.6, -r * 0.3);
            ctx.lineTo(r * 0.6, -r * 0.3);
            ctx.moveTo(-r * 0.6, r * 0.3);
            ctx.lineTo(r * 0.6, r * 0.3);
            ctx.stroke();
            
            // Pulsing Core
            const pulse = 0.8 + Math.sin(frame * 0.1) * 0.2;
            ctx.fillStyle = e.color;
            ctx.globalAlpha = pulse;
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.3, 0, Math.PI*2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            
            // Weapon Ports (Red glow)
            ctx.fillStyle = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(-r*0.7, r*0.5, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(r*0.7, r*0.5, 4, 0, Math.PI*2); ctx.fill();
        }
        
        ctx.restore();
    });

    // Bullets
    bullets.forEach(b => {
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        if (b.type === 'PLAYER' && b.behavior !== 'homing') {
            // Elongated plasma bolts for player
            ctx.ellipse(b.x, b.y, b.radius, b.radius * 2.5, 0, 0, Math.PI*2);
        } else if (b.type === 'ENEMY') {
            // Round energy orbs for enemies
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2);
            // Inner white core
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.fillStyle = b.color; // Restore for glow
        } else {
             ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Player
    const px = player.x;
    const py = player.y;
    
    // Beam Special Visual
    if (player.energy < 99 && !hand.isPinching && hand.isPresent) {
        const t = enemies.find(e => Math.hypot(e.x-px, e.y-py) < 300);
        if (t) {
            ctx.save();
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 3 + Math.random()*3;
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 20;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(px, py);
            // Jagged Lightning effect
            const midX = (px + t.x) / 2 + (Math.random()-0.5)*20;
            const midY = (py + t.y) / 2 + (Math.random()-0.5)*20;
            ctx.lineTo(midX, midY);
            ctx.lineTo(t.x, t.y);
            ctx.stroke();
            ctx.restore();
        }
    }

    if (player.invulnerable % 6 < 3) {
        // Engine Exhaust
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(px-6, py+25);
        ctx.lineTo(px, py+40 + Math.random()*15); // Flickering trail
        ctx.lineTo(px+6, py+25);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Ship Body (Iron Man Colors)
        ctx.save();
        // Main Wings
        ctx.fillStyle = '#991b1b'; // Dark Red
        ctx.strokeStyle = '#ef4444'; // Bright Red Edge
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py-25);
        ctx.lineTo(px+28, py+20);
        ctx.lineTo(px, py+10);
        ctx.lineTo(px-28, py+20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Gold Faceplate/Cockpit area
        ctx.fillStyle = '#fbbf24'; // Gold
        ctx.beginPath();
        ctx.moveTo(px, py-15);
        ctx.lineTo(px+8, py+15);
        ctx.lineTo(px-8, py+15);
        ctx.fill();
        
        // Arc Reactor Core
        ctx.fillStyle = '#e0f2fe'; // White-blue
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI*2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // Shield Bubble
    if (player.invulnerable > 0) {
        ctx.strokeStyle = `rgba(0, 240, 255, ${Math.sin(frame*0.2)*0.4 + 0.4})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, 40, 0, Math.PI*2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Floating Texts
    texts.forEach(t => {
        ctx.globalAlpha = Math.max(0, t.life);
        ctx.font = 'bold 16px "Rajdhani", sans-serif';
        ctx.fillStyle = t.color;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(t.text, t.x, t.y);
        ctx.fillText(t.text, t.x, t.y);
        ctx.globalAlpha = 1;
    });

    ctx.restore(); // End Shake
};