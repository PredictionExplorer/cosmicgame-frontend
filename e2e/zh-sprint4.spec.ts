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
    await expect(page.getByRole('list', { name: '按周期排列的获配者列表' })).toBeVisible();
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
      '已取回分配 · Cosmic Signature',
    );
    await expect(
      page.getByText(`第 ${SPRINT4_MOCK_CYCLE} 个周期的签名分配已取回。`, {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: `第 ${SPRINT4_MOCK_CYCLE} 个周期的分配` }),
    ).toBeVisible();
  });

  test('/zh/anchoring renders localized anchoring overview and metadata', async ({ page }) => {
    await openZhRoute(page, '/zh/anchoring', '锚定 · Cosmic Signature');
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
    await expect(page.getByRole('heading', { level: 1, name: '锚定操作' })).toBeVisible();
    await expect(page.getByText('Cosmic Signature NFT 锚定操作', { exact: true })).toBeVisible();
    await expect(page.getByText('锚定时间', { exact: true })).toBeVisible();
  });

  test('/zh/my-allocations renders its disconnected-wallet Chinese shell', async ({ page }) => {
    await openZhRoute(page, '/zh/my-allocations', '我的分配 · Cosmic Signature');
    await expect(page.getByText('我的分配', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('未连接钱包', { exact: true })).toBeVisible();
    await expect(page.getByText('连接钱包后即可查看并取回分配。', { exact: true })).toBeVisible();
  });

  test('/zh/my-anchors renders its disconnected-wallet Chinese shell', async ({ page }) => {
    await openZhRoute(page, '/zh/my-anchors', '我的锚定 · Cosmic Signature');
    await expect(page.getByText('我的锚定', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('未连接钱包', { exact: true })).toBeVisible();
    await expect(page.getByText('连接钱包后即可管理锚定。', { exact: true })).toBeVisible();
  });

  test('/zh/my-statistics renders localized personal statistics metadata', async ({ page }) => {
    await openZhRoute(page, '/zh/my-statistics', '我的统计 · Cosmic Signature');
    await expect(page.getByRole('heading', { level: 1, name: '我的统计' })).toBeVisible();
    await expect(page.getByText('暂无活动', { exact: true })).toBeVisible();
  });

  test('/zh/my-tokens renders its disconnected-wallet Chinese shell', async ({ page }) => {
    await openZhRoute(page, '/zh/my-tokens', '我的 NFT · Cosmic Signature');
    await expect(page.getByRole('heading', { level: 1, name: '我的 NFT' })).toBeVisible();
    await expect(page.getByText('未连接钱包', { exact: true })).toBeVisible();
    await expect(page.getByText('连接钱包后即可查看并管理 NFT。', { exact: true })).toBeVisible();
  });

  test('/zh/transfer-cst renders its disconnected-wallet Chinese shell', async ({ page }) => {
    await openZhRoute(page, '/zh/transfer-cst', '转账 CST · Cosmic Signature');
    await expect(page.getByRole('heading', { level: 1, name: '转账 CST' })).toBeVisible();
    await expect(page.getByText('未连接钱包', { exact: true })).toBeVisible();
    await expect(page.getByText('连接钱包后即可从余额中转账 CST。', { exact: true })).toBeVisible();
  });

  test('/zh/cosmic-signature-transfer/[address] renders localized NFT history', async ({
    page,
  }) => {
    await openZhRoute(
      page,
      `/zh/cosmic-signature-transfer/${SPRINT4_MOCK_ADDRESS}`,
      'Cosmic Signature NFT 转移记录 · Cosmic Signature',
    );
    await expect(
      page.getByRole('heading', { level: 1, name: 'Cosmic Signature NFT 转移记录' }),
    ).toBeVisible();
    await expect(page.getByText('暂无 NFT 转移记录。', { exact: true })).toBeVisible();
  });

  test('/zh/cosmic-token-transfer/[address] renders localized CST history', async ({ page }) => {
    await openZhRoute(
      page,
      `/zh/cosmic-token-transfer/${SPRINT4_MOCK_ADDRESS}`,
      'Cosmic Signature CST 转账记录 · Cosmic Signature',
    );
    await expect(
      page.getByRole('heading', { level: 1, name: 'Cosmic Signature CST 转账记录' }),
    ).toBeVisible();
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
        name: `代币 ${SPRINT4_MOCK_TOKEN_ID} 的锚定派发明细`,
      }),
    ).toBeVisible();
    await expect(page.getByText('锚定派发（ETH）', { exact: true }).first()).toBeVisible();
  });

  test('opens representative Chinese allocation tooltips', async ({ page }) => {
    await openZhRoute(page, '/zh/allocation', '分配名录 · Cosmic Signature');
    await expectZhLabelTooltip(page, '周期储备分配', /ETH 储备如何沿协议各条轨道分配/);
    await expectZhLabelTooltip(page, '签名分配', /写下收官之笔的参与者取回/);
  });

  test('opens representative Chinese anchoring tooltips', async ({ page }) => {
    await openZhRoute(page, '/zh/anchoring', '锚定 · Cosmic Signature');
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
