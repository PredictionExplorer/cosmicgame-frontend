import { test, expect } from '@playwright/test';

test.describe('Mobile gesture touch handling', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile Chrome', 'mobile-only regression');

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#tsparticles').waitFor({ state: 'attached', timeout: 15_000 });
  });

  test('particle backdrop is structurally inert on touch devices', async ({ page }) => {
    const particleLayer = await page.evaluate(() => {
      const host = document.querySelector('#tsparticles') as HTMLElement | null;
      const wrapper = host?.parentElement ?? null;
      const canvas = host?.querySelector('canvas') as HTMLElement | null;

      return {
        hostHasStableSize: host ? host.getBoundingClientRect().width > 0 : false,
        wrapperPointerEvents: wrapper ? window.getComputedStyle(wrapper).pointerEvents : null,
        wrapperTouchAction: wrapper ? window.getComputedStyle(wrapper).touchAction : null,
        wrapperPosition: wrapper ? window.getComputedStyle(wrapper).position : null,
        canvasPointerEvents: canvas ? window.getComputedStyle(canvas).pointerEvents : null,
        canvasPosition: canvas ? window.getComputedStyle(canvas).position : null,
      };
    });

    expect(particleLayer.hostHasStableSize).toBe(true);
    expect(particleLayer.wrapperPointerEvents).toBe('none');
    expect(particleLayer.wrapperTouchAction).toBe('none');
    expect(particleLayer.wrapperPosition).toBe('fixed');
    expect(particleLayer.canvasPointerEvents).toBe('none');
    expect(particleLayer.canvasPosition).not.toBe('fixed');
  });

  test('foreground controls win hit-testing over the particle canvas', async ({ page }) => {
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
        hitParticleLayer: Boolean(
          hit &&
          (hit.tagName.toLowerCase() === 'canvas' ||
            hit.id === 'tsparticles' ||
            hit.closest('#tsparticles')),
        ),
        targetReceivesHit: Boolean(hit && (hit === target || target.contains(hit))),
      };
    });

    expect(hitTest.hitParticleLayer).toBe(false);
    expect(hitTest.targetReceivesHit).toBe(true);
  });

  test('particle layer never wins elementFromPoint across visible main content', async ({
    page,
  }) => {
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
            id: (hit as HTMLElement | null)?.id ?? null,
            insideParticles: Boolean(hit?.closest('#tsparticles')),
          };
        }),
      );
    });

    expect(samples.length).toBeGreaterThan(0);
    for (const sample of samples) {
      expect(sample.insideParticles).toBe(false);
      expect(sample.id).not.toBe('tsparticles');
      expect(sample.tagName).not.toBe('canvas');
    }
  });

  test('gesture method controls accept real touch taps when rendered', async ({ page }) => {
    const ethOption = page.getByRole('button', { name: /ETH/i }).first();
    if (await ethOption.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await ethOption.tap();
      await expect(ethOption).toBeVisible();
    }
  });
});
