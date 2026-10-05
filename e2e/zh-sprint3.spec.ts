import { expect, test } from '@playwright/test';

import { dismissOpenTooltips, expectTooltipFullyVisible, openTooltip } from './tooltip-helpers';

/**
 * Sprint 3 Chinese coverage (docs/i18n/progress-zh.md): the core dApp routes —
 * home, current-cycle, gallery, detail, gesture, how-it-works — render
 * translated copy under /zh, including tooltips.
 *
 * Runs on localhost (neither configured host), which serves the dApp routes
 * without host redirects — same assumption as the other e2e suites.
 */

test.describe('zh Sprint 3 — core dApp routes', () => {
  test('/zh home renders the Chinese gesture console', async ({ page }) => {
    await page.goto('/zh');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page).toHaveTitle('Cosmic Signature');
    // Gesture form section heading + method picker are client-rendered and
    // data-independent (messages/zh/home.json form group).
    await expect(
      page
        .locator(
          '[data-testid="gesture-price-strip"]:visible, [data-testid="gesture-panel"]:visible',
        )
        .getByText('落笔方式')
        .first(),
    ).toBeVisible();
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
    // The H1 is the cycle itself, under the page's name as the eyebrow.
    await expect(page.getByRole('heading', { level: 1, name: /^第 \d+ 个周期$/ })).toBeVisible();
    await expect(page.getByText('当前演绎周期', { exact: true }).first()).toBeVisible();

    // One explanation pattern (D079): the header figures and the cycle's own
    // labels are plain words; the coined Cycle Reserve explains itself in place.
    await expect(page.getByText('落笔总次数', { exact: true }).first()).toBeVisible();
    await expect(
      page
        .getByRole('main')
        .locator('header')
        .first()
        .getByRole('button', { name: /^更多信息/ }),
    ).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'ETH 贡献' })).toHaveCount(0);
    await dismissOpenTooltips(page);
    const reserve = page
      .getByRole('main')
      .getByRole('button', { name: '周期储备', exact: true })
      .first();
    await reserve.scrollIntoViewIfNeeded();
    await openTooltip(reserve);
    await expectTooltipFullyVisible(page, /为当前周期持有的 ETH/);
  });

  test('/zh/gallery renders Chinese archive controls', async ({ page }) => {
    await page.goto('/zh/gallery', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page).toHaveTitle('画廊：确定性三体 NFT 艺术 · Cosmic Signature');
    // One header: the server-rendered H1 with the collection's figures.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Cosmic Signature 画廊' }),
    ).toBeVisible();
    // The facts line: "已铭刻 NFT", or the short "已铭刻" on a phone.
    await expect(
      page
        .getByText(/^已铭刻( NFT)?$/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
    await expect(page.getByRole('searchbox', { name: '搜索 NFT' })).toBeVisible();
    // The status filter sits in the toolbar from lg and in the Filters sheet
    // on smaller screens.
    if ((page.viewportSize()?.width ?? 0) < 1024) {
      await page.getByRole('button', { name: '筛选', exact: true }).click();
    }
    const all = page.getByRole('radio', { name: '全部', exact: true }).filter({ visible: true });
    await expect(all).toHaveCount(1);
    await expect(all).toHaveAttribute('aria-checked', 'true');
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
    // The mock carries no cycle position, so the H1 names the record by its id.
    await expect(
      page.getByRole('heading', { level: 1, name: '落笔记录 9101', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('main').getByRole('heading', { level: 2, name: '记录', exact: true }),
    ).toBeVisible();
    await expect(page.locator('[data-figure="cost"]')).toContainText('落笔价格');
    await expect(page.locator('[data-figure="participationCst"]')).toContainText('参与 CST');
  });

  test('/zh/how-it-works renders the Chinese protocol guide', async ({ page }) => {
    await page.goto('/zh/how-it-works');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page).toHaveTitle('运作原理：演绎周期、落笔与 NFT · Cosmic Signature');
    await expect(page.getByRole('heading', { level: 1, name: /运作原理/ })).toBeVisible();
    await expect(page.getByText('演绎周期的完整历程', { exact: true })).toBeVisible();
  });

  test('English core routes are unchanged (regression net)', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Cosmic Signature Gallery' }),
    ).toBeVisible();

    await page.goto('/how-it-works');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('heading', { level: 1, name: 'How Cosmic Signature works' }),
    ).toBeVisible();
  });
});
