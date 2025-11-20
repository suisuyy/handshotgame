import React from 'react';
import { HeadTrackingState, SystemLog } from '../types';

interface HUDProps {
  headState: HeadTrackingState;
  logs: SystemLog[];
  fps: number;
  score: number;
  health: number;
  weapon: string;
  wave: number;
}

const HUD: React.FC<HUDProps> = ({ headState, logs, fps, score, health, weapon, wave }) => {
  const xOffset = (headState.position.x - 0.5) * 30;
  const yOffset = (headState.position.y - 0.5) * 30;

  const style = {
    transform: `translate3d(${-xOffset}px, ${-yOffset}px, 0)`,
    transition: 'transform 0.1s ease-out',
  };

  const getWeaponColor = (w: string) => {
     switch(w) {
         case 'BLASTER': return 'text-yellow-400';
         case 'SPREAD': return 'text-cyan-400';
         case 'LASER': return 'text-emerald-400';
         case 'MISSILE': return 'text-pink-500';
         default: return 'text-white';
     }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden text-hud-cyan font-tech select-none">
      <div className="relative w-full h-full" style={style}>
        
        {/* Center Reticle - Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 border border-cyan-500/30 rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-10 border border-dashed border-cyan-500/30 rounded-full animate-spin-slow pointer-events-none"></div>

        {/* Top Center: Score & Wave */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
             <div className="flex items-baseline gap-4">
                 <div className="text-center">
                    <div className="text-xs tracking-[0.5em] text-cyan-300/70 uppercase">Score</div>
                    <div className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] tracking-widest">
                        {score.toLocaleString()}
                    </div>
                 </div>
                 <div className="h-10 w-px bg-cyan-500/30"></div>
                 <div className="text-center">
                    <div className="text-xs tracking-[0.5em] text-yellow-400/70 uppercase">Wave</div>
                    <div className="text-4xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                        {wave}
                    </div>
                 </div>
             </div>
        </div>

        {/* Top Right: Weapon & Health */}
        <div className="absolute top-8 right-8 text-right">
            <div className="mb-6">
                <div className="text-[10px] opacity-60 tracking-[0.3em] mb-1">ACTIVE ARMAMENT</div>
                <div className={`text-4xl font-bold ${getWeaponColor(weapon)} drop-shadow-md tracking-tighter`}>
                    {weapon}
                </div>
                <div className="flex justify-end gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-8 h-1 ${i < 3 ? 'bg-current opacity-100' : 'bg-gray-700'} skew-x-[-20deg]`} />
                    ))}
                </div>
            </div>
            
            <div>
                <div className="text-[10px] opacity-60 tracking-[0.3em] mb-1">ARMOR INTEGRITY</div>
                <div className="w-64 h-6 bg-gray-900/80 border border-cyan-500/30 skew-x-[-20deg] overflow-hidden relative backdrop-blur-sm">
                    <div 
                        className={`h-full transition-all duration-300 relative
                            ${health < 30 ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)]' : 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]'}
                        `}
                        style={{ width: `${health}%` }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-pulse"></div>
                    </div>
                </div>
                <div className="text-2xl font-bold mt-1 flex justify-end items-center gap-2">
                    <span className={health < 30 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}>{Math.max(0, Math.round(health))}%</span>
                </div>
            </div>
        </div>

        {/* Bottom Left: System Logs */}
        <div className="absolute bottom-8 left-8 w-96">
            <div className="flex items-center gap-3 mb-2 border-b border-cyan-500/30 pb-2">
                 <div className="w-2 h-2 bg-cyan-500 animate-pulse shadow-[0_0_10px_#00f0ff]"></div>
                 <h3 className="text-xs font-bold tracking-[0.3em] text-cyan-400">TACTICAL_LOG</h3>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono opacity-90 mask-image-gradient max-h-48 overflow-y-auto scrollbar-hide pr-4">
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-4 duration-300 border-l border-cyan-500/10 pl-2">
                        <span className="text-cyan-600/70">[{log.timestamp}]</span>
                        <span className={`
                          font-semibold tracking-wide
                          ${log.type === 'error' ? 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]' : ''}
                          ${log.type === 'success' ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : ''}
                          ${log.type === 'warning' ? 'text-yellow-400' : ''}
                          ${(log.type === 'info' || log.type === 'analysis') ? 'text-cyan-200' : ''}
                        `}>
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Top Left: Header */}
        <div className="absolute top-8 left-8 border-l-4 border-cyan-500 pl-4">
             <div className="text-5xl font-bold italic tracking-tighter text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                J.A.R.V.I.S.
             </div>
             <div className="flex gap-6 mt-1 text-[10px] font-mono text-cyan-300/60 tracking-widest">
                 <span>SYS.VER.4.2.0</span>
                 <span>FPS: {fps}</span>
                 <span className={headState.detected ? 'text-green-400' : 'text-red-400'}>
                    TRACKING: {headState.detected ? 'ACTIVE' : 'SEARCHING'}
                 </span>
             </div>
        </div>

        {/* Controls Hint (Bottom Right) */}
        <div className="absolute bottom-8 right-8 text-right">
             <div className="flex flex-col gap-2 text-[10px] font-mono text-cyan-200/60">
                 <div className="flex items-center justify-end gap-2">
                    <span>NAVIGATE</span>
                    <div className="bg-cyan-900/40 px-2 py-1 rounded border border-cyan-500/20">HAND POS</div>
                 </div>
                 <div className="flex items-center justify-end gap-2">
                    <span>FIRE WEAPON</span>
                    <div className="bg-cyan-900/40 px-2 py-1 rounded border border-cyan-500/20 text-yellow-200">PINCH</div>
                 </div>
                 <div className="flex items-center justify-end gap-2">
                    <span>REPULSOR BEAM</span>
                    <div className="bg-cyan-900/40 px-2 py-1 rounded border border-cyan-500/20 text-purple-300">OPEN HAND</div>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default HUD;