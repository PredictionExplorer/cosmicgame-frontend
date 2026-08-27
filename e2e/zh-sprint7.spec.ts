import { expect, test, type Page } from '@playwright/test';

import { mockZhQualityApi } from './zh-quality-mocks';

const ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
const MOCK_TIMESTAMP = 1710000000;

/**
 * The Go API always sends the full transaction envelope, and `flattenTx` hoists
 * every field of it. Omitting `BlockNum` / `TxId` produced records that strict
 * validation rightly rejects, which left the pages under test on their loading
 * state instead of rendering rows.
 */
function mockTransaction(evtLogId: number, hashFill: string) {
  return {
    EvtLogId: evtLogId,
    BlockNum: 100000 + evtLogId,
    TxId: evtLogId,
    TxHash: `0x${hashFill.repeat(64)}`,
    TimeStamp: MOCK_TIMESTAMP,
    DateTime: new Date(MOCK_TIMESTAMP * 1000).toISOString(),
  };
}

const contractAddresses = {
  CosmicSignatureAddr: '0x1111111111111111111111111111111111111111',
  CosmicTokenAddr: '0x2222222222222222222222222222222222222222',
  CharityWalletAddr: '0x3333333333333333333333333333333333333333',
  RandomWalkAddr: '0x4444444444444444444444444444444444444444',
  RaffleWalletAddr: '0x5555555555555555555555555555555555555555',
  StakingWalletAddr: '0x6666666666666666666666666666666666666666',
  MarketingWalletAddr: '0x7777777777777777777777777777777777777777',
  BusinessLogicAddr: '0x8888888888888888888888888888888888888888',
  CosmicGameAddr: '0x9999999999999999999999999999999999999999',
  CosmicDaoAddr: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  PrizesWalletAddr: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  StakingWalletCSTAddr: '0xcccccccccccccccccccccccccccccccccccccccc',
  StakingWalletRWalkAddr: '0xdddddddddddddddddddddddddddddddddddddddd',
  ImplementationAddr: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
};

const dashboard = {
  CurRoundNum: 8,
  CurNumBids: 7,
  CurPrizeAmountEth: 2.5,
  CurBidPriceEth: 0.1,
  PrizeClaimTs: MOCK_TIMESTAMP + 3600,
  TsRoundStart: MOCK_TIMESTAMP - 3600,
  LastBidderAddr: ADDRESS,
  GestureCostEth: 0.1,
  StakingAmountEth: 3,
  MainStats: {
    NumCSTokenMints: 24,
    NumBidsCST: 5,
    NumUniqueBidders: 4,
    NumUniqueWinners: 3,
    NumUniqueDonors: 2,
    NumUniqueStakersCST: 1,
    NumUniqueStakersRWalk: 1,
    TotalRaffleEthDeposits: 4,
    TotalRaffleEthWithdrawn: 3,
    TotalCSTConsumedEth: 100,
    TotalNamedTokens: 1,
    TotalMktRewardsEth: 125,
    NumMktRewards: 4,
    StakeStatisticsCST: {
      NumActiveStakers: 1,
      NumDeposits: 1,
      TotalTokensStaked: 2,
      TotalRewardEth: 3,
      UnclaimedRewardEth: 0,
    },
    StakeStatisticsRWalk: {
      NumActiveStakers: 1,
      TotalTokensStaked: 1,
      TotalTokensMinted: 1,
    },
  },
  ContractAddrs: contractAddresses,
  NumRaffleEthWinners: 5,
  NumRaffleNFTWinners: 3,
  NumHolderNFTWinners: 2,
  NumRaffleEthWinnersBidding: 2,
  NumRaffleNFTWinnersBidding: 1,
  NumRaffleNFTWinnersStakingRWalk: 1,
  PrizePercentage: 25,
  CharityPercentage: 7,
  RafflePercentage: 15,
  StakingPercentage: 20,
  TimeIncrease: 300,
  PriceIncrease: 10,
  NanosecondsExtra: 5000000,
};

