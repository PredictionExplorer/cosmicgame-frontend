import { getCstAuctionProgress, mapCTPriceInfo } from '../cstGesture';

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

  it('marks CST as free when price is zero', () => {
    const result = mapCTPriceInfo({
      AuctionDuration: '43200',
      CSTPrice: '0',
      SecondsElapsed: '1200',
    });

    expect(result.isFree).toBe(true);
  });

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
});
