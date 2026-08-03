"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { projects } from "@/lib/portfolio-data";
import { useThemeColors } from "@/lib/theme-colors";

// Fixed positions for the 4 project cubes in local coordinate space
const CUBE_POSITIONS: [number, number, number][] = [
  [-1.5, 1.0, 0],   // Top-Left
  [1.5, 0.8, -0.5],  // Top-Right
  [-1.2, -1.0, 0.5], // Bottom-Left
  [1.5, -0.9, 0],   // Bottom-Right
];

function ProjectCube({
  project,
  idx,
  position,
  onSelect,
}: {
  project: typeof projects[number];
  idx: number;
  position: [number, number, number];
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const scale = useRef(1);
  const theme = useThemeColors();
  // Alternate the two brand accents so adjacent cubes stay distinguishable.
  const tone = idx % 2 === 0 ? theme.primary : theme.accent;

  // Assign different geometric shapes inside the physical glass cubes (silver wireframes)
  const renderInnerCore = () => {
    if (idx === 0) return <torusGeometry args={[0.22, 0.08, 8, 24]} />;
    if (idx === 1) return <octahedronGeometry args={[0.3, 0]} />;
    if (idx === 2) return <torusKnotGeometry args={[0.18, 0.06, 32, 8]} />;
    return <boxGeometry args={[0.32, 0.32, 0.32]} />;
  };

  // Perform floating drift, spin acceleration, and smooth hover scale lerps
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Gentle vertical wave drift
      groupRef.current.position.y = position[1] + Math.sin(elapsed * 1.2 + idx * 2) * 0.12;

      // Accelerate spin on hover
      const rotSpeed = isHovered ? 0.8 : 0.2;
      groupRef.current.rotation.x = elapsed * rotSpeed * 0.5;
      groupRef.current.rotation.y = elapsed * rotSpeed;
    }

    if (meshRef.current) {
      // Elastic scale transition on hover
      const targetScale = isHovered ? 1.2 : 1.0;
      scale.current = THREE.MathUtils.lerp(scale.current, targetScale, 0.15);
      meshRef.current.scale.setScalar(scale.current);
    }
  });

  return (
    <group ref={groupRef} position={[position[0], 0, position[2]]}>
      {/* Outer Physical Glass Refractive Cube (Frosted White Glass) */}
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setIsHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setIsHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={onSelect}
      >
        <boxGeometry args={[0.85, 0.85, 0.85]} />
        {/* Frosted look without `transmission`/`clearcoat`: both force extra
            per-frame render passes for what is a background decoration. */}
        <meshStandardMaterial
          color={isHovered ? tone : theme.base200}
          roughness={0.12}
          metalness={0.1}
          transparent
          opacity={theme.isDark ? 0.42 : 0.3}
        />
      </mesh>

      {/* Glowing Inner Core Mesh (Silver Core) */}
      <mesh>
        {renderInnerCore()}
        <meshStandardMaterial
          color={tone}
          emissive={tone}
          emissiveIntensity={isHovered ? 1.4 : 0.4}
          roughness={0.15}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* 3D Monospace Title projection (Silver Glass Card) */}
      <Html position={[0, 0.7, 0]} center distanceFactor={7}>
        <div
          className={`flex flex-col items-center pointer-events-none select-none transition-all duration-300 ${
            isHovered ? "scale-105 opacity-100 font-bold" : "scale-95 opacity-60"
          }`}
        >
          <span
            className="px-2 py-0.5 rounded border border-base-300 bg-base-100/95 text-base-content font-mono text-[8px] sm:text-[9px] whitespace-nowrap shadow-md"
          >
            {project.title.split(" ")[0]}..
          </span>
        </div>
      </Html>
    </group>
  );
}

export function GlassCubeProjects({ onSelectProject }: { onSelectProject: (idx: number) => void }) {
  const theme = useThemeColors();

  return (
    <group position={[-8, 0, 0]}>
      {/* Local point lights targeting project coordinates */}
      <pointLight position={[-2, 2, 2]} intensity={2.0} color={theme.primary} distance={8} />
      <pointLight position={[2, -2, 2]} intensity={2.0} color={theme.accent} distance={8} />

      {/* Render 4 Projects Cubes */}
      {projects.map((p, idx) => {
        const position = CUBE_POSITIONS[idx] || [0, 0, 0];
        return (
          <ProjectCube
            key={p.title}
            project={p}
            idx={idx}
            position={position}
            onSelect={() => onSelectProject(idx)}
          />
        );
      })}
    </group>
  );
}
