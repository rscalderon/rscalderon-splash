'use client';

import {
  type ReactNode,
  type MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Float, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';
import { links } from '@/lib/links';

/* ------------------------------------------------------------------ *
 * THROWAWAY PROTOTYPE — walk a little astronaut around a tiny planet.
 *
 * Trick that keeps surface-walking simple: the character is FIXED at the
 * top pole; player input ROTATES THE PLANET underneath it (pitch about
 * world-X = forward/back, yaw about world-Y = turn). No camera-on-sphere
 * math. The character FACES -Z (forward); the camera sits just above and
 * behind its back (+Z) and looks out over it toward the horizon.
 * ------------------------------------------------------------------ */

type Palette = {
  name: string;
  bg: string;
  planet: string;
  trunk: string;
  tree: string;
  beacon: string;
  sky: string;
  ground: string;
  char: string;
  stars: boolean;
};

// Locked to Miami (palette switcher removed).
const PALETTE: Palette = {
  name: 'Miami',
  bg: '#070d1c',
  planet: '#15a394',
  trunk: '#7a5230',
  tree: '#1f8a5b',
  beacon: '#ff8fb1',
  sky: '#5fd0e6',
  ground: '#0c5c52',
  char: '#f5efe6',
  stars: true,
};

const BEACONS: { label: string; href: string; dir: [number, number, number] }[] = [
  ...links.map((l, i) => ({
    label: l.label,
    href: l.href,
    dir: [
      [0.25, 0.55, 0.8],
      [-0.85, 0.18, 0.45],
      [0.6, -0.1, -0.78],
    ][i] as [number, number, number],
  })),
  { label: 'Contact', href: '/contact-info', dir: [-0.4, -0.55, 0.6] },
];

const R = 1; // planet radius
const PITCH_SPEED = 1.1; // rad/s walking forward/back
const YAW_SPEED = 1.3; // rad/s turning
const ACTIVE_ANGLE = 0.5; // rad (~29°); a beacon this close to the pole is "reachable"

// Third-person follow cam — tweak these two to re-frame the shot.
const CAM_POS: [number, number, number] = [0, 1.55, 1.95]; // above + behind the back
const CAM_TARGET: [number, number, number] = [0, 0.85, -0.45]; // out over the character

const CHAR_SCALE = 0.45; // shrink the explorer — tiny-on-a-big-planet reads cuter

const UP = new THREE.Vector3(0, 1, 0);
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const BEACON_DIRS = BEACONS.map((b) => new THREE.Vector3(...b.dir).normalize());

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

type Tween = { from: THREE.Quaternion; to: THREE.Quaternion; t: number; dur: number };

/** Distribute n points roughly evenly on a unit sphere (fibonacci). */
function fibSphere(n: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = golden * i;
    out.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r));
  }
  return out;
}

/** Place children on the planet surface, oriented so local +Y points outward. */
function OnSurface({
  dir,
  radius = R,
  children,
}: {
  dir: THREE.Vector3 | [number, number, number];
  radius?: number;
  children: ReactNode;
}) {
  const { pos, quat } = useMemo(() => {
    const n = (Array.isArray(dir) ? new THREE.Vector3(...dir) : dir.clone()).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(UP, n);
    return { pos: n.multiplyScalar(radius), quat: q };
  }, [dir, radius]);
  return (
    <group position={[pos.x, pos.y, pos.z]} quaternion={[quat.x, quat.y, quat.z, quat.w]}>
      {children}
    </group>
  );
}

function Tree({ palette, scale = 1, spin = 0 }: { palette: Palette; scale?: number; spin?: number }) {
  return (
    <group scale={scale} rotation={[0, spin, 0]}>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.012, 0.018, 0.09, 5]} />
        <meshStandardMaterial color={palette.trunk} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <coneGeometry args={[0.075, 0.2, 6]} />
        <meshStandardMaterial color={palette.tree} flatShading roughness={0.7} />
      </mesh>
    </group>
  );
}

