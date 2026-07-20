import { assertSuccessfulTransactionReceipt, assertTransactionHash } from '../transactions';

describe('assertSuccessfulTransactionReceipt', () => {
  it('accepts a successful receipt', () => {
    expect(() => assertSuccessfulTransactionReceipt({ status: 'success' })).not.toThrow();
  });

  it('rejects a reverted receipt', () => {
    expect(() =>
      assertSuccessfulTransactionReceipt({
        status: 'reverted',
        transactionHash: '0xdeadbeef',
      }),
    ).toThrow('Transaction 0xdeadbeef reverted.');
  });

  it('rejects a missing receipt', () => {
    expect(() => assertSuccessfulTransactionReceipt(undefined)).toThrow(
      'Transaction receipt was unavailable.',
    );
  });
});

describe('assertTransactionHash', () => {
  it('accepts a transaction hash', () => {
    expect(() => assertTransactionHash('0xabc')).not.toThrow();
  });

  it('rejects an absent transaction hash', () => {
    expect(() => assertTransactionHash(undefined)).toThrow(
      'Contract write returned no transaction hash.',
    );
  });
});
