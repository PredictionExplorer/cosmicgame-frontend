import { expect, test, type Page } from '@playwright/test';

import { waitForStableLayout } from './mobile-audit-helpers';
import { dismissOpenTooltips, expectTooltipFullyVisible, openTooltip } from './tooltip-helpers';

const ADDRESS = '0x1111111111111111111111111111111111111111';
const CYCLE = 42;
const TIMESTAMP = Date.UTC(2026, 0, 1, 12, 34) / 1000;

const dashboard = {
  CurRoundNum: CYCLE,
  CurNumBids: 7,
  CurPrizeAmountEth: 2.5,
  CurBidPriceEth: 0.1,
  PrizeAmountEth: 2.5,
  PrizeClaimTs: TIMESTAMP + 3600,
  TsRoundStart: TIMESTAMP - 3600,
  LastBidderAddr: ADDRESS,
  GestureCostEth: 0.1,
  StakingAmountEth: 3,
  NumRaffleEthWinnersBidding: 2,
  NumRaffleNFTWinnersBidding: 1,
  NumRaffleNFTWinnersStakingRWalk: 1,
  CosmicGameBalanceEth: 36.1595,
  CharityBalanceEth: 0.5,
  NumDonatedNFTs: 0,
  NumRwalkTokensUsed: 1,
  NumVoluntaryDonations: 0,
  SumVoluntaryDonationsEth: 0,
  TotalPrizesPaidAmountEth: 1.25,
  CgPrizeRowCount: 12,
  CurRoundStats: {
    TotalEthInBidsEth: 1.5,
    TotalCstInBidsEth: 1000,
  },
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
    NumWinnersWithPendingRaffleWithdrawal: 0,
    TotalCSTConsumedEth: 100,
    TotalMktRewardsEth: 10,
    NumMktRewards: 2,
    TotalNamedTokens: 1,
    TotalEthDonatedAmountEth: 0,
    NumCosmicGameDonations: 0,
    SumCosmicGameDonationsEth: 0,
    NumWithdrawals: 0,
    SumWithdrawals: 0,
    DonatedTokenDistribution: [],
    StakeStatisticsCST: {
      NumActiveStakers: 1,
      NumDeposits: 1,
      TotalTokensStaked: 2,
      TotalTokensMinted: 2,
      TotalRewardEth: 3,
      UnclaimedRewardEth: 0,
    },
    StakeStatisticsRWalk: {
      NumActiveStakers: 1,
      TotalTokensStaked: 1,
      TotalTokensMinted: 1,
    },
  },
};

