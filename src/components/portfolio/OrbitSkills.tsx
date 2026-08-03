"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { skillGroups } from "@/lib/portfolio-data";
import { useThemeColors } from "@/lib/theme-colors";

// Orbit configurations. `tone` names a theme token rather than a fixed color,
// so the orbits re-tint with the active daisyUI palette.
const PLANET_CONFIGS = [
  { radius: 2.2, speed: 0.35, size: 0.30, tone: "primary", label: "AI & ML" },
  { radius: 3.5, speed: 0.22, size: 0.38, tone: "accent", label: "LLM & RAG" },
  { radius: 4.8, speed: 0.16, size: 0.34, tone: "primary", label: "App Dev" },
  { radius: 6.0, speed: 0.12, size: 0.28, tone: "accent", label: "Languages" },
  { radius: 7.2, speed: 0.08, size: 0.32, tone: "secondary", label: "Infra & DB" },
] as const;

function SkillPlanet({
  config,
  skillsList,
}: {
  config: typeof PLANET_CONFIGS[number];
  skillsList: string[];
}) {
  const orbitRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const scale = useRef(1);
  const theme = useThemeColors();
  const tone = theme[config.tone];

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // Rotate orbit (retards speed on hover)
    if (orbitRef.current) {
      const speedMultiplier = isHovered ? 0.15 : 1.0;
      orbitRef.current.rotation.y = elapsed * config.speed * speedMultiplier;
    }

    // Elastic scale lerp
    if (planetRef.current) {
      const targetScale = isHovered ? 1.25 : 1.0;
      scale.current = THREE.MathUtils.lerp(scale.current, targetScale, 0.15);
      planetRef.current.scale.setScalar(scale.current);
    }
  });

  return (
    <group>
      {/* 3D Wireframe circular track line (Silver) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[config.radius - 0.02, config.radius + 0.02, 48]} />
        <meshBasicMaterial
          color={theme.isDark ? theme.base300 : tone}
          transparent
          opacity={isHovered ? 0.35 : theme.isDark ? 0.08 : 0.18}
          side={THREE.DoubleSide}
          blending={
            theme.isDark ? THREE.AdditiveBlending : THREE.NormalBlending
          }
        />
      </mesh>

      {/* Orbit Rotational Group containing the planet node */}
      <group ref={orbitRef}>
        {/* Shift the planet mesh to its orbital radius distance */}
        <group position={[config.radius, 0, 0]}>
          <mesh
            ref={planetRef}
            onPointerOver={() => {
              setIsHovered(true);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setIsHovered(false);
              document.body.style.cursor = "auto";
            }}
          >
            <sphereGeometry args={[config.size, 16, 12]} />
            <meshStandardMaterial
              color={tone}
              emissive={tone}
              emissiveIntensity={isHovered ? 0.8 : 0.25}
              roughness={0.15}
              metalness={0.2}
              transparent
              opacity={0.82}
            />
          </mesh>

          {/* Halo ring accent on hover */}
          {isHovered && (
            <mesh rotation={[Math.PI / 3, 0, 0]}>
              <ringGeometry args={[config.size + 0.1, config.size + 0.15, 32]} />
              <meshBasicMaterial color={tone} side={THREE.DoubleSide} transparent opacity={0.5} />
            </mesh>
          )}

          {/* 3D HTML Label (Silver Glass card) */}
          <Html position={[0, config.size + 0.3, 0]} center distanceFactor={8}>
            <div
              className={`flex flex-col items-center pointer-events-none select-none transition-all duration-300 ${
                isHovered ? "scale-100 opacity-100 font-bold" : "scale-90 opacity-70"
              }`}
            >
              <span
                className="px-2 py-0.5 rounded font-mono-display text-[9px] border border-base-300 bg-base-100/95 text-base-content whitespace-nowrap shadow-md"
              >
                {config.label}
              </span>

              {/* Skill items list popup */}
              {isHovered && (
                <div
                  className="mt-1.5 p-2 rounded-lg border border-base-300 bg-base-100/95 text-left text-[8px] font-mono leading-relaxed max-w-[150px] text-base-content/80 shadow-lg animate-fade-in"
                >
                  {skillsList.slice(0, 6).map((skill) => (
                    <div key={skill} className="flex items-center gap-1">
                      <span>•</span>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}

export function OrbitSkills() {
  const sunRef = useRef<THREE.Mesh>(null);
  const theme = useThemeColors();

  // Rotate central tech core
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y = elapsed * 0.5;
    }
  });

  return (
    <group position={[0, 8, -10]}>
      {/* Soft point light */}
      <pointLight position={[0, 0, 0]} intensity={3.0} color={theme.primary} distance={12} decay={1.5} />

      {/* Central Tech Nucleus (Sun - Wireframe) */}
      <mesh ref={sunRef}>
        <dodecahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color={theme.primary}
          emissive={theme.primary}
          emissiveIntensity={0.6}
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Render Orbits & Satellite Planets */}
      {PLANET_CONFIGS.map((config, idx) => {
        const skillsList = skillGroups[idx]?.items || [];
        return (
          <SkillPlanet
            key={config.label}
            config={config}
            skillsList={skillsList}
          />
        );
      })}
    </group>
  );
}
