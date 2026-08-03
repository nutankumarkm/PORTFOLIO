"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useThemeColors } from "@/lib/theme-colors";

export function AICoreHero() {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // 1. Generate random particles for floating background stardust
  const particleCount = 220;
  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 15;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 15;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return arr;
  }, []);

  // 2. Animate meshes in the R3F frame loop
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // Rotate core elements
    if (innerRef.current) {
      innerRef.current.rotation.y = elapsed * 0.4;
      innerRef.current.rotation.x = elapsed * 0.2;
    }
    if (outerRef.current) {
      outerRef.current.rotation.y = -elapsed * 0.25;
      outerRef.current.rotation.z = elapsed * 0.15;
    }

    // Drift the whole particle field via its transform. Mutating the position
    // buffer per frame would force a full re-upload to the GPU every frame.
    if (particlesRef.current) {
      particlesRef.current.rotation.y = elapsed * 0.05;
      particlesRef.current.rotation.x = Math.sin(elapsed * 0.15) * 0.06;
      particlesRef.current.position.y = Math.sin(elapsed * 0.4) * 0.12;
    }
  });

  const theme = useThemeColors();
  // Additive blending only ever brightens, so it vanishes against a light
  // page. Fall back to normal blending (and firmer opacity) in light themes.
  const blending = theme.isDark
    ? THREE.AdditiveBlending
    : THREE.NormalBlending;

  return (
    <group position={[0, 0, 0]}>
      {/* Soft point light (two co-located lights merged into one) */}
      <pointLight
        position={[0, 0, 0]}
        intensity={4.0}
        color={theme.primary}
        distance={10}
        decay={2}
      />

      {/* Floating Particles System */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={theme.isDark ? theme.base300 : theme.primary}
          size={0.06}
          transparent
          opacity={theme.isDark ? 0.65 : 0.45}
          blending={blending}
          depthWrite={false}
        />
      </points>

      {/* 3D Outer Cage (Geometric Shield) */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshBasicMaterial
          color={theme.accent}
          wireframe
          transparent
          opacity={theme.isDark ? 0.35 : 0.5}
          blending={blending}
        />
      </mesh>

      {/* 3D Middle Wireframe Sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.2, 16, 12]} />
        <meshStandardMaterial
          color={theme.primary}
          wireframe
          emissive={theme.primary}
          emissiveIntensity={0.5}
          transparent
          opacity={theme.isDark ? 0.4 : 0.55}
        />
      </mesh>

      {/* Inner Glowing Core Nucleus
          NOTE: `transmission` is deliberately avoided here and on every other
          material in the scene — three.js re-renders the whole scene into a
          separate target for each transmissive mesh, once per frame. */}
      <mesh>
        <sphereGeometry args={[0.7, 24, 16]} />
        <meshStandardMaterial
          color={theme.primary}
          emissive={theme.primary}
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.05}
          transparent
          opacity={0.72}
        />
      </mesh>
    </group>
  );
}
