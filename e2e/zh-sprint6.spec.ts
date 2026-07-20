import { expect, test, type Page } from '@playwright/test';

async function mockSprint6Api(page: Page): Promise<void> {
  await page.route('**/api/cosmicgame/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/statistics/dashboard')) {
      await route.fulfill({
        json: {
          CurRoundNum: 42,
          GestureCostEth: 0.1,
          PrizePercentage: 25,
          ChronoWarriorPercentage: 10,
          RafflePercentage: 20,
          StakingPercentage: 30,
          CharityPercentage: 7,
          ContractAddrs: {},
        },
      });
      return;
    }
    await route.fulfill({ json: {} });
  });
}

async function openZh(page: Page, path: string): Promise<void> {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
}

test.describe('zh Sprint 6 — FAQ, legal, trust, contracts, code, and imprint', () => {
  test.beforeEach(async ({ page }) => {
    await mockSprint6Api(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('renders and searches the complete Chinese FAQ with Chinese JSON-LD', async ({ page }) => {
    await openZh(page, '/zh/faq');
    await expect(page.getByRole('heading', { name: 'Cosmic Signature 常见问题' })).toBeVisible();
    await expect(page.getByPlaceholder('搜索问题……')).toBeVisible();
    await page.getByPlaceholder('搜索问题……').fill('锚定');
    await expect(page.getByRole('button', { name: '锚定如何运作？', exact: true })).toBeVisible();

    const faqJson = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) =>
        scripts
          .map((script) => JSON.parse(script.textContent || '{}'))
          .find((value) => value['@type'] === 'FAQPage'),
      );
    expect(faqJson.inLanguage).toBe('zh-Hans');
    expect(faqJson.mainEntity).toHaveLength(67);
    expect(faqJson.mainEntity[0].name).toContain('Cosmic Signature');
  });

  test('renders complete Chinese legal and trust routes', async ({ page }) => {
    const routes: Array<[string, string]> = [
      ['/zh/terms', '服务条款'],
      ['/zh/privacy', '隐私政策'],
      ['/zh/risk-disclosures', 'Cosmic Signature 风险披露'],
      ['/zh/security', 'Cosmic Signature 安全'],
      ['/zh/audits', 'Cosmic Signature 审计'],
    ];

    for (const [path, heading] of routes) {
      await openZh(page, path);
      await expect(page.getByRole('heading', { name: heading, exact: true }).first()).toBeVisible();
    }
  });

  test('renders Chinese contracts, code, and imprint surfaces', async ({ page }) => {
    await openZh(page, '/zh/contracts');
    await expect(page.getByRole('heading', { name: 'Cosmic Signature 合约' })).toBeVisible();
    await expect(page.getByText('合约地址', { exact: true }).first()).toBeVisible();

    await openZh(page, '/zh/code');
    await expect(page.getByRole('heading', { name: 'Cosmic Signature 源代码' })).toBeVisible();
    await expect(page.getByText('代码查看器', { exact: true })).toBeVisible();

    await openZh(page, '/zh/imprint');
    await expect(page.getByRole('heading', { name: '铭刻 RandomWalk NFT' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '铭刻' })).toBeVisible();
  });

  test('preserves locale through the source-code alias redirect', async ({ page }) => {
    await page.goto('/zh/source-code', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/zh\/code$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
  });
});
