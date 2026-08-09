import type { Page } from '@playwright/test';

import { ZH_ROUTE_INVENTORY } from './zh-route-inventory';

/**
 * Shared instrumentation for the mobile responsive audit.
 *
 * The previous guard only compared `document.body.scrollWidth` against the
 * viewport. Every data table in the app sits inside an `overflow-x-auto`
 * container, so content that overflows *inside* a card never grows the body
 * and the guard stayed green while the page looked broken. These helpers work
 * element by element instead, which is the only way to see that class of bug.
 */

/** Sub-pixel layout noise; anything above this is a real overflow. */
const OVERFLOW_TOLERANCE_PX = 1;

/**
 * Boxes narrower than this hold no laid-out content. Screen-reader-only
 * helpers clip themselves to 1px on purpose and must not be reported.
 */
const MIN_MEASURABLE_PX = 8;

/**
 * Target sizes.
 *
 * Controls with an explicit affordance — buttons, inputs, tabs, icon-only
 * links — are held to WCAG 2.5.5 (AAA), because they are what a thumb aims at.
 * Text links are held to WCAG 2.5.8 (AA); sizing them to 44px would mean
 * padding out breadcrumbs and footer link lists, which the spec explicitly
 * does not ask for.
 */
export const MIN_TAP_TARGET_PX = 44;
export const MIN_TEXT_LINK_TARGET_PX = 24;

export const MOBILE_AUDIT_VIEWPORTS = [
  { name: 'iphone-se', width: 320, height: 568 },
  { name: 'iphone-x', width: 375, height: 812 },
  { name: 'iphone-plus', width: 414, height: 896 },
] as const;

export interface OverflowViolation {
  /**
   * - `overflowing` — the element's own text does not fit its box.
   * - `clipped` — the text fits its box, but an ancestor with `overflow: hidden`
   *   cuts it off, so part of it is invisible.
   * - `truncated` — deliberately cut with an ellipsis. Reported separately
   *   because on mobile it usually means content is unreachable.
   */
  type: 'overflowing' | 'clipped' | 'truncated';
  selector: string;
  overflowBy: number;
  text: string;
}

export interface TapTargetViolation {
  selector: string;
  width: number;
  height: number;
  text: string;
}

/**
 * Routes served by the dApp host. Redirect aliases are excluded because they
 * are audited at their destination, and the landing host needs a different
 * `X-Forwarded-Host` so it is swept separately.
 */
export const APP_AUDIT_ROUTES: readonly { id: string; path: string }[] = ZH_ROUTE_INVENTORY.filter(
  (entry) => entry.host === 'app' && !entry.redirectsTo,
).map((entry) => ({ id: entry.id, path: entry.fixturePath }));

export const LANDING_AUDIT_ROUTES: readonly { id: string; path: string }[] =
  ZH_ROUTE_INVENTORY.filter((entry) => entry.host === 'landing' && !entry.redirectsTo).map(
    (entry) => ({ id: entry.id, path: entry.fixturePath }),
  );

export const LANDING_HEADERS = { 'X-Forwarded-Host': 'cosmicsignature.com' } as const;

/**
 * Elements may opt out with `data-overflow-audit="ignore"` when the overflow is
 * deliberate and cannot be expressed as a scroll container (e.g. a canvas that
 * intentionally bleeds). Use sparingly — it disables the guard for the subtree.
 */
export async function collectOverflowViolations(page: Page): Promise<OverflowViolation[]> {
  return page.evaluate(
    ({ tolerance, MIN_MEASURABLE_PX }) => {
      function describe(el: Element): string {
        const parts: string[] = [];
        let node: Element | null = el;
        for (let depth = 0; node && depth < 4; depth += 1) {
          let part = node.tagName.toLowerCase();
          if (node.id) {
            part += `#${node.id}`;
          } else {
            const testId = node.getAttribute('data-testid');
            if (testId) {
              part += `[data-testid="${testId}"]`;
            } else {
              const cls = node.getAttribute('class');
              if (cls) part += `.${cls.trim().split(/\s+/).slice(0, 3).join('.')}`;
            }
          }
          parts.unshift(part);
          node = node.parentElement;
        }
        return parts.join(' > ');
      }

      /**
       * Only elements that own a text node are measured. Checking containers
       * instead would flag every decorative blur that is positioned to bleed
       * and then deliberately clipped by an `overflow-hidden` parent, which
       * buries the handful of places where readable content is actually lost.
       */
      function ownsText(el: Element): boolean {
        for (const node of Array.from(el.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '') {
            return true;
          }
        }
        return false;
      }

      const violations: {
        type: 'overflowing' | 'clipped' | 'truncated';
        selector: string;
        overflowBy: number;
        text: string;
      }[] = [];

      for (const el of Array.from(document.querySelectorAll('*'))) {
        if (!ownsText(el)) continue;
        if (el.closest('[data-overflow-audit="ignore"]')) continue;

        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          continue;
        }

        const rect = el.getBoundingClientRect();
        if (rect.width < MIN_MEASURABLE_PX || rect.height < 1) continue;

        const text = (el.textContent ?? '').trim().slice(0, 80);
        const overflowX = style.overflowX;
        const scrollable = overflowX === 'auto' || overflowX === 'scroll';

        // 1. The element's own text does not fit inside it.
        if (!scrollable && el.clientWidth >= MIN_MEASURABLE_PX) {
          const overflowBy = el.scrollWidth - el.clientWidth;
          if (overflowBy > tolerance) {
            violations.push({
              type: style.textOverflow === 'ellipsis' ? 'truncated' : 'overflowing',
              selector: describe(el),
              overflowBy,
              text,
            });
            continue;
          }
        }

        // 2. The text fits its own box but an ancestor cuts it off.
        for (let parent = el.parentElement; parent; parent = parent.parentElement) {
          const parentStyle = window.getComputedStyle(parent);
          const parentOverflow = parentStyle.overflowX;
          if (parentOverflow === 'visible') continue;
          // Reaching a scroll container means the content is reachable.
          if (parentOverflow === 'auto' || parentOverflow === 'scroll') break;
          // Screen-reader-only wrappers (including the table header row the
          // mobile card layout hides) clip themselves to a 1px box by design.
          if (parent.clientWidth < MIN_MEASURABLE_PX) break;

          const parentRect = parent.getBoundingClientRect();
          const contentLeft = parentRect.left + parent.clientLeft;
          const contentRight = contentLeft + parent.clientWidth;
          const spill = Math.max(rect.right - contentRight, contentLeft - rect.left);
          if (spill > tolerance) {
            violations.push({ type: 'clipped', selector: describe(el), overflowBy: spill, text });
          }
          break;
        }
      }

      return violations;
    },
    { tolerance: OVERFLOW_TOLERANCE_PX, MIN_MEASURABLE_PX },
  );
}

