import type { Page } from '@playwright/test';

export const SPRINT4_MOCK_ADDRESS = '0x1111111111111111111111111111111111111111';
export const SPRINT4_MOCK_RECIPIENT = '0x2222222222222222222222222222222222222222';
export const SPRINT4_MOCK_CYCLE = 42;
export const SPRINT4_MOCK_ACTION_ID = 73;
export const SPRINT4_MOCK_TOKEN_ID = 420;

const MOCK_NOW_SECONDS = 1_800_000_000;

const contractAddresses = {
  RandomWalkAddr: '0x3333333333333333333333333333333333333333',
  CosmicGameAddr: '0x4444444444444444444444444444444444444444',
  CosmicSignatureAddr: '0x5555555555555555555555555555555555555555',
  CosmicTokenAddr: '0x6666666666666666666666666666666666666666',
  CosmicDaoAddr: '0x7777777777777777777777777777777777777777',
  CharityWalletAddr: '0x8888888888888888888888888888888888888888',
  PrizesWalletAddr: '0x9999999999999999999999999999999999999999',
  StakingWalletCSTAddr: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  StakingWalletRWalkAddr: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  MarketingWalletAddr: '0xcccccccccccccccccccccccccccccccccccccccc',
  ImplementationAddr: '0xdddddddddddddddddddddddddddddddddddddddd',
};

const dashboard = {
  CurRoundNum: SPRINT4_MOCK_CYCLE,
  CurNumBids: 7,
  CurPrizeAmountEth: 2.5,
  CurBidPriceEth: 0.1,
  PrizeAmountEth: 2.5,
  PrizeClaimTs: MOCK_NOW_SECONDS + 3_600,
  CurRoundPrizeTime: MOCK_NOW_SECONDS + 3_600,
  TsRoundStart: MOCK_NOW_SECONDS - 3_600,
  LastBidderAddr: SPRINT4_MOCK_ADDRESS,
  GestureCostEth: 0.1,
  StakingAmountEth: 3,
  NumRaffleEthWinnersBidding: 2,
  NumRaffleNFTWinnersBidding: 1,
  NumRaffleNFTWinnersStakingRWalk: 1,
  ContractAddrs: contractAddresses,
  MainStats: {
    NumCSTokenMints: 24,
    TotalRaffleEthDeposits: 4,
    TotalCSTConsumedEth: 100,
    TotalMktRewardsEth: 10,
    NumMktRewards: 2,
    TotalRaffleEthWithdrawn: 3,
    NumBidsCST: 5,
    NumUniqueBidders: 4,
    NumUniqueWinners: 3,
    NumUniqueDonors: 2,
    TotalNamedTokens: 1,
    NumUniqueStakersCST: 1,
    NumUniqueStakersRWalk: 1,
    StakeStatisticsCST: {
      NumActiveStakers: 1,
      TotalTokensStaked: 2,
      TotalRewardEth: 3,
    },
    StakeStatisticsRWalk: {
      NumActiveStakers: 1,
      TotalTokensStaked: 1,
      TotalTokensMinted: 1,
    },
  },
  CurRoundStats: {
    TotalBids: 7,
    TotalDonatedAmountEth: 0,
    TotalDonatedNFTs: 0,
    TotalRaffleEthDepositsEth: 0.25,
    TotalRaffleNFTs: 1,
    ActivationTime: MOCK_NOW_SECONDS - 60,
  },
};

function mockTransaction(id: number, timestamp = MOCK_NOW_SECONDS - 300) {
  return {
    EvtLogId: id,
    BlockNum: 100_000 + id,
    TxId: id,
    TxHash: `0x${id.toString(16).padStart(64, '0')}`,
    TimeStamp: timestamp,
    DateTime: new Date(timestamp * 1_000).toISOString(),
  };
}

const roundInfo = {
  RoundNum: SPRINT4_MOCK_CYCLE,
  ClaimPrizeTx: { Tx: mockTransaction(4_200) },
  MainPrize: {
    WinnerAddr: SPRINT4_MOCK_ADDRESS,
    EthAmountEth: 1.25,
    NftTokenId: SPRINT4_MOCK_TOKEN_ID,
    CstAmountEth: 1_000,
  },
  CharityDeposit: {
    CharityAddress: contractAddresses.CharityWalletAddr,
    CharityAmountETH: 0.2,
  },
  StakingDeposit: {
    StakingDepositAmountEth: 0.3,
    StakingPerTokenEth: 0.15,
    StakingNumStakedTokens: 2,
  },
  EnduranceChampion: {
    WinnerAddr: SPRINT4_MOCK_RECIPIENT,
    NftTokenId: 421,
    CstAmountEth: 1_000,
  },
  LastCstBidder: {
    WinnerAddr: '0x3333333333333333333333333333333333333333',
    NftTokenId: 422,
    CstAmountEth: 1_000,
  },
  ChronoWarrior: {
    WinnerAddr: '0x4444444444444444444444444444444444444444',
    EthAmountEth: 0.4,
    CstAmountEth: 1_000,
    NftTokenId: 423,
  },
  RoundStats: {
    TotalBids: 7,
    TotalDonatedAmountEth: 0,
    TotalDonatedNFTs: 0,
    TotalRaffleEthDepositsEth: 0.25,
    TotalRaffleNFTs: 1,
  },
  RaffleNFTWinners: [],
  StakingNFTWinners: [],
  RaffleETHDeposits: [],
  AllPrizes: [],
};

