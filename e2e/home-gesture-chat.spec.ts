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

async function mockHomeGestureChatApi(page: Page) {
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
      await route.fulfill({ json: { BidsByRound: gestures } });
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

    const chat = page.getByTestId('gesture-message-chat');
    await chat.scrollIntoViewIfNeeded();

    await expect(chat).toBeVisible();
    await expect(chat.getByRole('heading', { name: 'Gesture Chat' })).toBeVisible();
    await expect(chat.getByText('Cycle #7 messages from gestures.')).toBeVisible();
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

  test('positions the chat appropriately for the current viewport', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.getByTestId('gesture-message-chat');
    const primaryColumn = page.getByTestId('home-primary-column');
    const cycleDetails = page.getByTestId('cycle-details-link-card');
    const publicGoods = page.getByTestId('public-goods-impact-card');
    await expect(chat).toBeVisible();
    await expect(cycleDetails).toBeVisible();
    await expect(publicGoods).toBeVisible();

    const viewport = page.viewportSize();
    const primaryBox = await primaryColumn.boundingBox();
    const cycleDetailsBox = await cycleDetails.boundingBox();
    const publicGoodsBox = await publicGoods.boundingBox();
    const box = await chat.boundingBox();
    expect(viewport).not.toBeNull();
    expect(primaryBox).not.toBeNull();
    expect(box).not.toBeNull();
    expect(cycleDetailsBox).not.toBeNull();
    expect(publicGoodsBox).not.toBeNull();

    if (testInfo.project.name !== 'Desktop Chrome') {
      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(cycleDetailsBox!.y).toBeGreaterThan(box!.y + box!.height);
      expect(publicGoodsBox!.y).toBeGreaterThan(cycleDetailsBox!.y + cycleDetailsBox!.height);
      return;
    }

    expect(box!.x).toBeGreaterThan(viewport!.width / 2);
    expect(box!.width).toBeGreaterThan(500);
    expect(primaryBox!.x + primaryBox!.width).toBeLessThanOrEqual(box!.x);
    expect(cycleDetailsBox!.y).toBeGreaterThan(box!.y + box!.height);
    expect(publicGoodsBox!.y).toBeGreaterThan(cycleDetailsBox!.y + cycleDetailsBox!.height);
    expect(Math.abs(cycleDetailsBox!.x - box!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(publicGoodsBox!.x - box!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(cycleDetailsBox!.width - box!.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(publicGoodsBox!.width - box!.width)).toBeLessThanOrEqual(2);
    expect(primaryBox!.x + primaryBox!.width).toBeLessThanOrEqual(publicGoodsBox!.x);
  });
});
