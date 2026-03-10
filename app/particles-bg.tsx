'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';

const Particles = dynamic(
  () => import('react-tsparticles').then((mod) => ({ default: mod.default })),
  { ssr: false },
);

const particleOptions = {
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'grab' },
      onClick: { enable: false },
    },
    modes: {
      grab: { distance: 140, links: { opacity: 0.3 } },
    },
  },
  particles: {
    color: {
      value: '#ffffff',
      animation: {
        enable: true,
        speed: 20,
        sync: true,
        h: { enable: true, offset: 0, speed: 0.5, sync: false },
        s: { enable: false, offset: 0, speed: 1, sync: true },
        l: { enable: false, offset: 0, speed: 1, sync: true },
      },
    },
    links: {
      color: '#ffffff',
      distance: 150,
      enable: true,
      opacity: 0.15,
      width: 1,
    },
    collisions: { enable: false },
    move: {
      direction: 'none' as const,
      enable: true,
      outModes: { default: 'out' as const },
      random: true,
      speed: 0.5,
      straight: false,
    },
    number: { density: { enable: true, area: 1000 }, value: 30 },
    opacity: {
      value: { min: 0.1, max: 0.4 },
      animation: { enable: true, speed: 0.5, minimumValue: 0.05, sync: false },
    },
    shape: { type: 'circle' },
    size: {
      value: { min: 1, max: 3 },
      animation: { enable: true, speed: 2, minimumValue: 0.5, sync: false },
    },
  },
  detectRetina: true,
};

export default function ParticlesBg() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async () => {}, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={particleOptions}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
