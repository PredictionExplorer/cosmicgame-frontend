// lexicon-allow-start: service test fixtures mirror the backend-sealed API surface

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
  BannedGesture,
  GestureEthCostInfo,
  Participant,
  GestureInfo,
  CharityWithdrawal,
  CombinedAnchorRecordInfo,
  ContractAddresses,
  CSTTokenInfo,
  CSTTransferRecord,
  CTBalanceDistribution,
  CTPriceInfo,
  DashboardInfo,
  DonatedERC20Token,
  AttachedNFT,
  DonatedTokenDistributionEntry,
  ETHDonation,
  MainStats,
  MarketingReward,
  NameHistoryRecord,
  NFTDonationStatsEntry,
  NotifyRedBoxResult,
  AllocationEntry,
  StellarSelectionETHDeposit,
  StellarSelectionNFTRecipient,
  RewardsByToken,
  RoundInfo,
  RoundStats,
  SpecialRecipients,
  AnchoredTokenInfo,
  AnchoringStatistics,
  AnchorAction,
  CSTAnchorDistribution,
  AnchorDistributionImprint,
  SystemModeChangeEvent,
  TokenDistribution,
  TokenImprintInfo,
  TxInfo,
  UniqueEthDonor,
  UniqueAnchorHolderCST,
  UniqueAnchorHolderRWLK,
  UsedRWLKNFT,
  UserBalance,
  UserInfo,
  UserInfoWithLists,
  Recipient,
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

  describe('SpecialRecipients', () => {
    it('satisfies the SpecialRecipients contract', () => {
      const sw: SpecialRecipients = {
        EnduranceChampionAddress: '0x123',
        EnduranceChampionDuration: 3600,
        ChronoWarriorAddress: '0x789',
        ChronoWarriorDuration: 7200,
        LastBidderAddress: '0xabc',
        LastBidderLastBidTime: 1_778_207_543,
        LastCstBidderAddress: '0x456',
      };
      expect(sw.EnduranceChampionAddress).toBe('0x123');
      expect(sw.EnduranceChampionDuration).toBe(3600);
      expect(sw.ChronoWarriorAddress).toBe('0x789');
      expect(sw.ChronoWarriorDuration).toBe(7200);
      expect(sw.LastBidderAddress).toBe('0xabc');
      expect(sw.LastBidderLastBidTime).toBe(1_778_207_543);
    });

    it('allows all fields to be optional', () => {
      const sw: SpecialRecipients = {};
      expect(sw.EnduranceChampionAddress).toBeUndefined();
    });
  });

  describe('BannedGesture', () => {
    it('satisfies the BannedGesture contract', () => {
      const bid: BannedGesture = { bid_id: 42 };
      expect(bid.bid_id).toBe(42);
    });
  });

  describe('GestureEthCostInfo', () => {
    it('satisfies the GestureEthCostInfo contract', () => {
      const info: GestureEthCostInfo = {
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

  describe('TokenImprintInfo', () => {
    it('satisfies the TokenImprintInfo contract', () => {
      const info: TokenImprintInfo = {
        CurName: 'Alpha',
        CurOwnerAddr: '0x123',
        SeedHex: '0xdeadbeef',
        TokenId: 5,
      };
      expect(info.CurName).toBe('Alpha');
      expect(info.SeedHex).toBe('0xdeadbeef');
    });

    it('allows all fields to be optional', () => {
      const info: TokenImprintInfo = {};
      expect(info.CurName).toBeUndefined();
    });
  });

  describe('Unique address entry types', () => {
    it('satisfies the Participant contract', () => {
      const bidder: Participant = {
        BidderAid: '1',
        BidderAddr: '0xabc',
        NumBids: 10,
        MaxBidAmountEth: 1.5,
      };
      expect(bidder.NumBids).toBe(10);
    });

    it('satisfies the Recipient contract', () => {
      const recipient: Recipient = {
        WinnerAid: '2',
        WinnerAddr: '0xdef',
        AllocationsCount: 3,
        MaxWinAmountEth: 5.0,
        PrizesSum: 15.0,
      };
      expect(recipient.AllocationsCount).toBe(3);
    });

    it('satisfies the UniqueAnchorHolderCST contract', () => {
      const anchorHolder: UniqueAnchorHolderCST = {
        StakerAid: '3',
        StakerAddr: '0xghi',
        NumStakeActions: 5,
        NumUnstakeActions: 2,
        TotalTokensMinted: 10,
        TotalTokensStaked: 8,
        TotalRewardEth: 2.5,
        UnclaimedRewardEth: 0.5,
      };
      expect(anchorHolder.TotalRewardEth).toBe(2.5);
    });

    it('satisfies the UniqueAnchorHolderRWLK contract', () => {
      const anchorHolder: UniqueAnchorHolderRWLK = {
        StakerAid: 4,
        StakerAddr: '0xjkl',
        NumStakeActions: 3,
        NumUnstakeActions: 1,
        TotalTokensStaked: 6,
        TotalTokensMinted: 4,
      };
      expect(anchorHolder.TotalTokensStaked).toBe(6);
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
        UnretrievedAnchorDistribution: 0.5,
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

  describe('AnchoredTokenInfo — new fields (4c)', () => {
    it('accepts UserAddr and StakeEvtLogId', () => {
      const info: AnchoredTokenInfo = {
        StakeActionId: 1,
        StakedTokenId: 42,
        StakeTimeStamp: 1700000000,
        UserAddr: '0xuser',
        StakeEvtLogId: 99,
      };
      expect(info.UserAddr).toBe('0xuser');
      expect(info.StakeEvtLogId).toBe(99);
    });

    it('UserAddr and StakeEvtLogId are optional', () => {
      const info: AnchoredTokenInfo = {
        StakeActionId: 1,
        StakedTokenId: 42,
        StakeTimeStamp: 1700000000,
      };
      expect(info.UserAddr).toBeUndefined();
      expect(info.StakeEvtLogId).toBeUndefined();
    });
  });

  describe('CSTAnchorDistribution — new fields (4c)', () => {
    it('accepts deposit/collection fields', () => {
      const reward: CSTAnchorDistribution = {
        EvtLogId: 1,
        RoundNum: 5,
        TokenId: 0,
        TotalDepositAmountEth: 1.5,
        PendingToCollectEth: 0.3,
        DepositTimeStamp: 1700000000,
        YourCollectedAmountEth: 0.8,
        NumUnclaimedTokens: 2,
        YourRewardAmountEth: 0.1,
        PendingToClaimEth: 0.05,
      };
      expect(reward.TotalDepositAmountEth).toBe(1.5);
      expect(reward.PendingToCollectEth).toBe(0.3);
      expect(reward.DepositTimeStamp).toBe(1700000000);
      expect(reward.YourCollectedAmountEth).toBe(0.8);
      expect(reward.NumUnclaimedTokens).toBe(2);
      expect(reward.YourRewardAmountEth).toBe(0.1);
      expect(reward.PendingToClaimEth).toBe(0.05);
    });

    it('new fields are optional', () => {
      const reward: CSTAnchorDistribution = { EvtLogId: 1, RoundNum: 1, TokenId: 0 };
      expect(reward.TotalDepositAmountEth).toBeUndefined();
      expect(reward.PendingToCollectEth).toBeUndefined();
      expect(reward.DepositTimeStamp).toBeUndefined();
      expect(reward.YourCollectedAmountEth).toBeUndefined();
    });
  });

  describe('CSTTokenInfo — new fields (4c)', () => {
    it('accepts MintTimeStamp, WinnerAddr, Staked, RecordType', () => {
      const token: CSTTokenInfo = {
        EvtLogId: 1,
        BlockNum: 100,
        TxId: 1,
        TxHash: '0xabc',
        TimeStamp: 1700000000,
        DateTime: '2024-01-01',
        TokenId: 42,
        MintTimeStamp: 1700000000,
        WinnerAddr: '0xwinner',
        Staked: true,
        RecordType: 3,
      };
      expect(token.MintTimeStamp).toBe(1700000000);
      expect(token.WinnerAddr).toBe('0xwinner');
      expect(token.Staked).toBe(true);
      expect(token.RecordType).toBe(3);
    });

    it('Seed accepts both string and number', () => {
      const strSeed: CSTTokenInfo = {
        EvtLogId: 1,
        BlockNum: 0,
        TxId: 0,
        TxHash: '',
        TimeStamp: 0,
        DateTime: '',
        TokenId: 1,
        Seed: 'deadbeef',
      };
      const numSeed: CSTTokenInfo = {
        EvtLogId: 1,
        BlockNum: 0,
        TxId: 0,
        TxHash: '',
        TimeStamp: 0,
        DateTime: '',
        TokenId: 2,
        Seed: 12345,
      };
      expect(strSeed.Seed).toBe('deadbeef');
      expect(numSeed.Seed).toBe(12345);
    });

    it('new fields are optional', () => {
      const token: CSTTokenInfo = {
        EvtLogId: 1,
        BlockNum: 0,
        TxId: 0,
        TxHash: '',
        TimeStamp: 0,
        DateTime: '',
        TokenId: 1,
      };
      expect(token.MintTimeStamp).toBeUndefined();
      expect(token.WinnerAddr).toBeUndefined();
      expect(token.Staked).toBeUndefined();
      expect(token.RecordType).toBeUndefined();
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

  describe('AttachedNFT', () => {
    it('supports optional Index field', () => {
      const nft: AttachedNFT = {
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

  describe('CSTAnchorDistribution extended fields', () => {
    it('supports anchoring recipient fields', () => {
      const reward: CSTAnchorDistribution = {
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
      const reward: CSTAnchorDistribution = {
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
        AnchoringStatistics: {} as AnchoringStatistics,
        MainStats: {} as MainStats,
        DonatedTokenDistributionEntry: {} as DonatedTokenDistributionEntry,
        ContractAddresses: {} as ContractAddresses,
        DashboardInfo: {} as DashboardInfo,
        RoundStats: {} as RoundStats,
        StellarSelectionNFTRecipient: {} as StellarSelectionNFTRecipient,
        StellarSelectionETHDeposit: {} as StellarSelectionETHDeposit,
        WinningHistoryEntry: {} as WinningHistoryEntry,
        AllocationEntry: {} as AllocationEntry,
        RoundInfo: {} as RoundInfo,
        GestureInfo: {} as GestureInfo,
        UserInfo: {} as UserInfo,
        UserBalance: {} as UserBalance,
        UserInfoWithLists: {} as UserInfoWithLists,
        CSTTokenInfo: {} as CSTTokenInfo,
        TokenDistribution: {} as TokenDistribution,
        CTBalanceDistribution: {} as CTBalanceDistribution,
        NameHistoryRecord: {} as NameHistoryRecord,
        UsedRWLKNFT: {} as UsedRWLKNFT,
        CSTTransferRecord: {} as CSTTransferRecord,
        AnchorAction: {} as AnchorAction,
        AnchoredTokenInfo: {} as AnchoredTokenInfo,
        CSTAnchorDistribution: {} as CSTAnchorDistribution,
        CombinedAnchorRecordInfo: {} as CombinedAnchorRecordInfo,
        RewardsByToken: {} as RewardsByToken,
        AnchorDistributionImprint: {} as AnchorDistributionImprint,
        AttachedNFT: {} as AttachedNFT,
        ETHDonation: {} as ETHDonation,
        CharityWithdrawal: {} as CharityWithdrawal,
        SpecialRecipients: {} as SpecialRecipients,
        BannedGesture: {} as BannedGesture,
        GestureEthCostInfo: {} as GestureEthCostInfo,
        CTPriceInfo: {} as CTPriceInfo,
        TokenImprintInfo: {} as TokenImprintInfo,
        Participant: {} as Participant,
        Recipient: {} as Recipient,
        UniqueAnchorHolderCST: {} as UniqueAnchorHolderCST,
        UniqueAnchorHolderRWLK: {} as UniqueAnchorHolderRWLK,
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

// lexicon-allow-end
