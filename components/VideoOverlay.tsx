import React from 'react';

const VideoOverlay: React.FC = () => (
  <>
    {/* Subtle Vignette */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-10"></div>
    {/* Extremely faint scanlines */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] z-10 bg-[length:100%_4px] pointer-events-none opacity-20"></div>
    {/* Optional faint color grading for tech feel */}
    <div className="absolute inset-0 bg-cyan-900/5 pointer-events-none mix-blend-overlay z-10"></div>
  </>
);

export default VideoOverlay;