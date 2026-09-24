import { expect, test, type Page } from '@playwright/test';

import { dismissOpenTooltips, openTooltip } from './tooltip-helpers';
import { mockZhQualityApi } from './zh-quality-mocks';
import { ZH_ROUTE_FIXTURES } from './zh-route-inventory';

const { cycle } = ZH_ROUTE_FIXTURES;
const TRANSLATED_TOOLTIP_NAME = /^(?:更多信息|查看“|说明“)/;

interface TooltipRoute {
  readonly path: string;
  readonly readyText: string;
  /** Icon triggers named "查看“…”的更多信息" and similar. */
  readonly minimum: number;
  /**
   * Coined terms explained in place (ExplainedTerm): the visible term is the
   * trigger, so it carries no "更多信息" label and is opened by its text.
   */
  readonly explainedTerms?: readonly string[];
  /** Data the route needs on top of the shared mocks for its triggers to render. */
  readonly mock?: (page: Page) => Promise<void>;
}

/**
 * Two outreach allocations: the ranking, whose Share column carries the
 * page's explained header, renders only when there are records.
 */
async function mockOutreachRecords(page: Page): Promise<void> {
  const reward = (id: number, address: string, cst: number) => ({
    RecordId: id,
    Tx: {
      EvtLogId: 28000 + id,
      BlockNum: 497387000 + id,
      TxId: 8980 + id,
      TxHash: `0x${String(id).padStart(64, '0')}`,
      TimeStamp: 1787447000 + id,
      DateTime: '2026-08-23T01:00:00Z',
    },
    Amount: `${cst}000000000000000000`,
    AmountEth: cst,
    MarketerAid: 970 + id,
    MarketerAddr: address,
  });
  await page.route('**/marketing/rewards/global/**', async (route) => {
    await route.fulfill({
      json: {
        MarketingRewards: [
          reward(2, '0xe7eD7F31cd76CeD85861ec5bD37879cBA053e887', 3000),
          reward(1, '0x5050000000000000000000000000000000000001', 1000),
        ],
      },
    });
  });
}

const ROUTES: readonly TooltipRoute[] = [
  { path: '/zh', readyText: 'Cosmic Signature 观测台', minimum: 5 },
  {
    path: '/zh/current-cycle',
    readyText: '落笔总次数',
    minimum: 4,
    explainedTerms: ['周期储备', '签名分配', '公共物品', '坚守冠军'],
  },
  { path: `/zh/allocation/${cycle}`, readyText: `第 ${cycle} 个周期`, minimum: 5 },
  { path: '/zh/anchoring', readyText: '锚定运作原理', minimum: 3 },
  { path: '/zh/statistics', readyText: '协议统计', minimum: 5 },
  { path: '/zh/contracts', readyText: 'Cosmic Signature 合约', minimum: 2 },
  { path: '/zh/marketing', readyText: '推广分配', minimum: 1, mock: mockOutreachRecords },
];

test.describe('Sprint 8 translated tooltip interaction coverage', () => {
  for (const route of ROUTES) {
    test(`opens every discoverable translated tooltip trigger on ${route.path}`, async ({
      page,
    }) => {
      test.slow();
      await mockZhQualityApi(page);
      await route.mock?.(page);
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
      const explained = (route.explainedTerms ?? []).map((term) => ({ term, explained: true }));
      for (const { term: label, explained: isTerm } of [
        ...labels.map((term) => ({ term, explained: false })),
        ...explained,
      ]) {
        await dismissOpenTooltips(page);
        const occurrence = occurrences.get(label) ?? 0;
        occurrences.set(label, occurrence + 1);
        const trigger = isTerm
          ? page.getByRole('main').getByRole('button', { name: label, exact: true }).first()
          : page.getByRole('button', { name: label, exact: true }).nth(occurrence);
        await trigger.scrollIntoViewIfNeeded();
        await expect(trigger).toBeVisible();
        if (!isTerm) await expect(trigger).toHaveAttribute('aria-label', /[\u3400-\u9fff]/);

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
