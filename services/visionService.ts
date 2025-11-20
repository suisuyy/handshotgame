import { FilesetResolver, FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';

let faceLandmarker: FaceLandmarker | null = null;
let handLandmarker: HandLandmarker | null = null;

export const initVision = async () => {
  // Use a version closer to the import map version (0.10.x) to ensure WASM compatibility.
  // Mismatched versions can cause delegate initialization issues.
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1
  });

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 4
  });

  return { faceLandmarker, handLandmarker };
};

export const getFaceLandmarker = () => faceLandmarker;
export const getHandLandmarker = () => handLandmarker;