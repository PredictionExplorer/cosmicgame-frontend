'use client';

import { useEffect, type RefObject } from 'react';

/** Breathing room between a lifted control and the dock's top edge, in px. */
const FOCUS_GAP_PX = 12;

/**
 * Keeps keyboard focus clear of the fixed action dock (WCAG 2.4.11, Focus Not
 * Obscured). `scroll-padding-bottom` only takes part when the browser scrolls
 * anyway: a control that is already inside the viewport, but under the dock
 * (a standings link or the art's Pause control at 390×844, say), receives
 * focus and stays hidden. When focus lands under the dock, the page lifts by
 * the overlap.
 *
 * The dock calls it itself, so every page that mounts the dock gets it. Only
 * keyboard focus (`:focus-visible`) moves the page; a tap never does. A dock
 * that has stepped aside (`inert`, and translated out of view) or is not
 * rendered covers nothing.
 */
export function useFocusClearOfDock(dockRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !isFocusVisible(target)) return;
      const dock = dockRef.current;
      if (!dock || dock.hasAttribute('inert') || dock.contains(target)) return;
      const dockRect = dock.getBoundingClientRect();
      if (dockRect.height === 0) return;
      const overlap = target.getBoundingClientRect().bottom + FOCUS_GAP_PX - dockRect.top;
      if (overlap > 0) window.scrollBy({ top: overlap, behavior: 'instant' });
    };
    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [dockRef]);
}

function isFocusVisible(element: HTMLElement): boolean {
  try {
    return element.matches(':focus-visible');
  } catch {
    // Engines without the selector: treat focus as keyboard focus.
    return true;
  }
}
