import { useState, useEffect, useCallback } from 'react';
import { initVision } from '../services/visionService';
import { initGemini } from '../services/geminiService';
import { SystemLog } from '../types';

export const useSystem = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  
  const addLog = useCallback((message: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-6), newLog]);
  }, []);

  useEffect(() => {
    const setup = async () => {
      try {
        addLog("Initializing JARVIS protocol...", "info");
        initGemini();
        addLog("Vision systems coming online...", "info");
        await initVision();
        setIsLoading(false);
        addLog("System Fully Operational", "info");
      } catch (e) {
        console.error(e);
        addLog("Critical Initialization Failure", "error");
      }
    };
    setup();
  }, [addLog]);

  return { isLoading, logs, addLog };
};