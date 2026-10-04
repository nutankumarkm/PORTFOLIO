"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useThemeColors } from "@/lib/theme-colors";
import { useIsMobileViewport } from "@/lib/viewport";
import {
  STAGE_LAST,
  STAGE_SECTIONS,
  getStageProgress,
  subscribeStageFrame,
} from "@/lib/scroll-stage";

import { AICoreHero } from "./AICoreHero";
import { WorkspaceAbout } from "./WorkspaceAbout";
import { OrbitSkills } from "./OrbitSkills";
import { GlassCubeProjects } from "./GlassCubeProjects";
import { TimelineTunnel } from "./TimelineTunnel";

interface Scene3DProps {
  onSelectProject: (idx: number) => void;
}

// One camera waypoint per page section, in DOM order. The camera is *on* a
// waypoint exactly when its section is centered, and interpolates through the
// curve in between — so the flight is the scroll, not a reaction to it.
const WAYPOINTS: Record<
  string,
  { pos: [number, number, number]; lookAt: [number, number, number] }
> = {
  hero: { pos: [0, 0, 7.5], lookAt: [-1.8, 0, 0] },
  about: { pos: [8, 0, 3.2], lookAt: [6.2, 0, 0] },
  skills: { pos: [0, 8, -4.5], lookAt: [-2.0, 8, -10] },
  // Climbs back down out of the orbit and re-frames the core from above.
  jobmatcher: { pos: [3.4, 3.2, 5.6], lookAt: [1.2, 0.8, 0] },
  experience: { pos: [0, -12, 9.0], lookAt: [-1.5, -12, 0] }, // inside the tunnel
  projects: { pos: [-8, 0, 7.5], lookAt: [-9.8, 0, 0] },
  // Pulls back off the cubes before the long sweep across to the desk.
  achievements: { pos: [-4.6, 2.4, 8.6], lookAt: [-6.8, 0.6, 0.6] },
  contact: { pos: [9.8, -0.6, 2.5], lookAt: [8.0, 0, 0] }, // side desk terminal
};

// Which 3D set is on camera for a given section. Only the sets near the camera
// are drawn, so one scene's worth of frame time covers the whole page.
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

// How hard the camera chases the scroll. Higher lands sooner and tracks the
// wheel more literally; lower glides. ~5 keeps a flick of momentum without
// feeling detached from the page.
const CAMERA_DAMPING = 5;

// Below this the camera counts as parked: it stops chasing and the canvas drops
// back to its idle frame rate.
const SETTLE_EPSILON = 0.0004;

// Wash over the canvas, under the page content.
//
// The sections carry a scroll transform, which makes each one a backdrop root —
// so `backdrop-filter` on the glass panels inside them cannot sample the canvas
// and quietly stops blurring. Rather than making fifteen panels opaque enough to
// survive without it, the scene itself is softened once, here. Raise for more
// contrast behind text, drop to 0 to see the scene at full strength.
const SCENE_SCRIM = "bg-base-100/35";

// Parked, the scene is a slow-drifting backdrop and half the repaints means
// half the WebGL work *and* half the backdrop-filter re-blurs on the glass
// panels above it. Mid-flight it draws every display frame, or the camera
// visibly steps against the page scrolling over it.
const IDLE_FPS = 30;

// Frame timestamps wobble around the vsync interval. A quarter of a 60Hz frame
// of slack keeps the idle rate from slipping a whole extra frame on that noise
// at any common refresh rate (60, 90, 120, 144Hz).
const IDLE_INTERVAL_MS = 1000 / IDLE_FPS - 4;

/**
 * Decides, once per display frame, whether that frame gets drawn.
 *
 * The canvas runs `frameloop="always"` so every useFrame callback sees every
 * display frame; this is the only priority > 0 subscriber, which switches off
 * R3F's automatic render and leaves the draw to it. Drawing inside the frame
 * that asked for it is the point. The previous limiter restarted R3F's demand
 * loop with `requestAnimationFrame` from within a frame callback, which always
 * lands on the *next* frame — so the scene could only ever draw every other
 * frame: 30fps mid-flight on a 60Hz screen, under a page scrolling at 60.
 */
