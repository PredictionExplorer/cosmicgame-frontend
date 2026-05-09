'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

import { NebulaShader } from './NebulaShader';
import { ReducedMotionFallback } from './ReducedMotionFallback';
import { ThreeBodyOrbit } from './ThreeBodyOrbit';

const QUALITY_QUERY = '(min-width: 1024px)';

export function HeroCanvas() {
  const reducedMotion = usePrefersReducedMotion();
  const highQuality = useMediaQuery(QUALITY_QUERY);

  if (reducedMotion || !highQuality) {
    return <ReducedMotionFallback />;
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ position: [0, 0.35, 4.6], fov: 55, near: 0.1, far: 40 }}
        frameloop="always"
      >
        <color attach="background" args={['#0D0521']} />
        <fog attach="fog" args={['#0D0521', 5, 16]} />

        <Suspense fallback={null}>
          <NebulaShader intensity={0.9} />
          <ThreeBodyOrbit />
        </Suspense>

        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={1.1} mipmapBlur luminanceThreshold={0.12} luminanceSmoothing={0.4} />
          <ChromaticAberration
            offset={new THREE.Vector2(0.0006, 0.0012)}
            radialModulation={false}
            modulationOffset={0}
            blendFunction={BlendFunction.NORMAL}
          />
          <Noise opacity={0.06} blendFunction={BlendFunction.MULTIPLY} premultiply />
          <Vignette
            eskil={false}
            offset={0.18}
            darkness={0.6}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