async function mockSprint5Api(page: Page): Promise<void> {
  // Keep capability probes inside this synthetic legacy backend as well.
  await page.route('**/api/v2/cosmicgame/**', (route) =>
    route.fulfill({ status: 404, json: { error: 'V2 API unavailable in legacy fixture' } }),
  );
  await page.route('**/api/cosmicgame/**', async (route) => {
    const path = new URL(route.request().url()).pathname;

    // lexicon-allow-start: backend route paths are sealed API contracts.
    if (path.endsWith('/statistics/dashboard')) {
      await route.fulfill({ json: dashboard });
      return;
    }
    if (path.includes('/cst/names/named_only')) {
      await route.fulfill({
        json: {
          NamedTokens: [
            {
              EvtLogId: 1,
              MintTimeStamp: TIMESTAMP,
              TimeStamp: TIMESTAMP,
              TokenId: 5,
              TokenName: '天穹',
              CurOwnerAddr: ADDRESS,
            },
          ],
        },
      });
      return;
    }
    if (path.includes('/bid/used_randomwalk_nfts')) {
      await route.fulfill({ json: { UsedRwalkNFTs: [] } });
      return;
    }
    if (path.includes('/donations/nft/list/')) {
      await route.fulfill({ json: { NFTDonations: [] } });
      return;
    }
    if (path.includes('/ct/total_supply_history_by_date/')) {
      await route.fulfill({
        json: {
          TotalSupplyHistory: [
            {
              Date: '20260101',
              TotalSupplyEth: 1000,
              MintAmountEth: 1000,
              BurnAmountEth: 0,
              AmountEth: 1000,
              NumBids: 1,
            },
          ],
        },
      });
      return;
    }
    if (path.endsWith('/ct/total_supply_history_by_bid')) {
      await route.fulfill({ json: { TotalSupplyHistory: [] } });
      return;
    }
    if (path.endsWith('/ct/statistics')) {
      await route.fulfill({ json: { Statistics: { TotalSupplyEth: 1000 } } });
      return;
    }
    if (path.endsWith('/cst/distribution')) {
      await route.fulfill({ json: { CosmicSignatureTokenDistribution: [] } });
      return;
    }
    if (path.endsWith('/ct/balances')) {
      await route.fulfill({ json: { CosmicTokenBalances: [] } });
      return;
    }
    if (path.endsWith('/statistics/unique/bidders')) {
      await route.fulfill({ json: { UniqueBidders: [] } });
      return;
    }
    if (path.endsWith('/statistics/unique/winners')) {
      await route.fulfill({ json: { UniqueWinners: [] } });
      return;
    }
    if (path.endsWith('/statistics/unique/donors')) {
      await route.fulfill({ json: { UniqueDonors: [] } });
      return;
    }
    if (path.endsWith('/statistics/leaderboard/roi')) {
      await route.fulfill({ json: { RoiLeaderboard: [] } });
      return;
    }
    if (path.endsWith('/statistics/claims/by_round')) {
      await route.fulfill({ json: { ClaimsByRound: [] } });
      return;
    }
    if (path.includes('/prizes/history/by_user/')) {
      await route.fulfill({ json: { UserPrizeHistory: [] } });
      return;
    }
    if (path.includes('/prizes/eth/raffle/by_user/')) {
      await route.fulfill({ json: { UserRaffleDeposits: [] } });
      return;
    }
    if (path.includes('/raffle/nft/by_user/')) {
      await route.fulfill({ json: { UserRaffleNFTWinnings: [] } });
      return;
    }
    if (path.includes('/system/admin_events/100/200')) {
      await route.fulfill({
        json: {
          AdminEvents: [
            {
              EvtLogId: 100,
              TxHash: `0x${'1'.repeat(64)}`,
              TimeStamp: TIMESTAMP,
              RecordType: 1,
              TransferType: 0,
              IntegerValue: 7,
              AddressValue: '',
              StringValue: '',
            },
          ],
        },
      });
      return;
    }
    if (path.includes('/system/modelist/')) {
      await route.fulfill({ json: { SystemModeChanges: [] } });
      return;
    }
    if (path.includes('/time/current')) {
      await route.fulfill({ json: { CurrentTimeStamp: TIMESTAMP } });
      return;
    }
    if (path.includes('/user/info/')) {
      await route.fulfill({ json: { Gestures: [], UserInfo: null } });
      return;
    }
    if (path.includes('/user/balances/')) {
      await route.fulfill({ json: { ETH_Balance: '0', CosmicTokenBalance: '0' } });
      return;
    }
    // lexicon-allow-end

    await route.fulfill({ json: {} });
  });
}

async function openZhRoute(page: Page, path: string, title?: string): Promise<void> {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
  if (title) await expect(page).toHaveTitle(title);
}

