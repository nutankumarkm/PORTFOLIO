"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useThemeColors } from "@/lib/theme-colors";
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
// are mounted, so one scene's worth of frame time covers the whole page.
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

/* Viewport check as an external store — no effect, no setState-on-mount. */
const MOBILE_QUERY = "(max-width: 767px)";

const subscribeMobile = (onChange: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const getMobileSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;
const getServerMobileSnapshot = () => false;

// Parked, the scene is a slow-drifting backdrop and half the repaints means
// half the WebGL work *and* half the backdrop-filter re-blurs on the glass
// panels above it. Mid-flight it needs the full rate or the camera steps.
const IDLE_FPS = 30;
const FLIGHT_FPS = 60;

// Drives rendering manually so the canvas can run below the display refresh
// rate, at a rate the camera raises while it is moving.
function FrameLimiter({ fpsRef }: { fpsRef: RefObject<number> }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let rafId = 0;
    let lastRender = 0;

    const tick = (time: number) => {
      rafId = requestAnimationFrame(tick);
      // Backgrounded tabs stop rendering entirely.
      if (document.hidden) return;
      // Half a millisecond of slack: at 60 the vsync interval lands a hair
      // under 1000/60 often enough to drop every other frame without it.
      if (time - lastRender < 1000 / fpsRef.current - 0.5) return;
      lastRender = time;
      invalidate();
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [invalidate, fpsRef]);

  return null;
}

// Flies the camera along the waypoint curve at the shared stage position.
function CameraFlight({
  path,
  fpsRef,
}: {
  path: { position: THREE.CatmullRomCurve3; lookAt: THREE.CatmullRomCurve3 };
  fpsRef: RefObject<number>;
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
      fpsRef.current = IDLE_FPS;
    } else {
      // Exponential decay rather than a spring: it lands instead of
      // overshooting, which matters on the long traverses.
      current.current += remaining * (1 - Math.exp(-step * CAMERA_DAMPING));
      fpsRef.current = FLIGHT_FPS;
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

  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getServerMobileSnapshot
  );

  const liveGroups = useLiveGroups();
  const fpsRef = useRef(FLIGHT_FPS);

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
        // Rendering is driven by <FrameLimiter/> rather than the display refresh.
        frameloop="demand"
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

        {/* Only the sets under the camera are mounted and animating */}
        {liveGroups.includes("core") && <AICoreHero />}
        {liveGroups.includes("workspace") && <WorkspaceAbout />}
        {liveGroups.includes("orbit") && <OrbitSkills />}
        {liveGroups.includes("cubes") && (
          <GlassCubeProjects onSelectProject={onSelectProject} />
        )}
        {liveGroups.includes("tunnel") && <TimelineTunnel />}

        <CameraFlight path={path} fpsRef={fpsRef} />
        <FrameLimiter fpsRef={fpsRef} />
      </Canvas>

      {/* Sits above the canvas but stays click-through, so the project cubes
          are still reachable. */}
      <div className={`pointer-events-none absolute inset-0 ${SCENE_SCRIM}`} />
    </div>
  );
}
