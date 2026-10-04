"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useThemeColors } from "@/lib/theme-colors";
import { useIsMobileViewport } from "@/lib/viewport";
import { STAGE_SECTIONS, useStageIndex } from "@/lib/scroll-stage";

import { AICoreHero } from "./AICoreHero";
import { WorkspaceAbout } from "./WorkspaceAbout";
import { OrbitSkills } from "./OrbitSkills";
import { GlassCubeProjects } from "./GlassCubeProjects";
import { TimelineTunnel } from "./TimelineTunnel";

interface Scene3DProps {
  onSelectProject: (idx: number) => void;
}

// One fixed view per page section, in DOM order. The camera does NOT track the
// scroll: when the page settles on a new section it eases to that section's
// view on a short timer of its own, then holds still. Scrolling therefore
// never waits on a WebGL frame, and the backdrop never has to catch up with it.
const VIEWS: Record<
  string,
  { pos: [number, number, number]; lookAt: [number, number, number] }
> = {
  hero: { pos: [0, 0, 7.5], lookAt: [-1.8, 0, 0] },
  about: { pos: [8, 0, 3.2], lookAt: [6.2, 0, 0] },
  skills: { pos: [0, 8, -4.5], lookAt: [-2.0, 8, -10] },
  jobmatcher: { pos: [3.4, 3.2, 5.6], lookAt: [1.2, 0.8, 0] },
  experience: { pos: [0, -12, 9.0], lookAt: [-1.5, -12, 0] }, // inside the tunnel
  projects: { pos: [-8, 0, 7.5], lookAt: [-9.8, 0, 0] },
  achievements: { pos: [-4.6, 2.4, 8.6], lookAt: [-6.8, 0.6, 0.6] },
  contact: { pos: [9.8, -0.6, 2.5], lookAt: [8.0, 0, 0] }, // side desk terminal
};

// Which 3D set belongs to each section.
const GROUP_FOR_SECTION: Record<string, string> = {
  hero: "core",
  about: "workspace",
  skills: "orbit",
  jobmatcher: "core",
  experience: "tunnel",
  projects: "cubes",
  achievements: "cubes",
  contact: "workspace",
};

// How long the camera takes to ease to the next section's view.
const TRANSITION_S = 0.9;

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
// the compositing of the page above it. Only the camera's short ease between
// sections is drawn at the full display rate.
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
function RenderStep({ movingRef }: { movingRef: RefObject<boolean> }) {
  const lastRender = useRef(-Infinity);

  useFrame(({ gl, scene, camera }) => {
    // The frame's own timestamp, shared by every callback in it.
    // performance.now() would add the jitter of where in the frame this runs.
    const now = Number(document.timeline.currentTime ?? performance.now());
    if (!movingRef.current && now - lastRender.current < FRAME_INTERVAL_MS) {
      return;
    }
    lastRender.current = now;
    gl.render(scene, camera);
  }, 1);

  return null;
}

/**
 * Compiles every set's shaders while the intro overlay is still up. All sets
 * stay mounted (hidden when off), so a section change never links a program.
 */
function PrecompileShaders() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    if (gl.extensions.has("KHR_parallel_shader_compile")) {
      gl.compileAsync(scene, camera).catch(() => {});
      return;
    }
    // Without the extension, drivers defer the link until a program's status is
    // first read; read it now rather than on the first visit to each set.
    gl.compile(scene, camera);
    for (const program of gl.info.programs ?? []) program.getUniforms();
  }, [gl, scene, camera]);

  return null;
}

/** True when neither the object nor any of its ancestors is hidden. */
function isShown(object: THREE.Object3D | null): boolean {
  for (let node = object; node; node = node.parent) {
    if (!node.visible) return false;
  }
  return true;
}

