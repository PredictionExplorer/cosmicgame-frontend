// lexicon-allow-start: fixtures exercise the sealed backend recipient fields.
import {
  getGestureCstCredits,
  normalizeGestureCstCreditFields,
  type GestureCstCreditContext,
} from '@/utils/gestureCstCredit';
import type { GestureInfo } from '@/services/api/types';

const ACTOR = '0xe7eD7F31cd76CeD85861ec5bD37879cBA053e887';
const PREVIOUS = '0x30E6E8EEEC88aA8Ea35B54807671458B3F01665e';
const ZERO = '0x0000000000000000000000000000000000000000';
const CONTEXT: GestureCstCreditContext = {
  chainId: 42161,
  protocolAddress: '0x6a714Ae7B5b6eA520F6BCA23d2E609C4Fd5863F2',
};

const record = (overrides: Partial<GestureInfo> = {}): GestureInfo => ({
  EvtLogId: 30748,
  BlockNum: 517075891,
  TxId: 10169,
  TxHash: '0xd2ac465cdddccef54bd39e843c71686588d2289007724a2a46abed671c39b2ec',
  TimeStamp: 1792630457,
  DateTime: '2026-10-22T00:54:17Z',
  RoundNum: 3,
  BidPosition: 79,
  BidderAddr: ACTOR,
  GestureType: 0,
  GestureCostEth: 0.001738302851295673,
  ...overrides,
});

/** Live gesture79: its receipt creates CST for gesture78's participant. */
const LIVE_CREDIT = {
  CSTReward: '210294532050989629',
  CSTRewardEth: 0.21029453205098964,
  PreviousBidderCstRewardAmount: '210294532050989629',
  PreviousCstRewardAmountEth: 0.21029453205098964,
  ThisBidderCstRewardAmount: '0',
  PreviousBidderAddr: PREVIOUS,
};

it('resolves the live API spelling and retains exact base units for gesture79', () => {
  expect(getGestureCstCredits(record(LIVE_CREDIT))).toEqual({
    status: 'credited',
    credits: [
      {
        role: 'previous',
        amount: 0.21029453205098964,
        amountWei: '210294532050989629',
        recipient: PREVIOUS,
        sameParticipant: false,
      },
    ],
  });
});

it('normalizes the decimal aliases even when only decimal recipient amounts are present', () => {
  const raw = {
    PreviousCstRewardAmountEth: 0.21,
    ThisCstRewardAmountEth: 0,
    PreviousBidderAddr: PREVIOUS,
  };
  normalizeGestureCstCreditFields(raw);
  expect(raw).toMatchObject({
    PreviousBidderCstRewardAmountEth: 0.21,
    ThisBidderCstRewardAmountEth: 0,
  });
  expect(getGestureCstCredits(record(raw))).toMatchObject({
    status: 'credited',
    credits: [{ role: 'previous', amount: 0.21, recipient: PREVIOUS }],
  });
});

it('preserves an explicit canonical zero instead of selecting a nonzero alias', () => {
  const raw = {
    PreviousBidderCstRewardAmountEth: 0,
    PreviousCstRewardAmountEth: 10,
    PreviousBidderAddr: PREVIOUS,
  };
  normalizeGestureCstCreditFields(raw);
  expect(raw.PreviousBidderCstRewardAmountEth).toBe(0);
  expect(getGestureCstCredits(record(raw))).toMatchObject({
    status: 'unknown',
    credits: [{ role: 'previous', amount: 0, recipient: PREVIOUS }],
  });
});

it('does not substitute the aggregate for an explicitly zero recipient amount', () => {
  expect(
    getGestureCstCredits(
      record({
        PreviousBidderCstRewardAmount: '0',
        PreviousBidderAddr: PREVIOUS,
        CSTRewardEth: 7,
      }),
    ),
  ).toEqual({
    status: 'unknown',
    credits: [
      { role: 'previous', amount: 0, amountWei: '0', recipient: PREVIOUS, sameParticipant: false },
    ],
  });
});

