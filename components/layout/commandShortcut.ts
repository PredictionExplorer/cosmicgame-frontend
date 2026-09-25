'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { OPEN_SITE_SEARCH_EVENT } from './siteSearchEvents';

/*
 * The command palette's keyboard contract, kept apart from the palette
 * itself: the header needs the chord and its label on every page, the
 * palette's list and search only once someone opens it (CommandPalette is
 * loaded on demand).
 */

const subscribeToNothing = () => () => {};

/** macOS, iOS and iPadOS, where the chord is ⌘K and Ctrl+K edits text. */
export function isApplePlatform(): boolean {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform;
  return /mac|iphone|ipad/i.test(platform);
}

/**
 * Whether a keydown is the palette's chord: ⌘K on Apple platforms and
 * Ctrl+K elsewhere, with no other modifier and not while an input method
 * composes. The letter is read from `key` when the layout types Latin
 * letters, and from the physical key (`code`) otherwise, so Ctrl+K works on
 * a Ukrainian or Russian layout, where the same key types "л".
 */
export function isPaletteChord(event: KeyboardEvent, apple: boolean): boolean {
  if (event.isComposing || event.altKey || event.shiftKey) return false;
  const modifier = apple ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
  if (!modifier) return false;
  const key = event.key.length === 1 ? event.key.toLowerCase() : '';
  return /^[a-z]$/.test(key) ? key === 'k' : event.code === 'KeyK';
}

export interface CommandShortcut {
  /** The key cap: "⌘K" or "Ctrl K". */
  readonly label: string;
  /** The same chord for `aria-keyshortcuts`: "Meta+K" or "Control+K". */
  readonly keys: string;
}

const APPLE_SHORTCUT: CommandShortcut = { label: '⌘K', keys: 'Meta+K' };
const OTHER_SHORTCUT: CommandShortcut = { label: 'Ctrl K', keys: 'Control+K' };

function platformShortcut(): CommandShortcut {
  return isApplePlatform() ? APPLE_SHORTCUT : OTHER_SHORTCUT;
}

/**
 * The platform's shortcut, once the client knows it: null on the server and
 * during hydration, so no one ever sees (or hears) the wrong chord.
 */
export function useCommandShortcut(): CommandShortcut | null {
  return useSyncExternalStore(subscribeToNothing, platformShortcut, () => null);
}

/**
 * Opens the palette on ⌘K (Apple) or Ctrl+K (elsewhere) anywhere, and when
 * another surface calls `requestSiteSearch()`. There is deliberately no
 * single-character shortcut ("/"): one that cannot be turned off fires from
 * speech input and stray keys (WCAG 2.1.4), and the modifier chord is always
 * available. Ctrl+K on a Mac stays the text fields' own "delete to the end
 * of the line".
 */
export function useCommandPaletteShortcut(open: () => void) {
  useEffect(() => {
    window.addEventListener(OPEN_SITE_SEARCH_EVENT, open);
    return () => window.removeEventListener(OPEN_SITE_SEARCH_EVENT, open);
  }, [open]);

  useEffect(() => {
    const apple = isApplePlatform();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isPaletteChord(event, apple)) return;
      event.preventDefault();
      open();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);
}

/**
 * Where focus goes when the palette closes: the element that opened it, or,
 * when that one has left the page (a row in a closed menu or drawer), the
 * header's search button, else its menu button, whichever is shown.
 */
export function paletteReturnTarget(opener: HTMLElement | null): HTMLElement | null {
  // `checkVisibility` is false for an element under `display: none` (the
  // search button below 640px); where a browser lacks it, assume shown.
  const shown = (element: HTMLElement | null): element is HTMLElement =>
    !!element &&
    element.isConnected &&
    (typeof element.checkVisibility !== 'function' || element.checkVisibility());
  if (shown(opener)) return opener;
  for (const selector of ['[data-site-search-trigger]', '[data-site-menu-trigger]']) {
    const fallback = document.querySelector<HTMLElement>(selector);
    if (shown(fallback)) return fallback;
  }
  return null;
}
