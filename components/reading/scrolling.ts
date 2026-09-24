/**
 * Scroll helpers shared by the reading pages (the white paper, Learn guides)
 * and the quiz. They honour both the operating system's reduced-motion
 * setting and the site's own motion preference (`html[data-motion]`).
 */

/** True when motion should be kept to a minimum: jumps instead of smooth scrolls. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return (
    document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

/** Brings an element fully into view with the smallest scroll, if it is not already. */
export function revealElement(element: HTMLElement | null): void {
  if (!element || typeof element.scrollIntoView !== 'function') return;
  element.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
}

/**
 * Brings an element's top edge into view when it has scrolled away (above
 * the sticky header, or below the fold), and otherwise leaves the page
 * where the reader has it. The element's `scroll-margin-top` keeps it clear
 * of the sticky header.
 */
export function revealTop(element: HTMLElement | null): void {
  if (!element || typeof element.scrollIntoView !== 'function') return;
  const { top } = element.getBoundingClientRect();
  const margin = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  if (top >= margin && top <= window.innerHeight * 0.6) return;
  element.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
}
