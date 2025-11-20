import { useEffect, RefObject } from 'react';

export const useWebcam = (videoRef: RefObject<HTMLVideoElement>, canvasRef: RefObject<HTMLCanvasElement>) => {
    useEffect(() => {
        const setupStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await new Promise(resolve => videoRef.current!.onloadedmetadata = resolve);
                    videoRef.current.play();
                    
                    if (canvasRef.current) {
                        canvasRef.current.width = window.innerWidth;
                        canvasRef.current.height = window.innerHeight;
                    }
                }
            } catch (e) {
                console.error("Webcam access denied", e);
            }
        };
        setupStream();

        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [videoRef, canvasRef]);
};