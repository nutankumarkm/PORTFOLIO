"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { Hand, X } from "lucide-react";

import {
  STAGE_SECTIONS,
  getStageIndex,
  scrollToStageSection,
} from "@/lib/scroll-stage";
import type {
  HandController,
  HandEvent,
  HandPose,
  HandProgress,
  HandStatus,
} from "@/lib/hand-control";
import { HandSetup } from "./HandSetup";

/** Only the two axes the preview draws — keeps this free of the MediaPipe types. */
interface HandPoint {
  x: number;
  y: number;
}

// Bones of the hand, for the skeleton preview.
const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const POSE_LABEL: Record<HandPose, string> = {
  none: "Hold your hand up",
  open: "Open palm",
  pinchIndex: "Thumb + index — scrolling up",
  pinchMiddle: "Thumb + middle — scrolling down",
  pinchPinky: "Thumb + pinky — selecting",
  fist: "Fist — paused",
  point: "Pointing",
};

const PINCH_POSES: HandPose[] = ["pinchIndex", "pinchMiddle", "pinchPinky"];

// Anything the pinch is allowed to press. Without this a pinch over empty page
// would click whatever container happens to sit under the cursor.
const CLICKABLE =
  "a, button, [role='button'], input, select, textarea, summary, [data-cursor='hover']";

