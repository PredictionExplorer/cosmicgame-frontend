import { expect, test } from '@playwright/test';

import { mockSprint4Api } from './zh-sprint4-helpers';

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 1000 },
] as const;

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

test.describe('Sprint 1 Chinese layout QA', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name} keeps shared Chinese UI readable`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto('/zh/faq');

      await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
      await expect(page.locator('footer').getByText('服务条款', { exact: true })).toBeVisible();
      await expect(page.locator('footer').getByText('隐私政策', { exact: true })).toBeVisible();

      if (viewport.width < 1024) {
        await page.getByRole('button', { name: '打开菜单' }).click();
        const drawer = page.getByRole('dialog');
        await expect(drawer.getByText('协议', { exact: true })).toBeVisible();
        await expect(drawer.getByText('生态', { exact: true })).toBeVisible();
        await expect(drawer.getByText('画廊', { exact: true })).toBeVisible();
        await page.keyboard.press('Escape');
      } else {
        const primary = page.getByRole('navigation', { name: '主导航' });
        await expect(primary.getByText('画廊', { exact: true })).toBeVisible();
        await expect(primary.getByText('探索', { exact: true })).toBeVisible();
        await expect(primary.getByText('帮助', { exact: true })).toBeVisible();
      }

      const footerProtocol = page.locator('footer').getByText('协议', { exact: true });
      await expect(footerProtocol).toHaveCSS('letter-spacing', /^(normal|0px)$/);
      await expect(footerProtocol).toHaveCSS('font-family', /Noto Sans SC/);
      await expectNoHorizontalOverflow(page);

      await page.goto('/zh/gallery');
      await expect(page.getByRole('textbox', { name: '搜索 NFT' })).toBeVisible();
      await expect(page.getByRole('button', { name: '搜索', exact: true })).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.goto('/zh/site-map');
      await expect(page.getByRole('heading', { level: 1, name: '网站地图' })).toBeVisible();
      await expect(page.getByText('个人工具', { exact: true })).toBeVisible();
      await expect(page.getByText('公开协议页面', { exact: true })).toBeVisible();
      await expect(page.getByText('协议数据页面', { exact: true })).toBeVisible();
      await expect(page.getByText('生态', { exact: true }).last()).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await testInfo.attach(`zh-site-map-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      await page.goto('/zh/allocation');
      const allocationChrome = page
        .getByRole('list', { name: '按周期排列的获配者列表' })
        .or(page.getByText('暂无获配者', { exact: true }))
        .or(page.getByRole('status', { name: '正在加载周期分配' }));
      await expect(allocationChrome.first()).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.goto('/zh/this-page-does-not-exist');
      await expect(page.getByRole('heading', { level: 1, name: '404：找不到页面' })).toBeVisible();
      await expect(page.getByRole('link', { name: '返回首页' })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe('Sprint 3 Chinese layout QA', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name} keeps core dApp Chinese pages readable`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);

      await page.goto('/zh');
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
      await expect(page.getByText('落笔方式').first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await testInfo.attach(`zh-home-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      await page.goto('/zh/current-cycle');
      await expect(page.getByText('落笔总次数', { exact: true }).first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await testInfo.attach(`zh-current-cycle-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      await page.goto('/zh/gallery');
      // Visible gallery heading is an h2 (the h1 is the English SeoSummary until Sprint 7).
      await expect(page.getByRole('heading', { name: 'NFT 画廊' })).toBeVisible();
      await expect(page.getByText('铭刻总数', { exact: true }).first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await testInfo.attach(`zh-gallery-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      await page.goto('/zh/how-it-works');
      await expect(page.getByRole('heading', { level: 1, name: /运作原理/ })).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await testInfo.attach(`zh-how-it-works-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    });
  }
});

test.describe('Sprint 4 Chinese layout QA', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name} keeps transaction and holdings pages readable`, async ({
      page,
    }, testInfo) => {
      await mockSprint4Api(page);
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await page.goto('/zh/allocation');
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
      await expect(page.getByText('分配名录', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('周期储备分配', { exact: true })).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await testInfo.attach(`zh-allocation-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      await page.goto('/zh/anchoring');
      await expect(page.getByText('锚定派发', { exact: true }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: '锚定运作原理' })).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await testInfo.attach(`zh-anchoring-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      await page.goto('/zh/my-allocations');
      await expect(page.getByText('我的分配', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('连接钱包后即可查看并取回分配。', { exact: true })).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await testInfo.attach(`zh-my-allocations-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      await page.goto('/zh/my-anchors');
      await expect(page.getByText('我的锚定', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('连接钱包后即可管理锚定。', { exact: true })).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await testInfo.attach(`zh-my-anchors-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      await page.goto('/zh/transfer-cst');
      await expect(page.getByRole('heading', { level: 1, name: '转账 CST' })).toBeVisible();
      await expect(
        page.getByText('连接钱包后即可从余额中转账 CST。', { exact: true }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await testInfo.attach(`zh-transfer-cst-${viewport.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    });
  }
});