function Rock({ palette, scale = 1 }: { palette: Palette; scale?: number }) {
  return (
    <mesh position={[0, 0.03, 0]} scale={scale}>
      <dodecahedronGeometry args={[0.05, 0]} />
      <meshStandardMaterial color={palette.ground} flatShading roughness={1} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- *
 * The explorer — a little astronaut. Faces -Z (forward); back is +Z
 * (toward the camera). Feet sit near local y=0; the parent group
 * adds the walk bob + lean and scales the whole thing down.
 * ---------------------------------------------------------------- */

function Astro({ palette }: { palette: Palette }) {
  return (
    <group>
      {/* suit body */}
      <mesh position={[0, 0.085, 0]}>
        <capsuleGeometry args={[0.055, 0.07, 8, 16]} />
        <meshStandardMaterial color={palette.char} roughness={0.55} />
      </mesh>
      {/* helmet */}
      <mesh position={[0, 0.195, 0]}>
        <sphereGeometry args={[0.062, 20, 20]} />
        <meshStandardMaterial color={palette.char} roughness={0.35} metalness={0.05} />
      </mesh>
      {/* visor (front, -Z) */}
      <mesh position={[0, 0.195, -0.03]} scale={[1, 0.78, 0.62]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#10131c" roughness={0.18} metalness={0.4} />
      </mesh>
      {/* backpack (toward camera, +Z) */}
      <mesh position={[0, 0.1, 0.055]}>
        <boxGeometry args={[0.07, 0.095, 0.04]} />
        <meshStandardMaterial color={palette.beacon} roughness={0.5} />
      </mesh>
      {/* antenna */}
      <mesh position={[0.03, 0.25, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.05, 6]} />
        <meshStandardMaterial color={palette.char} />
      </mesh>
      <mesh position={[0.03, 0.28, 0]}>
        <sphereGeometry args={[0.012, 10, 10]} />
        <meshStandardMaterial color={palette.beacon} emissive={palette.beacon} emissiveIntensity={1.2} />
      </mesh>
      {/* feet */}
      <mesh position={[-0.03, 0.02, -0.01]}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshStandardMaterial color={palette.char} roughness={0.6} />
      </mesh>
      <mesh position={[0.03, 0.02, -0.01]}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshStandardMaterial color={palette.char} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Parent: fixed at the pole, applies the walk bob + lean, scales down. */
function Character({
  palette,
  movingRef,
  reduced,
}: {
  palette: Palette;
  movingRef: MutableRefObject<boolean>;
  reduced: boolean;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    const moving = movingRef.current && !reduced;
    g.current.position.y = R + (moving ? Math.abs(Math.sin(t * 9)) * 0.03 * CHAR_SCALE : 0);
    g.current.rotation.z = moving ? Math.sin(t * 9) * 0.06 : 0;
  });
  return (
    <group ref={g} position={[0, R, 0]} scale={CHAR_SCALE}>
      <Astro palette={palette} />
    </group>
  );
}

function Beacon({
  palette,
  label,
  active,
  onWalkTo,
  onOpen,
}: {
  palette: Palette;
  label: string;
  active: boolean;
  onWalkTo: (p: THREE.Vector3) => void;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const lit = active || hovered;
  return (
    <group>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.26, 4]} />
        <meshStandardMaterial color={palette.beacon} emissive={palette.beacon} emissiveIntensity={0.4} />
      </mesh>
      <Float speed={2.2} rotationIntensity={1.1} floatIntensity={0.7}>
        <mesh
          position={[0, 0.3, 0]}
          scale={active ? 1.5 : hovered ? 1.3 : 1}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            if (active) onOpen();
            else onWalkTo(e.point);
          }}
        >
          <octahedronGeometry args={[0.085, 0]} />
          <meshStandardMaterial
            color={palette.beacon}
            emissive={palette.beacon}
            emissiveIntensity={lit ? 1.7 : 0.75}
            flatShading
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        <Html position={[0, 0.46, 0]} center>
          <div
            onClick={() => (active ? onOpen() : undefined)}
            style={{
              whiteSpace: 'nowrap',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 12,
              letterSpacing: '0.02em',
              padding: active ? '3px 9px' : '1px 7px',
              borderRadius: 999,
              color: '#0b0b0e',
              background: palette.beacon,
              opacity: lit ? 1 : 0.62,
              boxShadow: lit ? '0 2px 16px rgba(0,0,0,0.5)' : 'none',
              transform: `scale(${active ? 1.12 : 1})`,
              transition: 'transform 120ms ease, opacity 160ms ease',
              cursor: active ? 'pointer' : 'default',
              userSelect: 'none',
            }}
          >
            {active ? `${label} · open ↵` : label}
          </div>
        </Html>
      </Float>
    </group>
  );
}

/** Everything that lives inside the Canvas + the per-frame control loop. */
function World({
  palette,
  reduced,
  planetRef,
  keysRef,
  tweenRef,
  movingRef,
  activeRef,
  active,
  setActive,
  onWalkTo,
  onOpen,
}: {
  palette: Palette;
  reduced: boolean;
  planetRef: MutableRefObject<THREE.Group | null>;
  keysRef: MutableRefObject<Set<string>>;
  tweenRef: MutableRefObject<Tween | null>;
  movingRef: MutableRefObject<boolean>;
  activeRef: MutableRefObject<number>;
  active: number;
  setActive: (i: number) => void;
  onWalkTo: (p: THREE.Vector3) => void;
  onOpen: (i: number) => void;
}) {
  const trees = useMemo(() => fibSphere(22), []);

  useFrame((_, dtRaw) => {
    const planet = planetRef.current;
    if (!planet) return;
    const dt = Math.min(dtRaw, 0.05); // clamp to avoid big jumps on tab refocus
    let moving = false;

    const tw = tweenRef.current;
    if (tw) {
      tw.t += dt / tw.dur;
      if (tw.t >= 1) {
        planet.quaternion.copy(tw.to);
        tweenRef.current = null;
      } else {
        planet.quaternion.copy(tw.from).slerp(tw.to, easeInOut(tw.t));
      }
      moving = true;
    } else {
      const k = keysRef.current;
      let pitch = 0;
      let yaw = 0;
      if (k.has('arrowup') || k.has('w')) pitch += 1;
      if (k.has('arrowdown') || k.has('s')) pitch -= 1;
      if (k.has('arrowleft') || k.has('a')) yaw += 1;
      if (k.has('arrowright') || k.has('d')) yaw -= 1;
      if (pitch || yaw) {
        moving = true;
        const qx = new THREE.Quaternion().setFromAxisAngle(AXIS_X, pitch * PITCH_SPEED * dt);
        const qy = new THREE.Quaternion().setFromAxisAngle(AXIS_Y, yaw * YAW_SPEED * dt);
        planet.quaternion.premultiply(qx).premultiply(qy);
      }
    }
    movingRef.current = moving;

    // which beacon is under the explorer?
    let best = -1;
    let bestAng = ACTIVE_ANGLE;
    for (let i = 0; i < BEACON_DIRS.length; i++) {
      const ang = BEACON_DIRS[i].clone().applyQuaternion(planet.quaternion).angleTo(UP);
      if (ang < bestAng) {
        bestAng = ang;
        best = i;
      }
    }
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
  });

  return (
    <>
      <group ref={planetRef}>
        <mesh
          onPointerDown={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onWalkTo(e.point);
          }}
        >
          <icosahedronGeometry args={[R, 4]} />
          <meshStandardMaterial color={palette.planet} flatShading roughness={0.85} metalness={0.05} />
        </mesh>

        {trees.map((p, i) => {
          const isRock = i % 7 === 3;
          return (
            <OnSurface key={i} dir={p}>
              {isRock ? (
                <Rock palette={palette} scale={0.7 + (i % 3) * 0.25} />
              ) : (
                <Tree palette={palette} scale={0.7 + (i % 5) * 0.09} spin={(i * 1.7) % Math.PI} />
              )}
            </OnSurface>
          );
        })}

        {BEACONS.map((b, i) => (
          <OnSurface key={b.label} dir={b.dir}>
            <Beacon
              palette={palette}
              label={b.label}
              active={active === i}
              onWalkTo={onWalkTo}
              onOpen={() => onOpen(i)}
            />
          </OnSurface>
        ))}
      </group>

      <Character palette={palette} movingRef={movingRef} reduced={reduced} />
    </>
  );
}

