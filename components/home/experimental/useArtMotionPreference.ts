'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** Per-browser choice to hold the featured artwork still (WCAG 2.2.2 Pause, Stop, Hide). */
export const ART_MOTION_STORAGE_KEY = 'cosmic-experimental-art-paused';
const ART_MOTION_EVENT = 'cosmic:art-motion-change';

/** The choice for this page load, used when the browser blocks storage. */
let pausedInMemory = false;

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(ART_MOTION_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(ART_MOTION_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function readPaused(): boolean {
  try {
    return window.localStorage.getItem(ART_MOTION_STORAGE_KEY) === '1';
  } catch {
    return pausedInMemory;
  }
}

/** The server never knows the choice, so it renders the moving state. */
const readPausedOnServer = (): boolean => false;

/**
 * Whether the viewer paused the featured artwork, remembered in this browser.
 * Pausing stops the generation reel on its current frame and the rotation of
 * stills; playing resumes both. Read through `useSyncExternalStore`, so the
 * first client render matches the server HTML and a choice made in another
 * tab applies here too. Where storage is blocked the choice lasts for the
 * page load.
 */
export function useArtMotionPreference(): {
  paused: boolean;
  setPaused: (paused: boolean) => void;
} {
  const paused = useSyncExternalStore(subscribe, readPaused, readPausedOnServer);

  const setPaused = useCallback((next: boolean) => {
    pausedInMemory = next;
    try {
      if (next) window.localStorage.setItem(ART_MOTION_STORAGE_KEY, '1');
      else window.localStorage.removeItem(ART_MOTION_STORAGE_KEY);
    } catch {
      // Blocked storage: readPaused falls back to the in-memory choice.
    }
    window.dispatchEvent(new Event(ART_MOTION_EVENT));
  }, []);

  return { paused, setPaused };
}
