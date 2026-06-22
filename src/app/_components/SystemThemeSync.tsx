'use client';

import { useEffect } from 'react';
import { watchSystemTheme } from '@/lib/theme';

/**
 * Runtime complement to the pre-paint theme script in layout.tsx: keeps the
 * background/foreground following the OS color scheme live while the page is
 * open (unless the user set an explicit override via the `theme` command).
 */
export default function SystemThemeSync() {
  useEffect(() => watchSystemTheme(), []);
  return null;
}
