import React from 'react';

const LoadingScreen: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
      <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-cyan-500 font-tech text-xl tracking-widest animate-pulse">INITIALIZING SYSTEMS</h2>
      </div>
  </div>
);

export default LoadingScreen;