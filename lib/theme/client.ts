'use client';

import { useSyncExternalStore } from 'react';

import {
  DEFAULT_SITE_THEME,
  isSiteTheme,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  themeCookieString,
  themeFromCookie,
  type SiteTheme,
} from './config';

// Browsers may permit reading an old preference while silently rejecting writes.
// Keep a new choice for this page until persistence reflects an external change.
let unsavedSelection: { theme: SiteTheme; savedTheme: SiteTheme | undefined } | undefined;

export function readThemePreference(): SiteTheme | undefined {
  try {
    const cookieTheme = themeFromCookie(document.cookie);
    if (cookieTheme) return cookieTheme;
  } catch {
    // Sandboxed browsers may deny cookies but still allow local storage.
  }
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isSiteTheme(stored)) return stored;
  } catch {
    // In-memory selection still works when persistence is unavailable.
  }
  return undefined;
}

export function currentSiteTheme(): SiteTheme {
  const value = document.documentElement.dataset.theme;
  return isSiteTheme(value) ? value : DEFAULT_SITE_THEME;
}

function applyTheme(theme: SiteTheme) {
  document.documentElement.dataset.theme = theme;
  // Keep mobile browser chrome aligned, including after a soft navigation.
  const color = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
  if (color) {
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute('content', `hsl(${color})`);
    });
  }
}

export function restoreSiteTheme() {
  const savedTheme = readThemePreference();
  if (unsavedSelection && savedTheme !== unsavedSelection.savedTheme) {
    unsavedSelection = undefined;
  }
  applyTheme(unsavedSelection?.theme ?? savedTheme ?? currentSiteTheme());
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function setSiteTheme(value: string) {
  if (!isSiteTheme(value)) return;
  applyTheme(value);
  try {
    document.cookie = themeCookieString(value, location.hostname, location.protocol === 'https:');
  } catch {
    // Storage is a convenience, never a prerequisite for changing the palette.
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    // The DOM remains the session's source of truth if storage is blocked.
  }
  const savedTheme = readThemePreference();
  unsavedSelection = savedTheme === value ? undefined : { theme: value, savedTheme };
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

/** Server and hydration snapshots agree; the pre-paint script owns the page palette. */
export function useSiteTheme() {
  return useSyncExternalStore(subscribe, currentSiteTheme, () => DEFAULT_SITE_THEME);
}
