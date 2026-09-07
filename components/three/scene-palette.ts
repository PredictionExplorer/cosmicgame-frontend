'use client';

import { useMemo } from 'react';
import { Color, SRGBColorSpace } from 'three';

import { useSiteTheme } from '@/lib/theme/client';
import type { SiteTheme } from '@/lib/theme/config';

/** WebGL colors must be numeric: Three cannot resolve CSS custom properties. */
export interface ScenePalette {
  theme: SiteTheme;
  background: Color;
  surface: Color;
  primary: Color;
  secondary: Color;
  foreground: Color;
}

function readScenePalette(theme: SiteTheme): ScenePalette {
  const styles =
    typeof document === 'undefined' ? null : getComputedStyle(document.documentElement);
  const read = (token: string, fallback: number) => {
    const [hue, saturation, lightness] = (styles?.getPropertyValue(token).trim() ?? '')
      .split(/\s+/)
      .map(Number.parseFloat);
    if (
      hue === undefined ||
      saturation === undefined ||
      lightness === undefined ||
      ![hue, saturation, lightness].every(Number.isFinite)
    ) {
      return new Color(fallback);
    }
    return new Color().setHSL(hue / 360, saturation / 100, lightness / 100, SRGBColorSpace);
  };
  return {
    theme,
    background: read('--background', 0x000000),
    surface: read('--card', 0x000000),
    primary: read('--primary', 0xffffff),
    secondary: read('--secondary', 0xffffff),
    foreground: read('--foreground', 0xffffff),
  };
}

/** Read once per theme change, never in the animation loop. */
export function useScenePalette(): ScenePalette {
  const theme = useSiteTheme();
  // The preference store emits after applying the root CSS palette. Keeping
  // the colors separate from scene state lets every material update in place.
  return useMemo(() => readScenePalette(theme), [theme]);
}
