"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { experience } from "@/lib/portfolio-data";
import { useThemeColors } from "@/lib/theme-colors";

export function TimelineTunnel() {
  const tunnelRef = useRef<THREE.Mesh>(null);
  const theme = useThemeColors();

  // Rotate the wireframe tunnel slowly in frame loop
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (tunnelRef.current) {
      // Rotation gives scroll traversal inside a vortex feel
      tunnelRef.current.rotation.z = elapsed * 0.08;
    }
  });

  // Coordinates of experience checkpoints along the tunnel Z axis
  const nodes = [
    { z: 4.0, x: -1.2, y: 0.5, color: theme.primary, item: experience[0] }, // KAM Global AI (Recent)
    { z: -4.0, x: 1.2, y: -0.5, color: theme.accent, item: experience[1] }, // IIITB COMET (Past)
  ];

  return (
    <group position={[0, -12, 0]}>
      {/* Lights specific to experience tunnel */}
      <pointLight position={[0, 0, 5]} intensity={1.5} color={theme.accent} distance={10} />
      <pointLight position={[0, 0, -5]} intensity={1.5} color={theme.primary} distance={10} />

      {/* Wireframe Cylinder (The Tunnel) */}
      <mesh ref={tunnelRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 20, 24, 16, true]} />
        <meshBasicMaterial
          color={theme.accent}
          wireframe
          transparent
          opacity={theme.isDark ? 0.12 : 0.22}
          side={THREE.DoubleSide}
          blending={
            theme.isDark ? THREE.AdditiveBlending : THREE.NormalBlending
          }
        />
      </mesh>

      {/* Traversed Grid Rings (Visual velocity lines) */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[0, 0, -8 + i * 4.0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.18, 3.22, 32]} />
          <meshBasicMaterial
            color={theme.secondary}
            transparent
            opacity={theme.isDark ? 0.15 : 0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Timeline Experience Nodes mapped inside the tunnel */}
      {nodes.map((node, idx) => {
        if (!node.item) return null;
        return (
          <group key={idx} position={[node.x, node.y, node.z]}>
            {/* Glowing timeline node sphere */}
            <mesh>
              <sphereGeometry args={[0.26, 16, 12]} />
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={0.8}
                roughness={0.1}
                metalness={0.9}
                transparent
                opacity={0.95}
              />
            </mesh>

            {/* Inner pulsing core */}
            <mesh scale={[0.5, 0.5, 0.5]}>
              <sphereGeometry args={[0.26, 16, 12]} />
              <meshBasicMaterial color={theme.base100} />
            </mesh>

            {/* Projecting HUD timeline text card */}
            <Html position={[0, 0.45, 0]} center distanceFactor={7}>
              <div
                className="w-[200px] p-2.5 rounded-lg border bg-base-100/95 text-left font-mono text-[9px] shadow-lg pointer-events-none select-none"
                style={{ borderColor: `${node.color}66`, color: node.color }}
              >
                <div className="flex items-center justify-between border-b border-base-300 pb-1 mb-1 font-bold text-[8px] opacity-85">
                  <span>{node.item.period}</span>
                  <span>{node.item.role.split(" ")[0]}</span>
                </div>
                <div className="font-bold text-[10px] text-base-content truncate">{node.item.company}</div>
                <div className="mt-1 text-base-content/80 text-[8px] leading-relaxed line-clamp-3">
                  {node.item.summary}
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