test.describe('zh Sprint 5 — statistics, tables, and formatting', () => {
  // A reader in China: date-times print in the reader's zone, so the zone is pinned.
  test.use({ timezoneId: 'Asia/Shanghai' });

  test.beforeEach(async ({ page }) => {
    await mockSprint5Api(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('renders every Sprint 5 route in Chinese', async ({ page }) => {
    const routes: Array<[string, string, string | undefined]> = [
      ['/zh/statistics', '协议统计', '统计：演绎周期、落笔、NFT 与 CST · Cosmic Signature'],
      ['/zh/statistics/activity', '落笔活动统计', '落笔活动统计 · Cosmic Signature'],
      ['/zh/statistics/anchoring', '锚定统计', '锚定统计 · Cosmic Signature'],
      ['/zh/statistics/participation', '参与统计', '参与统计 · Cosmic Signature'],
      ['/zh/statistics/performance', '参与者结果', '参与者结果 · Cosmic Signature'],
      ['/zh/statistics/tokens', '代币分布统计', '代币分布统计 · Cosmic Signature'],
      ['/zh/recipient-history', '我的分配历史', '我的分配历史 · Cosmic Signature'],
      ['/zh/named-nfts', '已命名 Cosmic Signature NFT', '已命名 NFT · Cosmic Signature'],
      ['/zh/attached-nfts', '已附加 NFT 贡献', '已附加 NFT 贡献 · Cosmic Signature'],
      [
        '/zh/used-rwlk-nfts',
        '已使用的 Random Walk NFT',
        '已使用的 Random Walk NFT · Cosmic Signature',
      ],
      [`/zh/user/${ADDRESS}`, '落笔花费', undefined],
      // The record pages name their track in the H1 ("星选 · ETH"); the participant is the trail.
      [`/zh/user/stellar-selection-eth/${ADDRESS}`, '星选 · ETH', '星选 ETH · Cosmic Signature'],
      [`/zh/user/stellar-selection-nft/${ADDRESS}`, '星选 · NFT', '星选 NFT · Cosmic Signature'],
      [
        `/zh/system-event/${CYCLE}/100/200`,
        `第 ${CYCLE} 个周期前的配置`,
        '系统事件 · Cosmic Signature',
      ],
    ];

    for (const [path, heading, title] of routes) {
      await openZhRoute(page, path, title);
      await expect(page.getByText(heading, { exact: true }).first()).toBeVisible();
    }
  });

  test('localizes statistics tooltips, dates, chart axes, and system-event copy', async ({
    page,
  }) => {
    await openZhRoute(
      page,
      '/zh/statistics',
      '统计：演绎周期、落笔、NFT 与 CST · Cosmic Signature',
    );
    // The figure's explanation is a client island: a hover that lands before it hydrates
    // opens nothing, so the page settles first (it used to be torn down and rebuilt by a
    // hydration mismatch, which detached the trigger instead).
    await waitForStableLayout(page);
    // The header figure's explanation is named after its label.
    const tooltipTrigger = page.getByRole('button', { name: '查看“当前演绎周期”的更多信息' });
    await tooltipTrigger.scrollIntoViewIfNeeded();
    await openTooltip(tooltipTrigger);
    await expectTooltipFullyVisible(page, /当前索引的演绎周期编号/);
    await dismissOpenTooltips(page);
    // The cycle's opening (11:34 UTC), in the zh calendar style and the reader's zone,
    // named inline; the year shows only outside the current one. (The named NFTs page
    // this used to check is a gallery of plates now, with no dates.)
    await expect(page.getByText(/^(2026年)?1月1日 19:34 UTC\+8$/)).toBeVisible();

    await openZhRoute(page, '/zh/statistics/tokens', '代币分布统计 · Cosmic Signature');
    // The supply summary dates the reading in the zh calendar style.
    await expect(page.getByText(/^2026年1月1日 总供应量：1,000\sCST。/)).toBeVisible();

    await openZhRoute(page, `/zh/system-event/${CYCLE}/100/200`, '系统事件 · Cosmic Signature');
    const eventTooltipTrigger = page.getByRole('button', {
      name: '说明“公共物品比例已变更”事件',
    });
    await openTooltip(eventTooltipTrigger);
    await expectTooltipFullyVisible(page, /分配至公共物品金库的资金比例已变更/);
  });
});
