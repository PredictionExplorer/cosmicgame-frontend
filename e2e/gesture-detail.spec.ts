import { test, expect } from '@playwright/test';

test.describe('Gesture detail page', () => {
  test('gesture/1 loads without errors', async ({ page }) => {
    const response = await page.goto('/gesture/1', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).not.toHaveText('Internal Server Error');
  });

  test('shows gesture information fields', async ({ page }) => {
    await page.goto('/gesture/1', { waitUntil: 'networkidle' });
    // One H1: "Gesture #N" (its place in the cycle) once the gesture is indexed
    // with its position, "Gesture record <id>" otherwise.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /^(Gesture #\d+|Gesture record 1)$/,
    );
    // The record, a record that does not exist, or a read that failed (with a retry).
    await expect(
      page
        .getByRole('heading', {
          name: /^(Record|No gesture information found\.|Gesture record didn’t load)$/,
        })
        .first(),
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

    // The header figures: what was paid (CST at two decimals, the exact amount on hover)
    // and what it imprinted.
    await expect(page.locator('[data-figure="cost"]')).toContainText('411.53 CST');
    await expect(page.locator('[data-figure="participationCst"]')).toContainText(
      'Participation CST',
    );
    await expect(page.locator('[data-figure="participationCst"]')).toContainText('100 CST');
    await expect(page.locator('[data-figure="cost"]')).not.toContainText(/^Gesture Cost\s*0 CST$/);
    // A message is quoted only when there is one.
    await expect(page.getByTestId('gesture-message')).toContainText('rewards system');
  });

  test('a record the API does not hold reads as missing, not as a failed read (D321)', async ({
    page,
  }) => {
    // The production API answers an id it does not hold with 400, not 404.
    let reads = 0;
    // lexicon-allow-start: mocked backend route is a sealed API contract.
    await page.route('**/api/cosmicgame/bid/info/40000', (route) => {
      reads += 1;
      return route.fulfill({ status: 400, json: { error: 'record not found' } });
    });
    // lexicon-allow-end

    await page.goto('/gesture/40000', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gesture record 40000');
    await expect(
      page.getByRole('heading', { name: 'No gesture information found.' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'See the current cycle' })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
    await expect(page.getByRole('heading', { name: 'Gesture record didn’t load' })).toHaveCount(0);
    // The answer is final: it is read once, never retried.
    expect(reads).toBe(1);
  });

  // The route layout turns a malformed id away before the loading boundary
  // streams, so it is a real 404 rather than a 200 "Invalid" page.
  test('an id that is not a whole number is a real 404, never a nearby gesture', async ({
    page,
  }) => {
    const response = await page.goto('/gesture/12abc', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  });
});
