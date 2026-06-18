"use client";

import { motion } from "framer-motion";

interface MorphBlobProps {
  className?: string;
  color?: string;
  duration?: number;
  opacity?: number;
}

// Hand-authored closed Bézier blobs that morph smoothly via framer-motion's
// path animation. All paths share the same number of segments so morphing is
// geometrically stable (no flicker).
const PATHS = [
  "M 110,20 C 170,30 200,80 195,130 C 190,180 145,205 95,200 C 45,195 20,150 25,100 C 30,55 70,15 110,20 Z",
  "M 110,25 C 165,20 205,70 200,120 C 195,170 145,205 95,200 C 50,195 18,150 28,100 C 38,55 65,30 110,25 Z",
  "M 100,18 C 160,25 210,70 200,125 C 190,180 140,210 90,200 C 40,190 18,145 25,95 C 32,50 60,15 100,18 Z",
  "M 115,22 C 170,30 198,80 198,128 C 198,180 150,202 100,200 C 50,198 22,150 28,100 C 34,55 70,18 115,22 Z",
];

export function MorphBlob({
  className = "",
  color = "#d4ff3a",
  duration = 14,
  opacity = 0.18,
}: MorphBlobProps) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <motion.path
        d={PATHS[0]}
        fill={color}
        opacity={opacity}
        animate={{ d: PATHS }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
}

// Multi-stroke version — looks like layered motion graphics
export function MorphBlobLines({
  className = "",
  color = "#d4ff3a",
  duration = 18,
}: MorphBlobProps) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.path
          key={i}
          d={PATHS[0]}
          stroke={color}
          strokeWidth={1}
          fill="none"
          opacity={0.18 - i * 0.025}
          animate={{
            d: PATHS,
            opacity: [0.18 - i * 0.025, 0.05, 0.18 - i * 0.025],
          }}
          transition={{
            duration: duration + i * 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            transform: `scale(${1 + i * 0.08})`,
            transformOrigin: "center",
          }}
        />
      ))}
    </svg>
  );
}
