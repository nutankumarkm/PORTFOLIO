"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useThemeColors } from "@/lib/theme-colors";
import { useIsMobileViewport } from "@/lib/viewport";

import { AICoreHero } from "./AICoreHero";

// The one view the background holds: the AI core, framed to sit beside the
// hero copy. The camera deliberately ignores the scroll — the page moves over a
// scene that animates on its own clock, so scrolling never has to wait on a
// WebGL frame and the backdrop never has to catch up with the page.
const CAMERA_POSITION: [number, number, number] = [0, 0, 7.5];
const CAMERA_TARGET = new THREE.Vector3(-1.8, 0, 0);

// Wash over the canvas, under the page content.
//
// The panels above the scene deliberately carry no `backdrop-filter`: blurring
// what sits behind them has to be redone on every frame the canvas changes,
// which on laptop GPUs was the heaviest cost on the page while scrolling. They
// are opaque enough to read on their own, and the scene is softened once, here.
// Raise for more contrast behind text, drop to 0 to see the scene at full
// strength.
const SCENE_SCRIM = "bg-base-100/35";

// A slow-moving backdrop: half a 60Hz display's rate halves the WebGL work and
// the compositing of the page above it, and the core turns slowly enough that
// the difference doesn't show.
const FPS = 30;

// Frame timestamps wobble around the vsync interval. A quarter of a 60Hz frame
// of slack keeps the rate from slipping a whole extra frame on that noise at
// any common refresh rate (60, 90, 120, 144Hz).
const FRAME_INTERVAL_MS = 1000 / FPS - 4;

/**
 * Draws the scene at FPS.
 *
 * The canvas runs `frameloop="always"` so every useFrame callback sees every
 * display frame; this is the only priority > 0 subscriber, which switches off
 * R3F's automatic render and leaves the draw to it, inside the frame that asked
 * for it. (Throttling R3F's demand loop from outside instead restarts it with
 * `requestAnimationFrame`, which always lands a frame late.)
 */
function RenderStep() {
  const lastRender = useRef(-Infinity);

  useFrame(({ gl, scene, camera }) => {
    // The frame's own timestamp, shared by every callback in it.
    // performance.now() would add the jitter of where in the frame this runs.
    const now = Number(document.timeline.currentTime ?? performance.now());
    if (now - lastRender.current < FRAME_INTERVAL_MS) return;
    lastRender.current = now;
    gl.render(scene, camera);
  }, 1);

  return null;
}

/** A breath of drift so the camera feels alive without moving the framing. */
function CameraDrift() {
  useFrame(({ camera, clock }) => {
    const elapsed = clock.getElapsedTime();
    camera.position.set(
      CAMERA_POSITION[0] + Math.sin(elapsed * 0.32) * 0.12,
      CAMERA_POSITION[1] + Math.cos(elapsed * 0.24) * 0.1,
      CAMERA_POSITION[2]
    );
    camera.lookAt(CAMERA_TARGET);
  });

  return null;
}

export default function Scene3D() {
  const theme = useThemeColors();
  const { isDark } = theme;

  // The page only mounts the scene on desktop; this guards direct use.
  const isMobile = useIsMobileViewport();

  if (isMobile) {
    return null; // Fallback to CSS styles on mobile screens
  }

  // Every color below is pulled from the active daisyUI theme, so the scene
  // follows the palette instead of carrying its own.
  const bgColor = theme.base100;
  const gridColor1 = theme.base300;
  const gridColor2 = theme.base200;

  return (
    // Purely decorative: nothing in the scene takes pointer input.
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none">
      <Canvas
        className="w-full h-full block"
        camera={{ fov: 45, near: 0.1, far: 100, position: CAMERA_POSITION }}
        // Cap the pixel ratio: retina panels otherwise shade 4x the pixels for
        // a background element nobody is inspecting up close.
        dpr={[1, 1.5]}
        // Every display frame runs the scene's callbacks; <RenderStep/> decides
        // which of them are drawn.
        frameloop="always"
        gl={{
          antialias: false,
          alpha: false,
          stencil: false,
          powerPreference: "high-performance",
        }}
      >
        {/* Set solid background color and smooth depth fog matching the CSS theme */}
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 8, 30]} />

        {/* Soft atmospheric background lighting */}
        <ambientLight intensity={isDark ? 0.25 : 0.65} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={isDark ? 0.5 : 1.2}
          color={theme.base100}
        />

        {/* Cinematic Grid Grid-plane to ground the coordinates */}
        <gridHelper args={[100, 40, gridColor1, gridColor2]} position={[0, -4, 0]} />

        <AICoreHero />

        <CameraDrift />
        <RenderStep />
      </Canvas>

      <div className={`pointer-events-none absolute inset-0 ${SCENE_SCRIM}`} />
    </div>
  );
}
