import { test, expect } from '@playwright/test';

test.describe('Mobile gesture touch handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  // The backdrop (AmbientBackdrop) is static CSS behind the page with
  // pointer-events disabled; these guard against any layer, backdrop or
  // canvas, ever sitting on top of the controls a thumb reaches for.
  test('foreground controls win hit-testing over the backdrop', async ({ page }) => {
    const foregroundTarget = page
      .locator('main button:not([disabled]):visible, main a[href]:visible')
      .first();
    await foregroundTarget.scrollIntoViewIfNeeded();
    await expect(foregroundTarget).toBeVisible();

    const hitTest = await foregroundTarget.evaluate((target) => {
      const rect = target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y);

      return {
        hitBackdrop: Boolean(
          hit && (hit.tagName.toLowerCase() === 'canvas' || hit.closest('[data-ambient-backdrop]')),
        ),
        targetReceivesHit: Boolean(hit && (hit === target || target.contains(hit))),
      };
    });

    expect(hitTest.hitBackdrop).toBe(false);
    expect(hitTest.targetReceivesHit).toBe(true);
  });

  test('no backdrop layer wins elementFromPoint across visible main content', async ({ page }) => {
    const samples = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return [];
      const rect = main.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const yValues = [
        Math.max(0, rect.top + 24),
        Math.min(viewportHeight - 1, rect.top + rect.height * 0.35),
        Math.min(viewportHeight - 1, rect.top + rect.height * 0.7),
      ];
      const xValues = [viewportWidth * 0.25, viewportWidth * 0.5, viewportWidth * 0.75];

      return yValues.flatMap((y) =>
        xValues.map((x) => {
          const hit = document.elementFromPoint(x, y);
          return {
            x,
            y,
            tagName: hit?.tagName.toLowerCase() ?? null,
            insideBackdrop: Boolean(hit?.closest('[data-ambient-backdrop]')),
          };
        }),
      );
    });

    expect(samples.length).toBeGreaterThan(0);
    for (const sample of samples) {
      expect(sample.insideBackdrop).toBe(false);
      expect(sample.tagName).not.toBe('canvas');
    }
  });

  test('gesture method controls accept real touch taps when rendered', async ({ page }) => {
    // Target the gesture method button precisely: a loose /ETH/i name also
    // matches info-tooltip triggers whose labels mention ETH.
    const ethOption = page.getByRole('button', { name: /pay with ether/i }).first();
    if (await ethOption.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await ethOption.tap();
      await expect(ethOption).toBeVisible();
      await expect(ethOption).toHaveAttribute('aria-pressed', 'true');
    }
  });
});
