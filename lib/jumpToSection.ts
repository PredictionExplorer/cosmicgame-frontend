/** Smooth scrolling, unless the reader asked for reduced motion. */
export function sectionScrollBehavior(): ScrollBehavior {
  return typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}

/** The element keyboard focus should land on in a section: its first heading, else itself. */
function focusTargetOf(section: HTMLElement): HTMLElement {
  return section.querySelector<HTMLElement>('h1, h2, h3, h4') ?? section;
}

/**
 * Takes the reader to an in-page section the way following its `#link`
 * would, for links that cancel the browser's own jump (to open an accordion
 * first, or to scroll smoothly): scrolls the section to the top of the
 * reading area (its `scroll-margin-top` clears the sticky bars), writes its
 * fragment to the address bar without a new history entry, and moves
 * keyboard focus to it without scrolling again. Focus lands on `focus` when
 * given (an accordion trigger), else on the section's first heading, made
 * programmatically focusable, so the next Tab continues from there and a
 * screen reader announces where the reader now is.
 *
 * Returns false when there is no element with that id.
 */
export function jumpToSection(
  id: string,
  { focus, hash = id }: { focus?: HTMLElement | null; hash?: string } = {},
): boolean {
  const section = document.getElementById(id);
  if (!section) return false;
  section.scrollIntoView({ behavior: sectionScrollBehavior(), block: 'start' });
  window.history.replaceState(window.history.state, '', `#${hash}`);
  const target = focus ?? focusTargetOf(section);
  if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
  return true;
}