/** three's raycaster ignores `visible`; drop hits on hidden sets. */
function VisibleHitsOnly() {
  const setEvents = useThree((s) => s.setEvents);

  useEffect(() => {
    setEvents({ filter: (hits) => hits.filter((hit) => isShown(hit.object)) });
  }, [setEvents]);

  return null;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Eases to the current section's view, holds it, and adds a breath of drift. */
function CameraRig({
  sectionId,
  movingRef,
}: {
  sectionId: string;
  movingRef: RefObject<boolean>;
}) {
  const view = VIEWS[sectionId] ?? VIEWS.hero;
  const pos = useRef(new THREE.Vector3(...view.pos));
  const look = useRef(new THREE.Vector3(...view.lookAt));
  const fromPos = useRef(new THREE.Vector3(...view.pos));
  const fromLook = useRef(new THREE.Vector3(...view.lookAt));
  const toPos = useRef(new THREE.Vector3(...view.pos));
  const toLook = useRef(new THREE.Vector3(...view.lookAt));
  const progress = useRef(1);

  // New section: start a timed ease from wherever the camera is now.
  useEffect(() => {
    fromPos.current.copy(pos.current);
    fromLook.current.copy(look.current);
    toPos.current.set(...view.pos);
    toLook.current.set(...view.lookAt);
    progress.current = 0;
  }, [view]);

  useFrame(({ camera, clock }, delta) => {
    if (progress.current < 1) {
      // Clamped so a stalled tab doesn't teleport the camera.
      progress.current = Math.min(1, progress.current + Math.min(delta, 0.1) / TRANSITION_S);
      const e = easeInOut(progress.current);
      pos.current.lerpVectors(fromPos.current, toPos.current, e);
      look.current.lerpVectors(fromLook.current, toLook.current, e);
      movingRef.current = true;
    } else {
      movingRef.current = false;
    }

    const t = clock.getElapsedTime();
    camera.position.set(
      pos.current.x + Math.sin(t * 0.32) * 0.12,
      pos.current.y + Math.cos(t * 0.24) * 0.1,
      pos.current.z
    );
    camera.lookAt(look.current);
  });

  return null;
}

export default function Scene3D({ onSelectProject }: Scene3DProps) {
  const theme = useThemeColors();
  const { isDark } = theme;

  // The page only mounts the scene on desktop; this guards direct use.
  const isMobile = useIsMobileViewport();

  // Re-renders only when the page settles on a different section.
  const index = useStageIndex();
  const sectionId = STAGE_SECTIONS[index]?.id ?? "hero";
  const group = GROUP_FOR_SECTION[sectionId] ?? "core";

  // The set being left stays visible until the camera has finished easing away.
  const [shown, setShown] = useState(group);
  const [leaving, setLeaving] = useState<string | null>(null);
  if (shown !== group) {
    setLeaving(shown);
    setShown(group);
  }
  useEffect(() => {
    if (!leaving) return;
    const id = setTimeout(() => setLeaving(null), TRANSITION_S * 1000);
    return () => clearTimeout(id);
  }, [leaving, shown]);
  const isOn = (g: string) => g === shown || g === leaving;

  const movingRef = useRef(true);

  if (isMobile) {
    return null; // Fallback to CSS styles on mobile screens
  }

  // Every color below is pulled from the active daisyUI theme, so the scene
  // follows the palette instead of carrying its own.
  const bgColor = theme.base100;
  const gridColor1 = theme.base300;
  const gridColor2 = theme.base200;

  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none">
      {/* pointer-events-auto so mouse gestures reach the 3D meshes */}
      <Canvas
        className="w-full h-full block pointer-events-auto"
        camera={{ fov: 45, near: 0.1, far: 100, position: VIEWS.hero.pos }}
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

        {/* Every set stays mounted; those not on show are hidden and idle.
            Unmounting would change the scene's light count (recompiling every
            lit shader) and throw away compiled programs. */}
        <AICoreHero active={isOn("core")} />
        <WorkspaceAbout active={isOn("workspace")} />
        <OrbitSkills active={isOn("orbit")} />
        <GlassCubeProjects active={isOn("cubes")} onSelectProject={onSelectProject} />
        <TimelineTunnel active={isOn("tunnel")} />

        <CameraRig sectionId={sectionId} movingRef={movingRef} />
        <RenderStep movingRef={movingRef} />
        <PrecompileShaders />
        <VisibleHitsOnly />
      </Canvas>

      {/* Click-through, so the project cubes stay reachable. */}
      <div className={`pointer-events-none absolute inset-0 ${SCENE_SCRIM}`} />
    </div>
  );
}
