import type { CTPriceInfo } from '@/services/api/types';

import {
  deriveLiveCstGestureData,
  formatCstProgressPercent,
  getCstAuctionProgress,
  mapCTPriceInfo,
} from '../cstGesture';

describe('cstGesture utilities', () => {
  it('maps API price info into finite CST gesture data', () => {
    const result = mapCTPriceInfo({
      AuctionDuration: '43200',
      CSTPrice: '1500000000000000000',
      SecondsElapsed: '1200',
    });

    expect(result).toMatchObject({
      AuctionDuration: 43200,
      CSTPrice: 1.5,
      CSTPriceWei: 1500000000000000000n,
      SecondsElapsed: 1200,
      isFree: false,
      source: 'api',
      timingAvailable: true,
    });
  });

  it('uses contract durations when supplied', () => {
    const result = mapCTPriceInfo(
      {
        AuctionDuration: '3600',
        CSTPrice: '1500000000000000000',
        SecondsElapsed: '1200',
      },
      { AuctionDuration: 43200, SecondsElapsed: 1800 },
    );

    expect(result).toMatchObject({
      AuctionDuration: 43200,
      SecondsElapsed: 1800,
      apiAuctionDuration: 3600,
      apiSecondsElapsed: 1200,
      source: 'contract',
    });
  });

  it('keeps contract-backed dynamic durations distinct from stale API values', () => {
    const result = mapCTPriceInfo(
      {
        AuctionDuration: '43200',
        CSTPrice: '2500000000000000000',
        SecondsElapsed: '1200',
      },
      { AuctionDuration: 5400, SecondsElapsed: 2700 },
    );

    expect(result).toMatchObject({
      AuctionDuration: 5400,
      SecondsElapsed: 2700,
      apiAuctionDuration: 43200,
      apiSecondsElapsed: 1200,
      CSTPrice: 2.5,
      source: 'contract',
    });
  });

  it('uses live contract CST price when supplied', () => {
    const result = mapCTPriceInfo(
      {
        AuctionDuration: '43200',
        CSTPrice: '2500000000000000000',
        SecondsElapsed: '1200',
      },
      { AuctionDuration: 5400, SecondsElapsed: 2700, updatedAtMs: 10_000 },
      1500000000000000000n,
    );

    expect(result).toMatchObject({
      AuctionDuration: 5400,
      SecondsElapsed: 2700,
      CSTPrice: 1.5,
      CSTPriceWei: 1500000000000000000n,
      source: 'contract',
      updatedAtMs: 10_000,
    });
  });

  it('can render contract-backed CST values before API data arrives', () => {
    const result = mapCTPriceInfo(
      null,
      { AuctionDuration: 5400, SecondsElapsed: 2700, updatedAtMs: 10_000 },
      1500000000000000000n,
    );

    expect(result).toMatchObject({
      AuctionDuration: 5400,
      SecondsElapsed: 2700,
      CSTPrice: 1.5,
      CSTPriceWei: 1500000000000000000n,
      source: 'contract',
      updatedAtMs: 10_000,
      isFree: false,
    });
  });

  it('marks CST as free when price is zero', () => {
    const result = mapCTPriceInfo({
      AuctionDuration: '43200',
      CSTPrice: '0',
      SecondsElapsed: '1200',
    });

    expect(result.isFree).toBe(true);
  });

  it('keeps a duration-only contract snapshot unpriced until a price arrives', () => {
    const durations = { AuctionDuration: 5400, SecondsElapsed: 6000, updatedAtMs: 10_000 };
    const pending = mapCTPriceInfo(undefined, durations);

    expect(pending).toMatchObject({
      ...durations,
      source: 'empty',
      isFree: false,
      timingAvailable: true,
    });
    expect(deriveLiveCstGestureData(pending, { nowMs: 15_000 })).toMatchObject({
      source: 'empty',
      isFree: false,
    });
    expect(mapCTPriceInfo(undefined, durations, 0n)).toMatchObject({
      CSTPriceWei: 0n,
      source: 'contract',
      isFree: true,
    });
  });

  it.each([0n, 20n * 10n ** 18n])(
    'keeps quote-only timing unavailable for a confirmed price of %s',
    (price) => {
      expect(mapCTPriceInfo(null, null, price)).toMatchObject({
        source: 'contract',
        CSTPriceWei: price,
        timingAvailable: false,
      });
    },
  );

  it('distinguishes a missing sample from a confirmed zero-duration window', () => {
    expect(mapCTPriceInfo(null).timingAvailable).toBe(false);
    expect(
      mapCTPriceInfo({ AuctionDuration: '0', SecondsElapsed: '0', CSTPrice: '0' }),
    ).toMatchObject({
      timingAvailable: true,
      AuctionDuration: 0,
      SecondsElapsed: 0,
    });
    expect(mapCTPriceInfo(null, { AuctionDuration: 0, SecondsElapsed: 0 })).toMatchObject({
      timingAvailable: true,
      source: 'empty',
      isFree: false,
    });
  });

  it.each([
    { AuctionDuration: '3600', SecondsElapsed: undefined },
    { AuctionDuration: undefined, SecondsElapsed: '60' },
    { AuctionDuration: '', SecondsElapsed: '60' },
    { AuctionDuration: '3600ms', SecondsElapsed: '60' },
    { AuctionDuration: '3600', SecondsElapsed: '-1' },
    { AuctionDuration: '3600', SecondsElapsed: '1.5' },
  ])('does not promote malformed or missing API timing to a real window: %j', (timing) => {
    const result = mapCTPriceInfo({ ...timing, CSTPrice: '20000000000000000000' } as CTPriceInfo);
    expect(result).toMatchObject({ source: 'api', CSTPrice: 20, timingAvailable: false });
    expect(result.AuctionDuration).toBe(0);
    expect(result.SecondsElapsed).toBe(0);
  });

  it.each([
    { AuctionDuration: Number.NaN, SecondsElapsed: 60 },
    { AuctionDuration: 3600, SecondsElapsed: Number.POSITIVE_INFINITY },
    { AuctionDuration: 3600, SecondsElapsed: -1 },
    { AuctionDuration: 3600, SecondsElapsed: 1.5 },
  ])('rejects malformed contract timing without discarding a valid price: %j', (timing) => {
    expect(mapCTPriceInfo(null, timing, 20n * 10n ** 18n)).toMatchObject({
      source: 'contract',
      CSTPrice: 20,
      timingAvailable: false,
    });
  });

  it('uses the coherent API pair when a contract timing read is invalid', () => {
    const result = mapCTPriceInfo(
      { AuctionDuration: '3600', SecondsElapsed: '900', CSTPrice: '20000000000000000000' },
      { AuctionDuration: Number.NaN, SecondsElapsed: 10, updatedAtMs: 10_000 },
    );
    expect(result).toMatchObject({
      timingAvailable: true,
      AuctionDuration: 3600,
      SecondsElapsed: 900,
      source: 'api',
    });
    expect(result.updatedAtMs).toBeUndefined();
  });

  it.each(['', ' ', '-1', 'invalid'])(
    'does not advertise a malformed price as free: %j',
    (price) => {
      const result = mapCTPriceInfo({
        AuctionDuration: '43200',
        CSTPrice: price,
        SecondsElapsed: '1200',
      });

      expect(result).toMatchObject({ source: 'empty', isFree: false });
    },
  );

  it('does not leak NaN when API fields are malformed', () => {
    const result = mapCTPriceInfo({
      AuctionDuration: 'bad',
      CSTPrice: 'not-a-bigint',
      SecondsElapsed: '',
    });

    expect(result.AuctionDuration).toBe(0);
    expect(result.SecondsElapsed).toBe(0);
    expect(result.CSTPrice).toBe(0);
    expect(result.CSTPriceWei).toBe(0n);
  });

  it('calculates calibration progress for dynamic durations', () => {
    expect(
      getCstAuctionProgress({
        AuctionDuration: 5400,
        SecondsElapsed: 1350,
      }),
    ).toMatchObject({
      auctionDuration: 5400,
      secondsElapsed: 1350,
      secondsRemaining: 4050,
      percentComplete: 25,
      percentCompleteRounded: 25,
      isEnded: false,
    });
  });

  it('keeps exact duration active while reporting 100% complete', () => {
    expect(
      getCstAuctionProgress({
        AuctionDuration: 5400,
        SecondsElapsed: 5400,
      }),
    ).toMatchObject({
      secondsRemaining: 0,
      percentComplete: 100,
      percentCompleteRounded: 100,
      isEnded: false,
    });
  });

  it('clamps over-duration progress and marks the window ended', () => {
    expect(
      getCstAuctionProgress({
        AuctionDuration: 5400,
        SecondsElapsed: 6000,
      }),
    ).toMatchObject({
      secondsRemaining: 0,
      percentComplete: 100,
      percentCompleteRounded: 100,
      isEnded: true,
    });
  });

  it('keeps malformed progress inputs finite and non-negative', () => {
    expect(
      getCstAuctionProgress({
        AuctionDuration: Number.NaN,
        SecondsElapsed: -100,
      }),
    ).toMatchObject({
      auctionDuration: 0,
      secondsElapsed: 0,
      secondsRemaining: 0,
      percentComplete: 0,
      percentCompleteRounded: 0,
      isEnded: false,
    });
  });

  it('derives live elapsed time from the last CST timing sample', () => {
    const result = deriveLiveCstGestureData(
      {
        AuctionDuration: 5400,
        CSTPrice: 1.5,
        CSTPriceWei: 1500000000000000000n,
        SecondsElapsed: 2700,
        isFree: false,
        source: 'contract',
        updatedAtMs: 10_000,
      },
      { nowMs: 13_400 },
    );

    expect(result.SecondsElapsed).toBe(2703);
    expect(result.isFree).toBe(false);
  });

  it('marks live CST display free after elapsed time passes the dynamic duration', () => {
    const result = deriveLiveCstGestureData(
      {
        AuctionDuration: 10,
        CSTPrice: 1.5,
        CSTPriceWei: 1500000000000000000n,
        SecondsElapsed: 9,
        isFree: false,
        source: 'contract',
        updatedAtMs: 10_000,
      },
      { nowMs: 12_000 },
    );

    expect(result.SecondsElapsed).toBe(11);
    expect(result.isFree).toBe(true);
  });

  it('leaves CST display unchanged when no timing sample exists', () => {
    const data = {
      AuctionDuration: 5400,
      CSTPrice: 1.5,
      CSTPriceWei: 1500000000000000000n,
      SecondsElapsed: 2700,
      isFree: false,
      source: 'api' as const,
    };

    expect(deriveLiveCstGestureData(data, { nowMs: 20_000 })).toBe(data);
  });

  it('formats compact progress with decimals only when useful', () => {
    expect(formatCstProgressPercent(0)).toBe('0%');
    expect(formatCstProgressPercent(50)).toBe('50%');
    expect(formatCstProgressPercent(50.25)).toBe('50.3%');
    expect(formatCstProgressPercent(100)).toBe('100%');
    expect(formatCstProgressPercent(Number.NaN)).toBe('0%');
  });
});
