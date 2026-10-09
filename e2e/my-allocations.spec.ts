import { test, expect } from '@playwright/test';

import myPages from '../messages/en/myPages.json';

/**
 * My Allocations for a wallet the indexer has not seen yet. The UX scenario's demo account
 * stands in for a newly connected wallet, and the reads answer as production does for such a
 * wallet (`UserAid: 0`, empty lists, `Winnings: []`). Regression: that notice read as a failed
 * Anchor Distribution read, so every new wallet saw a permanent error instead of the empty page.
 */
const PAGE = '/my-allocations?uxScenario=live-mid-cycle';
const DEMO_ACCOUNT = '0x1111111111111111111111111111111111111111';

// lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract
const NEW_WALLET_READS: [route: string, fields: Record<string, unknown>][] = [
  ['/user/notif_red_box/', { Winnings: [] }],
  ['/staking/cst/rewards/to_claim/by_user/', { UnclaimedEthDeposits: [] }],
  ['/donations/nft/unclaimed/by_user/', { UnclaimedDonatedNFTs: [] }],
  ['/prizes/eth/unclaimed/by_user/', { UnclaimedDeposits: [] }],
  ['/donations/erc20/by_user/', { DonatedPrizesERC20ByWinner: [] }],
];
// lexicon-allow-end

test.describe('My Allocations for a new wallet', () => {
  test('says nothing is waiting, never that the Anchor Distributions failed', async ({ page }) => {
    await page.route('**/api/cosmicgame/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      const read = NEW_WALLET_READS.find(([prefix]) => path.includes(prefix));
      if (!read) return route.continue();
      return route.fulfill({
        json: { ...read[1], UserAddr: DEMO_ACCOUNT, UserAid: 0, error: '', status: 1 },
      });
    });

    await page.goto(PAGE, { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { level: 2, name: myPages.allocations.nothing.title }),
    ).toBeVisible();
    await expect(page.getByText(myPages.allocations.anchorLoadError.title)).toHaveCount(0);
    await expect(page.getByTestId('retrieval-summary')).toHaveCount(0);
  });
});
