import type { Page } from '@playwright/test';

/**
 * Detects content painting over pinned chrome as the page scrolls.
 *
 * A sticky element only travels while there is container height below it, and
 * that height is usually its own later siblings. Those siblings come later in
 * paint order, so unless the sticky element is raised they scroll straight over
 * it. The panels here are glass — `bg-white/[0.04]` with a backdrop blur — so
 * the result is legible content bleeding through pinned chrome rather than a
 * clean occlusion, which is what a user reports as "overlapping".
 *
 * Rather than compare z-index values (which only mean anything within a shared
 * stacking context, and this app has many), this asks the browser what is
 * actually on top: sample points inside the pinned element's box and check
 * `elementFromPoint`. That is what the user sees, so it catches z-index
 * inversions, transparent bleed and unexpected stacking contexts alike.
 */

/** Fractions of the scrollable range to sample. 0 is the top of the document. */
const SCROLL_FRACTIONS = [0, 0.15, 0.35, 0.55, 0.8] as const;

/** Ignore slivers; a few pixels of a pinned element is not a usable target. */
const MIN_PINNED_SIZE_PX = 24;

export interface OverlapViolation {
  /** The pinned element being covered. */
  pinned: string;
  /** What was found painting on top of it. */
  covering: string;
  scrollY: number;
  /** Share of sampled points that were covered, 0-1. */
  coverage: number;
  text: string;
}

export interface BrokenFixedElement {
  selector: string;
  containingBlockAncestor: string;
  reason: string;
}

/**
 * Elements may opt out with `data-overlap-audit="ignore"` when being covered is
 * the intended behaviour (a modal scrim, for example).
 */
export async function collectOverlapViolations(page: Page): Promise<OverlapViolation[]> {
  const violations: OverlapViolation[] = [];
  const { maxScroll } = await page.evaluate(() => ({
    maxScroll: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
  }));

  for (const fraction of SCROLL_FRACTIONS) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(maxScroll * fraction));
    // Let sticky elements settle and any scroll-driven state re-render.
    await page.waitForTimeout(250);

    const found = await page.evaluate((minSize) => {
      function describe(el: Element): string {
        const parts: string[] = [];
        let node: Element | null = el;
        for (let depth = 0; node && depth < 3; depth += 1) {
          let part = node.tagName.toLowerCase();
          const testId = node.getAttribute('data-testid');
          if (node.id) {
            part += `#${node.id}`;
          } else if (testId) {
            part += `[data-testid="${testId}"]`;
          } else {
            const cls = node.getAttribute('class');
            if (cls) part += `.${cls.trim().split(/\s+/).slice(0, 2).join('.')}`;
          }
          parts.unshift(part);
          node = node.parentElement;
        }
        return parts.join(' > ');
      }

      const results: {
        pinned: string;
        covering: string;
        scrollY: number;
        coverage: number;
        text: string;
      }[] = [];

      const pinnedElements = Array.from(document.querySelectorAll('*')).filter((el) => {
        if (el.closest('[data-overlap-audit="ignore"]')) return false;
        const style = window.getComputedStyle(el);
        if (style.position !== 'sticky' && style.position !== 'fixed') return false;
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return false;
        }
        // Decorative layers are meant to sit behind everything.
        if (style.pointerEvents === 'none') return false;
        const rect = el.getBoundingClientRect();
        return rect.width >= minSize && rect.height >= minSize;
      });

      for (const pinned of pinnedElements) {
        const rect = pinned.getBoundingClientRect();
        // Only the part actually on screen can be covered.
        const top = Math.max(rect.top, 0);
        const bottom = Math.min(rect.bottom, window.innerHeight);
        const left = Math.max(rect.left, 0);
        const right = Math.min(rect.right, window.innerWidth);
        if (bottom - top < minSize || right - left < minSize) continue;

        const coverCounts = new Map<string, number>();
        let sampled = 0;

        for (let row = 1; row <= 4; row += 1) {
          for (let col = 1; col <= 4; col += 1) {
            const x = left + ((right - left) * col) / 5;
            const y = top + ((bottom - top) * row) / 5;
            const hit = document.elementFromPoint(x, y);
            if (!hit) continue;
            sampled += 1;
            // The pinned element, its descendants, or an ancestor showing
            // through its own padding are all legitimate hits.
            if (hit === pinned || pinned.contains(hit) || hit.contains(pinned)) continue;
            const key = describe(hit);
            coverCounts.set(key, (coverCounts.get(key) ?? 0) + 1);
          }
        }

        if (sampled === 0) continue;

        for (const [covering, count] of coverCounts) {
          results.push({
            pinned: describe(pinned),
            covering,
            scrollY: Math.round(window.scrollY),
            coverage: Math.round((count / sampled) * 100) / 100,
            text: (pinned.textContent ?? '').trim().slice(0, 60),
          });
        }
      }

      return results;
    }, MIN_PINNED_SIZE_PX);

    violations.push(...found);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  return violations;
}