function RenderStep({ flyingRef }: { flyingRef: RefObject<boolean> }) {
  const lastRender = useRef(-Infinity);

  useFrame(({ gl, scene, camera }) => {
    // The frame's own timestamp, shared by every callback in it.
    // performance.now() would add the jitter of where in the frame this runs.
    const now = Number(document.timeline.currentTime ?? performance.now());
    if (!flyingRef.current && now - lastRender.current < IDLE_INTERVAL_MS) {
      return;
    }
    lastRender.current = now;
    gl.render(scene, camera);
  }, 1);

  return null;
}

/**
 * Compiles every set's shaders while the intro overlay is still up.
 *
 * Sets off the camera's path are hidden rather than unmounted, so all of their
 * materials are already in the scene, and `compile` walks hidden objects too.
 * The cost is paid once, here, instead of as a hitch the first time the camera
 * flies into each set.
 */
function PrecompileShaders() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    if (gl.extensions.has("KHR_parallel_shader_compile")) {
      // The driver compiles on its own threads; nothing here blocks.
      gl.compileAsync(scene, camera).catch(() => {});
      return;
    }

    // Without that extension drivers defer the real work until a program's
    // status is first read, which three does on the program's first draw. Read
    // it now, behind the intro, rather than mid-flight into each set. Every
    // program, not just each material's current one: transparent double-sided
    // materials compile a back-face and a front-face variant.
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

/**
 * three's raycaster ignores `visible`, so without this a hidden set's cubes and
 * planets would still take hovers and clicks wherever they sit on screen.
 */
function VisibleHitsOnly() {
  const setEvents = useThree((s) => s.setEvents);

  useEffect(() => {
    setEvents({ filter: (hits) => hits.filter((hit) => isShown(hit.object)) });
  }, [setEvents]);

  return null;
}

// Flies the camera along the waypoint curve at the shared stage position.
function CameraFlight({
  path,
  flyingRef,
}: {
  path: { position: THREE.CatmullRomCurve3; lookAt: THREE.CatmullRomCurve3 };
  flyingRef: RefObject<boolean>;
}) {
  const { camera } = useThree();
  const target = useRef(getStageProgress());
  const current = useRef(getStageProgress());
  const position = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());

  useEffect(() => subscribeStageFrame((progress) => {
    target.current = progress;
  }), []);

  useFrame((state, delta) => {
    // Clamped so a stalled tab doesn't teleport the camera on the next frame.
    const step = Math.min(delta, 0.1);
    const remaining = target.current - current.current;

    if (Math.abs(remaining) < SETTLE_EPSILON) {
      current.current = target.current;
      flyingRef.current = false;
    } else {
      // Exponential decay rather than a spring: it lands instead of
      // overshooting, which matters on the long traverses.
      current.current += remaining * (1 - Math.exp(-step * CAMERA_DAMPING));
      flyingRef.current = true;
    }

    const t = STAGE_LAST > 0 ? current.current / STAGE_LAST : 0;
    path.position.getPoint(t, position.current);
    path.lookAt.getPoint(t, lookAt.current);

    // A breath of drift so a parked camera still feels alive. Small enough not
    // to disturb the framing each waypoint was composed for.
    const elapsed = state.clock.getElapsedTime();
    camera.position.set(
      position.current.x + Math.sin(elapsed * 0.32) * 0.12,
      position.current.y + Math.cos(elapsed * 0.24) * 0.1,
      position.current.z
    );
    camera.lookAt(lookAt.current);
  });

  return null;
}

