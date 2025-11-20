import React, { forwardRef } from 'react';

const Cursor = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div 
      ref={ref} 
      className="absolute top-0 left-0 z-50 pointer-events-none opacity-0 will-change-transform text-cyan-400 transition-colors duration-200"
    >
        <div className="relative">
           {/* Center Dot */}
           <div className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-current rounded-full shadow-[0_0_15px_currentColor]"></div>
           {/* Pulsing Ring */}
           <div className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-current rounded-full opacity-50 animate-ping"></div>
           {/* Rotating Reticle */}
           <div className="absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-dashed border-current/40 rounded-full animate-spin-slow"></div>
           {/* Dynamic Coordinates */}
           <div className="absolute left-6 top-2 text-[10px] font-mono font-bold tracking-wider opacity-80 cursor-coords bg-black/50 px-1 border-l border-current">
              INIT_TRK
           </div>
        </div>
    </div>
  );
});

export default Cursor;