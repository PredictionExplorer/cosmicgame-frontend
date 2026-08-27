import { expect, test, type Page } from '@playwright/test';

const MOCK_NOW_SECONDS = 1_700_000_500;
const CYCLE_NUMBER = 7;

const dashboard = {
  CurRoundNum: CYCLE_NUMBER,
  CurNumBids: 4,
  CurPrizeAmountEth: 2.5,
  CurBidPriceEth: 0.1,
  PrizeAmountEth: 2.5,
  RaffleAmountEth: 0.4,
  PrizeClaimTs: MOCK_NOW_SECONDS + 3_600,
  CurRoundPrizeTime: MOCK_NOW_SECONDS + 3_600,
  TsRoundStart: MOCK_NOW_SECONDS - 3_600,
  LastBidderAddr: '0x1111111111111111111111111111111111111111',
  GestureCostEth: 0.1,
  StakingAmountEth: 0,
  CharityPercentage: 7,
  NumRaffleEthWinnersBidding: 2,
  NumRaffleNFTWinnersBidding: 1,
  NumRaffleNFTWinnersStakingRWalk: 0,
  MainStats: {
    NumCSTokenMints: 0,
    TotalRaffleEthDeposits: 0,
    TotalCSTConsumedEth: 0,
    TotalMktRewardsEth: 0,
    NumMktRewards: 0,
    TotalRaffleEthWithdrawn: 0,
    NumBidsCST: 0,
    NumUniqueBidders: 3,
    NumUniqueWinners: 0,
    NumUniqueDonors: 0,
    TotalNamedTokens: 0,
    NumUniqueStakersCST: 0,
    NumUniqueStakersRWalk: 0,
    StakeStatisticsCST: { NumActiveStakers: 0, TotalTokensStaked: 0 },
    StakeStatisticsRWalk: { NumActiveStakers: 0, TotalTokensStaked: 0 },
  },
  CurRoundStats: {
    TotalBids: 4,
    TotalDonatedAmountEth: 0,
    TotalDonatedNFTs: 0,
    TotalRaffleEthDepositsEth: 0,
    TotalRaffleNFTs: 0,
    ActivationTime: MOCK_NOW_SECONDS - 60,
  },
};

const gestures = [
  {
    BidderAddr: '0x1111111111111111111111111111111111111111',
    BidType: 0,
    EthPriceEth: 0.1,
    RoundNum: CYCLE_NUMBER,
    Message: 'Older message from a gesture',
    Tx: {
      EvtLogId: 101,
      BlockNum: 1,
      TxId: 1,
      TxHash: '0x101',
      TimeStamp: MOCK_NOW_SECONDS - 300,
      DateTime: '2023-11-14T22:08:20Z',
    },
  },
  {
    BidderAddr: '0x2222222222222222222222222222222222222222',
    BidType: 0,
    EthPriceEth: 0.11,
    RoundNum: CYCLE_NUMBER,
    Message: '',
    Tx: {
      EvtLogId: 102,
      BlockNum: 2,
      TxId: 2,
      TxHash: '0x102',
      TimeStamp: MOCK_NOW_SECONDS - 200,
      DateTime: '2023-11-14T22:10:00Z',
    },
  },
  {
    BidderAddr: '0x3333333333333333333333333333333333333333',
    BidType: 2,
    CstPriceEth: 20,
    EthPriceEth: -1,
    RoundNum: CYCLE_NUMBER,
    Message: 'Newest message from a gesture',
    Tx: {
      EvtLogId: 103,
      BlockNum: 3,
      TxId: 3,
      TxHash: '0x103',
      TimeStamp: MOCK_NOW_SECONDS - 100,
      DateTime: '2023-11-14T22:11:40Z',
    },
  },
];

