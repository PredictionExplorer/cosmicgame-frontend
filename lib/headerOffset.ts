/** The phone header, for the server and for a page without the token. */
const PHONE_HEADER_PX = 56;

/**
 * The sticky site header's height in pixels, as the page resolves
 * `--header-height` (styles/global.css: 56px on phones, 72px from `sm`).
 * Read it when an effect sets up an observer, never during render: the
 * server has no layout and answers with the phone value.
 */
export function headerHeightPx(): number {
  if (typeof window === 'undefined') return PHONE_HEADER_PX;
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue('--header-height').trim();
  const amount = parseFloat(value);
  if (!Number.isFinite(amount)) return PHONE_HEADER_PX;
  if (value.endsWith('rem')) return amount * (parseFloat(getComputedStyle(root).fontSize) || 16);
  return amount;
}

/**
 * An IntersectionObserver `rootMargin` that takes the sticky header off the
 * top of the viewport, so a region that has slid under the header counts as
 * out of view.
 */
export function headerRootMargin(): string {
  return `-${Math.ceil(headerHeightPx())}px 0px 0px 0px`;
}
