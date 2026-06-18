"use client";

import { motion } from "framer-motion";

interface MorphSilhouetteProps {
  className?: string;
  color?: string;
}

// Three hand-drawn silhouette paths (abstract head/shoulders) that morph
// between each other — gives the about section an organic, sculpted feel
// without leaning on stock illustration.
const PATHS = [
  "M 60 180 C 40 165, 35 130, 50 105 C 35 90, 38 60, 60 55 C 55 30, 85 18, 110 22 C 138 26, 152 50, 145 75 C 165 85, 168 115, 155 135 C 170 150, 168 175, 150 185 C 130 195, 80 195, 60 180 Z",
  "M 55 185 C 30 170, 30 135, 50 110 C 32 92, 40 60, 62 58 C 60 32, 90 20, 112 24 C 140 30, 154 55, 142 80 C 168 88, 170 120, 152 138 C 172 152, 165 180, 145 188 C 122 195, 78 195, 55 185 Z",
  "M 65 180 C 45 165, 40 130, 55 108 C 38 92, 45 62, 65 55 C 60 28, 92 18, 115 22 C 142 28, 156 52, 144 76 C 166 86, 168 116, 152 134 C 168 150, 162 178, 144 186 C 124 196, 80 196, 65 180 Z",
];

export function MorphSilhouette({
  className = "",
  color = "#d4ff3a",
}: MorphSilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {/* Background filled morphing shape */}
      <motion.path
        d={PATHS[0]}
        fill={color}
        opacity={0.08}
        animate={{ d: PATHS }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Outline morphing shape */}
      <motion.path
        d={PATHS[0]}
        stroke={color}
        strokeWidth={1.2}
        fill="none"
        animate={{ d: PATHS }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Offset echo outline */}
      <motion.path
        d={PATHS[0]}
        stroke={color}
        strokeWidth={0.5}
        fill="none"
        opacity={0.4}
        animate={{ d: PATHS }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
        style={{ transform: "translate(4px, 4px)", transformOrigin: "center" }}
      />
    </svg>
  );
}
