import { expect, test } from '@playwright/test';

import { dismissOpenTooltips, openTooltip } from './tooltip-helpers';
import { mockZhQualityApi } from './zh-quality-mocks';
import { ZH_ROUTE_FIXTURES } from './zh-route-inventory';

const { cycle } = ZH_ROUTE_FIXTURES;
const TRANSLATED_TOOLTIP_NAME = /^(?:更多信息|查看“|说明“)/;

const ROUTES = [
  { path: '/zh', readyText: 'Cosmic Signature 观测台', minimum: 5 },
  { path: '/zh/current-cycle', readyText: '落笔总次数', minimum: 5 },
  { path: `/zh/allocation/${cycle}`, readyText: `第 ${cycle} 个周期`, minimum: 5 },
  { path: '/zh/anchoring', readyText: '锚定运作原理', minimum: 3 },
  { path: '/zh/statistics', readyText: 'Cosmic Signature 协议统计', minimum: 5 },
  { path: '/zh/contracts', readyText: 'Cosmic Signature 合约', minimum: 2 },
  { path: '/zh/faq', readyText: 'Cosmic Signature 常见问题', minimum: 1 },
  { path: '/zh/marketing', readyText: '推广 Cosmic Signature', minimum: 1 },
] as const;

test.describe('Sprint 8 translated tooltip interaction coverage', () => {
  for (const route of ROUTES) {
    test(`opens every discoverable translated tooltip trigger on ${route.path}`, async ({
      page,
    }) => {
      test.slow();
      await mockZhQualityApi(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });

      await expect(page.getByText(route.readyText, { exact: false }).first()).toBeVisible();
      const triggers = page.getByRole('button', { name: TRANSLATED_TOOLTIP_NAME });
      await expect(triggers.first()).toBeVisible();
      await page.waitForTimeout(300);
      const labels = await triggers.evaluateAll((elements) =>
        elements
          .map((element) => element.getAttribute('aria-label'))
          .filter((label): label is string => Boolean(label)),
      );
      expect(
        labels.length,
        `too few translated tooltip triggers discovered on ${route.path}`,
      ).toBeGreaterThanOrEqual(route.minimum);

      const occurrences = new Map<string, number>();
      for (const label of labels) {
        await dismissOpenTooltips(page);
        const occurrence = occurrences.get(label) ?? 0;
        occurrences.set(label, occurrence + 1);
        const trigger = page.getByRole('button', { name: label, exact: true }).nth(occurrence);
        await trigger.scrollIntoViewIfNeeded();
        await expect(trigger).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-label', /[\u3400-\u9fff]/);

        await openTooltip(trigger);
        const tooltip = page.getByRole('tooltip').first();
        await expect(tooltip).toBeVisible();
        const text = (await tooltip.innerText()).trim();
        expect(text.length).toBeGreaterThan(0);
        if (!/[\u3400-\u9fff]/.test(text)) {
          expect(text, `unexpected English tooltip fallback on ${route.path}`).toMatch(
            /^(?:0x[0-9a-f]+|[\d.,%# +:/()-]+(?:ETH|CST|NFT)?|ETH|CST|NFT|Arbitrum|Protocol Guild)$/i,
          );
        }

        const box = await tooltip.boundingBox();
        const viewport = page.viewportSize();
        expect(box).not.toBeNull();
        expect(viewport).not.toBeNull();
        if (box && viewport) {
          expect(box.x).toBeGreaterThanOrEqual(-4);
          expect(box.y).toBeGreaterThanOrEqual(-4);
          expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 4);
          expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 4);
        }
      }
    });
  }
});
