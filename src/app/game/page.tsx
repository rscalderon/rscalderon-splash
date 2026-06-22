import type { Metadata } from 'next';
import GameClient from './GameClient';

export const metadata: Metadata = {
  title: 'Explore — Rodrigo S. Calderon',
  description: 'A tiny planet you can explore.',
};

// Prototype route. The 3D scene is client-only and lazy-loaded inside GameClient,
// so the heavy three.js bundle never ships with the homepage.
export default function GamePage() {
  return <GameClient />;
}
