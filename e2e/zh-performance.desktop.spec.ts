import { expect, test } from '@playwright/test';

import { mockZhQualityApi } from './zh-quality-mocks';

declare global {
  interface Window {
    __sprint8Performance?: {
      cls: number;
      initialCls: number;
      fontWidthShift: number;
      longTasks: number;
    };
  }
}

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 800 },
  { name: 'desktop-1440', width: 1_440, height: 1_000 },
] as const;

test.describe('Sprint 8 Chinese font and performance guard', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name} uses the approved CJK stack without unstable layout`, async ({
      context,
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.addInitScript(() => {
        window.__sprint8Performance = {
          cls: 0,
          initialCls: 0,
          fontWidthShift: 0,
          longTasks: 0,
        };

        if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const shift = entry as PerformanceEntry & {
                hadRecentInput?: boolean;
                value?: number;
              };
              if (!shift.hadRecentInput) {
                window.__sprint8Performance!.cls += shift.value ?? 0;
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });
        }

        if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
          new PerformanceObserver((list) => {
            window.__sprint8Performance!.longTasks += list.getEntries().length;
          }).observe({ type: 'longtask', buffered: true });
        }
      });

      const fontResponses: Array<{ url: string; status: number }> = [];
      await page.route(/\.(?:woff2?|ttf)(?:\?|$)/i, async (route) => {
        // Make the fallback frame observable without introducing a heavy
        // synthetic throttling dependency.
        await new Promise((resolve) => setTimeout(resolve, 250));
        await route.continue();
      });
      page.on('response', (response) => {
        if (/\.(?:woff2?|ttf)(?:\?|$)/i.test(response.url())) {
          fontResponses.push({ url: response.url(), status: response.status() });
        }
      });

      await mockZhQualityApi(page);
      const response = await page.goto('/zh', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      await page.evaluate(async () => {
        const probe = document.createElement('span');
        probe.id = 'sprint8-cjk-font-probe';
        probe.textContent = 'Noto中文字体锚定落笔演绎周期';
        probe.style.cssText =
          "position:fixed;left:0;top:0;opacity:0;pointer-events:none;font-family:var(--font-noto-sc),'PingFang SC','Microsoft YaHei',sans-serif;font-size:32px;font-weight:700;line-height:1.4";
        document.body.appendChild(probe);
        const fallbackWidth = probe.getBoundingClientRect().width;
        await document.fonts.ready;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        const loadedWidth = probe.getBoundingClientRect().width;
        window.__sprint8Performance!.fontWidthShift =
          fallbackWidth === 0 ? 0 : Math.abs(loadedWidth - fallbackWidth) / fallbackWidth;
        window.__sprint8Performance!.initialCls = window.__sprint8Performance!.cls;
        window.__sprint8Performance!.cls = 0;
      });
      await page.waitForTimeout(500);

      const client = await context.newCDPSession(page);
      await client.send('DOM.enable');
      await client.send('CSS.enable');
      const documentNode = await client.send('DOM.getDocument');
      const probeNode = await client.send('DOM.querySelector', {
        nodeId: documentNode.root.nodeId,
        selector: '#sprint8-cjk-font-probe',
      });
      const platformFonts = await client.send('CSS.getPlatformFontsForNode', {
        nodeId: probeNode.nodeId,
      });
      await client.detach();

      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming;
        const bodyStyle = getComputedStyle(document.body);
        const heading = [...document.querySelectorAll<HTMLElement>('h1, h2, h3')].find(
          (element) => element.offsetParent !== null && /[\u3400-\u9fff]/.test(element.innerText),
        );
        const headingStyle = heading ? getComputedStyle(heading) : null;
        return {
          settledCls: window.__sprint8Performance?.cls ?? 0,
          initialCls: window.__sprint8Performance?.initialCls ?? 0,
          fontWidthShift: window.__sprint8Performance?.fontWidthShift ?? 0,
          longTasks: window.__sprint8Performance?.longTasks ?? 0,
          domContentLoadedMs: navigation.domContentLoadedEventEnd,
          bodyFont: bodyStyle.fontFamily,
          notoVariable: getComputedStyle(document.documentElement)
            .getPropertyValue('--font-noto-sc')
            .trim(),
          notoFaces: [...document.fonts]
            .filter((face) => /noto/i.test(face.family))
            .map((face) => ({ family: face.family, status: face.status })),
          headingFound: Boolean(heading),
          headingLetterSpacing: headingStyle?.letterSpacing ?? '',
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });

      const usedFontFamilies = platformFonts.fonts
        .map((font: { familyName: string }) => font.familyName)
        .join(', ');
      const renderedGlyphs = platformFonts.fonts.reduce(
        (total: number, font: { glyphCount: number }) => total + font.glyphCount,
        0,
      );
      expect(usedFontFamilies, 'the probe must use an approved CJK face').toMatch(
        /Noto|PingFang|Microsoft YaHei|蘋方-簡/i,
      );
      expect(
        renderedGlyphs,
        'the approved fallback chain must cover every probe glyph',
      ).toBeGreaterThan(10);
      expect(metrics.bodyFont).toMatch(/Noto Sans SC/);
      expect(metrics.bodyFont).toMatch(/PingFang SC/);
      expect(metrics.bodyFont).toMatch(/Microsoft YaHei/);
      expect(metrics.notoVariable).not.toBe('');
      expect(metrics.notoFaces.some((face) => face.status === 'loaded')).toBe(true);
      expect(metrics.headingFound).toBe(true);
      expect(['normal', '0px']).toContain(metrics.headingLetterSpacing);
      expect(metrics.fontWidthShift).toBeLessThanOrEqual(0.08);
      expect(metrics.settledCls).toBeLessThanOrEqual(0.05);
      expect(metrics.initialCls).toBeLessThanOrEqual(1.25);
      expect(metrics.domContentLoadedMs).toBeLessThan(15_000);
      expect(metrics.longTasks).toBeLessThanOrEqual(20);
      expect(metrics.overflow).toBeLessThanOrEqual(1);

      expect(fontResponses.length, 'expected local webfont responses').toBeGreaterThan(0);
      expect(fontResponses.filter((font) => font.status >= 400)).toEqual([]);
    });
  }
});