// lexicon-allow-start: mocked backend URL paths mirror the sealed API contract
async function mockSprint7Api(page: Page): Promise<void> {
  await page.route('**/api/cosmicgame/**', async (route) => {
    const path = new URL(route.request().url()).pathname;

    if (path.endsWith('/statistics/dashboard')) {
      await route.fulfill({ json: dashboard });
      return;
    }

    if (path.includes('/donations/eth/with_info/info/7')) {
      await route.fulfill({
        json: {
          ETHDonation: {
            EvtLogId: 7,
            DonorAddr: ADDRESS,
            RoundNum: 7,
            AmountEth: 1.25,
            DataJson: JSON.stringify({ title: 'Protocol work', message: 'Keep building' }),
            Tx: mockTransaction(7, 'a'),
          },
        },
      });
      return;
    }

    if (path.includes('/donations/eth/both/by_round/')) {
      await route.fulfill({ json: { CosmicGameDonations: [] } });
      return;
    }

    if (path.includes('/donations/eth/both/all')) {
      await route.fulfill({ json: { CosmicGameDonations: [] } });
      return;
    }

    if (path.includes('/donations/charity/cg_deposits')) {
      await route.fulfill({ json: { CharityDonations: [] } });
      return;
    }

    if (path.includes('/donations/charity/voluntary')) {
      await route.fulfill({ json: { CharityDonations: [] } });
      return;
    }

    if (path.includes('/donations/charity/withdrawals')) {
      await route.fulfill({ json: { CharityWithdrawals: [] } });
      return;
    }

    if (path.includes('/marketing/rewards/by_user/')) {
      await route.fulfill({ json: { UserMarketingRewards: [] } });
      return;
    }

    if (path.includes('/marketing/rewards/global/')) {
      await route.fulfill({ json: { MarketingRewards: [] } });
      return;
    }

    if (path.includes('/system/modelist/')) {
      await route.fulfill({ json: { SystemModeChanges: [] } });
      return;
    }

    if (path.includes('/system/admin_events/')) {
      await route.fulfill({
        json: {
          AdminEvents: [
            {
              EvtLogId: 3,
              RecordType: 1,
              TransferType: 0,
              IntegerValue: 7,
              AddressValue: '',
              StringValue: '',
              Tx: mockTransaction(3, 'b'),
            },
          ],
        },
      });
      return;
    }

    if (path.endsWith('/get_banned_bids')) {
      await route.fulfill({ json: [] });
      return;
    }

    if (path.endsWith('/bid/current_special_winners')) {
      await route.fulfill({
        json: {
          EnduranceChampionAddress: ADDRESS,
          EnduranceChampionDuration: 3600,
          ChronoWarriorAddress: '0x2222222222222222222222222222222222222222',
          ChronoWarriorDuration: 7200,
          LastBidderAddress: ADDRESS,
          LastBidderLastBidTime: Math.floor(Date.now() / 1000) - 60,
          LastCstBidderAddress: '0x3333333333333333333333333333333333333333',
        },
      });
      return;
    }

    if (path.includes('/bid/list/by_round/')) {
      await route.fulfill({ json: { BidsByRound: [] } });
      return;
    }

    if (path.includes('/bid/list/all/')) {
      await route.fulfill({
        json: {
          Gestures: [
            {
              BidderAddr: ADDRESS,
              RoundNum: 7,
              BidType: 0,
              EthPriceEth: 0.05,
              CstPriceEth: -1,
              Message: 'Review locale link',
              Tx: mockTransaction(9, 'c'),
            },
          ],
        },
      });
      return;
    }

    await route.fulfill({ json: {} });
  });
}
// lexicon-allow-end

async function openZh(page: Page, path: string): Promise<void> {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
}

