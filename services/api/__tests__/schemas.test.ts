/**
 * Schema contract tests — validate that the Zod schemas in services/api/schemas.ts
 * accept realistic backend payloads and surface mismatches on corrupted ones.
 *
 * Keep the fixtures inline so a backend-shape change that breaks this file is
 * obvious in the diff, not hidden behind a helper.
 */

import {
  DashboardInfoSchema,
  GestureInfoSchema,
  RoundInfoSchema,
  UserBalanceSchema,
  UserInfoSchema,
  getValidationMode,
  safeValidate,
  setValidationMode,
} from '@/services/api/schemas';
import { normalizeDashboardWire } from '@/services/api/rounds';

// Reset validation mode between cases since it's module-level state.
afterEach(() => setValidationMode('warn'));

describe('DashboardInfoSchema', () => {
  const sample = {
    CurNumBids: 42,
    CurPrizeAmountEth: 1.23,
    CurRoundNum: 17,
    PrizeClaimTs: 1_700_000_000,
    TsRoundStart: 1_699_000_000,
    LastBidderAddr: '0xabc',
    GestureCostEth: 0.001,
    StakingAmountEth: 0.5,
    NumRaffleNFTWinnersBidding: 3,
    NumRaffleNFTWinnersStakingRWalk: 2,
    MainStats: {
      NumCSTokenMints: 1000,
      TotalRaffleEthDeposits: 10,
      TotalCSTConsumedEth: 5,
      TotalMktRewardsEth: 1,
      NumMktRewards: 8,
      TotalRaffleEthWithdrawn: 7,
      NumBidsCST: 200,
      NumUniqueBidders: 50,
      NumUniqueWinners: 20,
      NumUniqueDonors: 10,
      TotalNamedTokens: 30,
      NumUniqueStakersCST: 40,
      NumUniqueStakersRWalk: 25,
      StakeStatisticsCST: {
        NumActiveStakers: 40,
        NumDeposits: 100,
        TotalRewardEth: 5,
        TotalTokensMinted: 1000,
        TotalTokensStaked: 400,
      },
      StakeStatisticsRWalk: {
        NumActiveStakers: 25,
        NumDeposits: 70,
        TotalRewardEth: 3,
        TotalTokensMinted: 800,
        TotalTokensStaked: 300,
      },
    },
  };

  it('accepts a realistic payload', () => {
    const parsed = DashboardInfoSchema.parse(sample);
    expect(parsed.CurNumBids).toBe(42);
    expect(parsed.MainStats.NumCSTokenMints).toBe(1000);
  });

  it('passes through unknown top-level fields', () => {
    const parsed = DashboardInfoSchema.parse({ ...sample, FutureField: 'yes' });
    expect((parsed as Record<string, unknown>).FutureField).toBe('yes');
  });

  it('rejects missing required fields', () => {
    const bad = { ...sample };
    delete (bad as { CurRoundNum?: unknown }).CurRoundNum;
    expect(() => DashboardInfoSchema.parse(bad)).toThrow();
  });

  it('accepts Go dashboard wire format after normalizeDashboardWire', () => {
    const goLike = {
      PrizeAmountEth: 12.34,
      BidPriceEth: 0.056,
      TokenReward: '100000000000000000',
      CurNumBids: 1,
      CurRoundNum: 2,
      PrizeClaimTs: 3,
      TsRoundStart: 4,
      LastBidderAddr: '0xabc',
      StakingAmountEth: 5,
      NumRaffleNFTWinnersBidding: 6,
      NumRaffleNFTWinnersStakingRWalk: 7,
      MainStats: {
        NumCSTokenMints: 100,
        TotalRaffleEthDeposits: 1,
        TotalCSTConsumedEth: 2,
        TotalMktRewardsEth: 3,
        NumMktRewards: 4,
        TotalRaffleEthWithdrawn: 5,
        NumBidsCST: 6,
        NumUniqueBidders: 7,
        NumUniqueWinners: 8,
        NumUniqueDonors: 9,
        TotalNamedTokens: 10,
        NumUniqueStakersCST: 11,
        NumUniqueStakersRWalk: 12,
        StakeStatisticsCST: {
          NumActiveStakers: 1,
          NumDeposits: 2,
          TotalRewardEth: 3,
          TotalTokensStaked: 4,
        },
        StakeStatisticsRWalk: {
          NumActiveStakers: 1,
          TotalTokensMinted: 99,
          TotalTokensStaked: 4,
        },
      },
    };
    const normalized = normalizeDashboardWire(goLike as Record<string, unknown>);
    const parsed = DashboardInfoSchema.safeParse(normalized);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.CurPrizeAmountEth).toBe(12.34);
      expect(parsed.data.CurBidPriceEth).toBe(0.056);
      expect(parsed.data.GestureCostEth).toBeCloseTo(0.1);
    }
  });
});