/** The one or two 3D sets within reach of the camera's current position. */
function groupsFor(progress: number): string[] {
  const mid = Math.min(STAGE_LAST, Math.max(0, Math.round(progress)));
  const offset = progress - mid;
  const groups = [GROUP_FOR_SECTION[STAGE_SECTIONS[mid].id] ?? "core"];

  // The neighbour joins once the flight has actually left the waypoint. The
  // dead band keeps a parked camera from thrashing a set in and out of the
  // scene on sub-pixel scroll jitter.
  if (Math.abs(offset) > 0.12) {
    const neighbour = Math.min(
      STAGE_LAST,
      Math.max(0, mid + Math.sign(offset))
    );
    const group = GROUP_FOR_SECTION[STAGE_SECTIONS[neighbour].id] ?? "core";
    if (group !== groups[0]) groups.push(group);
  }

  return groups;
}

function useLiveGroups(): string[] {
  const [groups, setGroups] = useState(() => groupsFor(getStageProgress()));

  useEffect(() => subscribeStageFrame((progress) => {
    const next = groupsFor(progress);
    // Re-renders only when a set actually enters or leaves the scene, not on
    // every scroll frame.
    setGroups((prev) =>
      prev.length === next.length && prev.every((g, i) => g === next[i])
        ? prev
        : next
    );
  }), []);

  return groups;
}

export default function Scene3D({ onSelectProject }: Scene3DProps) {
  const theme = useThemeColors();
  const { isDark } = theme;

  // The page only mounts the scene on desktop; this guards direct use.
  const isMobile = useIsMobileViewport();

  const liveGroups = useLiveGroups();
  // Start as "flying" so the first frames draw at full rate while the camera
  // settles onto wherever the page was restored to.
  const flyingRef = useRef(true);

  // Centripetal parameterisation: the waypoints are unevenly spaced, and a
  // uniform spline loops back on itself between the far-apart ones.
  const path = useMemo(() => {
    const toCurve = (key: "pos" | "lookAt") =>
      new THREE.CatmullRomCurve3(
        STAGE_SECTIONS.map(
          (section) => new THREE.Vector3(...WAYPOINTS[section.id][key])
        ),
        false,
        "centripetal",
        0.5
      );
    return { position: toCurve("pos"), lookAt: toCurve("lookAt") };
  }, []);

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
      {/* Set pointer-events-auto for Canvas so mouse gestures reach 3D meshes */}
      <Canvas
        className="w-full h-full block pointer-events-auto"
        camera={{ fov: 45, near: 0.1, far: 100, position: WAYPOINTS.hero.pos }}
        // Cap the pixel ratio: retina panels otherwise shade 4x the pixels for
        // a background element nobody is inspecting up close.
        dpr={[1, 1.5]}
        // Every display frame runs the scene's callbacks; <RenderStep/> decides
        // which of them are drawn.
        frameloop="always"
        // Let R3F scale resolution down instead of dropping frames.
        performance={{ min: 0.5, debounce: 200 }}
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

        {/* Every set stays mounted; those off the camera's path are hidden and
            idle rather than unmounted. Unmounting changed the scene's light
            count at each section boundary — which recompiles every lit shader
            — and threw away the set's geometry, materials and programs, so the
            flight hitched exactly as it crossed from one set to the next. */}
        <AICoreHero active={liveGroups.includes("core")} />
        <WorkspaceAbout active={liveGroups.includes("workspace")} />
        <OrbitSkills active={liveGroups.includes("orbit")} />
        <GlassCubeProjects
          active={liveGroups.includes("cubes")}
          onSelectProject={onSelectProject}
        />
        <TimelineTunnel active={liveGroups.includes("tunnel")} />

        <CameraFlight path={path} flyingRef={flyingRef} />
        <RenderStep flyingRef={flyingRef} />
        <PrecompileShaders />
        <VisibleHitsOnly />
      </Canvas>

      {/* Sits above the canvas but stays click-through, so the project cubes
          are still reachable. */}
      <div className={`pointer-events-none absolute inset-0 ${SCENE_SCRIM}`} />
    </div>
  );
}
