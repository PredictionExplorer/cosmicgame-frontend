/**
 * Tests for centralized API type definitions.
 *
 * Validates that all types exported from services/api/types.ts satisfy their
 * structural contracts, ensuring end-to-end type safety from API service
 * functions through React Query hooks to consumer components.
 */
import type {
  ActionIdWithClaimInfo,
  AdminEventRow,
  BannedBid,
  BidEthPriceInfo,
  Bidder,
  BidInfo,
  CharityWithdrawal,
  CombinedStakingRecordInfo,
  ContractAddresses,
  CSTTokenInfo,
  CSTTransferRecord,
  CTBalanceDistribution,
  CTPriceInfo,
  DashboardInfo,
  DonatedERC20Token,
  DonatedNFT,
  DonatedTokenDistributionEntry,
  ETHDonation,
  MainStats,
  MarketingReward,
  NameHistoryRecord,
  NFTDonationStatsEntry,
  NotifyRedBoxResult,
  PrizeEntry,
  RaffleETHDeposit,
  RaffleNFTWinner,
  RewardsByToken,
  RoundInfo,
  RoundStats,
  SpecialWinners,
  StakedTokenInfo,
  StakeStatistics,
  StakingAction,
  StakingCSTReward,
  StakingRewardMint,
  SystemModeChangeEvent,
  TokenDistribution,
  TokenMintInfo,
  TxInfo,
  UniqueEthDonor,
  UniqueStakerCST,
  UniqueStakerRWLK,
  UsedRWLKNFT,
  UserBalance,
  UserInfo,
  UserInfoWithLists,
  Winner,
  WinningHistoryEntry,
} from '../types';