describe('RoundInfoSchema', () => {
  const sample = {
    RoundNum: 5,
    WinnerAddr: '0xwinner',
    AmountEth: 2.5,
    TokenId: 1,
    TxHash: '0xtx',
    TimeStamp: 1_700_000_000,
    DateTime: '2026-03-01T00:00:00Z',
    RoundStats: { TotalBids: 99 },
    RaffleNFTWinners: [],
    StakingNFTWinners: [],
    RaffleETHDeposits: [],
    AllPrizes: [],
    CSTAmountEth: 0.1,
    CharityAddress: '0xcharity',
    CharityAmountETH: 0.5,
    StakingDepositAmountEth: 0.3,
    StakingPerTokenEth: 0.01,
    StakingNumStakedTokens: 30,
    EnduranceWinnerAddr: '0xendurance',
    LastCstBidderAddr: '0xcst',
    ChronoWarriorAddr: '0xchrono',
  };

  it('accepts a realistic payload', () => {
    expect(() => RoundInfoSchema.parse(sample)).not.toThrow();
  });

  it('accepts nested recipient arrays with loose extras', () => {
    const withExtras = {
      ...sample,
      RaffleNFTWinners: [
        {
          WinnerAddr: '0xabc',
          TokenId: 1,
          FutureFlag: true,
        },
      ],
    };
    const parsed = RoundInfoSchema.parse(withExtras);
    expect(parsed.RaffleNFTWinners[0]).toMatchObject({
      WinnerAddr: '0xabc',
      FutureFlag: true,
    });
  });

  it('accepts RaffleETHDeposits with only Amount (no tx row)', () => {
    const sparse = {
      ...sample,
      RaffleETHDeposits: [{ Amount: 0.1 }],
    };
    expect(() => RoundInfoSchema.parse(sparse)).not.toThrow();
  });

  it('accepts RaffleETHDeposits with nested Tx', () => {
    const nested = {
      ...sample,
      RaffleETHDeposits: [
        {
          Amount: 0.2,
          RoundNum: 5,
          Tx: { EvtLogId: 9, TxHash: '0xdep', TimeStamp: 1_700_000_001 },
        },
      ],
    };
    expect(() => RoundInfoSchema.parse(nested)).not.toThrow();
  });
});

describe('GestureInfoSchema', () => {
  it('accepts a realistic payload', () => {
    const sample = {
      EvtLogId: 1,
      BlockNum: 100,
      TxId: 5,
      TxHash: '0xh',
      TimeStamp: 1_700_000_000,
      RoundNum: 17,
      BidderAddr: '0xbidder',
      GestureType: 0,
      GestureCostEth: 0.001,
    };
    expect(() => GestureInfoSchema.parse(sample)).not.toThrow();
  });

  it('rejects a wrong type on GestureType', () => {
    const bad = {
      EvtLogId: 1,
      BlockNum: 100,
      TxId: 5,
      TxHash: '0xh',
      TimeStamp: 1_700_000_000,
      RoundNum: 17,
      BidderAddr: '0xbidder',
      GestureType: 'nope',
      GestureCostEth: 0.001,
    };
    expect(() => GestureInfoSchema.parse(bad)).toThrow();
  });
});

describe('UserInfoSchema + UserBalanceSchema', () => {
  it('accepts realistic payloads', () => {
    expect(() => UserInfoSchema.parse({ NumBids: 3, NumPrizes: 1 })).not.toThrow();
    expect(() =>
      UserBalanceSchema.parse({ ETH_Balance: '1.5', CosmicTokenBalance: '1000' }),
    ).not.toThrow();
  });

  it('rejects UserBalance with number fields (must be string)', () => {
    expect(() => UserBalanceSchema.parse({ ETH_Balance: 1.5, CosmicTokenBalance: 1000 })).toThrow();
  });
});

describe('safeValidate (warn-only default)', () => {
  it('returns the original value when the schema matches', () => {
    const value = { NumBids: 1, NumPrizes: 1 };
    expect(safeValidate(UserInfoSchema, value, 'UserInfo')).toEqual(value);
  });

  it('returns the original value on mismatch in warn mode (no throw)', () => {
    // reportError fires console.error — silence it here so the jest.setup
    // guard doesn't fail the test on the expected telemetry call.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const bad = { NumBids: 'not-a-number' };
      const result = safeValidate(UserInfoSchema, bad, 'UserInfo');
      expect(result).toBe(bad); // raw value passes through
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('[schema:UserInfo]'),
        expect.any(Error),
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('throws on mismatch in throw mode', () => {
    setValidationMode('throw');
    const bad = { NumBids: 'not-a-number' };
    expect(() => safeValidate(UserInfoSchema, bad, 'UserInfo')).toThrow(/schemaMismatch:UserInfo/);
  });

  it('getValidationMode reflects the set mode', () => {
    expect(getValidationMode()).toBe('warn');
    setValidationMode('throw');
    expect(getValidationMode()).toBe('throw');
  });
});
