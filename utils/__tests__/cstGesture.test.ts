import { mapCTPriceInfo } from '../cstGesture';

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
});
