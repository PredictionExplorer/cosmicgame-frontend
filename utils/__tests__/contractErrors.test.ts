import { getContractErrorDescriptor, getContractErrorMessage } from '../contractErrors';

function makeRevertError(errorName: string, args: readonly unknown[]): Error {
  const reverted = Object.assign(new Error(errorName), {
    name: 'ContractFunctionRevertedError',
    data: { errorName, args },
  });
  return Object.assign(new Error('execution reverted'), {
    name: 'ContractFunctionExecutionError',
    walk: (predicate: (e: Error) => boolean) => (predicate(reverted) ? reverted : null),
  });
}

describe('contractErrors', () => {
  it('explains CST gesture cost changes from InsufficientReceivedBidAmount', () => {
    const err = makeRevertError('InsufficientReceivedBidAmount', [
      'gesture cost changed',
      1500000000000000000n,
      1000000000000000000n,
    ]);

    expect(
      getContractErrorMessage(err, {
        gestureCurrency: 'CST',
        displayedPriceWei: 1000000000000000000n,
      }),
    ).toBe(
      'CST Gesture Cost changed while your transaction was in transit, likely because another gesture landed first. The contract required 1.500000 CST, above your 1.000000 CST maximum. Refresh and try again.',
    );
  });

  it('keeps ETH gesture cost wording for existing callers', () => {
    const err = makeRevertError('InsufficientReceivedBidAmount', [
      'gesture cost changed',
      1500000000000000000n,
      1000000000000000000n,
    ]);

    expect(getContractErrorMessage(err, 1)).toBe(
      'Gesture Cost rose by 0.500000 ETH while your transaction was in transit. The new required cost is 1.500000 ETH. Please try again.',
    );
  });

  it('returns ICU values for localized dynamic CST cost changes', () => {
    const err = makeRevertError('InsufficientReceivedBidAmount', [
      'gesture cost changed',
      1500000000000000000n,
      1000000000000000000n,
    ]);

    expect(
      getContractErrorDescriptor(err, {
        gestureCurrency: 'CST',
        displayedPriceWei: 1000000000000000000n,
      }),
    ).toEqual({
      key: 'gesture.contractErrors.cstCostChanged',
      values: { required: '1.500000', maximum: '1.000000' },
      errorName: 'InsufficientReceivedBidAmount',
    });
  });

  it('maps known finalize reverts to localized toast keys', () => {
    const err = makeRevertError('MainPrizeEarlyClaim', []);
    expect(getContractErrorDescriptor(err)).toEqual({
      key: 'finalize.contractErrors.mainPrizeEarlyClaim',
      errorName: 'MainPrizeEarlyClaim',
    });
  });

  it('keeps unknown custom errors out of user-facing descriptors', () => {
    expect(getContractErrorDescriptor(makeRevertError('UnknownCustomError', []))).toBeNull();
  });
});
