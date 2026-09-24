import { expect, test, type Locator, type Page } from '@playwright/test';

import { dismissOpenTooltips, expectTooltipFullyVisible, openTooltip } from './tooltip-helpers';
import {
  mockSprint4Api,
  SPRINT4_MOCK_ACTION_ID,
  SPRINT4_MOCK_ADDRESS,
  SPRINT4_MOCK_CYCLE,
  SPRINT4_MOCK_TOKEN_ID,
} from './zh-sprint4-helpers';

/**
 * Sprint 4 Chinese coverage (docs/i18n/progress-zh.md): all transaction and
 * holdings routes render stable translated page-shell copy under /zh.
 *
 * Backend reads are intercepted in zh-sprint4-helpers.ts. Assertions avoid
 * PublicDataRouteSeoSummary because that crawler-only content belongs to
 * Sprint 7's SEO sweep.
 */

function zhTooltipTriggerForLabel(page: Page, label: string): Locator {
  const zhTooltipButtonSelector = [
    ':is(button, [role="button"])[aria-label^="更多信息"]',
    ':is(button, [role="button"])[aria-label^="查看“"]',
    'button[aria-label^="说明“"]',
  ].join(', ');

  return page
    .getByText(label, { exact: true })
    .first()
    .locator('xpath=ancestor::*[.//button or .//*[@role="button"]][1]')
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

/** A word that explains itself (Term, ExplainedTerm): the word is the trigger. */
async function expectZhTermTooltip(page: Page, label: string, expected: RegExp): Promise<void> {
  await dismissOpenTooltips(page);
  const trigger = page.getByRole('button', { name: label, exact: true }).first();
  await trigger.scrollIntoViewIfNeeded();
  await openTooltip(trigger);
  await expectTooltipFullyVisible(page, expected);
  await dismissOpenTooltips(page);
}

async function openZhRoute(page: Page, path: string, title: string): Promise<void> {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
  await expect(page).toHaveTitle(title);
}

test.describe('zh Sprint 4 — transactions and holdings routes', () => {
  test.beforeEach(async ({ page }) => {
    await mockSprint4Api(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('/zh/allocation renders localized allocation records and metadata', async ({ page }) => {
    await openZhRoute(page, '/zh/allocation', '分配名录 · Cosmic Signature');
    await expect(page.getByText('分配名录', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('仅显示已收官周期记录', { exact: true })).toBeVisible();
    // Every finalized cycle is one row of the ledger, named by its section title.
    await expect(page.getByRole('table', { name: '已收官周期' })).toBeVisible();
  });

  test('/zh/allocation/[id] renders localized cycle details and metadata', async ({ page }) => {
    await openZhRoute(
      page,
      `/zh/allocation/${SPRINT4_MOCK_CYCLE}`,
      `第 ${SPRINT4_MOCK_CYCLE} 个周期分配详情 · Cosmic Signature`,
    );
    await expect(
      page.getByRole('heading', { level: 1, name: `第 ${SPRINT4_MOCK_CYCLE} 个周期` }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: '周期获配者' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '周期统计' })).toBeVisible();
  });

  test('/zh/allocation-finalized renders localized retrieval details and metadata', async ({
    page,
  }) => {
    await openZhRoute(
      page,
      `/zh/allocation-finalized?cycle=${SPRINT4_MOCK_CYCLE}`,
      // A cycle's record is titled like its H1; the index keeps 已收官的分配.
      `第 ${SPRINT4_MOCK_CYCLE} 个周期的签名分配 · Cosmic Signature`,
    );
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: `第 ${SPRINT4_MOCK_CYCLE} 个周期的签名分配`,
      }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '分配包含的内容' })).toBeVisible();
  });

  test('/zh/anchoring renders localized anchoring overview and metadata', async ({ page }) => {
    // The route carries one name, 锚定派发 (Anchor Distributions), in the nav, H1 and title.
    await openZhRoute(page, '/zh/anchoring', '锚定派发 · Cosmic Signature');
    await expect(page.getByText('锚定派发', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '锚定运作原理' })).toBeVisible();
    await expect(page.getByText('开始锚定', { exact: true })).toBeVisible();
  });

  test('/zh/anchor-action/[IsRwalk]/[actionId] renders localized action details', async ({
    page,
  }) => {
    await openZhRoute(
      page,
      `/zh/anchor-action/0/${SPRINT4_MOCK_ACTION_ID}`,
      '锚定操作详情 · Cosmic Signature',
    );
    await expect(
      page.getByRole('heading', { level: 1, name: `操作 #${SPRINT4_MOCK_ACTION_ID}` }),
    ).toBeVisible();
    await expect(page.getByText('Cosmic Signature NFT 锚定操作', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '时间线' })).toBeVisible();
  });

  test('/zh/my-allocations renders its disconnected-wallet Chinese shell', async ({ page }) => {
    await openZhRoute(page, '/zh/my-allocations', '我的分配 · Cosmic Signature');
    await expect(page.getByText('我的分配', { exact: true }).first()).toBeVisible();
    // The wallet-required state says what connecting shows (wallet.required.allocations).
    await expect(
      page.getByRole('heading', { level: 2, name: '连接钱包，查看你的分配' }),
    ).toBeVisible();
    await expect(
      page.getByText('连接后，这里会显示你可取回的 ETH、锚定派发，以及附加的 NFT 与代币。', {
        exact: true,
      }),
    ).toBeVisible();
  });

  test('/zh/my-anchors renders its disconnected-wallet Chinese shell', async ({ page }) => {
    await openZhRoute(page, '/zh/my-anchors', '我的锚定 · Cosmic Signature');
    await expect(page.getByRole('heading', { level: 1, name: '我的锚定' })).toBeVisible();
    await expect(page.getByText('连接钱包，管理你的锚定', { exact: true })).toBeVisible();
  });

  test('/zh/my-statistics renders localized personal statistics metadata', async ({ page }) => {
    await openZhRoute(page, '/zh/my-statistics', '我的统计 · Cosmic Signature');
    await expect(page.getByRole('heading', { level: 1, name: '我的统计' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: '连接钱包，查看你的统计' }),
    ).toBeVisible();
    await expect(
      page.getByText('连接后，这里会显示你在每个演绎周期中的落笔、分配与锚定。', { exact: true }),
    ).toBeVisible();
  });

  test('/zh/my-tokens renders its disconnected-wallet Chinese shell', async ({ page }) => {
    await openZhRoute(page, '/zh/my-tokens', '我的 NFT · Cosmic Signature');
    await expect(page.getByRole('heading', { level: 1, name: '我的 NFT' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: '连接钱包，查看你的 NFT' }),
    ).toBeVisible();
    await expect(
      page.getByText(
        '连接后，这里会显示你钱包中的 Cosmic Signature NFT，你也可以将它们发送到其他地址。',
        { exact: true },
      ),
    ).toBeVisible();
  });

  test('/zh/transfer-cst renders its disconnected-wallet Chinese shell', async ({ page }) => {
    await openZhRoute(page, '/zh/transfer-cst', '转账 CST · Cosmic Signature');
    await expect(page.getByRole('heading', { level: 1, name: '转账 CST' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '连接钱包，发送 CST' })).toBeVisible();
    await expect(
      page.getByText('连接后，这里会显示你的 CST 余额、发送表单，以及你的转账记录链接。', {
        exact: true,
      }),
    ).toBeVisible();
  });

  test('/zh/cosmic-signature-transfer/[address] renders localized NFT history', async ({
    page,
  }) => {
    await openZhRoute(
      page,
      `/zh/cosmic-signature-transfer/${SPRINT4_MOCK_ADDRESS}`,
      'NFT 转移记录 · Cosmic Signature',
    );
    await expect(page.getByRole('heading', { level: 1, name: 'NFT 转移记录' })).toBeVisible();
    await expect(page.getByText('暂无 NFT 转移记录。', { exact: true })).toBeVisible();
  });

  test('/zh/cosmic-token-transfer/[address] renders localized CST history', async ({ page }) => {
    await openZhRoute(
      page,
      `/zh/cosmic-token-transfer/${SPRINT4_MOCK_ADDRESS}`,
      'CST 转账记录 · Cosmic Signature',
    );
    await expect(page.getByRole('heading', { level: 1, name: 'CST 转账记录' })).toBeVisible();
    await expect(page.getByText('暂无 CST 转账记录。', { exact: true })).toBeVisible();
  });

  test('/zh/distributions-by-token/[address]/[tokenId] renders localized details', async ({
    page,
  }) => {
    await openZhRoute(
      page,
      `/zh/distributions-by-token/${SPRINT4_MOCK_ADDRESS}/${SPRINT4_MOCK_TOKEN_ID}`,
      '按代币查看锚定派发 · Cosmic Signature',
    );
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: `Cosmic Signature #${String(SPRINT4_MOCK_TOKEN_ID).padStart(6, '0')} 的锚定派发`,
      }),
    ).toBeVisible();
    await expect(page.getByText('锚定派发（ETH）', { exact: true }).first()).toBeVisible();
  });

  test('opens representative Chinese allocation tooltips', async ({ page }) => {
    await openZhRoute(page, '/zh/allocation', '分配名录 · Cosmic Signature');
    await expectZhLabelTooltip(page, '周期储备分配', /ETH 储备如何沿协议各条轨道分配/);
    // A split legend entry explains itself: the track's name is the trigger.
    await expectZhTermTooltip(page, '签名分配', /完成收官之笔的参与者取回/);
  });

  test('opens representative Chinese anchoring tooltips', async ({ page }) => {
    await openZhRoute(page, '/zh/anchoring', '锚定派发 · Cosmic Signature');
    await expectZhLabelTooltip(page, '锚定派发池', /当前分配至锚定派发池的 ETH 总额/);
    await expectZhLabelTooltip(page, '每枚 NFT 派发额', /当前每枚已锚定 Cosmic Signature NFT/);
  });

  test('shows an end-user-visible Chinese Sonner toast', async ({ page }) => {
    await openZhRoute(
      page,
      `/zh/allocation/${SPRINT4_MOCK_CYCLE}`,
      `第 ${SPRINT4_MOCK_CYCLE} 个周期分配详情 · Cosmic Signature`,
    );
    await page.getByRole('button', { name: '分享周期摘要' }).click();
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: '周期摘要已复制到剪贴板' }),
    ).toBeVisible();
  });
});

/**
 * Browser-level transaction rejection was attempted with the injected-provider
 * pattern from wallet.spec.ts. The wallet connected on Desktop and Mobile
 * Chrome, but the production public-client transport could not complete the CST
 * balance read under interception, so the real submit button correctly stayed
 * disabled. Keeping that case would be transport-dependent and flaky. The
 * deterministic code-4001 -> localized cancellation behavior remains covered
 * by components/tokens/__tests__/CstTransferForm.test.tsx.
 */
