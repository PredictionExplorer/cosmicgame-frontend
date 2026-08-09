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

/** WCAG 2.5.5 (AAA) target size. WCAG 2.5.8 (AA) allows 24px with spacing. */
export const MIN_TAP_TARGET_PX = 44;

export const MOBILE_AUDIT_VIEWPORTS = [
  { name: 'iphone-se', width: 320, height: 568 },
  { name: 'iphone-x', width: 375, height: 812 },
  { name: 'iphone-plus', width: 414, height: 896 },
] as const;

export interface OverflowViolation {
  /** `overflowing` = content wider than its own box. `truncated` = clipped with an ellipsis. */
  type: 'overflowing' | 'truncated';
  selector: string;
  scrollWidth: number;
  clientWidth: number;
  overflowX: string;
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

      function hasText(el: Element): boolean {
        return (el.textContent ?? '').trim().length > 0;
      }

      interface Measured {
        type: 'overflowing' | 'truncated';
        scrollWidth: number;
        clientWidth: number;
        overflowX: string;
        text: string;
      }

      const candidates: { el: Element; violation: Measured }[] = [];

      for (const el of Array.from(document.querySelectorAll('*'))) {
        if (el.closest('[data-overflow-audit="ignore"]')) continue;

        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          continue;
        }

        // Decorative, non-interactive layers (ambient backdrops, glow orbs) are
        // positioned to bleed on purpose and never hold readable content.
        if (
          style.pointerEvents === 'none' &&
          (style.position === 'fixed' || style.position === 'absolute')
        ) {
          continue;
        }

        const overflowX = style.overflowX;
        // Intentional scroll containers are how wide content is *supposed* to work.
        if (overflowX === 'auto' || overflowX === 'scroll') continue;

        const clientWidth = el.clientWidth;
        // Visually-hidden helpers (`.sr-only`) are deliberately clipped to a
        // 1px box; they are read aloud, never laid out.
        if (clientWidth < MIN_MEASURABLE_PX) continue;
        if (el.scrollWidth <= clientWidth + tolerance) continue;
        if (!hasText(el)) continue;

        candidates.push({
          el,
          violation: {
            type: style.textOverflow === 'ellipsis' ? 'truncated' : 'overflowing',
            scrollWidth: el.scrollWidth,
            clientWidth,
            overflowX,
            text: (el.textContent ?? '').trim().slice(0, 80),
          },
        });
      }

      // Report only the innermost culprits. Otherwise a single wide table also
      // flags every wrapper above it and buries the real cause.
      const elements = candidates.map((c) => c.el);
      return candidates
        .filter(({ el }) => !elements.some((other) => other !== el && el.contains(other)))
        .map(({ el, violation }) => ({ ...violation, selector: describe(el) }));
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
    ({ minSize }) => {
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

        if (rect.width + 0.5 < minSize || rect.height + 0.5 < minSize) {
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
    { minSize: MIN_TAP_TARGET_PX },
  );
}

export function formatOverflowViolations(
  route: string,
  violations: readonly OverflowViolation[],
): string {
  if (violations.length === 0) return '';
  const lines = violations.map(
    (v) =>
      `  [${v.type}] ${v.selector}\n` +
      `      scrollWidth=${v.scrollWidth} clientWidth=${v.clientWidth} overflow-x=${v.overflowX}\n` +
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