/** True when the page itself scrolls sideways. */
export async function getPageOverflow(
  page: Page,
): Promise<{ scrollWidth: number; viewportWidth: number }> {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
}

/**
 * Interactive controls smaller than the target size. Inline links inside a
 * paragraph are exempt per WCAG 2.5.8, which is why display is checked.
 */
export async function collectTapTargetViolations(page: Page): Promise<TapTargetViolation[]> {
  return page.evaluate(
    ({ minSize, minTextLinkSize }) => {
      const SELECTOR = [
        'a[href]',
        'button',
        'input:not([type="hidden"])',
        'select',
        'textarea',
        '[role="button"]',
        '[role="tab"]',
        '[role="checkbox"]',
        '[role="switch"]',
        '[role="menuitem"]',
      ].join(',');

      /** A link whose content is text, rather than an icon-only control. */
      function isTextLink(el: Element): boolean {
        if (el.tagName !== 'A') return false;
        return (el.textContent ?? '').trim().length > 0;
      }

      /**
       * Controls too small to grow without disturbing the layout around them
       * extend their hit area with a pseudo-element and declare
       * `data-touch-target="extended"`. Measure that pseudo-element rather
       * than take the attribute on trust — the first attempt at this in the
       * codebase produced no box at all, and only measuring caught it.
       *
       * `elementFromPoint` would be a stronger check but only works inside the
       * viewport, and most controls on a page are below the fold.
       */
      function hasWorkingExtendedHitArea(el: Element, required: number): boolean {
        for (const pseudo of ['::after', '::before']) {
          const style = window.getComputedStyle(el, pseudo);
          if (style.content === 'none' || style.position !== 'absolute') continue;
          const width = Number.parseFloat(style.width);
          const height = Number.parseFloat(style.height);
          if (width + 0.5 >= required && height + 0.5 >= required) return true;
        }
        return false;
      }

      function describe(el: Element): string {
        const label =
          el.getAttribute('aria-label') ?? (el.textContent ?? '').trim().slice(0, 40) ?? '';
        const cls = el.getAttribute('class');
        const classPart = cls ? `.${cls.trim().split(/\s+/).slice(0, 3).join('.')}` : '';
        return `${el.tagName.toLowerCase()}${classPart}${label ? ` "${label}"` : ''}`;
      }

      const violations: { selector: string; width: number; height: number; text: string }[] = [];

      for (const el of Array.from(document.querySelectorAll(SELECTOR))) {
        if (el.closest('[data-tap-target-audit="ignore"]')) continue;

        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        if (style.pointerEvents === 'none') continue;

        // Inline links flowing inside body copy are exempt from target sizing.
        if (el.tagName === 'A' && style.display === 'inline') continue;

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        // Visually-hidden controls (skip links until focused) are not touch targets.
        if (rect.width <= 1 || rect.height <= 1) continue;

        const required = isTextLink(el) ? minTextLinkSize : minSize;
        if (
          el.getAttribute('data-touch-target') === 'extended' &&
          hasWorkingExtendedHitArea(el, required)
        ) {
          continue;
        }
        if (rect.width + 0.5 < required || rect.height + 0.5 < required) {
          violations.push({
            selector: describe(el),
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10,
            text: (el.textContent ?? '').trim().slice(0, 40),
          });
        }
      }

      return violations;
    },
    { minSize: MIN_TAP_TARGET_PX, minTextLinkSize: MIN_TEXT_LINK_TARGET_PX },
  );
}

export function formatOverflowViolations(
  route: string,
  violations: readonly OverflowViolation[],
): string {
  if (violations.length === 0) return '';
  const lines = violations.map(
    (v) =>
      `  [${v.type}] overflows by ${Math.round(v.overflowBy)}px — ${v.selector}\n` +
      `      text: ${JSON.stringify(v.text)}`,
  );
  return `${violations.length} overflow violation(s) on ${route}:\n${lines.join('\n')}`;
}

export function formatTapTargetViolations(
  route: string,
  violations: readonly TapTargetViolation[],
): string {
  if (violations.length === 0) return '';
  const lines = violations.map((v) => `  ${v.selector} — ${v.width}x${v.height}px`);
  return `${violations.length} tap target violation(s) on ${route}:\n${lines.join('\n')}`;
}

/**
 * Waits for layout to settle: fonts drive text metrics and images drive row
 * heights, so measuring before both land produces flaky results.
 */
export async function waitForStableLayout(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(300);
}
