'use client';

import { useEffect, useRef } from 'react';
import type { Globe as CobeGlobe } from 'cobe';
import { currentTheme } from '@/lib/theme';
import { prefersReducedMotion } from '@/lib/motion';
import type { FocusAngles } from '@/lib/travel';

export type GlobeMarker = { location: [number, number]; size: number };

type ThemeColors = {
  dark: number;
  baseColor: [number, number, number];
  markerColor: [number, number, number];
  glowColor: [number, number, number];
  mapBrightness: number;
};

const COLORS: Record<'light' | 'dark', ThemeColors> = {
  light: { dark: 0, baseColor: [0.62, 0.62, 0.6], markerColor: [0.86, 0.55, 0.1], glowColor: [1, 1, 1], mapBrightness: 1.1 },
  dark: { dark: 1, baseColor: [0.26, 0.26, 0.29], markerColor: [0.92, 0.6, 0.14], glowColor: [0.06, 0.06, 0.08], mapBrightness: 5 },
};

export default function Globe({ markers, focus }: { markers: GlobeMarker[]; focus: FocusAngles | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phi = useRef(0);
  const theta = useRef(0.2);
  const width = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerMovement = useRef(0);
  const focusRef = useRef<FocusAngles | null>(focus);
  focusRef.current = focus;

  useEffect(() => {
    if (!canvasRef.current) return;
    let globe: CobeGlobe | null = null;
    let rafId = 0;
    let disposed = false;
    let runId = 0;
    const reduce = prefersReducedMotion();

    const onResize = () => {
      if (canvasRef.current) width.current = canvasRef.current.offsetWidth;
    };
    window.addEventListener('resize', onResize);
    onResize();

    const tick = () => {
      if (!globe || disposed) return;
      const target = focusRef.current;
      if (pointerInteracting.current === null) {
        if (target) {
          const k = reduce ? 1 : 0.08;
          phi.current += (target.phi - phi.current) * k;
          theta.current += (target.theta - theta.current) * k;
          pointerMovement.current += (0 - pointerMovement.current) * k;
        } else if (!reduce) {
          phi.current += 0.004;
        }
      }
      globe.update({
        phi: phi.current + pointerMovement.current / 200,
        theta: theta.current,
        width: width.current * 2,
        height: width.current * 2,
      });
      rafId = requestAnimationFrame(tick);
    };

    // Cancellable so a theme flip mid-load can't spawn a second globe / rAF loop.
    const create = async () => {
      const myRun = ++runId;
      cancelAnimationFrame(rafId);
      if (globe) {
        globe.destroy();
        globe = null;
      }
      const createGlobe = (await import('cobe')).default;
      if (disposed || myRun !== runId || !canvasRef.current) return;
      const c = COLORS[currentTheme()];
      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width.current * 2,
        height: width.current * 2,
        phi: phi.current,
        theta: theta.current,
        dark: c.dark,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: c.mapBrightness,
        baseColor: c.baseColor,
        markerColor: c.markerColor,
        glowColor: c.glowColor,
        markers,
      });
      canvasRef.current.style.opacity = '1';
      rafId = requestAnimationFrame(tick);
    };

    create();

    // Re-skin when the theme (.dark class on <html>) flips — cobe has no live color setter.
    const observer = new MutationObserver(() => {
      create();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      if (globe) globe.destroy();
    };
  }, [markers]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Interactive globe of places I've visited"
      className="aspect-square w-full max-w-[420px] cursor-grab opacity-0 transition-opacity duration-700 [contain:layout_paint_size]"
      onPointerDown={(e) => {
        pointerInteracting.current = e.clientX - pointerMovement.current;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
      }}
      onPointerUp={() => {
        pointerInteracting.current = null;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
      }}
      onPointerOut={() => {
        pointerInteracting.current = null;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
      }}
      onPointerMove={(e) => {
        if (pointerInteracting.current !== null) {
          pointerMovement.current = e.clientX - pointerInteracting.current;
        }
      }}
      onTouchMove={(e) => {
        if (pointerInteracting.current !== null && e.touches[0]) {
          pointerMovement.current = e.touches[0].clientX - pointerInteracting.current;
        }
      }}
    />
  );
}