/**
 * Confirms `position: fixed` resolves against the viewport.
 *
 * A transform (or filter, or paint containment) on any ancestor makes that
 * ancestor the containing block for fixed descendants, which silently turns
 * floating chrome into something anchored partway down the document. Framer
 * Motion applies transforms, and this app wraps every route in an animated
 * `motion.div`, so this is worth asserting rather than assuming.
 */
export async function collectBrokenFixedElements(page: Page): Promise<BrokenFixedElement[]> {
  return page.evaluate(() => {
    function describe(el: Element): string {
      const parts: string[] = [];
      let node: Element | null = el;
      for (let depth = 0; node && depth < 3; depth += 1) {
        let part = node.tagName.toLowerCase();
        const testId = node.getAttribute('data-testid');
        if (node.id) {
          part += `#${node.id}`;
        } else if (testId) {
          part += `[data-testid="${testId}"]`;
        } else {
          const cls = node.getAttribute('class');
          if (cls) part += `.${cls.trim().split(/\s+/).slice(0, 2).join('.')}`;
        }
        parts.unshift(part);
        node = node.parentElement;
      }
      return parts.join(' > ');
    }

    const broken: { selector: string; containingBlockAncestor: string; reason: string }[] = [];

    for (const el of Array.from(document.querySelectorAll('*'))) {
      const style = window.getComputedStyle(el);
      if (style.position !== 'fixed') continue;
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        const parentStyle = window.getComputedStyle(parent);
        let reason = '';
        if (parentStyle.transform && parentStyle.transform !== 'none') {
          reason = `transform: ${parentStyle.transform}`;
        } else if (parentStyle.filter && parentStyle.filter !== 'none') {
          reason = `filter: ${parentStyle.filter}`;
        } else if (parentStyle.perspective && parentStyle.perspective !== 'none') {
          reason = `perspective: ${parentStyle.perspective}`;
        } else if (parentStyle.willChange === 'transform') {
          reason = 'will-change: transform';
        } else if (parentStyle.contain === 'paint' || parentStyle.contain === 'strict') {
          reason = `contain: ${parentStyle.contain}`;
        }
        if (!reason) continue;

        broken.push({
          selector: describe(el),
          containingBlockAncestor: describe(parent),
          reason,
        });
        break;
      }
    }

    return broken;
  });
}

export function formatOverlapViolations(
  route: string,
  violations: readonly OverlapViolation[],
): string {
  if (violations.length === 0) return '';
  const lines = violations.map(
    (v) =>
      `  at scrollY=${v.scrollY}, ${Math.round(v.coverage * 100)}% of "${v.pinned}" is covered by\n` +
      `      ${v.covering}\n` +
      `      pinned text: ${JSON.stringify(v.text)}`,
  );
  return `${violations.length} overlap(s) on ${route}:\n${lines.join('\n')}`;
}

export function formatBrokenFixed(route: string, broken: readonly BrokenFixedElement[]): string {
  if (broken.length === 0) return '';
  const lines = broken.map(
    (b) =>
      `  ${b.selector}\n` +
      `      is position:fixed, but ancestor ${b.containingBlockAncestor}\n` +
      `      has ${b.reason}, so it anchors there instead of the viewport`,
  );
  return `${broken.length} broken fixed element(s) on ${route}:\n${lines.join('\n')}`;
}
