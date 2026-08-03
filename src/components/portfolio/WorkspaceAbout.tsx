"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import { useThemeColors } from "@/lib/theme-colors";

export function WorkspaceAbout() {
  const monitorRef = useRef<THREE.Mesh>(null);
  const diskRef = useRef<THREE.Mesh>(null);
  const bookRef = useRef<THREE.Mesh>(null);

  const monitorScale = useRef(1);
  const diskScale = useRef(1);
  const dossierScale = useRef(1);

  const theme = useThemeColors();
  const [hoveredEl, setHoveredEl] = useState<string | null>(null);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  // Animate objects gently in the scene + apply smooth hover scale lerps
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    
    if (monitorRef.current) {
      monitorRef.current.position.y = Math.sin(elapsed * 1.5) * 0.08;
      const target = hoveredEl === "monitor" ? 1.08 : 1.0;
      monitorScale.current = THREE.MathUtils.lerp(monitorScale.current, target, 0.15);
      monitorRef.current.scale.setScalar(monitorScale.current);
    }
    
    if (diskRef.current) {
      diskRef.current.rotation.y = elapsed * 0.5;
      const target = hoveredEl === "disk" ? 1.12 : 1.0;
      diskScale.current = THREE.MathUtils.lerp(diskScale.current, target, 0.15);
      diskRef.current.scale.setScalar(diskScale.current);
    }
    
    if (bookRef.current) {
      bookRef.current.rotation.z = Math.sin(elapsed) * 0.05;
      bookRef.current.position.y = -0.5 + Math.cos(elapsed * 1.2) * 0.05;
      const target = hoveredEl === "dossier" ? 1.08 : 1.0;
      dossierScale.current = THREE.MathUtils.lerp(dossierScale.current, target, 0.15);
      bookRef.current.scale.setScalar(dossierScale.current);
    }
  });

  const handleElementClick = (name: string, info: string) => {
    setActiveInfo(activeInfo === name ? null : info);
  };

  return (
    <group position={[8, 0, 0]}>
      {/* Soft silver atmospheric point lights */}
      <pointLight position={[0, 2, 2]} intensity={2.0} color={theme.primary} distance={6} />
      <pointLight position={[-2, -1, 1]} intensity={1.5} color={theme.accent} distance={5} />

      {/* 3D Stylized Desk Plate (Holographic White Frosted Glass) */}
      <mesh position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 3]} />
        <meshBasicMaterial
          color={theme.isDark ? theme.base300 : theme.primary}
          transparent
          opacity={theme.isDark ? 0.16 : 0.1}
          blending={theme.isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>

      {/* Desk Support Rings (Silver Grey) */}
      <mesh position={[0, -1.02, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.05, 32, 1, true]} />
        <meshBasicMaterial color={theme.base300} wireframe transparent opacity={0.45} />
      </mesh>

      {/* Element 1: CRT Monitor Node (Frosted Glass Container) */}
      <group position={[-1.2, 0.2, -0.5]}>
        <mesh
          ref={monitorRef}
          onPointerOver={() => {
            setHoveredEl("monitor");
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHoveredEl(null);
            document.body.style.cursor = "auto";
          }}
          onClick={() =>
            handleElementClick(
              "monitor",
              "SYSTEM CORE: Focuses on research-grade machine learning and production systems (120ms retrieval latency, custom RAG pipelines)."
            )
          }
        >
          <boxGeometry args={[1.2, 0.9, 0.6]} />
          <meshStandardMaterial
            color={hoveredEl === "monitor" ? theme.primary : theme.base200}
            roughness={0.15}
            metalness={0.1}
            transparent
            opacity={0.62}
            emissive={hoveredEl === "monitor" ? theme.primary : theme.base300}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* screen projection */}
        <mesh position={[0, 0, 0.31]}>
          <planeGeometry args={[1.0, 0.7]} />
          <meshBasicMaterial color={theme.baseContent} />
        </mesh>
        
        {/* Glow indicator line */}
        <mesh position={[0, -0.46, 0.32]}>
          <boxGeometry args={[0.8, 0.04, 0.02]} />
          <meshBasicMaterial color={theme.primary} />
        </mesh>

        <Html position={[0, 0.7, 0]} center distanceFactor={6}>
          <div
            className={`px-2 py-1 rounded bg-base-100/95 border border-base-300 font-mono text-[9px] text-base-content uppercase tracking-wider transition-opacity duration-300 pointer-events-none select-none whitespace-nowrap ${
              hoveredEl === "monitor" ? "opacity-100" : "opacity-0"
            }`}
          >
            [Inspect AI Core]
          </div>
        </Html>
      </group>

      {/* Element 2: Floating Floppy Disk (Frosted Glass Storage) */}
      <group position={[1.2, 0.1, 0.3]}>
        <mesh
          ref={diskRef}
          onPointerOver={() => {
            setHoveredEl("disk");
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHoveredEl(null);
            document.body.style.cursor = "auto";
          }}
          onClick={() =>
            handleElementClick(
              "disk",
              "SYS_STORAGE: Highly optimized structures. Hand-coded 5-node Raft consensus engine in Python & ZeroMQ with leader leases."
            )
          }
        >
          <boxGeometry args={[0.7, 0.7, 0.08]} />
          <meshStandardMaterial
            color={hoveredEl === "disk" ? theme.accent : theme.base300}
            roughness={0.15}
            metalness={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>

        <Html position={[0, 0.6, 0]} center distanceFactor={6}>
          <div
            className={`px-2 py-1 rounded bg-base-100/95 border border-base-300 font-mono text-[9px] text-base-content uppercase tracking-wider transition-opacity duration-300 pointer-events-none select-none whitespace-nowrap ${
              hoveredEl === "disk" ? "opacity-100" : "opacity-0"
            }`}
          >
            [Decrypt Disk]
          </div>
        </Html>
      </group>

      {/* Element 3: Holographic Dossier Book (Frosted Glass Education) */}
      <group position={[0.2, -0.5, 0.6]}>
        <mesh
          ref={bookRef}
          onPointerOver={() => {
            setHoveredEl("dossier");
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHoveredEl(null);
            document.body.style.cursor = "auto";
          }}
          onClick={() =>
            handleElementClick(
              "dossier",
              "EDUCATION DATA: B.E. in Computer Science & Design from Tontadarya College of Engineering. Stipend-awarded Project Intern at IIITB COMET."
            )
          }
        >
          <boxGeometry args={[1.1, 0.15, 0.8]} />
          <meshStandardMaterial
            color={hoveredEl === "dossier" ? theme.secondary : theme.base200}
            roughness={0.25}
            transparent
            opacity={0.65}
          />
        </mesh>

        <Html position={[0, 0.5, 0]} center distanceFactor={6}>
          <div
            className={`px-2 py-1 rounded bg-base-100/95 border border-base-300 font-mono text-[9px] text-base-content uppercase tracking-wider transition-opacity duration-300 pointer-events-none select-none whitespace-nowrap ${
              hoveredEl === "dossier" ? "opacity-100" : "opacity-0"
            }`}
          >
            [Read Dossier]
          </div>
        </Html>
      </group>

      {/* Floating Info Overlay Screen (Frosted Silver Card) */}
      {activeInfo && (
        <Html position={[0, 1.3, -0.4]} center distanceFactor={5.5}>
          <div className="w-[260px] rounded-xl border border-base-300 bg-base-100/95 p-4 font-mono text-[10px] text-base-content leading-relaxed shadow-lg select-none">
            <div className="flex items-center justify-between border-b border-base-300 pb-1.5 mb-2 font-bold opacity-80">
              <span>DECRYPTED_BIO_BLOCK.TXT</span>
              <button
                onClick={() => setActiveInfo(null)}
                className="hover:text-error transition-colors font-bold px-1"
              >
                [X]
              </button>
            </div>
            <p className="whitespace-normal">{activeInfo}</p>
          </div>
        </Html>
      )}
    </group>
  );
}
