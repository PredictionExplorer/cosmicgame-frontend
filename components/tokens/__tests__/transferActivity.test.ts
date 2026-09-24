import {
  classifyTransfer,
  countByActivity,
  movesInDirection,
  sumCstTransfers,
  transferWei,
} from '../transferActivity';

const ME = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';
const OTHER = '0x1Ec14aDaf61e27AB339bc590BA4Bf2356Dd7E990';
const ZERO = '0x0000000000000000000000000000000000000000';
const WEI = 1_000_000_000_000_000_000n;

describe('classifyTransfer', () => {
  it('reads a transfer from the zero address as imprinted, with no counterparty', () => {
    expect(classifyTransfer(ZERO, ME, ME)).toEqual({
      activity: 'imprinted',
      counterparty: null,
      self: false,
    });
  });

  it('reads a transfer to the zero address as consumed, with no counterparty', () => {
    expect(classifyTransfer(ME, ZERO, ME)).toEqual({
      activity: 'consumed',
      counterparty: null,
      self: false,
    });
  });

  it('names the other side of an ordinary transfer, in any letter case', () => {
    expect(classifyTransfer(OTHER, ME.toLowerCase(), ME)).toEqual({
      activity: 'received',
      counterparty: OTHER,
      self: false,
    });
    expect(classifyTransfer(ME.toLowerCase(), OTHER, ME)).toEqual({
      activity: 'sent',
      counterparty: OTHER,
      self: false,
    });
  });

  it('marks a transfer to itself, which moves value both ways', () => {
    const self = classifyTransfer(ME.toLowerCase(), ME, ME);
    expect(self).toEqual({ activity: 'sent', counterparty: ME, self: true });
    expect(movesInDirection(self, 'in')).toBe(true);
    expect(movesInDirection(self, 'out')).toBe(true);
    expect(movesInDirection(classifyTransfer(OTHER, ME, ME), 'out')).toBe(false);
  });
});

describe('transferWei', () => {
  it('prefers the exact wei string over the float', () => {
    expect(transferWei('176768030409476485098', 176.77)).toBe(176_768_030_409_476_485_098n);
  });

  it('falls back to the float, and to null when there is no amount', () => {
    expect(transferWei(undefined, 1.5)).toBe(1_500_000_000_000_000_000n);
    expect(transferWei('not a number', undefined)).toBeNull();
  });
});

describe('sumCstTransfers', () => {
  it('counts imprinted CST as received and consumed CST as sent, exactly', () => {
    const totals = sumCstTransfers([
      { activity: 'imprinted', wei: 10n * WEI },
      { activity: 'received', wei: 5n * WEI },
      { activity: 'sent', wei: 3n * WEI },
      { activity: 'consumed', wei: 20n * WEI },
      { activity: 'received', wei: null },
    ]);
    expect(totals).toEqual({
      received: 15n * WEI,
      imprinted: 10n * WEI,
      sent: 23n * WEI,
      consumed: 20n * WEI,
      net: -8n * WEI,
    });
  });
});

describe('sumCstTransfers with a self-transfer', () => {
  it('counts it as received and sent, leaving the net unchanged (regression)', () => {
    // A self-transfer read only as sent, understating received and the net.
    const totals = sumCstTransfers([
      { activity: 'received', wei: 5n * WEI },
      { activity: 'sent', wei: 2n * WEI, self: true },
    ]);
    expect(totals).toEqual({
      received: 7n * WEI,
      imprinted: 0n,
      sent: 2n * WEI,
      consumed: 0n,
      net: 5n * WEI,
    });
  });
});

describe('countByActivity', () => {
  it('counts a self-transfer as received and sent', () => {
    expect(countByActivity([{ activity: 'sent', self: true }])).toEqual({
      imprinted: 0,
      received: 1,
      sent: 1,
      consumed: 0,
    });
  });

  it('counts rows per activity', () => {
    expect(
      countByActivity([{ activity: 'imprinted' }, { activity: 'sent' }, { activity: 'imprinted' }]),
    ).toEqual({ imprinted: 2, received: 0, sent: 1, consumed: 0 });
  });
});