describe('API types', () => {
  describe('TxInfo (base type)', () => {
    it('satisfies the TxInfo contract', () => {
      const txInfo: TxInfo = {
        EvtLogId: 1,
        BlockNum: 100,
        TxId: 42,
        TxHash: '0xabc',
        TimeStamp: 1700000000,
        DateTime: '2024-01-01',
      };
      expect(txInfo.EvtLogId).toBe(1);
      expect(txInfo.TxHash).toBe('0xabc');
    });

    it('allows additional properties via index signature', () => {
      const txInfo: TxInfo = {
        EvtLogId: 1,
        BlockNum: 100,
        TxId: 42,
        TxHash: '0xabc',
        TimeStamp: 1700000000,
        DateTime: '2024-01-01',
        ExtraField: 'allowed',
      };
      expect(txInfo.ExtraField).toBe('allowed');
    });
  });

  describe('SpecialWinners', () => {
    it('satisfies the SpecialWinners contract', () => {
      const sw: SpecialWinners = {
        EnduranceChampionAddress: '0x123',
        EnduranceChampionDuration: 3600,
        LastCstBidderAddress: '0x456',
      };
      expect(sw.EnduranceChampionAddress).toBe('0x123');
      expect(sw.EnduranceChampionDuration).toBe(3600);
    });

    it('allows all fields to be optional', () => {
      const sw: SpecialWinners = {};
      expect(sw.EnduranceChampionAddress).toBeUndefined();
    });
  });

  describe('BannedBid', () => {
    it('satisfies the BannedBid contract', () => {
      const bid: BannedBid = { bid_id: 42 };
      expect(bid.bid_id).toBe(42);
    });
  });

  describe('BidEthPriceInfo', () => {
    it('satisfies the BidEthPriceInfo contract', () => {
      const info: BidEthPriceInfo = {
        AuctionDuration: '3600',
        ETHPrice: '1000000000000000000',
        SecondsElapsed: '120',
      };
      expect(info.AuctionDuration).toBe('3600');
      expect(info.ETHPrice).toBe('1000000000000000000');
    });
  });

  describe('CTPriceInfo', () => {
    it('satisfies the CTPriceInfo contract', () => {
      const info: CTPriceInfo = {
        AuctionDuration: '7200',
        CSTPrice: '500000000000000000',
        SecondsElapsed: '60',
      };
      expect(info.CSTPrice).toBe('500000000000000000');
    });
  });

  describe('TokenMintInfo', () => {
    it('satisfies the TokenMintInfo contract', () => {
      const info: TokenMintInfo = {
        CurName: 'Alpha',
        CurOwnerAddr: '0x123',
        SeedHex: '0xdeadbeef',
        TokenId: 5,
      };
      expect(info.CurName).toBe('Alpha');
      expect(info.SeedHex).toBe('0xdeadbeef');
    });

    it('allows all fields to be optional', () => {
      const info: TokenMintInfo = {};
      expect(info.CurName).toBeUndefined();
    });
  });

  describe('Unique address entry types', () => {
    it('satisfies the Bidder contract', () => {
      const bidder: Bidder = {
        BidderAid: '1',
        BidderAddr: '0xabc',
        NumBids: 10,
        MaxBidAmountEth: 1.5,
      };
      expect(bidder.NumBids).toBe(10);
    });

    it('satisfies the Winner contract', () => {
      const winner: Winner = {
        WinnerAid: '2',
        WinnerAddr: '0xdef',
        PrizesCount: 3,
        MaxWinAmountEth: 5.0,
        PrizesSum: 15.0,
      };
      expect(winner.PrizesCount).toBe(3);
    });

    it('satisfies the UniqueStakerCST contract', () => {
      const staker: UniqueStakerCST = {
        StakerAid: '3',
        StakerAddr: '0xghi',
        NumStakeActions: 5,
        NumUnstakeActions: 2,
        TotalTokensMinted: 10,
        TotalTokensStaked: 8,
        TotalRewardEth: 2.5,
        UnclaimedRewardEth: 0.5,
      };
      expect(staker.TotalRewardEth).toBe(2.5);
    });

    it('satisfies the UniqueStakerRWLK contract', () => {
      const staker: UniqueStakerRWLK = {
        StakerAid: 4,
        StakerAddr: '0xjkl',
        NumStakeActions: 3,
        NumUnstakeActions: 1,
        TotalTokensStaked: 6,
        TotalTokensMinted: 4,
      };
      expect(staker.TotalTokensStaked).toBe(6);
    });

    it('satisfies the UniqueEthDonor contract', () => {
      const donor: UniqueEthDonor = {
        DonorAid: '5',
        DonorAddr: '0xmno',
        CountDonations: 7,
        TotalDonatedEth: 3.14,
      };
      expect(donor.CountDonations).toBe(7);
    });
  });

  describe('NotifyRedBoxResult', () => {
    it('satisfies the NotifyRedBoxResult contract', () => {
      const result: NotifyRedBoxResult = {
        ETHRaffleToClaim: 1.5,
        ETHRaffleToClaimWei: 1500000000000000000,
        NumDonatedNFTToClaim: 2,
        UnclaimedStakingReward: 0.5,
      };
      expect(result.ETHRaffleToClaim).toBe(1.5);
      expect(result.NumDonatedNFTToClaim).toBe(2);
    });
  });

  describe('MarketingReward', () => {
    it('satisfies the MarketingReward contract', () => {
      const reward: MarketingReward = {
        EvtLogId: 1,
        TxHash: '0xabc',
        TimeStamp: 1700000000,
        MarketerAddr: '0x123',
        AmountEth: 0.5,
      };
      expect(reward.MarketerAddr).toBe('0x123');
    });
  });

  describe('SystemModeChangeEvent', () => {
    it('satisfies the SystemModeChangeEvent contract', () => {
      const event: SystemModeChangeEvent = {
        RoundNum: 5,
        EvtLogId: 100,
        TimeStamp: 1700000000,
      };
      expect(event.RoundNum).toBe(5);
    });

    it('supports optional NextEvtLogId', () => {
      const event: SystemModeChangeEvent = {
        RoundNum: 5,
        EvtLogId: 100,
        NextEvtLogId: 200,
        TimeStamp: 1700000000,
      };
      expect(event.NextEvtLogId).toBe(200);
    });
  });

  describe('AdminEventRow', () => {
    it('satisfies the AdminEventRow contract', () => {
      const event: AdminEventRow = {
        EvtLogId: '42',
        RecordType: 1,
        TransferType: 0,
        TimeStamp: 1700000000,
        TxHash: '0xabc',
        IntegerValue: 100,
        AddressValue: '0x123',
        StringValue: 'test',
      };
      expect(event.RecordType).toBe(1);
      expect(event.AddressValue).toBe('0x123');
    });
  });

  describe('CharityWithdrawal', () => {
    it('satisfies the CharityWithdrawal contract', () => {
      const withdrawal: CharityWithdrawal = {
        EvtLogId: '1',
        TxHash: '0xabc',
        TimeStamp: 1700000000,
        DestinationAddr: '0x123',
        AmountEth: 2.5,
      };
      expect(withdrawal.DestinationAddr).toBe('0x123');
      expect(withdrawal.AmountEth).toBe(2.5);
    });
  });

  describe('DonatedERC20Token', () => {
    it('satisfies the DonatedERC20Token contract with TxInfo base', () => {
      const token: DonatedERC20Token = {
        EvtLogId: 1,
        BlockNum: 100,
        TxId: 42,
        TxHash: '0xabc',
        TimeStamp: 1700000000,
        DateTime: '2024-01-01',
        RoundNum: 5,
        TokenAddr: '0xtoken',
        AmountDonatedEth: 1.0,
        AmountClaimedEth: 0.5,
        WinnerAddr: '0xwinner',
      };
      expect(token.AmountDonatedEth).toBe(1.0);
      expect(token.WinnerAddr).toBe('0xwinner');
    });
  });

  describe('ActionIdWithClaimInfo', () => {
    it('satisfies the ActionIdWithClaimInfo contract', () => {
      const info: ActionIdWithClaimInfo = {
        DepositId: 1,
        StakeActionId: 42,
        Claimed: false,
      };
      expect(info.DepositId).toBe(1);
      expect(info.Claimed).toBe(false);
    });
  });

  describe('ETHDonation', () => {
    it('extends TxInfo and includes donation fields', () => {
      const donation: ETHDonation = {
        EvtLogId: 1,
        BlockNum: 100,
        TxId: 42,
        TxHash: '0xabc',
        TimeStamp: 1700000000,
        DateTime: '2024-01-01',
        RoundNum: 5,
        DonorAddr: '0xdonor',
        AmountEth: 1.0,
      };
      expect(donation.RoundNum).toBe(5);
    });

    it('supports optional RecordType and CGRecordId', () => {
      const donation: ETHDonation = {
        EvtLogId: 1,
        BlockNum: 100,
        TxId: 42,
        TxHash: '0xabc',
        TimeStamp: 1700000000,
        DateTime: '2024-01-01',
        RoundNum: 5,
        DonorAddr: '0xdonor',
        AmountEth: 1.0,
        RecordType: 2,
        CGRecordId: '123',
      };
      expect(donation.RecordType).toBe(2);
      expect(donation.CGRecordId).toBe('123');
    });
  });

  describe('DonatedNFT', () => {
    it('supports optional Index field', () => {
      const nft: DonatedNFT = {
        EvtLogId: 1,
        BlockNum: 100,
        TxId: 42,
        TxHash: '0xabc',
        TimeStamp: 1700000000,
        DateTime: '2024-01-01',
        RoundNum: 3,
        DonorAddr: '0xdonor',
        TokenAddr: '0xtoken',
        Index: 5,
      };
      expect(nft.Index).toBe(5);
    });
  });

  describe('StakingCSTReward extended fields', () => {
    it('supports staking winner fields', () => {
      const reward: StakingCSTReward = {
        EvtLogId: 1,
        RoundNum: 3,
        TokenId: 5,
        StakerAddr: '0xstaker',
        StakerNumStakedNFTs: 4,
        StakerAmountEth: 2.0,
        TxHash: '0xabc',
        TimeStamp: 1700000000,
      };
      expect(reward.StakerAddr).toBe('0xstaker');
    });

    it('supports deposit reward fields', () => {
      const reward: StakingCSTReward = {
        EvtLogId: 1,
        RoundNum: 3,
        TokenId: 5,
        DepositRoundNum: 2,
        DepositId: 10,
        DepositAmountEth: 1.0,
        ClaimedAmountEth: 0.5,
        YourClaimableAmountEth: 0.5,
        FullyClaimed: false,
      };
      expect(reward.FullyClaimed).toBe(false);
    });
  });

  describe('type completeness', () => {
    it('exports all expected type names', () => {
      const typeAssertions: Record<string, unknown> = {
        TxInfo: {} as TxInfo,
        StakeStatistics: {} as StakeStatistics,
        MainStats: {} as MainStats,
        DonatedTokenDistributionEntry: {} as DonatedTokenDistributionEntry,
        ContractAddresses: {} as ContractAddresses,
        DashboardInfo: {} as DashboardInfo,
        RoundStats: {} as RoundStats,
        RaffleNFTWinner: {} as RaffleNFTWinner,
        RaffleETHDeposit: {} as RaffleETHDeposit,
        WinningHistoryEntry: {} as WinningHistoryEntry,
        PrizeEntry: {} as PrizeEntry,
        RoundInfo: {} as RoundInfo,
        BidInfo: {} as BidInfo,
        UserInfo: {} as UserInfo,
        UserBalance: {} as UserBalance,
        UserInfoWithLists: {} as UserInfoWithLists,
        CSTTokenInfo: {} as CSTTokenInfo,
        TokenDistribution: {} as TokenDistribution,
        CTBalanceDistribution: {} as CTBalanceDistribution,
        NameHistoryRecord: {} as NameHistoryRecord,
        UsedRWLKNFT: {} as UsedRWLKNFT,
        CSTTransferRecord: {} as CSTTransferRecord,
        StakingAction: {} as StakingAction,
        StakedTokenInfo: {} as StakedTokenInfo,
        StakingCSTReward: {} as StakingCSTReward,
        CombinedStakingRecordInfo: {} as CombinedStakingRecordInfo,
        RewardsByToken: {} as RewardsByToken,
        StakingRewardMint: {} as StakingRewardMint,
        DonatedNFT: {} as DonatedNFT,
        ETHDonation: {} as ETHDonation,
        CharityWithdrawal: {} as CharityWithdrawal,
        SpecialWinners: {} as SpecialWinners,
        BannedBid: {} as BannedBid,
        BidEthPriceInfo: {} as BidEthPriceInfo,
        CTPriceInfo: {} as CTPriceInfo,
        TokenMintInfo: {} as TokenMintInfo,
        Bidder: {} as Bidder,
        Winner: {} as Winner,
        UniqueStakerCST: {} as UniqueStakerCST,
        UniqueStakerRWLK: {} as UniqueStakerRWLK,
        UniqueEthDonor: {} as UniqueEthDonor,
        NotifyRedBoxResult: {} as NotifyRedBoxResult,
        MarketingReward: {} as MarketingReward,
        SystemModeChangeEvent: {} as SystemModeChangeEvent,
        AdminEventRow: {} as AdminEventRow,
        DonatedERC20Token: {} as DonatedERC20Token,
        NFTDonationStatsEntry: {} as NFTDonationStatsEntry,
        ActionIdWithClaimInfo: {} as ActionIdWithClaimInfo,
      };
      expect(Object.keys(typeAssertions).length).toBe(48);
    });
  });
});