it('uses raw units ahead of a rounded decimal amount and never rounds tiny positive credits to zero', () => {
  const credit = getGestureCstCredits(
    record({
      PreviousBidderCstRewardAmount: '1',
      PreviousCstRewardAmountEth: 0,
      PreviousBidderAddr: PREVIOUS,
    }),
  );
  expect(credit).toMatchObject({
    status: 'credited',
    credits: [{ amount: 1e-18, amountWei: '1' }],
  });
});

it('recognizes the actual first V3 gesture with an explicit zero aggregate and no recipient fields', () => {
  expect(
    getGestureCstCredits(
      record({
        EvtLogId: 30592,
        BlockNum: 517064940,
        BidPosition: 1,
        CSTReward: '0',
        CSTRewardEth: 0,
      }),
    ),
  ).toEqual({ status: 'first', credits: [] });
});

it.each([
  { PreviousBidderCstRewardAmount: '0', PreviousBidderAddr: PREVIOUS },
  { ThisBidderCstRewardAmount: '0' },
])('does not mistake a single zero recipient partition for a confirmed zero total', (fields) => {
  const result = getGestureCstCredits(record({ BidPosition: 1, ...fields }));
  expect(result.status).toBe('unknown');
  expect(result.credits[0]?.amount).toBe(0);
});

it('does not call a first gesture zero merely because its credit data is absent', () => {
  expect(getGestureCstCredits(record({ BidPosition: 1 }))).toEqual({
    status: 'unknown',
    credits: [],
  });
});

it('distinguishes confirmed zero on a later gesture from missing data', () => {
  expect(getGestureCstCredits(record({ CSTReward: '0' }))).toEqual({ status: 'zero', credits: [] });
  expect(getGestureCstCredits(record())).toEqual({ status: 'unknown', credits: [] });
});

it('keeps a zero credit attached to the known previous participant', () => {
  expect(
    getGestureCstCredits(
      record({
        PreviousBidderCstRewardAmount: '0',
        PreviousBidderAddr: PREVIOUS,
        ThisBidderCstRewardAmount: '0',
        CSTReward: '0',
      }),
    ),
  ).toMatchObject({
    status: 'zero',
    credits: [{ role: 'previous', amount: 0, recipient: PREVIOUS }],
  });
});

it('recognizes consecutive gestures by the same wallet without changing its recipient role', () => {
  expect(
    getGestureCstCredits(record({ ...LIVE_CREDIT, PreviousBidderAddr: ACTOR.toLowerCase() })),
  ).toMatchObject({ status: 'credited', credits: [{ role: 'previous', sameParticipant: true }] });
});

it('keeps both explicit recipient credits in older split-shaped records', () => {
  expect(
    getGestureCstCredits(
      record({
        PreviousBidderAddr: PREVIOUS,
        PreviousBidderCstRewardAmount: '90000000000000000000',
        ThisBidderCstRewardAmount: '10000000000000000000',
      }),
    ),
  ).toMatchObject({
    status: 'credited',
    credits: [
      { role: 'previous', amount: 90, recipient: PREVIOUS },
      { role: 'participant', amount: 10, recipient: ACTOR },
    ],
  });
});

it('retains explicit legacy participant attribution independent of the currently deployed version', () => {
  expect(
    getGestureCstCredits(
      record({
        PreviousBidderCstRewardAmount: '0',
        ThisCstRewardAmountEth: 100,
      }),
    ),
  ).toMatchObject({
    status: 'credited',
    credits: [{ role: 'participant', amount: 100, recipient: ACTOR }],
  });
});

it.each(['', ZERO, '0x123', '<script>', `0x${'g'.repeat(40)}`])(
  'does not invent a recipient for invalid address %s',
  (recipient) => {
    const result = getGestureCstCredits(record({ ...LIVE_CREDIT, PreviousBidderAddr: recipient }));
    expect(result).toMatchObject({
      status: 'credited',
      credits: [{ role: 'previous', amount: 0.21029453205098964 }],
    });
    expect(result.credits[0]?.recipient).toBeUndefined();
    expect(result.credits[0]?.sameParticipant).toBe(false);
  },
);

