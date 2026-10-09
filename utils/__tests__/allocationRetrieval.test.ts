import {
  DEADLINE_SOON_SECONDS,
  buildRetrievalPlan,
  deadlineState,
  nextDeadline,
  tokenClaimKey,
  uniqueRounds,
  unretrievedTokenClaims,
} from '../allocationRetrieval';

describe('uniqueRounds', () => {
  it('lists each cycle once, ascending, and drops anything that is not a cycle number', () => {
    expect(uniqueRounds([7, 5, 7, null, -1, 5.5, undefined, 0, Number.NaN])).toEqual([0, 5, 7]);
  });
});

describe('tokenClaimKey', () => {
  it('ignores the address case, so the row and the retrieval agree', () => {
    expect(tokenClaimKey(3, '0xAbC')).toBe(tokenClaimKey(3, '0xabc'));
    expect(tokenClaimKey(3, '0xabc')).not.toBe(tokenClaimKey(4, '0xabc'));
  });
});

describe('unretrievedTokenClaims', () => {
  it('keeps the tokens still waiting, with raw base-unit amounts', () => {
    expect(
      unretrievedTokenClaims([
        { RoundNum: 0, TokenAddr: '0xA', DonateClaimDiff: '1999999999999999988000' },
        { RoundNum: 1, TokenAddr: '0xB', Amount: '5', Claimed: true },
        { RoundNum: 2, TokenAddr: '', Amount: '7' },
      ]),
    ).toEqual([{ roundNum: 0, tokenAddress: '0xA', amount: '1999999999999999988000' }]);
  });
});

describe('buildRetrievalPlan', () => {
  it('gathers every waiting item into one withdrawEverything call', () => {
    const plan = buildRetrievalPlan({
      deposits: [
        { RoundNum: 2, Amount: 0.5 },
        { RoundNum: 2, Amount: 0.25 },
        { RoundNum: 1, Amount: 1, Claimed: true },
        { RoundNum: 3, Amount: 0.125 },
      ],
      nfts: [
        { Index: 9, RoundNum: 4 },
        { Index: 4, RoundNum: 2 },
        { Index: 9, RoundNum: 4 },
      ],
      tokens: [{ RoundNum: 5, TokenAddr: '0xT', Amount: '10' }],
    });

    expect(plan.ethRounds).toEqual([2, 3]);
    expect(plan.ethAmount).toBeCloseTo(0.875);
    expect(plan.nftIndexes).toEqual([4, 9]);
    expect(plan.tokenClaims).toEqual([{ roundNum: 5, tokenAddress: '0xT', amount: '10' }]);
    expect(plan.rounds).toEqual([2, 3, 4, 5]);
    expect(plan.isEmpty).toBe(false);
  });

  it('reports an unreadable amount as unknown rather than a smaller total', () => {
    const plan = buildRetrievalPlan({
      deposits: [{ RoundNum: 2, Amount: 0.5 }, { RoundNum: 3 }],
      nfts: [],
      tokens: [],
    });
    expect(plan.ethAmount).toBeNull();
    expect(plan.ethRounds).toEqual([2, 3]);
  });

  it('is empty when nothing waits in PrizesWallet', () => {
    const plan = buildRetrievalPlan({
      deposits: [{ RoundNum: 1, Amount: 1, Claimed: true }],
      nfts: [],
      tokens: [{ RoundNum: 1, TokenAddr: '0xT', Amount: '1', Claimed: true }],
    });
    expect(plan).toMatchObject({ isEmpty: true, ethAmount: 0, rounds: [] });
  });
});

describe('deadlineState', () => {
  const now = 1_800_000_000;

  it('is unknown until both the deadline and the clock are known', () => {
    expect(deadlineState(undefined, now)).toBe('unknown');
    expect(deadlineState(0, now)).toBe('unknown');
    expect(deadlineState(now + 10, 0)).toBe('unknown');
  });

  it('turns to soon inside the last week and to expired once passed', () => {
    expect(deadlineState(now + DEADLINE_SOON_SECONDS + 1, now)).toBe('open');
    expect(deadlineState(now + DEADLINE_SOON_SECONDS, now)).toBe('soon');
    expect(deadlineState(now, now)).toBe('expired');
    expect(deadlineState(now - 1, now)).toBe('expired');
  });
});

describe('nextDeadline', () => {
  const now = 1_000;

  it('is the earliest deadline still ahead', () => {
    expect(nextDeadline([3_000, 2_000, undefined, 500], now)).toBe(2_000);
  });

  it('falls back to the most recent one that passed, then to null', () => {
    expect(nextDeadline([200, 900], now)).toBe(900);
    expect(nextDeadline([undefined, null, 0], now)).toBeNull();
  });
});
