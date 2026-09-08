import type { Page } from '@playwright/test';

const MOCK_NOW_SECONDS = Math.floor(Date.now() / 1000);
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
  LastBidderAddr: '0x3333333333333333333333333333333333333333',
  GestureCostEth: 0.1,
  StakingAmountEth: 0,
  CosmicGameBalanceEth: 10,
  PrizePercentage: 25,
  ChronoWarriorPercentage: 8,
  RafflePercentage: 4,
  StakingPercentage: 6,
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

export const gestures = [
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
    CSTRewardEth: 100,
    BidPosition: 4,
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

export const specialRecipients = {
  EnduranceChampionAddress: '0x1111111111111111111111111111111111111111',
  EnduranceChampionDuration: 600,
  EnduranceChampionStartTimeStamp: MOCK_NOW_SECONDS - 1_200,
  PrevEnduranceChampionDuration: 0,
  ChronoWarriorAddress: '0x2222222222222222222222222222222222222222',
  ChronoWarriorDuration: 1_800,
  ChronoWarriorIsLive: false,
  LastBidderAddress: '0x3333333333333333333333333333333333333333',
  LastBidderLastBidTime: Math.floor(Date.now() / 1000) - 100,
  LastCstBidderAddress: '0x3333333333333333333333333333333333333333',
  SourceBlockNumber: 100,
  SourceBlockTimeStamp: MOCK_NOW_SECONDS,
};

export function makeLongGestureFeed(count = 12) {
  return Array.from({ length: count }, (_, index) => {
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
}

export async function mockHomeGestureChatApi(
  page: Page,
  gestureFeed = gestures,
  roleSnapshot = specialRecipients,
  cstPriceWei = '20000000000000000000',
) {
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
          CSTPrice: cstPriceWei,
          SecondsElapsed: '120',
        },
      });
      return;
    }

    if (path.endsWith('/bid/current_special_winners')) {
      await route.fulfill({ json: roleSnapshot });
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
