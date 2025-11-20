import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are JARVIS, a highly advanced AI assistant for a powered armor suit. 
Your output must be extremely brief, technical, and formatted as a system log. 
Do not use markdown. Do not use pleasantries. 
Use terms like "Calibration", "Thermal variance", "Targeting", "Network latency", "Biometrics", "Spectroscopy".
Maximum 10 words per response.
`;

const FALLBACK_LOGS = [
    "SYSTEM: Re-routing auxiliary power.",
    "HUD: Optical sensors calibrated.",
    "TARGETING: Predictive algorithms active.",
    "THRUSTERS: Efficiency at 98%.",
    "DEFENSE: Shield harmonics stabilizing.",
    "SCAN: Atmospheric density dropping.",
    "NETWORK: Encrypted channel secure.",
    "CORE: Fusion output nominal.",
    "WEAPON: Capacitor charge complete.",
    "ALERT: Long-range sensors pinging."
];

let genAI: GoogleGenAI | null = null;

export const initGemini = () => {
  if (process.env.API_KEY) {
    try {
        genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
        console.warn("Gemini Init failed, falling back to offline mode.");
    }
  }
};

export const generateSystemLog = async (context: string): Promise<string> => {
  if (!genAI) return getRandomFallback();

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `Generate a system status log regarding: ${context}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 20,
        temperature: 0.7,
      }
    });
    
    const text = response.text;
    if (typeof text === 'string') {
      return text.trim();
    }

    return getRandomFallback();
  } catch (error: any) {
    // Gracefully handle quota exhaustion or network errors by returning a simulation log
    // This keeps the game immersive even if the backend fails
    return getRandomFallback();
  }
};

const getRandomFallback = () => {
    return FALLBACK_LOGS[Math.floor(Math.random() * FALLBACK_LOGS.length)];
};