export default function PlanetScene() {
  const [active, setActive] = useState(-1);
  const palette = PALETTE;
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const planetRef = useRef<THREE.Group | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const tweenRef = useRef<Tween | null>(null);
  const movingRef = useRef(false);
  const activeRef = useRef(-1);

  const open = (i: number) => {
    const href = BEACONS[i]?.href;
    if (!href) return;
    if (href.startsWith('/')) window.location.href = href;
    else window.open(href, '_blank', 'noopener,noreferrer');
  };

  const walkTo = (worldPoint: THREE.Vector3) => {
    const planet = planetRef.current;
    if (!planet) return;
    const pw = worldPoint.clone().normalize(); // planet centered at origin
    const delta = new THREE.Quaternion().setFromUnitVectors(pw, UP);
    const to = delta.multiply(planet.quaternion.clone());
    tweenRef.current = { from: planet.quaternion.clone(), to, t: 0, dur: 0.7 };
  };

  useEffect(() => {
    const move = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ']);
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (move.has(key)) e.preventDefault();
      if (key === ' ' || key === 'enter') {
        if (activeRef.current >= 0) open(activeRef.current);
        return;
      }
      keysRef.current.add(key);
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    const blur = () => keysRef.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: palette.bg }}>
      <Canvas camera={{ position: CAM_POS, fov: 46 }} dpr={[1, 2]}>
        <color attach="background" args={[palette.bg]} />
        <hemisphereLight args={[palette.sky, palette.ground, 0.65]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 3]} intensity={2.1} />
        <directionalLight position={[-5, -2, -3]} intensity={0.4} color={palette.beacon} />

        <mesh>
          <sphereGeometry args={[1.22, 32, 32]} />
          <meshBasicMaterial color={palette.beacon} transparent opacity={0.05} side={THREE.BackSide} />
        </mesh>

        {palette.stars && <Stars radius={60} depth={25} count={1400} factor={2.4} fade speed={0.4} />}

        <World
          palette={palette}
          reduced={reduced}
          planetRef={planetRef}
          keysRef={keysRef}
          tweenRef={tweenRef}
          movingRef={movingRef}
          activeRef={activeRef}
          active={active}
          setActive={setActive}
          onWalkTo={walkTo}
          onOpen={open}
        />

        <OrbitControls enableRotate={false} enableZoom={false} enablePan={false} target={CAM_TARGET} />
      </Canvas>

      {/* ---- overlay UI (plain DOM, not 3D) ---- */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 font-mono text-zinc-200">
        <div>
          <div className="text-sm font-medium">rsc · a tiny planet</div>
          <div className="mt-0.5 text-xs text-zinc-400">
            arrows / WASD to walk · tap the planet to move · click a beacon to open it
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <Link
            href="/"
            className="pointer-events-auto text-xs text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
          >
            ← back
          </Link>
          {active >= 0 && (
            <button
              onClick={() => open(active)}
              className="pointer-events-auto rounded-full px-4 py-1.5 text-sm font-medium text-[#0b0b0e] shadow-lg"
              style={{ background: palette.beacon }}
            >
              open {BEACONS[active].label} ↵
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