const anchorAction = {
  CombinedAnchorRecordInfo: {
    Stake: {
      Tx: mockTransaction(7_300),
      ActionId: SPRINT4_MOCK_ACTION_ID,
      ActionType: 0,
      TokenId: SPRINT4_MOCK_TOKEN_ID,
      Seed: '1234',
      StakerAddr: SPRINT4_MOCK_ADDRESS,
      NumStakedNFTs: 1,
    },
    Unstake: null,
  },
};

const rewardsByToken = {
  RewardsByTokenDetails: {
    0: {
      DepositTimeStamp: MOCK_NOW_SECONDS - 240,
      RoundNum: SPRINT4_MOCK_CYCLE,
      DepositId: 11,
      DepositIndex: 0,
      Claimed: false,
      RewardEth: 0.15,
      Stake: {
        Tx: mockTransaction(7_301),
        NumStakedNFTs: 1,
      },
      Unstake: {
        EvtLogId: 0,
        TxHash: '',
        TimeStamp: 0,
        NumStakedNFTs: 1,
        MaxUnpaidDepositIndex: 0,
        RewardAmountEth: 0,
      },
    },
  },
};

/**
 * Browser-side API interception used by Sprint 4 route and layout coverage.
 * Every response is synthetic, including the provider-level dashboard request,
 * so no assertion depends on the current protocol cycle.
 */
export async function mockSprint4Api(page: Page): Promise<void> {
  await page.route('**/api/cosmicgame/**', async (route) => {
    const path = new URL(route.request().url()).pathname;

    if (path.endsWith('/statistics/dashboard')) {
      await route.fulfill({ json: dashboard });
      return;
    }

    // lexicon-allow-start: backend route paths and wire keys are sealed API contracts.
    if (path.includes('/rounds/list/')) {
      await route.fulfill({ json: { Rounds: [roundInfo] } });
      return;
    }
    if (path.endsWith(`/rounds/info/${SPRINT4_MOCK_CYCLE}`)) {
      await route.fulfill({ json: { RoundInfo: roundInfo } });
      return;
    }
    if (path.includes(`/bid/list/by_round/${SPRINT4_MOCK_CYCLE}/`)) {
      await route.fulfill({ json: { BidsByRound: [] } });
      return;
    }
    if (path.endsWith(`/donations/nft/by_round/${SPRINT4_MOCK_CYCLE}`)) {
      await route.fulfill({ json: { NFTDonations: [] } });
      return;
    }
    if (path.endsWith(`/donations/erc20/by_round/all/${SPRINT4_MOCK_CYCLE}`)) {
      await route.fulfill({ json: { DonationsERC20ByRoundAll: [] } });
      return;
    }
    if (path.endsWith(`/staking/cst/rewards/by_round/${SPRINT4_MOCK_CYCLE}`)) {
      await route.fulfill({ json: { Rewards: [] } });
      return;
    }
    if (path.endsWith('/staking/cst/rewards/global')) {
      await route.fulfill({ json: { StakingCSTRewards: [] } });
      return;
    }
    if (path.includes('/staking/randomwalk/mints/global/')) {
      await route.fulfill({ json: { StakingRWalkRewardsMints: [] } });
      return;
    }
    if (path.endsWith('/statistics/unique/stakers/cst')) {
      await route.fulfill({ json: { UniqueStakersCST: [] } });
      return;
    }
    if (path.endsWith(`/staking/cst/actions/info/${SPRINT4_MOCK_ACTION_ID}`)) {
      await route.fulfill({ json: anchorAction });
      return;
    }
    if (path.includes('/cst/transfers/by_user/')) {
      await route.fulfill({ json: { CosmicSignatureTransfers: [] } });
      return;
    }
    if (path.includes('/ct/transfers/by_user/')) {
      await route.fulfill({ json: { CosmicTokenTransfers: [] } });
      return;
    }
    if (path.includes('/staking/cst/rewards/by_user/by_token/details/')) {
      await route.fulfill({ json: rewardsByToken });
      return;
    }

    // Connected-wallet providers used by the transfer-form browser checks.
    if (path.includes('/user/balances/')) {
      await route.fulfill({
        json: {
          ETH_Balance: '1000000000000000000',
          CosmicTokenBalance: '100000000000000000000',
        },
      });
      return;
    }
    if (path.includes('/user/notif_red_box/')) {
      await route.fulfill({
        json: {
          Winnings: {
            ETHRaffleToClaim: 0,
            ETHRaffleToClaimWei: 0,
            NumDonatedNFTToClaim: 0,
            UnretrievedAnchorDistribution: 0,
          },
        },
      });
      return;
    }
    if (path.includes('/cst/list/by_user/')) {
      await route.fulfill({ json: { UserTokens: [] } });
      return;
    }
    if (path.includes('/staking/cst/staked_tokens/by_user/')) {
      await route.fulfill({ json: { StakedTokensCST: [] } });
      return;
    }
    if (path.includes('/staking/randomwalk/staked_tokens/by_user/')) {
      await route.fulfill({ json: { StakedTokensRWalk: [] } });
      return;
    }
    if (path.includes('/staking/cst/rewards/to_claim/by_user/')) {
      await route.fulfill({ json: { UnclaimedEthDeposits: [] } });
      return;
    }
    // lexicon-allow-end

    await route.fulfill({ json: {} });
  });
}
