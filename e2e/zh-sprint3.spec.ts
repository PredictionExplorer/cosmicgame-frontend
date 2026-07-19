import { expect, test, type Locator, type Page } from '@playwright/test';

import { dismissOpenTooltips, expectTooltipFullyVisible, openTooltip } from './tooltip-helpers';

/**
 * Sprint 3 Chinese coverage (docs/i18n/progress.md): the core dApp routes —
 * home, current-cycle, gallery, detail, gesture, how-it-works — render
 * translated copy under /zh, including tooltips.
 *
 * Runs on localhost (neither configured host), which serves the dApp routes
 * without host redirects — same assumption as the other e2e suites.
 */

/**
 * InfoTooltip triggers carry translated aria-labels on /zh
 * (tooltips.moreInformation* in messages/zh/tooltips.json), so the shared
 * English-prefix helper in tooltip-helpers.ts cannot locate them.
 */
function zhTooltipTriggerForLabel(page: Page, label: string): Locator {
  const zhTooltipButtonSelector = [
    'button[aria-label^="更多信息"]',
    'button[aria-label^="查看“"]',
    'button[aria-label^="说明“"]',
  ].join(', ');

  return page
    .getByText(label, { exact: true })
    .first()
    .locator('xpath=ancestor::*[.//button][1]')
    .locator(zhTooltipButtonSelector)
    .first();
}

async function expectZhLabelTooltip(page: Page, label: string, expected: RegExp): Promise<void> {
  await dismissOpenTooltips(page);
  const trigger = zhTooltipTriggerForLabel(page, label);
  await trigger.evaluate((element) => {
    element.scrollIntoView({ block: 'center', inline: 'center' });
  });
  await expect(trigger, `trigger for "${label}" must be visible`).toBeVisible();
  await openTooltip(trigger);
  await expectTooltipFullyVisible(page, expected);
  await dismissOpenTooltips(page);
}

test.describe('zh Sprint 3 — core dApp routes', () => {
  test('/zh home renders the Chinese gesture console', async ({ page }) => {
    await page.goto('/zh');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page).toHaveTitle('Cosmic Signature');
    // Gesture form section heading + method picker are client-rendered and
    // data-independent (messages/zh/home.json form group).
    await expect(page.getByText('落笔方式').first()).toBeVisible();
    // The public-goods impact card is part of the home shell.
    await expect(page.getByText('公共物品', { exact: false }).first()).toBeVisible();
  });

  test('/zh/current-cycle renders Chinese cycle copy and stat tooltips', async ({ page }) => {
    // networkidle before tooltip interactions, matching the English
    // current-cycle-tooltips spec — hovering while StatCards re-render
    // from live fetches loses the tooltip open state.
    await page.goto('/zh/current-cycle', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page).toHaveTitle('当前演绎周期 · Cosmic Signature');
    await expect(page.getByRole('heading', { name: /第 \d+ 个周期/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '返回首页' })).toBeVisible();

    await expect(page.getByText('落笔总次数', { exact: true }).first()).toBeVisible();
    await expectZhLabelTooltip(page, '落笔总次数', /本周期的落笔总次数/);
    await expectZhLabelTooltip(page, '星选池', /程序化随机选出/);
  });

  test('/zh/gallery renders Chinese archive controls', async ({ page }) => {
    await page.goto('/zh/gallery', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page).toHaveTitle('Cosmic Signature 画廊 · 确定性三体 NFT 艺术');
    // The visible gallery heading is an h2; the page's h1 belongs to the
    // crawler-facing SeoSummary (still English until Sprint 7).
    await expect(page.getByRole('heading', { name: 'NFT 画廊' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '搜索 NFT' })).toBeVisible();
    await expect(page.getByText('全部', { exact: true }).first()).toBeVisible();

    // GalleryHero wraps the whole stat card in a TooltipTrigger (no info
    // button), so hover the label itself — same as gallery-tooltips.spec.ts.
    const totalImprinted = page.getByText('铭刻总数', { exact: true }).first();
    await totalImprinted.scrollIntoViewIfNeeded();
    await totalImprinted.hover();
    await expectTooltipFullyVisible(page, /所有周期累计铭刻/);
    await dismissOpenTooltips(page);
  });

  test('gallery card navigates to a Chinese detail page', async ({ page }) => {
    await page.goto('/zh/gallery');
    const firstCard = page.locator('a[href^="/zh/detail/"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(page).toHaveURL(/\/zh\/detail\/\d+/);

    // Assert on always-rendered metadata stat labels; the name/ownership
    // history sections only render when the token has history entries.
    await expect(page.getByText('铭刻时间', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('持有者', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('种子', { exact: true }).first()).toBeVisible();
  });

  test('/zh/gesture renders Chinese gesture details', async ({ page }) => {
    // Mirror e2e/gesture-detail.spec.ts: mock the gesture payload so the
    // section assertions do not depend on live indexer data for this ID.
    // lexicon-allow-start: mocked backend route and wire keys are sealed API contracts.
    await page.route('**/api/cosmicgame/bid/info/9101', (route) =>
      route.fulfill({
        json: {
          BidInfo: {
            Tx: {
              EvtLogId: 9101,
              BlockNum: 467848129,
              TxId: 5441,
              TxHash: '0x45d7ecb96a242458dd991de97272332c0dc02fdac341af3a0cf549c4f30b0582',
              TimeStamp: 1780045566,
              DateTime: '2026-05-29T09:06:06Z',
            },
            BidderAddr: '0x76Cd6127403163a2a74Aa4b6968579DC6435034e',
            EthPriceEth: 0.05,
            CstPriceEth: -1,
            RoundNum: 3,
            BidType: 0,
            CSTRewardEth: 100,
            RWalkNFTId: -1,
            NFTDonationTokenId: -1,
            NFTDonationTokenAddr: '',
            NFTTokenURI: '',
            Message: '',
            DonatedERC20TokenAddr: '',
            DonatedERC20TokenAmount: '',
            DonatedERC20TokenAmountEth: 0,
          },
          error: '',
          status: 1,
        },
      }),
    );
    // lexicon-allow-end

    await page.goto('/zh/gesture/9101', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page.getByText('落笔详情', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('交易与周期', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('落笔价格与参与 CST', { exact: true }).first()).toBeVisible();
  });

  test('/zh/how-it-works renders the Chinese protocol guide', async ({ page }) => {
    await page.goto('/zh/how-it-works');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page).toHaveTitle('Cosmic Signature 运作原理 · 演绎周期、落笔与 NFT');
    await expect(page.getByRole('heading', { level: 1, name: /运作原理/ })).toBeVisible();
    await expect(page.getByText('演绎周期的完整历程', { exact: true })).toBeVisible();
  });

  test('English core routes are unchanged (regression net)', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { name: 'NFT Gallery' })).toBeVisible();

    await page.goto('/how-it-works');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('heading', { level: 1, name: /How Cosmic Signature Works/ }),
    ).toBeVisible();
  });
});
