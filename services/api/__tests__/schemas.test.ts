/**
 * Schema contract tests — validate that the Zod schemas in services/api/schemas.ts
 * accept realistic backend payloads and surface mismatches on corrupted ones.
 *
 * Keep the fixtures inline so a backend-shape change that breaks this file is
 * obvious in the diff, not hidden behind a helper.
 */

// lexicon-allow-start: schema fixtures mirror the backend-sealed API surface

import {
  AnchoredTokenCSTSchema,
  AnchoredTokenRWalkSchema,
  BidTypeRatioBucketSchema,
  CharityWithdrawalSchema,
  DashboardInfoSchema,
  ETHDonationSchema,
  GestureInfoSchema,
  MarketingRewardSchema,
  RoundClaimDetailSchema,
  RoundClaimSummarySchema,
  RoundInfoSchema,
  SpecialRecipientsSchema,
  StellarSelectionETHDepositSchema,
  TopBidderActivePeriodsResponseSchema,
  UserBalanceSchema,
  UserInfoSchema,
  safeValidate,
  safeValidateListSample,
  validate,
  validateList,
} from '@/services/api/schemas';
import { normalizeDashboardWire } from '@/services/api/rounds';

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

  it('accepts an unfinalized cycle, which has no claim transaction or stats row', () => {
    const inFlight = { ...sample, RoundStats: {} };
    delete (inFlight as { TxHash?: unknown }).TxHash;
    delete (inFlight as { TimeStamp?: unknown }).TimeStamp;
    delete (inFlight as { DateTime?: unknown }).DateTime;

    expect(() => RoundInfoSchema.parse(inFlight)).not.toThrow();
  });

  it('keeps a string allocation amount as a string instead of coercing it', () => {
    const parsed = RoundInfoSchema.parse({
      ...sample,
      AllPrizes: [{ RoundNum: 5, Amount: '1500000000000000000' }],
    });

    expect(parsed.AllPrizes[0]?.Amount).toBe('1500000000000000000');
  });
});