export function HandControl() {
  const [status, setStatus] = useState<HandStatus>("idle");
  const [detail, setDetail] = useState<string | null>(null);
  const [progress, setProgress] = useState<HandProgress | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [pose, setPose] = useState<HandPose>("none");
  const [present, setPresent] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

  const controllerRef = useRef<HandController | null>(null);

  // Whichever canvas is currently mounted — the setup stage or the corner
  // panel. The two overlap while the setup screen plays its exit animation, so
  // each owner may only clear the ref if it is still the one holding it;
  // otherwise the departing screen blanks the panel that just took over.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasOwnerRef = useRef<"setup" | "panel" | null>(null);

  const claimCanvas = useCallback(
    (canvas: HTMLCanvasElement | null, owner: "setup" | "panel") => {
      if (canvas) {
        canvasRef.current = canvas;
        canvasOwnerRef.current = owner;
      } else if (canvasOwnerRef.current === owner) {
        canvasRef.current = null;
        canvasOwnerRef.current = null;
      }
    },
    []
  );

  // The cursor moves every frame — keep it off the React render path.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 520, damping: 40, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 520, damping: 40, mass: 0.4 });

  const drawSkeleton = useCallback((landmarks: HandPoint[] | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    if (!landmarks) return;

    // Mirrored, to match the mirrored video underneath.
    const px = (i: number) => (1 - landmarks[i].x) * width;
    const py = (i: number) => landmarks[i].y * height;

    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    CONNECTIONS.forEach(([a, b]) => {
      ctx.moveTo(px(a), py(a));
      ctx.lineTo(px(b), py(b));
    });
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    for (let i = 0; i < landmarks.length; i++) {
      ctx.beginPath();
      ctx.arc(px(i), py(i), i === 8 || i === 4 ? 4 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const handleEvent = useCallback(
    (event: HandEvent) => {
      if (event.type === "state") {
        const { state } = event;
        rawX.set(state.x);
        rawY.set(state.y);
        setPresent((prev) => (prev === state.present ? prev : state.present));
        setPose((prev) => (prev === state.pose ? prev : state.pose));
        drawSkeleton(state.landmarks);
        return;
      }

      if (event.type === "swipe") {
        // Same sense as the arrow keys: "up" goes to the previous section,
        // "down" goes to the next one.
        const step = event.direction === "up" ? -1 : 1;
        const next = Math.min(
          STAGE_SECTIONS.length - 1,
          Math.max(0, getStageIndex() + step)
        );
        scrollToStageSection(next);
        return;
      }

      if (event.type === "click") {
        const target = document
          .elementFromPoint(event.x, event.y)
          ?.closest<HTMLElement>(CLICKABLE);
        target?.click();
      }
    },
    [drawSkeleton, rawX, rawY]
  );

  const teardown = useCallback(() => {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setStream(null);
    setProgress(null);
    setPresent(false);
    setPose("none");
    setSetupOpen(false);
    drawSkeleton(null);
  }, [drawSkeleton]);

  const begin = useCallback(async () => {
    if (controllerRef.current) return;
    setSetupOpen(true);
    setStatus("requesting");
    setDetail(null);

    const { startHandControl } = await import("@/lib/hand-control");
    const controller = await startHandControl({
      onEvent: handleEvent,
      onCamera: setStream,
      onProgress: setProgress,
      onStatus: (next, why) => {
        setStatus(next);
        setDetail(why ?? null);
      },
    });

    // Gestures stay inert until the setup screen is dismissed, so rehearsing in
    // front of the camera can't navigate the page behind it.
    controller.setGesturesEnabled(false);
    controllerRef.current = controller;
  }, [handleEvent]);

  const confirmSetup = useCallback(() => {
    controllerRef.current?.setGesturesEnabled(true);
    setSetupOpen(false);
    drawSkeleton(null);
  }, [drawSkeleton]);

  // Never leave the camera running behind us.
  useEffect(() => () => controllerRef.current?.stop(), []);

  const live = status === "running" && !setupOpen;
  const busy =
    status === "requesting" || status === "downloading" || status === "running";

  return (
    <>
      <AnimatePresence>
        {setupOpen && (
          <HandSetup
            key="hand-setup"
            status={status}
            progress={progress}
            detail={detail}
            pose={pose}
            present={present}
            stream={stream}
            onCanvas={(canvas) => claimCanvas(canvas, "setup")}
            onStart={confirmSetup}
            onCancel={() => {
              teardown();
              setStatus("idle");
            }}
          />
        )}
      </AnimatePresence>

      {/* Gesture cursor */}
      <AnimatePresence>
        {live && present && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: PINCH_POSES.includes(pose) ? 0.55 : 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            style={{ x, y }}
            className="pointer-events-none fixed left-0 top-0 z-[120] -ml-5 -mt-5 h-10 w-10"
          >
            <div
              className={`h-full w-full rounded-full border-2 transition-colors duration-150 ${
                PINCH_POSES.includes(pose)
                  ? "border-primary bg-primary/30"
                  : "border-primary/70 bg-primary/10"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner panel, once setup is done */}
      <div className="fixed bottom-6 left-4 z-[96] hidden flex-col items-start gap-3 sm:left-6 lg:flex">
        <AnimatePresence>
          {live && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              className="w-48 overflow-hidden rounded-box border border-base-300 bg-base-100/95 shadow-xl backdrop-blur-xl"
            >
              <div className="relative aspect-[4/3] w-full bg-base-300/40">
                <canvas
                  ref={(canvas) => claimCanvas(canvas, "panel")}
                  width={224}
                  height={168}
                  className="absolute inset-0 h-full w-full"
                />
                {!present && (
                  <div className="absolute inset-0 grid place-items-center px-4 text-center font-mono-display text-[9px] uppercase leading-relaxed tracking-[0.15em] text-base-content/50">
                    Hold your hand up
                  </div>
                )}
              </div>
              <div className="border-t border-base-300 p-2.5 font-mono-display text-[9px] uppercase tracking-[0.15em] text-primary">
                {POSE_LABEL[pose]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!setupOpen && (
          <button
            onClick={() => {
              if (busy) {
                teardown();
                setStatus("idle");
              } else {
                void begin();
              }
            }}
            className={`btn btn-sm gap-2 rounded-full border-base-300 font-mono-display text-[10px] uppercase tracking-[0.2em] shadow-md ${
              live ? "btn-primary" : "bg-base-100"
            }`}
            aria-label={busy ? "Turn off hand control" : "Control with hand gestures"}
            data-cursor="hover"
          >
            {busy ? <X className="h-3.5 w-3.5" /> : <Hand className="h-3.5 w-3.5" />}
            {busy ? "Stop" : "Hand control"}
          </button>
        )}
      </div>
    </>
  );
}