test.describe('zh Sprint 7 — long-tail routes', () => {
  test.beforeEach(async ({ page }) => {
    await mockSprint7Api(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('renders Chinese ETH contribution list, detail, and cycle routes', async ({ page }) => {
    await openZh(page, '/zh/eth-contribution');
    await expect(page.getByRole('heading', { name: 'ETH 贡献', exact: true })).toBeVisible();
    await expect(page.getByText('暂无贡献记录。')).toBeVisible();

    await openZh(page, '/zh/eth-contribution/detail/7');
    await expect(page.getByRole('heading', { name: 'ETH 贡献详情', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: '第 7 个周期' })).toBeVisible();
    await expect(page.getByText('贡献者留言')).toBeVisible();

    await openZh(page, '/zh/eth-contribution/round/7');
    await expect(
      page.getByRole('heading', { name: '第 7 个周期的直接 ETH 贡献', exact: true }),
    ).toBeVisible();
  });

  test('renders all Chinese public-goods routes', async ({ page }) => {
    const routes: Array<[string, string]> = [
      ['/zh/public-goods-contributions-cg', '协议公共物品资助'],
      ['/zh/public-goods-contributions-voluntary', '自愿公共物品资助'],
      ['/zh/public-goods-retrievals', '公共物品取回'],
    ];

    for (const [path, heading] of routes) {
      await openZh(page, path);
      await expect(page.getByRole('heading', { name: heading, exact: true }).first()).toBeVisible();
    }
  });

  test('renders Chinese outreach overview and participant history', async ({ page }) => {
    await openZh(page, '/zh/marketing');
    await expect(page.getByRole('heading', { name: /推广 Cosmic Signature/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: '推广分配记录', exact: true })).toBeVisible();
    await expect(page.getByText('暂无推广分配')).toBeVisible();

    await openZh(page, `/zh/marketing/${ADDRESS}`);
    await expect(page.getByText('此参与者的推广分配', { exact: true })).toBeVisible();
    await expect(page.getByText('暂无分配。')).toBeVisible();
  });

  test('renders Chinese coordination, admin, and internal tools', async ({ page }) => {
    await openZh(page, '/zh/coordination-changes');
    await expect(
      page.getByRole('heading', { name: '协调变更', exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByRole('row', { name: /公共物品比例已变更/ })).toBeVisible({
      timeout: 30_000,
    });

    await openZh(page, '/zh/admin');
    await expect(page.getByRole('heading', { name: '管理', exact: true })).toBeVisible();
    const gestureRow = page.getByRole('row', { name: /Review locale link/ });
    await expect(gestureRow).toBeVisible();
    await expect(gestureRow.getByRole('link', { name: '7', exact: true })).toHaveAttribute(
      'href',
      '/zh/allocation/7',
    );

    await openZh(page, '/zh/admin/admin');
    await expect(page.getByRole('heading', { name: '管理方法', exact: true })).toBeVisible();
    await expect(page.getByText('Cosmic Signature 合约', { exact: true })).toBeVisible();

    await openZh(page, '/zh/internal/cst-outreach-transfer');
    await expect(page.getByRole('heading', { name: 'CST 推广转账', exact: true })).toBeVisible();
    await expect(page.getByText('未连接钱包', { exact: true })).toBeVisible();
  });

  test('keeps special-allocation participant links inside /zh', async ({ page }) => {
    await mockZhQualityApi(page);
    await page.route('**/current_special_winners', async (route) => {
      await route.fulfill({
        json: {
          EnduranceChampionAddress: ADDRESS,
          EnduranceChampionDuration: 3600,
          ChronoWarriorAddress: '0x2222222222222222222222222222222222222222',
          ChronoWarriorDuration: 7200,
          LastBidderAddress: ADDRESS,
          LastBidderLastBidTime: Math.floor(Date.now() / 1000) - 60,
          LastCstBidderAddress: '0x3333333333333333333333333333333333333333',
        },
      });
    });
    // The full special-allocation cards (with participant profile links)
    // live on the cycle details page; the home standings link to gestures.
    await openZh(page, '/zh/current-cycle');
    const latestCard = page.getByTestId('special-allocation-card-latest-participant').first();
    await expect(latestCard).toBeVisible({ timeout: 30_000 });
    await expect(latestCard.getByRole('link', { name: ADDRESS })).toHaveAttribute(
      'href',
      `/zh/user/${ADDRESS}`,
    );
  });

  test('renders the localized endurance embed and keeps noindex,nofollow', async ({ page }) => {
    await openZh(page, '/zh/embed/endurance/7');
    await expect(page.getByText('此周期暂无领先记录。')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex, nofollow/,
    );
  });
});
