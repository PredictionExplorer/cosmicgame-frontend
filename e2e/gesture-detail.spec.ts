import { test, expect } from '@playwright/test';

test.describe('Gesture detail page', () => {
  test('gesture/1 loads without errors', async ({ page }) => {
    const response = await page.goto('/gesture/1', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('shows gesture information fields', async ({ page }) => {
    await page.goto('/gesture/1', { waitUntil: 'networkidle' });
    // The page header always shows "Gesture Position" (with "#N" once indexed).
    await expect(page.getByText(/Gesture Position/i).first()).toBeVisible();
    await expect(
      page.getByText(/Gesture details|No gesture information found/i).first(),
    ).toBeVisible();
  });

  test('gesture cost does not show NaN or undefined', async ({ page }) => {
    await page.goto('/gesture/1', { waitUntil: 'networkidle' });
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('undefined ETH');
    expect(bodyText).not.toContain('undefined CST');
  });

  test('participant address is a valid hex string', async ({ page }) => {
    await page.goto('/gesture/1', { waitUntil: 'networkidle' });
    const addressLink = page.locator('a[href*="/user/0x"]').first();
    if (await addressLink.isVisible()) {
      const href = await addressLink.getAttribute('href');
      expect(href).toMatch(/\/user\/0x[0-9a-fA-F]+/);
    }
  });

  test('multiple gesture pages load correctly', async ({ page }) => {
    for (const id of [1, 2, 5, 10]) {
      const response = await page.goto(`/gesture/${id}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
    }
  });

  test('shows nonzero CST cost and Participation CST for live-shaped CST payload', async ({
    page,
  }) => {
    // lexicon-allow-start: mocked backend route and wire keys are sealed API contracts.
    await page.route('**/api/cosmicgame/bid/info/18482', (route) =>
      route.fulfill({
        json: {
          BidInfo: {
            Tx: {
              EvtLogId: 18482,
              BlockNum: 467848129,
              TxId: 5441,
              TxHash: '0x45d7ecb96a242458dd991de97272332c0dc02fdac341af3a0cf549c4f30b0582',
              TimeStamp: 1780045566,
              DateTime: '2026-05-29T09:06:06Z',
            },
            BidderAddr: '0x76Cd6127403163a2a74Aa4b6968579DC6435034e',
            EthPriceEth: -1e-18,
            CstPriceEth: 411.52783099128,
            RoundNum: 0,
            BidType: 2,
            CSTRewardEth: 100,
            RWalkNFTId: -1,
            NFTDonationTokenId: -1,
            NFTDonationTokenAddr: '',
            NFTTokenURI: '',
            Message:
              "Let's talk about the rewards system of Cosmic signature is quite different from other projects",
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

    await page.goto('/gesture/18482', { waitUntil: 'networkidle' });

    const section = page.getByRole('region', { name: 'Cost and Participation CST' });
    await expect(section).toContainText('411.5278 CST');
    await expect(section).toContainText('Participation CST');
    await expect(section).toContainText('100.00 CST');
    const sectionText = await section.innerText();
    expect(sectionText).not.toMatch(/Gesture cost\s*0\.00 CST/);
  });
});