it.each(['', '-1', '0x10', '1e18', ' 1 ', '1.5', '9'.repeat(79), (1n << 256n).toString()])(
  'rejects malformed/out-of-range raw amount %s without falling back to its decimal alias',
  (rawAmount) => {
    const input = { ...LIVE_CREDIT, PreviousBidderCstRewardAmount: rawAmount };
    normalizeGestureCstCreditFields(input);
    const result = getGestureCstCredits(record(input));
    expect(result.status).toBe('unknown');
    expect(result.credits[0]?.amount).toBeUndefined();
    expect(result.unattributedAmount).toBeUndefined();
  },
);

it.each([-1, NaN, Infinity, -Infinity, 1e60, '0.21'])(
  'rejects invalid canonical decimal %s without exposing an otherwise valid alias after normalization',
  (value) => {
    const input: Record<string, unknown> = {
      PreviousBidderCstRewardAmountEth: value,
      PreviousCstRewardAmountEth: 0.21,
      PreviousBidderAddr: PREVIOUS,
    };
    normalizeGestureCstCreditFields(input);
    expect(getGestureCstCredits(record(input))).toMatchObject({
      status: 'unknown',
      credits: [{ role: 'previous', amount: undefined }],
    });
  },
);

it('does not attribute an aggregate-only V3 credit to its sender or an address-only previous role', () => {
  expect(
    getGestureCstCredits(record({ ParticipationCST: 0.21, PreviousBidderAddr: PREVIOUS }), CONTEXT),
  ).toEqual({ status: 'unknown', credits: [], unattributedAmount: 0.21 });
});

it.each([
  { block: 460505524, raw: '100000000000000000000', amount: 100 },
  { block: 493596742, raw: '2425237369092255542', amount: 2.4252373690922555 },
])(
  'resolves actual aggregate-only V1/V2 history at block$block only for its audited deployment',
  ({ block, raw, amount }) => {
    const legacy = record({ BlockNum: block, BidPosition: 1, CSTReward: raw });
    expect(getGestureCstCredits(legacy, CONTEXT)).toMatchObject({
      status: 'credited',
      credits: [{ role: 'participant', amount, amountWei: raw, recipient: ACTOR }],
    });
    expect(getGestureCstCredits(legacy)).toMatchObject({
      status: 'unknown',
      credits: [],
      unattributedAmount: amount,
    });
  },
);

it.each([
  { chainId: 421614, protocolAddress: CONTEXT.protocolAddress },
  { chainId: 42161, protocolAddress: ACTOR },
])('does not apply mainnet history to another deployment', (context) => {
  expect(getGestureCstCredits(record({ BlockNum: 493596742, CSTRewardEth: 100 }), context)).toEqual(
    { status: 'unknown', credits: [], unattributedAmount: 100 },
  );
});

it.each([0, 455767588, 516839618, 516839619, NaN, 493596742.5])(
  'keeps aggregate-only block %s outside the proven legacy interval unattributed',
  (block) => {
    expect(getGestureCstCredits(record({ BlockNum: block, CSTRewardEth: 100 }), CONTEXT)).toEqual({
      status: 'unknown',
      credits: [],
      unattributedAmount: 100,
    });
  },
);

it.each([455767589, 516839617])('includes the known legacy interval boundary %s', (block) => {
  expect(
    getGestureCstCredits(record({ BlockNum: block, CSTRewardEth: 100 }), CONTEXT),
  ).toMatchObject({ status: 'credited', credits: [{ role: 'participant', amount: 100 }] });
});

it('does not let audited history override malformed recipient-specific data', () => {
  expect(
    getGestureCstCredits(
      record({
        BlockNum: 493596742,
        CSTRewardEth: 100,
        PreviousBidderCstRewardAmount: '-1',
      }),
      CONTEXT,
    ),
  ).toMatchObject({ status: 'unknown', credits: [{ amount: undefined }] });
});
// lexicon-allow-end