const longGestureFeed = Array.from({ length: 12 }, (_, index) => {
  const sequence = index + 1;
  return {
    ...gestures[0]!,
    BidderAddr: `0x${sequence.toString(16).padStart(40, '0')}`,
    Message: `Scrollable message ${sequence}: ${'cosmic signal '.repeat(8).trim()}`,
    Tx: {
      ...gestures[0]!.Tx,
      EvtLogId: 200 + sequence,
      TxId: 200 + sequence,
      TxHash: `0x${200 + sequence}`,
      TimeStamp: MOCK_NOW_SECONDS - sequence * 60,
    },
  };
});

async function mockHomeGestureChatApi(page: Page, gestureFeed = gestures) {
  await page.route('**/api/cosmicgame/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.endsWith('/time/current')) {
      await route.fulfill({ json: { CurrentTimeStamp: MOCK_NOW_SECONDS } });
      return;
    }

    if (path.endsWith('/rounds/current/time')) {
      await route.fulfill({ json: { CurRoundPrizeTime: MOCK_NOW_SECONDS + 3_600 } });
      return;
    }

    if (path.endsWith('/statistics/dashboard')) {
      await route.fulfill({ json: dashboard });
      return;
    }

    // lexicon-allow-start: backend route paths are sealed API contracts.
    if (path.includes(`/bid/list/by_round/${CYCLE_NUMBER}/1/`)) {
      await route.fulfill({ json: { BidsByRound: gestureFeed } });
      return;
    }

    if (path.endsWith('/get_banned_bids')) {
      await route.fulfill({ json: [] });
      return;
    }

    if (path.endsWith('/bid/eth_price')) {
      await route.fulfill({
        json: {
          AuctionDuration: '3600',
          ETHPrice: '100000000000000000',
          SecondsElapsed: '120',
        },
      });
      return;
    }

    if (path.endsWith('/bid/cst_price')) {
      await route.fulfill({
        json: {
          AuctionDuration: '3600',
          CSTPrice: '20000000000000000000',
          SecondsElapsed: '120',
        },
      });
      return;
    }

    if (path.endsWith('/bid/used_randomwalk_nfts')) {
      await route.fulfill({ json: { UsedRwalkNFTs: [] } });
      return;
    }

    if (path.endsWith(`/donations/nft/by_round/${CYCLE_NUMBER}`)) {
      await route.fulfill({ json: { NFTDonations: [] } });
      return;
    }

    if (path.endsWith(`/donations/erc20/by_round/all/${CYCLE_NUMBER}`)) {
      await route.fulfill({ json: { DonationsERC20ByRoundAll: [] } });
      return;
    }
    // lexicon-allow-end

    await route.fulfill({ json: {} });
  });
}

