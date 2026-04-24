'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Body {
  mass: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
}

const G = 1.0;
const DT = 0.008;
const TRAIL_LENGTH = 240;

function createBodies(): Body[] {
  return [
    {
      mass: 1.0,
      position: new THREE.Vector3(-1.1, 0.0, 0.0),
      velocity: new THREE.Vector3(0.0, -0.45, 0.08),
      color: new THREE.Color('#6C3CE1'),
    },
    {
      mass: 1.0,
      position: new THREE.Vector3(1.1, 0.0, 0.0),
      velocity: new THREE.Vector3(0.0, 0.45, -0.08),
      color: new THREE.Color('#00E5FF'),
    },
    {
      mass: 0.6,
      position: new THREE.Vector3(0.0, 0.9, 0.2),
      velocity: new THREE.Vector3(-0.22, 0.0, 0.12),
      color: new THREE.Color('#FF3D8A'),
    },
  ];
}

function advance(bodies: Body[]) {
  const accelerations = bodies.map(() => new THREE.Vector3());
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i]!;
      const b = bodies[j]!;
      const diff = new THREE.Vector3().subVectors(b.position, a.position);
      const distSq = Math.max(diff.lengthSq(), 0.04);
      const dist = Math.sqrt(distSq);
      const force = (G * a.mass * b.mass) / distSq;
      const dir = diff.multiplyScalar(force / dist);
      accelerations[i]!.add(dir.clone().divideScalar(a.mass));
      accelerations[j]!.add(dir.clone().divideScalar(-b.mass));
    }
  }
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i]!;
    body.velocity.add(accelerations[i]!.multiplyScalar(DT));
    body.position.add(body.velocity.clone().multiplyScalar(DT));
  }
  const com = new THREE.Vector3();
  const totalMass = bodies.reduce((s, b) => s + b.mass, 0);
  bodies.forEach((b) => com.add(b.position.clone().multiplyScalar(b.mass / totalMass)));
  bodies.forEach((b) => b.position.sub(com));
}

export function ThreeBodyOrbit() {
  const bodiesRef = useRef<Body[]>(createBodies());
  const bodyMeshRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const groupRef = useRef<THREE.Group | null>(null);

  const trailGeometries = useMemo(() => {
    return Array.from({ length: 3 }, () => {
      const geom = new THREE.BufferGeometry();
      const positions = new Float32Array(TRAIL_LENGTH * 3);
      const colors = new Float32Array(TRAIL_LENGTH * 3);
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geom.setDrawRange(0, 0);
      return geom;
    });
  }, []);

  const trailLines = useMemo(() => {
    return trailGeometries.map((geom) => {
      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        linewidth: 1,
      });
      return new THREE.Line(geom, mat);
    });
  }, [trailGeometries]);

  const trailHistory = useRef<THREE.Vector3[][]>([[], [], []]);

  useFrame((_, delta) => {
    const steps = Math.min(3, Math.max(1, Math.floor(delta * 120)));
    for (let s = 0; s < steps; s++) {
      advance(bodiesRef.current);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03;
    }

    bodiesRef.current.forEach((body, i) => {
      const mesh = bodyMeshRefs.current[i];
      if (mesh) mesh.position.copy(body.position);

      const history = trailHistory.current[i];
      if (!history) return;
      history.push(body.position.clone());
      if (history.length > TRAIL_LENGTH) history.shift();

      const geom = trailGeometries[i];
      if (!geom) return;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
      const colAttr = geom.getAttribute('color') as THREE.BufferAttribute;

      for (let k = 0; k < history.length; k++) {
        const p = history[k]!;
        posAttr.setXYZ(k, p.x, p.y, p.z);
        const fade = k / history.length;
        colAttr.setXYZ(k, body.color.r * fade, body.color.g * fade, body.color.b * fade);
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      geom.setDrawRange(0, history.length);
    });
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.1} color="#F0EDFF" />

      {bodiesRef.current.map((body, i) => (
        <mesh
          key={`body-${i}`}
          ref={(el) => {
            bodyMeshRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[body.mass * 0.14, 32, 32]} />
          <meshStandardMaterial
            color={body.color}
            emissive={body.color}
            emissiveIntensity={1.4}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      ))}

      {trailLines.map((line, i) => (
        <primitive key={`trail-${i}`} object={line} />
      ))}
    </group>
  );
}