// lexicon-allow-start: regression fixtures use the sealed API's raw amount fields.
it('retains exact aggregate units when its recipient is unavailable', () => {
  expect(getGestureCstCredits(record({ CSTReward: '210294532050989629' }))).toEqual({
    status: 'unknown',
    credits: [],
    unattributedAmount: 0.21029453205098964,
    unattributedAmountWei: '210294532050989629',
  });
});

it('marks a positive subtotal above the aggregate as incomplete even when the other partition is missing', () => {
  expect(
    getGestureCstCredits(
      record({
        PreviousBidderAddr: PREVIOUS,
        PreviousBidderCstRewardAmount: '1000000000000000000',
        CSTReward: '0',
      }),
    ),
  ).toMatchObject({
    status: 'unknown',
    credits: [{ role: 'previous', amount: 1, recipient: PREVIOUS }],
  });
});

it('never turns a contradictory positive credit into a first-gesture zero', () => {
  expect(
    getGestureCstCredits(
      record({
        BidPosition: 1,
        PreviousBidderAddr: PREVIOUS,
        PreviousBidderCstRewardAmount: '1',
        CSTRewardEth: 0,
      }),
    ),
  ).toMatchObject({ status: 'unknown', credits: [{ amount: 1e-18, amountWei: '1' }] });
});

it('checks exact raw totals even when conversion to Number would hide a one-unit difference', () => {
  expect(
    getGestureCstCredits(
      record({
        PreviousBidderAddr: PREVIOUS,
        PreviousBidderCstRewardAmount: '1000000000000000000000000001',
        ThisBidderCstRewardAmount: '0',
        CSTReward: '1000000000000000000000000000',
      }),
    ),
  ).toMatchObject({
    status: 'unknown',
    credits: [
      { role: 'previous', amountWei: '1000000000000000000000000001' },
      { role: 'participant', amountWei: '0' },
    ],
  });
});

it('preserves both explicit zero partitions when their aggregate contradicts them', () => {
  expect(
    getGestureCstCredits(
      record({
        PreviousBidderAddr: PREVIOUS,
        PreviousBidderCstRewardAmount: '0',
        ThisBidderCstRewardAmount: '0',
        CSTReward: '1000000000000000000',
      }),
    ),
  ).toMatchObject({
    status: 'unknown',
    credits: [
      { role: 'previous', amount: 0 },
      { role: 'participant', amount: 0 },
    ],
  });
});

it('compares decimal totals with floating-point tolerance, not strict Number equality', () => {
  const fields = {
    PreviousBidderAddr: PREVIOUS,
    PreviousCstRewardAmountEth: 0.1,
    ThisCstRewardAmountEth: 0.2,
    CSTRewardEth: 0.3,
  };
  expect(getGestureCstCredits(record(fields))).toMatchObject({ status: 'credited' });
  expect(getGestureCstCredits(record({ ...fields, CSTRewardEth: 0.31 }))).toMatchObject({
    status: 'unknown',
    credits: [{ amount: 0.1 }, { amount: 0.2 }],
  });
});

it('does not invent a discrepancy from an absent partition or absent aggregate', () => {
  expect(
    getGestureCstCredits(
      record({
        PreviousBidderAddr: PREVIOUS,
        PreviousCstRewardAmountEth: 0.1,
        CSTRewardEth: 0.3,
      }),
    ),
  ).toMatchObject({ status: 'credited', credits: [{ role: 'previous', amount: 0.1 }] });
  expect(
    getGestureCstCredits(
      record({
        PreviousBidderAddr: PREVIOUS,
        PreviousCstRewardAmountEth: 0.1,
        ThisCstRewardAmountEth: 0.2,
      }),
    ),
  ).toMatchObject({ status: 'credited', credits: [{ amount: 0.1 }, { amount: 0.2 }] });
});
// lexicon-allow-end