describe('GestureInfoSchema', () => {
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

  it('accepts a realistic payload', () => {
    expect(() => GestureInfoSchema.parse(sample)).not.toThrow();
  });

  it('accepts a CST gesture, which has no ETH cost', () => {
    const cst = { ...sample, GestureType: 2 };
    delete (cst as { GestureCostEth?: unknown }).GestureCostEth;

    expect(() => GestureInfoSchema.parse(cst)).not.toThrow();
  });

  it('rejects a wrong type on GestureType', () => {
    expect(() => GestureInfoSchema.parse({ ...sample, GestureType: 'nope' })).toThrow();
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

describe('SpecialRecipientsSchema', () => {
  const livePayload = {
    ChronoWarriorAddress: '0x30E6E8EEEC88aA8Ea35B54807671458B3F01665e',
    ChronoWarriorDuration: 1551,
    EnduranceChampionAddress: '0x30E6E8EEEC88aA8Ea35B54807671458B3F01665e',
    EnduranceChampionDuration: 704,
    LastBidderAddress: '0x4A9A3815060C3Bd08fb4d44C9e74513874771b0C',
    LastBidderLastBidTime: 1778207543,
    LastCstBidderAddress: '0xC83aa25FA5829c789DF2AC5976b4A26d49c648FF',
  };

  it('accepts the live current-special-recipients payload', () => {
    const parsed = SpecialRecipientsSchema.parse(livePayload);
    expect(parsed.ChronoWarriorAddress).toBe(livePayload.ChronoWarriorAddress);
    expect(parsed.LastBidderLastBidTime).toBe(1778207543);
  });

  it('passes through future backend fields', () => {
    const parsed = SpecialRecipientsSchema.parse({ ...livePayload, FutureChampionField: 'ok' });
    expect((parsed as Record<string, unknown>).FutureChampionField).toBe('ok');
  });

  it('accepts source-backed V2 champion segment fields', () => {
    const parsed = SpecialRecipientsSchema.parse({
      ...livePayload,
      EnduranceChampionStartTimeStamp: 1778207000,
      PrevEnduranceChampionDuration: 704,
      ChronoWarriorIsLive: false,
      LastCstBidderLastBidTime: 1778207010,
      LastCstBidEventLogId: 123,
      RoundNum: 0,
      SourceBlockNumber: 465857123,
      SourceBlockTimeStamp: 1779544720,
    });

    expect(parsed.EnduranceChampionStartTimeStamp).toBe(1778207000);
    expect(parsed.ChronoWarriorIsLive).toBe(false);
    expect(parsed.SourceBlockTimeStamp).toBe(1779544720);
  });

  it('rejects corrupted duration fields', () => {
    expect(() =>
      SpecialRecipientsSchema.parse({ ...livePayload, ChronoWarriorDuration: '1551' }),
    ).toThrow();
  });
});

describe('anchored-token schemas', () => {
  /** The CST endpoint nests the token and sends no flat `StakedTokenId`. */
  const cstRow = {
    StakeActionId: 10,
    StakeTimeStamp: 1701346718,
    UserAddr: '0xholder',
    TokenInfo: { TokenId: 99, Seed: 'abc123', StakeActionId: 10 },
  };

  it('accepts the CST row shape that the shared schema used to reject', () => {
    expect(() => AnchoredTokenCSTSchema.parse(cstRow)).not.toThrow();
  });

  it('requires the nested TokenInfo the CST tables read', () => {
    const withoutTokenInfo = { ...cstRow };
    delete (withoutTokenInfo as { TokenInfo?: unknown }).TokenInfo;

    expect(() => AnchoredTokenCSTSchema.parse(withoutTokenInfo)).toThrow();
  });

  it('accepts a numeric CST seed as well as a hex string', () => {
    expect(() =>
      AnchoredTokenCSTSchema.parse({ ...cstRow, TokenInfo: { TokenId: 1, Seed: 42 } }),
    ).not.toThrow();
  });

  it('requires the flat token id on RandomWalk rows', () => {
    expect(() =>
      AnchoredTokenRWalkSchema.parse({
        StakeActionId: 7,
        StakedTokenId: 42,
        StakeTimeStamp: 1701346718,
      }),
    ).not.toThrow();
    expect(() =>
      AnchoredTokenRWalkSchema.parse({ StakeActionId: 7, StakeTimeStamp: 1701346718 }),
    ).toThrow();
  });
});

describe('claim / allocation schemas', () => {
  const summary = {
    RoundNum: 4,
    ClaimWindowTimeout: 1_800_000_000,
    AwardedTs: 1_700_000_000,
    Expired: false,
    EthAwarded: 3,
    EthUnclaimed: 1,
    EthUnclaimedEth: 0.25,
    NftAwarded: 2,
    NftUnclaimed: 1,
    Erc20Awarded: 1,
    Erc20Unclaimed: 0,
    TotalAwarded: 6,
    TotalUnclaimed: 2,
    AvgClaimPeriodSecs: 3600,
    UnclaimedItems: [
      {
        AssetType: 'ETH',
        RecipientAddr: '0xrecipient',
        AmountEth: 0.25,
        TokenAddr: '',
        TokenId: -1,
      },
    ],
  };

  it('accepts a per-cycle claim summary', () => {
    expect(() => RoundClaimSummarySchema.parse(summary)).not.toThrow();
  });

  it('accepts a summary with no unclaimed items key', () => {
    const withoutItems = { ...summary };
    delete (withoutItems as { UnclaimedItems?: unknown }).UnclaimedItems;

    expect(() => RoundClaimSummarySchema.parse(withoutItems)).not.toThrow();
  });

  it('rejects an unknown asset type', () => {
    expect(() =>
      RoundClaimSummarySchema.parse({
        ...summary,
        UnclaimedItems: [{ ...summary.UnclaimedItems[0], AssetType: 'DOGE' }],
      }),
    ).toThrow();
  });

  it('accepts a claim drill-down with empty collections', () => {
    expect(() =>
      RoundClaimDetailSchema.parse({ RoundNum: 4, ClaimTransactions: [], AttachedTokens: [] }),
    ).not.toThrow();
  });
});

describe('newly covered modules', () => {
  it('accepts a marketing reward row', () => {
    expect(() =>
      MarketingRewardSchema.parse({
        EvtLogId: 1,
        TxHash: '0xh',
        TimeStamp: 1_700_000_000,
        MarketerAddr: '0xmarketer',
        AmountEth: 0.5,
      }),
    ).not.toThrow();
  });

  it('rejects a marketing reward whose amount is a string', () => {
    expect(() =>
      MarketingRewardSchema.parse({
        EvtLogId: 1,
        TxHash: '0xh',
        TimeStamp: 1_700_000_000,
        MarketerAddr: '0xmarketer',
        AmountEth: '0.5',
      }),
    ).toThrow();
  });

  it('accepts an ETH contribution row with and without a cycle', () => {
    const row = {
      EvtLogId: 2,
      TxHash: '0xh',
      TimeStamp: 1_700_000_000,
      DonorAddr: '0xdonor',
      AmountEth: 1,
    };
    expect(() => ETHDonationSchema.parse(row)).not.toThrow();
    expect(() => ETHDonationSchema.parse({ ...row, RoundNum: 3 })).not.toThrow();
  });

  it('accepts a charity retrieval row with a string event id', () => {
    expect(() =>
      CharityWithdrawalSchema.parse({
        EvtLogId: '18',
        TxHash: '0xh',
        TimeStamp: 1_700_000_000,
        DestinationAddr: '0xcharity',
        AmountEth: 2,
      }),
    ).not.toThrow();
  });

  it('accepts a stellar-selection deposit row with only the fields the API sends', () => {
    expect(() => StellarSelectionETHDepositSchema.parse({ Amount: 0.5 })).not.toThrow();
  });

  it('accepts a gesture-type ratio bucket', () => {
    expect(() =>
      BidTypeRatioBucketSchema.parse({
        BucketTs: 1_700_000_000,
        EthBids: 3,
        RwalkBids: 1,
        CstBids: 2,
        TotalBids: 6,
        EthPct: 50,
        RwalkPct: 16.7,
        CstPct: 33.3,
      }),
    ).not.toThrow();
  });

  it('accepts a top-participant active-periods response', () => {
    expect(() =>
      TopBidderActivePeriodsResponseSchema.parse({
        InitTs: 1,
        FinTs: 2,
        TopN: 3,
        GapHours: 6,
        MinBids: 2,
        TopBidders: [{ BidderAid: 1, BidderAddr: '0xa', NumBids: 5 }],
        ActivePeriods: [
          {
            BidderAid: 1,
            BidderAddr: '0xa',
            PeriodStart: 1,
            PeriodEnd: 2,
            NumBids: 5,
            DurationSecs: 1,
          },
        ],
      }),
    ).not.toThrow();
  });
});

describe('safeValidate (warn-only)', () => {
  it('returns the parsed value when the schema matches', () => {
    const value = { NumBids: 1, NumPrizes: 1 };
    expect(safeValidate(UserInfoSchema, value, 'UserInfo')).toEqual(value);
  });

  it('returns the original value on mismatch and reports it', () => {
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

  it('reports the field path of the first mismatch', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      safeValidate(UserInfoSchema, { NumBids: 1 }, 'UserInfo');
      const reported = spy.mock.calls[0]?.[1] as Error;
      expect(reported.message).toMatch(/schemaMismatch:UserInfo — NumPrizes:/);
    } finally {
      spy.mockRestore();
    }
  });
});

describe('safeValidateListSample (warn-only)', () => {
  it('only inspects the sampled rows', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const rows = [
        ...Array.from({ length: 5 }, () => ({ NumBids: 1, NumPrizes: 1 })),
        { NumBids: 'bad' },
      ];
      expect(safeValidateListSample(UserInfoSchema, rows, 'UserInfoList')).toBe(rows);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it('passes non-array and empty input straight through', () => {
    expect(safeValidateListSample(UserInfoSchema, null, 'UserInfoList')).toBeNull();
    expect(safeValidateListSample(UserInfoSchema, [], 'UserInfoList')).toEqual([]);
  });
});

describe('validate (strict)', () => {
  it('returns the parsed value when the schema matches', () => {
    expect(validate(UserInfoSchema, { NumBids: 1, NumPrizes: 2 }, 'UserInfo')).toEqual({
      NumBids: 1,
      NumPrizes: 2,
    });
  });

  it('throws with the endpoint name and field path on mismatch', () => {
    expect(() => validate(UserInfoSchema, { NumBids: 'not-a-number' }, 'UserInfo')).toThrow(
      /schemaMismatch:UserInfo — NumBids: /,
    );
  });

  it('does not report to Sentry — the failed read does that once', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => validate(UserInfoSchema, {}, 'UserInfo')).toThrow();
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
});

describe('validateList (strict)', () => {
  const rows = (count: number) =>
    Array.from({ length: count }, () => ({ NumBids: 1, NumPrizes: 1 }));

  it('returns the parsed rows when every row matches', () => {
    expect(validateList(UserInfoSchema, rows(3), 'UserInfoList')).toHaveLength(3);
  });

  it('checks past the sampled window that warn-mode validation stops at', () => {
    const corrupt = [...rows(20), { NumBids: 1 }];

    expect(() => validateList(UserInfoSchema, corrupt, 'UserInfoList')).toThrow(
      /schemaMismatch:UserInfoList — 20\.NumPrizes/,
    );
  });

  it('treats a nil slice (null) as an empty list', () => {
    expect(validateList(UserInfoSchema, null, 'UserInfoList')).toEqual([]);
    expect(validateList(UserInfoSchema, undefined, 'UserInfoList')).toEqual([]);
  });

  it('throws when the payload is not a list at all', () => {
    expect(() => validateList(UserInfoSchema, { NumBids: 1 }, 'UserInfoList')).toThrow(
      /schemaMismatch:UserInfoList — <root>: expected array, received object/,
    );
  });
});

// lexicon-allow-end
