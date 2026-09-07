'use client';

import { useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { nebulaFragment } from '@/shaders/nebula.frag';
import { nebulaVertex } from '@/shaders/nebula.vert';

import type { ScenePalette } from './scene-palette';

interface NebulaShaderProps {
  intensity?: number;
  palette: ScenePalette;
}

export function NebulaShader({ intensity = 1, palette }: NebulaShaderProps) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { size, pointer } = useThree();

  // Canonical R3F pattern: a useRef-backed uniforms object whose inner
  // `.value` slots are mutated each frame by useFrame. This is what the
  // shaderMaterial expects — see the eslint-disable on the JSX consumer
  // below for the targeted refs-in-render suppression.
  const uniforms = useRef({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uIntensity: { value: intensity },
    uBackground: { value: palette.background.clone().convertLinearToSRGB() },
    uSurface: { value: palette.surface.clone().convertLinearToSRGB() },
    uPrimary: { value: palette.primary.clone().convertLinearToSRGB() },
    uSecondary: { value: palette.secondary.clone().convertLinearToSRGB() },
    uHighlight: { value: palette.foreground.clone().convertLinearToSRGB() },
  });

  useLayoutEffect(() => {
    // Preserve the shader clock and its existing sRGB noise interpolation.
    // Standard Three materials use linear colors; this custom fragment shader
    // writes sRGB directly and therefore needs the display-space values.
    uniforms.current.uBackground.value.copy(palette.background).convertLinearToSRGB();
    uniforms.current.uSurface.value.copy(palette.surface).convertLinearToSRGB();
    uniforms.current.uPrimary.value.copy(palette.primary).convertLinearToSRGB();
    uniforms.current.uSecondary.value.copy(palette.secondary).convertLinearToSRGB();
    uniforms.current.uHighlight.value.copy(palette.foreground).convertLinearToSRGB();
  }, [palette]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    uniforms.current.uTime.value += delta;
    uniforms.current.uResolution.value.set(size.width, size.height);
    const lerp = 0.08;
    uniforms.current.uMouse.value.x += (pointer.x - uniforms.current.uMouse.value.x) * lerp;
    uniforms.current.uMouse.value.y += (pointer.y - uniforms.current.uMouse.value.y) * lerp;
    uniforms.current.uIntensity.value = intensity;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        // eslint-disable-next-line react-hooks/refs
        uniforms={uniforms.current}
        vertexShader={nebulaVertex}
        fragmentShader={nebulaFragment}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
