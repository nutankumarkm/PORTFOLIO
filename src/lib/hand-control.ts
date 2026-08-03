"use client";

/**
 * Webcam hand tracking, on-device.
 *
 * The camera stream is read into a MediaPipe HandLandmarker and turned into a
 * small set of gestures. No frame ever leaves the browser and nothing is
 * recorded — the track is stopped the moment tracking is switched off.
 *
 * Startup is deliberately ordered so the setup screen has something to show:
 * permission first, then the camera goes live and is handed straight back, and
 * only then does the ~19MB runtime and model download begin. That download is
 * the slow part, and it happens while the person is already framing their hand.
 */

import type { HandLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";

export type HandPose = "none" | "open" | "pinch" | "fist" | "point";

export interface HandState {
  /** Whether a hand is currently in frame. */
  present: boolean;
  pose: HandPose;
  /** Smoothed cursor in viewport pixels, already un-mirrored. */
  x: number;
  y: number;
  /** 21 landmarks for the preview overlay, in normalized image space. */
  landmarks: NormalizedLandmark[] | null;
}

export type HandEvent =
  | { type: "state"; state: HandState }
  | { type: "click"; x: number; y: number }
  | { type: "swipe"; direction: "up" | "down" };

export type HandStatus =
  | "idle"
  /** Waiting on the camera permission prompt. */
  | "requesting"
  /** Camera is live and previewable; runtime and model are downloading. */
  | "downloading"
  /** Tracking. */
  | "running"
  | "denied"
  | "unsupported"
  | "error";

export interface HandProgress {
  /** The wasm runtime reports no size, so only "model" carries real numbers. */
  phase: "runtime" | "model";
  loaded: number;
  total: number;
}

/* --- Landmark helpers ----------------------------------------------------- */

const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;

// Each fingertip paired with the joint two down the chain. With the hand held
// upright a finger reads as extended when its tip sits above that joint.
const FINGERS: [tip: number, pip: number][] = [
  [8, 6],
  [12, 10],
  [16, 14],
  [20, 18],
];

const distance = (a: NormalizedLandmark, b: NormalizedLandmark) =>
  Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Maps 21 hand landmarks to a pose. Assumes the hand is held roughly upright,
 * which is how people hold a hand up to a laptop camera. Exported so the
 * thresholds can be exercised without a webcam.
 */
export function classifyPose(points: NormalizedLandmark[]): HandPose {
  // Everything is measured against palm span, so the same gesture reads the
  // same whether the hand is near the lens or far from it.
  const span = distance(points[WRIST], points[MIDDLE_MCP]) || 1;

  const [indexUp, middleUp, ringUp, pinkyUp] = FINGERS.map(
    ([tip, pip]) => points[tip].y < points[pip].y
  );
  const extended = [indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;

  // A closed fist also parks the thumb tip next to the index tip, so proximity
  // alone would read every fist as a pinch and fire a click. Requiring the back
  // fingers to stay up separates a deliberate pinch from a fist.
  const backFingersUp = [middleUp, ringUp, pinkyUp].filter(Boolean).length;
  if (
    distance(points[THUMB_TIP], points[INDEX_TIP]) / span < 0.55 &&
    backFingersUp >= 2
  ) {
    return "pinch";
  }

  if (extended >= 4) return "open";
  if (extended === 0) return "fist";
  if (indexUp && backFingersUp === 0) return "point";
  return "none";
}

/* --- Tuning --------------------------------------------------------------- */

const DETECT_FPS = 24;

// Cursor smoothing. Raw landmarks jitter by a few pixels every frame; this is
// the fraction of the gap to the new reading taken per update.
const CURSOR_EASE = 0.35;

// A swipe has to cover this much of the frame height, this fast, to count.
const SWIPE_DISTANCE = 0.22;
const SWIPE_WINDOW_MS = 400;
const SWIPE_COOLDOWN_MS = 900;

// Pinch has to release before it can fire again, so a held pinch is one click.
const CLICK_COOLDOWN_MS = 400;

const WASM_PATH = "/mediapipe/wasm";
const MODEL_PATH = "/mediapipe/hand_landmarker.task";

export interface HandControlOptions {
  onEvent: (event: HandEvent) => void;
  onStatus: (status: HandStatus, detail?: string) => void;
  /** Fires as soon as the camera is live, before the model download starts. */
  onCamera?: (stream: MediaStream) => void;
  onProgress?: (progress: HandProgress) => void;
}

export interface HandController {
  stop: () => void;
  /**
   * Gestures still get recognised when disabled — the preview keeps updating —
   * but swipes and clicks stop firing. The setup screen uses this so a hand
   * being waved at the camera doesn't navigate the page behind it.
   */
  setGesturesEnabled: (enabled: boolean) => void;
}

/** Streams the model so the setup screen can show a real progress bar. */
async function fetchModel(
  onProgress: (loaded: number, total: number) => void
): Promise<Uint8Array> {
  const response = await fetch(MODEL_PATH);
  if (!response.ok) throw new Error(`Model failed to load (${response.status})`);

  const total = Number(response.headers.get("content-length")) || 0;
  if (!response.body) return new Uint8Array(await response.arrayBuffer());

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress(loaded, total);
  }

  const buffer = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  return buffer;
}

/**
 * Starts tracking. Resolves once the camera and model are live; every update
 * after that arrives through `onEvent`.
 */
export async function startHandControl({
  onEvent,
  onStatus,
  onCamera,
  onProgress,
}: HandControlOptions): Promise<HandController> {
  let stopped = false;
  let gesturesEnabled = true;
  let stream: MediaStream | null = null;
  let landmarker: HandLandmarker | null = null;
  let rafId = 0;

  const video = document.createElement("video");
  video.playsInline = true;
  video.muted = true;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    // Releasing the tracks is what turns the camera indicator light off.
    stream?.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
    landmarker?.close();
    landmarker = null;
    onStatus("idle");
  };

  const controller: HandController = {
    stop,
    setGesturesEnabled: (enabled) => {
      gesturesEnabled = enabled;
    },
  };

  if (!navigator.mediaDevices?.getUserMedia) {
    onStatus("unsupported", "This browser has no camera API.");
    return controller;
  }

  try {
    onStatus("requesting");

    // Camera first: if permission is refused there is no point paying for a
    // 19MB download.
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
    });
    if (stopped) {
      stream.getTracks().forEach((t) => t.stop());
      return controller;
    }

    video.srcObject = stream;
    await video.play();

    // Hand the live feed over before the slow part, so the setup screen can
    // show the person their framing while everything else downloads.
    onCamera?.(stream);
    onStatus("downloading");

    onProgress?.({ phase: "runtime", loaded: 0, total: 0 });
    const { FilesetResolver, HandLandmarker: Landmarker } = await import(
      "@mediapipe/tasks-vision"
    );
    const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
    if (stopped) throw new Error("cancelled");

    const modelAssetBuffer = await fetchModel((loaded, total) =>
      onProgress?.({ phase: "model", loaded, total })
    );
    if (stopped) throw new Error("cancelled");

    landmarker = await Landmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetBuffer, delegate: "GPU" },
      runningMode: "VIDEO",
      numHands: 1,
    });

    if (stopped) {
      landmarker.close();
      stream.getTracks().forEach((t) => t.stop());
      return controller;
    }
  } catch (err) {
    const error = err as DOMException;
    stream?.getTracks().forEach((t) => t.stop());
    landmarker?.close();

    if (stopped || error?.message === "cancelled") {
      stopped = true;
      return controller;
    }
    if (error?.name === "NotAllowedError" || error?.name === "SecurityError") {
      onStatus("denied", "Camera access was blocked.");
    } else if (error?.name === "NotFoundError") {
      onStatus("unsupported", "No camera found on this device.");
    } else {
      onStatus("error", error?.message || "Hand tracking failed to start.");
    }
    stopped = true;
    return controller;
  }

  onStatus("running");

  /* --- Detection loop ----------------------------------------------------- */

  const interval = 1000 / DETECT_FPS;
  let lastDetect = 0;
  let lastVideoTime = -1;

  const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let seeded = false;

  let pinching = false;
  let lastClick = 0;
  let lastSwipe = 0;
  const trail: { y: number; t: number }[] = [];

  const tick = (time: number) => {
    if (stopped) return;
    rafId = requestAnimationFrame(tick);

    if (document.hidden || time - lastDetect < interval) return;
    lastDetect = time;

    if (!landmarker || video.readyState < 2) return;
    // Feeding the same frame twice makes the tracker throw.
    if (video.currentTime === lastVideoTime) return;
    lastVideoTime = video.currentTime;

    let points: NormalizedLandmark[] | null = null;
    try {
      const result = landmarker.detectForVideo(video, time);
      points = result.landmarks?.[0] ?? null;
    } catch {
      return; // A dropped frame is not worth tearing the session down for.
    }

    if (!points) {
      trail.length = 0;
      pinching = false;
      onEvent({
        type: "state",
        state: { present: false, pose: "none", x: cursor.x, y: cursor.y, landmarks: null },
      });
      return;
    }

    const pose = classifyPose(points);

    // The webcam image is mirrored relative to the person using it, so moving
    // your hand right has to move the cursor right.
    const targetX = (1 - points[INDEX_TIP].x) * window.innerWidth;
    const targetY = points[INDEX_TIP].y * window.innerHeight;

    if (!seeded) {
      cursor.x = targetX;
      cursor.y = targetY;
      seeded = true;
    } else {
      cursor.x += (targetX - cursor.x) * CURSOR_EASE;
      cursor.y += (targetY - cursor.y) * CURSOR_EASE;
    }

    // Pinch closes -> one click. It has to open again before the next.
    if (pose === "pinch" && !pinching) {
      pinching = true;
      if (gesturesEnabled && time - lastClick > CLICK_COOLDOWN_MS) {
        lastClick = time;
        onEvent({ type: "click", x: cursor.x, y: cursor.y });
      }
    } else if (pose !== "pinch") {
      pinching = false;
    }

    // Swipes are only read off an open palm, so moving the hand back down after
    // a swipe (usually a relaxed or closed hand) doesn't bounce you backwards.
    if (pose === "open") {
      const wristY = points[WRIST].y;
      trail.push({ y: wristY, t: time });
      while (trail.length && time - trail[0].t > SWIPE_WINDOW_MS) trail.shift();

      if (trail.length > 1 && gesturesEnabled && time - lastSwipe > SWIPE_COOLDOWN_MS) {
        const travel = trail[trail.length - 1].y - trail[0].y;
        if (Math.abs(travel) > SWIPE_DISTANCE) {
          lastSwipe = time;
          trail.length = 0;
          onEvent({ type: "swipe", direction: travel > 0 ? "down" : "up" });
        }
      }
    } else {
      trail.length = 0;
    }

    onEvent({
      type: "state",
      state: { present: true, pose, x: cursor.x, y: cursor.y, landmarks: points },
    });
  };

  rafId = requestAnimationFrame(tick);
  return controller;
}
