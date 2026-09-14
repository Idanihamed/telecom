'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Mesh } from 'three';

function Knot() {
  const mesh = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.2;
      mesh.current.rotation.y += delta * 0.3;
    }
  });
  return (
    <mesh ref={mesh}>
      <torusKnotGeometry args={[0.9, 0.28, 180, 24]} />
      <meshStandardMaterial color="#1F3A5F" metalness={0.75} roughness={0.2} emissive="#C0392B" emissiveIntensity={0.08} />
    </mesh>
  );
}

/** Forme 3D abstraite décorative pour l'espace admin (login). */
export function AdminOrb3D() {
  return (
    <Canvas className="!h-full !w-full" camera={{ position: [0, 0, 4.2], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <pointLight position={[-3, -2, 2]} intensity={0.4} color="#C0392B" />
      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1}>
          <Knot />
        </Float>
      </Suspense>
    </Canvas>
  );
}
