import { Point } from '../types';

export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17] // Knuckles
];

export const calculateScreenMapping = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const videoRatio = video.videoWidth / video.videoHeight;
    const canvasRatio = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, startX, startY;

    // Calculate how video is scaled/cropped by object-cover
    if (canvasRatio > videoRatio) {
        // Screen is wider than video
        drawWidth = canvas.width;
        drawHeight = canvas.width / videoRatio;
        startX = 0;
        startY = (canvas.height - drawHeight) / 2;
    } else {
        // Screen is taller than video
        drawHeight = canvas.height;
        drawWidth = canvas.height * videoRatio;
        startX = (canvas.width - drawWidth) / 2;
        startY = 0;
    }

    const toScreen = (p: Point) => ({
        x: startX + (1 - p.x) * drawWidth,
        y: startY + p.y * drawHeight
    });

    return { toScreen };
};

export const drawHandSkeleton = (
    ctx: CanvasRenderingContext2D, 
    landmarks: Point[], 
    toScreen: (p: Point) => {x: number, y: number},
    isPinching: boolean = false
) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const mainColor = isPinching ? 'rgba(0, 255, 0, 0.9)' : 'rgba(0, 240, 255, 0.8)';
    const glowColor = isPinching ? '#00ff00' : '#00f0ff';
    const tipColor = isPinching ? '#ffffff' : '#ffff00';

    // 1. Draw Connections (Bones) - Thicker and Brighter
    ctx.beginPath();
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 5; // Thicker for better visibility
    
    for (const [start, end] of HAND_CONNECTIONS) {
        const p1 = toScreen(landmarks[start]);
        const p2 = toScreen(landmarks[end]);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // 2. Draw Inner White Core for Bones (for contrast)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    for (const [start, end] of HAND_CONNECTIONS) {
        const p1 = toScreen(landmarks[start]);
        const p2 = toScreen(landmarks[end]);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // 3. Draw Joints - Distinct and Glowing
    for (let i = 0; i < landmarks.length; i++) {
        const { x, y } = toScreen(landmarks[i]);
        ctx.beginPath();
        
        // Fingertips
        if ([4, 8, 12, 16, 20].includes(i)) {
             ctx.fillStyle = tipColor;
             ctx.arc(x, y, 7, 0, 2 * Math.PI);
             ctx.shadowBlur = 20;
             ctx.shadowColor = glowColor;
        } else {
             ctx.fillStyle = glowColor;
             ctx.arc(x, y, 5, 0, 2 * Math.PI);
             ctx.shadowBlur = 10;
             ctx.shadowColor = glowColor;
        }
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }

    // 4. Status Label (Near Wrist)
    const wrist = toScreen(landmarks[0]);
    ctx.font = 'bold 16px "Share Tech Mono", monospace';
    ctx.fillStyle = glowColor;
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    
    const labelText = isPinching ? ">> GRIP <<" : "  OPEN  ";
    ctx.fillText(labelText, wrist.x + 25, wrist.y);
    
    // Connecting line for label
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(wrist.x, wrist.y);
    ctx.lineTo(wrist.x + 20, wrist.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
};