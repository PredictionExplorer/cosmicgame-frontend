import { expect, test } from '@playwright/test';

import { dismissOpenTooltips, openTooltip } from './tooltip-helpers';
import { mockZhQualityApi } from './zh-quality-mocks';
import { ZH_ROUTE_FIXTURES } from './zh-route-inventory';

const LANDING_HEADERS = { 'X-Forwarded-Host': 'cosmicsignature.com' };
const { cycle, gestureId, learnSlug } = ZH_ROUTE_FIXTURES;

test.describe('Sprint 8 deterministic Chinese journeys', () => {
  test.beforeEach(async ({ page }) => {
    await mockZhQualityApi(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('moves from the gesture console through cycle and gesture details', async ({ page }) => {
    await page.goto('/zh', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(
      page
        .locator(
          '[data-testid="gesture-price-strip"]:visible, [data-testid="gesture-panel"]:visible',
        )
        .getByText('落笔方式')
        .first(),
    ).toBeVisible();

    const timer = page.getByRole('timer').first();
    await expect(timer).toHaveAccessibleName(/周期|收官|倒计时/);
    await expect(timer.getByText('小时', { exact: true })).toBeVisible();
    await expect(timer.getByText('分', { exact: true })).toBeVisible();
    await expect(timer.getByText('秒', { exact: true })).toBeVisible();

    const tooltipTrigger = page
      .locator(
        'button[aria-label^="更多信息"]:visible, button[aria-label^="查看“"]:visible, button[aria-label^="说明“"]:visible',
      )
      .first();
    await openTooltip(tooltipTrigger);
    await expect(page.getByRole('tooltip').first()).toContainText(/[\u3400-\u9fff]/);
    await dismissOpenTooltips(page);

    await page.locator('a[href="/zh/current-cycle"]:visible').first().click();
    await expect(page).toHaveURL(/\/zh\/current-cycle$/);
    await expect(page.getByText('落笔总次数', { exact: true }).first()).toBeVisible();

    await page.goto(`/zh/gesture/${gestureId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('落笔详情', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('交易与周期', { exact: true }).first()).toBeVisible();
  });

  test('keeps the anchoring journey localized without a wallet write', async ({ page }) => {
    await page.goto('/zh/anchoring', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: '锚定运作原理' })).toBeVisible();
    await expect(page.getByText('开始锚定', { exact: true })).toBeVisible();

    const trigger = page
      .locator(
        'button[aria-label^="更多信息"]:visible, button[aria-label^="查看“"]:visible, button[aria-label^="说明“"]:visible',
      )
      .first();
    await openTooltip(trigger);
    await expect(page.getByRole('tooltip').first()).toContainText(/锚定|派发|NFT/);
    await dismissOpenTooltips(page);

    await page.locator('a[href="/zh/my-anchors"]:visible').first().click();
    await expect(page).toHaveURL(/\/zh\/my-anchors$/);
    await expect(page.getByText('未连接钱包', { exact: true })).toBeVisible();
    await expect(page.getByText('连接钱包后即可管理锚定。', { exact: true })).toBeVisible();
  });

  test('supports Chinese FAQ search and hash deep links', async ({ page }) => {
    await page.goto('/zh/faq', { waitUntil: 'domcontentloaded' });
    const search = page.getByRole('textbox', { name: '搜索常见问题' });
    await search.fill('锚定');
    await expect(page.getByText(/共 67 个问题，当前显示 \d+ 个/)).toBeVisible();
    await expect(page.getByRole('button', { name: '锚定如何运作？', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '清除搜索' })).toBeVisible();

    await page.goto('/zh/faq#main-allocation', { waitUntil: 'domcontentloaded' });
    const question = page.getByRole('button', { name: '什么是签名分配？', exact: true });
    await expect(question).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#main-allocation')).toBeAttached();
  });

  test('round-trips a dynamic Learn route and preserves cross-host Chinese links', async ({
    context,
    page,
  }) => {
    await context.setExtraHTTPHeaders(LANDING_HEADERS);
    await page.goto(`/zh/learn/${learnSlug}`, { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('heading', { level: 1, name: '什么是 Cosmic Signature？' }),
    ).toBeVisible();

    const productLinks = page.locator(
      'a[href*="app.cosmicsignature.com"], a[href*="app.cosmicsignature.local"]',
    );
    expect(await productLinks.count()).toBeGreaterThan(0);
    for (const href of await productLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href') ?? ''),
    )) {
      expect(new URL(href).pathname).toMatch(/^\/zh(?:\/|$)/);
    }

    await page.locator('button[aria-label="语言"]:visible').first().click();
    await page.getByRole('menuitemradio', { name: 'English' }).click();
    await page.waitForURL((url) => url.pathname === `/learn/${learnSlug}`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.locator('button[aria-label="Language"]:visible').first().click();
    await page.getByRole('menuitemradio', { name: '简体中文', exact: true }).click();
    await page.waitForURL((url) => url.pathname === `/zh/learn/${learnSlug}`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
  });

  test('navigates from a localized data list to deterministic cycle details', async ({ page }) => {
    await page.goto('/zh/allocation', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('分配名录', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('list', { name: '按周期排列的获配者列表' })).toBeVisible();

    const cycleLink = page.locator(`a[href="/zh/allocation/${cycle}"]:visible`).first();
    await expect(cycleLink).toBeVisible();
    await cycleLink.click();
    await expect(page).toHaveURL(new RegExp(`/zh/allocation/${cycle}$`));
    await expect(page.getByRole('heading', { level: 1, name: `第 ${cycle} 个周期` })).toBeVisible();
  });

  test('validates contribution and outreach forms without live-chain writes', async ({ page }) => {
    await page.goto('/zh/eth-contribution', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('heading', { name: 'ETH 贡献', exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText('贡献记录', { exact: true })).toBeVisible();
    await expect(page.getByLabel('金额（ETH）')).toHaveCount(0);

    await page.goto('/zh/internal/cst-outreach-transfer', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'CST 推广转账' })).toBeVisible();
    await expect(page.getByText('未连接钱包', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '拨付推广 CST' })).toHaveCount(0);
  });

  test('renders localized success and error toasts through safe mocked flows', async ({ page }) => {
    await page.goto(`/zh/allocation/${cycle}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: '分享周期摘要' }).click();
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: '周期摘要已复制到剪贴板' }),
    ).toBeVisible();

    await page.goto('/zh/contracts', { waitUntil: 'domcontentloaded' });
    const forward = page.getByRole('button', {
      name: '将公共物品金库余额转拨给 Protocol Guild',
    });
    await expect(forward).toBeEnabled();
    await forward.click();
    await expect(
      page
        .locator('[data-sonner-toast]')
        .filter({ hasText: '请连接钱包，再将公共物品金库资金转拨给 Protocol Guild。' }),
    ).toBeVisible();
  });
});
