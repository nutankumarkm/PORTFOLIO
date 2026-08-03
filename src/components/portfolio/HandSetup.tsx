"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";

import type { HandPose, HandProgress, HandStatus } from "@/lib/hand-control";

interface HandSetupProps {
  status: HandStatus;
  progress: HandProgress | null;
  detail: string | null;
  pose: HandPose;
  present: boolean;
  /** Live camera feed, available well before the model finishes downloading. */
  stream: MediaStream | null;
  /** Receives the canvas the skeleton should be drawn into. */
  onCanvas: (canvas: HTMLCanvasElement | null) => void;
  onStart: () => void;
  onCancel: () => void;
}

const GESTURES = [
  { name: "Thumb + Index", hint: "Touch thumb to index finger to scroll up" },
  { name: "Thumb + Middle", hint: "Touch thumb to middle finger to scroll down" },
  { name: "Thumb + Pinky", hint: "Touch thumb to little finger to select" },
  { name: "Fist", hint: "Close your hand to pause" },
];

/**
 * Full-screen setup shown while the runtime and model download.
 *
 * The camera is live from the first second, so the wait is spent framing the
 * hand rather than watching a spinner. Once the model lands, the same screen
 * turns into a rehearsal space — the skeleton and the live pose readout let
 * someone confirm their gestures register before anything starts responding.
 */
export function HandSetup({
  status,
  progress,
  detail,
  pose,
  present,
  stream,
  onCanvas,
  onStart,
  onCancel,
}: HandSetupProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    video.play().catch(() => {});
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  const ready = status === "running";
  const failed =
    status === "denied" || status === "unsupported" || status === "error";

  const pct =
    progress?.phase === "model" && progress.total > 0
      ? Math.round((progress.loaded / progress.total) * 100)
      : null;

  const step = failed
    ? detail ?? "Something went wrong."
    : status === "requesting"
      ? "Allow camera access to continue"
      : status === "downloading"
        ? progress?.phase === "model"
          ? `Downloading model… ${pct ?? 0}%`
          : "Loading runtime…"
        : present
          ? "Hand detected — try a gesture"
          : "Hold your hand up to the camera";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[130] grid place-items-center bg-base-100/92 px-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Hand control setup"
    >
      <motion.div
        initial={{ y: 16, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        className="w-full max-w-3xl overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <div>
            <div className="font-display text-sm font-bold">Set up hand control</div>
            <div className="font-mono-display text-[9px] uppercase tracking-[0.2em] text-base-content/50">
              On-device · nothing is uploaded
            </div>
          </div>
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Cancel hand control setup"
            data-cursor="hover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[1.15fr_1fr]">
          {/* Camera stage */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-box bg-base-300/50">
            <video
              ref={videoRef}
              muted
              playsInline
              // Mirrored so it reads like a mirror rather than a video call.
              className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
            />
            <canvas
              ref={onCanvas}
              width={480}
              height={360}
              className="absolute inset-0 h-full w-full"
            />

            {/* Framing guide */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div
                className={`h-[62%] w-[46%] rounded-[2rem] border-2 border-dashed transition-colors duration-300 ${
                  present ? "border-success/70" : "border-base-content/25"
                }`}
              />
            </div>

            {!stream && (
              <div className="absolute inset-0 grid place-items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {/* Live status strip */}
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-base-100/85 px-3 py-2 backdrop-blur-md">
              {ready && present ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
              ) : (
                !failed && (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
                )
              )}
              <span className="font-mono-display text-[9px] uppercase tracking-[0.15em] text-base-content/70">
                {step}
              </span>
            </div>
          </div>

          {/* Guidance */}
          <div className="flex flex-col">
            {/* Progress only claims accuracy for the phase that reports a size. */}
            {!ready && !failed && (
              <div className="mb-4">
                <div className="h-1 w-full overflow-hidden rounded-full bg-base-300">
                  <div
                    className={`h-full bg-primary transition-[width] duration-200 ${
                      pct === null ? "w-1/4 animate-pulse" : ""
                    }`}
                    style={pct === null ? undefined : { width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-base-content/50">
                  About 19MB, downloaded once and cached. Get your hand framed
                  while it finishes.
                </p>
              </div>
            )}

            <ul className="space-y-2.5">
              {GESTURES.map((g) => (
                <li
                  key={g.name}
                  className="rounded-field border border-base-300 px-3 py-2"
                >
                  <div className="font-mono-display text-[10px] uppercase tracking-[0.15em] text-primary">
                    {g.name}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-relaxed text-base-content/60">
                    {g.hint}
                  </div>
                </li>
              ))}
            </ul>

            {ready && (
              <div className="mt-3 rounded-field bg-base-200 px-3 py-2 font-mono-display text-[9px] uppercase tracking-[0.15em] text-base-content/60">
                Reading: <span className="text-base-content">{pose}</span>
              </div>
            )}

            <div className="mt-auto flex gap-2 pt-4">
              <button
                onClick={onStart}
                disabled={!ready}
                className="btn btn-primary btn-sm flex-1 rounded-full font-mono-display text-[10px] uppercase tracking-[0.2em] disabled:opacity-40"
                data-cursor="hover"
              >
                {present ? "Start" : ready ? "Start anyway" : "Preparing…"}
              </button>
              <button
                onClick={onCancel}
                className="btn btn-ghost btn-sm rounded-full font-mono-display text-[10px] uppercase tracking-[0.2em]"
                data-cursor="hover"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