test.describe('home gesture chat', () => {
  test.beforeEach(async ({ page }) => {
    await mockHomeGestureChatApi(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('shows current-cycle gesture messages newest first', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    await expect(chat.getByText('Cycle #7 · 2 messages')).toBeVisible();
    await chat.scrollIntoViewIfNeeded();

    await expect(chat).toBeVisible();
    await expect(chat.getByRole('heading', { name: 'Gesture Chat' })).toBeVisible();
    await expect(chat.getByText('Newest message from a gesture')).toBeVisible();
    await expect(chat.getByText('Older message from a gesture')).toBeVisible();
    await expect(chat.getByRole('link', { name: 'Open gesture position 103' })).toHaveAttribute(
      'href',
      '/gesture/103',
    );
    await expect(chat.getByRole('link', { name: 'Open gesture position 102' })).toHaveCount(0);

    const firstMessage = chat.getByRole('listitem').first();
    await expect(firstMessage).toContainText('Newest message from a gesture');
  });

  test('handles a long feed without making phone scrolling feel nested', async ({
    page,
  }, testInfo) => {
    await page.unroute('**/api/cosmicgame/**');
    await mockHomeGestureChatApi(page, longGestureFeed);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    const scroll = chat.getByTestId('gesture-message-chat-scroll');
    const cycleDetails = page.locator('[data-testid="cycle-details-link-card"]:visible').first();
    await expect(chat.getByText('Cycle #7 · 12 messages')).toBeVisible();

    const viewport = page.viewportSize();
    const chatBox = await chat.boundingBox();
    const metrics = await scroll.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      overflowY: window.getComputedStyle(element).overflowY,
    }));
    expect(viewport).not.toBeNull();
    expect(chatBox).not.toBeNull();

    if (testInfo.project.name === 'Desktop Chrome') {
      // The deck row is sized by the monument; the chat fills that column's
      // slack (all three columns end on one line) but a long feed must never
      // stretch the row — the list scrolls inside instead.
      const monumentBox = await page
        .locator('[data-testid="cycle-monument"]:visible')
        .first()
        .boundingBox();
      expect(monumentBox).not.toBeNull();
      expect(chatBox!.height).toBeLessThanOrEqual(monumentBox!.height);
      expect(metrics.overflowY).toBe('auto');
      expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight + 20);

      await scroll.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      expect(await scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      await expect(chat.getByText(/Scrollable message 12:/)).toBeVisible();
      return;
    }

    expect(metrics.overflowY).toBe('visible');
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 1);
    expect(chatBox!.height).toBeGreaterThan(viewport!.height);

    const cycleDetailsBox = await cycleDetails.boundingBox();
    expect(cycleDetailsBox).not.toBeNull();
    expect(cycleDetailsBox!.y).toBeGreaterThan(chatBox!.y + chatBox!.height);
  });

  test('positions the chat appropriately for the current viewport', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    const composer = page.locator('[data-testid="gesture-composer"]:visible').first();
    const monument = page.locator('[data-testid="cycle-monument"]:visible').first();
    const cycleDetails = page.locator('[data-testid="cycle-details-link-card"]:visible').first();
    await expect(chat.getByText('Cycle #7 · 2 messages')).toBeVisible();
    await expect(chat).toBeVisible();
    await expect(composer).toBeVisible();
    await expect(cycleDetails).toBeVisible();
    // The Public Goods impact card moved whole to /public-goods-contributions-cg.

    const viewport = page.viewportSize();
    const monumentBox = await monument.boundingBox();
    const composerBox = await composer.boundingBox();
    const cycleDetailsBox = await cycleDetails.boundingBox();
    const box = await chat.boundingBox();
    expect(viewport).not.toBeNull();
    expect(monumentBox).not.toBeNull();
    expect(composerBox).not.toBeNull();
    expect(box).not.toBeNull();
    expect(cycleDetailsBox).not.toBeNull();

    // The composer docks directly above the feed in the same Deck column.
    expect(composerBox!.y + composerBox!.height).toBeLessThanOrEqual(box!.y + 2);
    expect(Math.abs(composerBox!.x - box!.x)).toBeLessThanOrEqual(2);

    if (testInfo.project.name !== 'Desktop Chrome') {
      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      // Mobile stacks monument first, then composer + chat.
      expect(monumentBox!.y + monumentBox!.height).toBeLessThanOrEqual(composerBox!.y + 2);
      expect(cycleDetailsBox!.y).toBeGreaterThan(box!.y + box!.height);

      const participantBox = await chat
        .getByTestId('gesture-message-participant')
        .first()
        .boundingBox();
      const badgesBox = await chat.getByTestId('gesture-message-badges').first().boundingBox();
      expect(participantBox).not.toBeNull();
      expect(badgesBox).not.toBeNull();
      expect(badgesBox!.y).toBeGreaterThanOrEqual(participantBox!.y + participantBox!.height - 1);
      return;
    }

    // Desktop Deck: chat column on the right flank, monument to its left.
    expect(box!.x).toBeGreaterThan(viewport!.width / 2);
    expect(box!.width).toBeGreaterThan(320);
    expect(monumentBox!.x + monumentBox!.width).toBeLessThanOrEqual(box!.x + 2);
    // Companion cards live in the console rail below the Deck, aligned with
    // each other (their column widths differ from the Deck's chat column).
    expect(cycleDetailsBox!.y).toBeGreaterThan(box!.y + box!.height);
  });
});
