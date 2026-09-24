import type { Abi } from 'viem';
// The real encoder (the `viem` entry is a jest mock).
import { encodeErrorResult } from 'viem/utils';

import { cosmicGameAbi } from '@/contracts/abis';

import { getContractErrorDescriptor, withDecodedContractError } from '../contractErrors';

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

describe('getContractErrorDescriptor', () => {
  const costRose = () =>
    makeRevertError('InsufficientReceivedBidAmount', [
      'gesture cost changed',
      1500000000000000000n,
      1000000000000000000n,
    ]);

  it('returns ICU values for localized dynamic CST cost changes', () => {
    expect(
      getContractErrorDescriptor(costRose(), {
        gestureCurrency: 'CST',
        displayedPriceWei: 1000000000000000000n,
      }),
    ).toEqual({
      key: 'gesture.contractErrors.cstCostChanged',
      values: { required: '1.500000', maximum: '1.000000' },
      errorName: 'InsufficientReceivedBidAmount',
    });
  });

  it('describes an ETH cost rise with the increase and the new cost', () => {
    expect(getContractErrorDescriptor(costRose(), 1)).toEqual({
      key: 'gesture.contractErrors.ethCostChanged',
      values: { increase: '0.500000', required: '1.500000' },
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

type AbiError = Extract<Abi[number], { type: 'error' }>;

describe('withDecodedContractError', () => {
  const costError = (cosmicGameAbi as Abi).find(
    (item): item is AbiError =>
      item.type === 'error' && item.name === 'InsufficientReceivedBidAmount',
  );

  it('appends the decoded custom error with its named arguments', () => {
    if (!costError) throw new Error('InsufficientReceivedBidAmount is missing from the ABI');
    const args = costError.inputs.map((input) =>
      input.type === 'string' ? 'cost changed' : 7n,
    ) as readonly unknown[];
    const data = encodeErrorResult({
      abi: [costError],
      errorName: costError.name,
      args,
    } as unknown as Parameters<typeof encodeErrorResult>[0]);
    const err = Object.assign(new Error('execution reverted'), { cause: { data } });

    const details = withDecodedContractError('ContractFunctionExecutionError: reverted', err);

    expect(details.split('\n')[0]).toBe('ContractFunctionExecutionError: reverted');
    expect(details).toContain('CosmicSignatureErrors.InsufficientReceivedBidAmount(');
    for (const input of costError.inputs) {
      if (input.name) expect(details).toContain(`${input.name} = `);
    }
  });

  it('leaves the details alone when there is no revert data', () => {
    expect(withDecodedContractError('Error: offline', new Error('offline'))).toBe('Error: offline');
  });
});
