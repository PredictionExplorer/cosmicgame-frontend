'use client';

import { Suspense, type ComponentType } from 'react';
import dynamic from 'next/dynamic';

import type { CompanionFaceId } from '@/lib/fonts';

/*
 * One code-split module per companion face. `next/dynamic` keeps each face's
 * @font-face stylesheet in its own chunk and, while rendering on the server,
 * emits a `<link rel="stylesheet">` for the chunk it renders and no other.
 * The split only happens from a Client Component, which is why this module
 * is one (the Server Component RootDocument renders it).
 */
const FACES: Record<CompanionFaceId, ComponentType> = {
  'noto-sans-sc': dynamic(() => import('./companion-fonts/noto-sans-sc')),
  'noto-sans-tc': dynamic(() => import('./companion-fonts/noto-sans-tc')),
  'noto-sans-hk': dynamic(() => import('./companion-fonts/noto-sans-hk')),
  'noto-sans-kr': dynamic(() => import('./companion-fonts/noto-sans-kr')),
  'noto-sans-jp': dynamic(() => import('./companion-fonts/noto-sans-jp')),
  onest: dynamic(() => import('./companion-fonts/onest')),
};

/**
 * Links the @font-face rules of the page locale's companion face
 * (LOCALE_COMPANION_FONTS in lib/fonts.ts), and nothing on locales the Latin
 * faces cover. Renders no DOM of its own. The Suspense boundary keeps the
 * face's small JS chunk from holding up hydration of the rest of the page.
 */
export function CompanionFontFaces({ face }: { face: CompanionFaceId | null }) {
  if (!face) return null;
  const Face = FACES[face];
  return (
    <Suspense fallback={null}>
      <Face />
    </Suspense>
  );
}
