import type { Abi } from 'viem';
// The real encoder (the `viem` entry is a jest mock).
import { encodeErrorResult, getContractError } from 'viem/utils';

import { cosmicGameAbi } from '@/contracts/abis';

import {
  contractErrorNameOf,
  extractRevertData,
  getContractErrorDescriptor,
  withDecodedContractError,
} from '../contractErrors';
import { pickGestureWriteAbi, SUPPLEMENTAL_ERROR_ABI } from '../cosmicGameContractCompat';

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
      values: { required: '1.5', maximum: '1' },
      errorName: 'InsufficientReceivedBidAmount',
    });
  });

  it('describes an ETH cost rise with the increase and the new cost', () => {
    expect(getContractErrorDescriptor(costRose(), 1)).toEqual({
      key: 'gesture.contractErrors.ethCostChanged',
      values: { increase: '0.5', required: '1.5' },
      errorName: 'InsufficientReceivedBidAmount',
    });
  });

  it("formats the amounts in the reader's locale, without padded zeros", () => {
    // Regression: a vi participant saw 0,10211 ETH in the form and
    // "0.102110 ETH" in the toast.
    const err = makeRevertError('InsufficientReceivedBidAmount', [
      'gesture cost changed',
      102110000000000000n,
      100000000000000000n,
    ]);
    expect(getContractErrorDescriptor(err, { displayedPrice: 0.1, locale: 'vi' })?.values).toEqual({
      increase: '0,00211',
      required: '0,10211',
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

/**
 * The errors viem really produces, not hand-built `data: { errorName }`
 * fixtures: a node's revert wrapped by `getContractError` against the ABI the
 * write was made with. Before the fix the gesture slice carried no error
 * definitions, so viem left `data` undefined and nothing was ever explained.
 */
describe('decoding what viem really throws for a gesture', () => {
  // The real viem (the `viem` entry is a jest mock); only its error classes.
  const viem = jest.requireActual<typeof import('viem')>('viem');

  function gestureRevert(abi: Abi, errorName: string, args: readonly unknown[]) {
    const data = encodeErrorResult({
      abi: [...(cosmicGameAbi as Abi), ...(SUPPLEMENTAL_ERROR_ABI as unknown as Abi)],
      errorName,
      args,
    } as unknown as Parameters<typeof encodeErrorResult>[0]);
    const rpcError = new viem.RawContractError({ data, message: 'execution reverted' });
    return getContractError(rpcError, {
      abi,
      functionName: 'bidWithEth',
      args: [-1n, '', 0n],
      address: '0x0000000000000000000000000000000000000001',
    });
  }

  it('names the custom error through the gesture ABI slice', () => {
    const err = gestureRevert(
      pickGestureWriteAbi('bidWithEth', [-1n, '', 0n]),
      'UsedRandomWalkNft',
      ['Used.', 7n],
    );
    expect(getContractErrorDescriptor(err)).toEqual({
      key: 'gesture.contractErrors.usedRandomWalkNft',
      errorName: 'UsedRandomWalkNft',
    });
    expect(contractErrorNameOf(err)).toBe('UsedRandomWalkNft');
  });

  it('explains the Participation CST floor revert, which the generated ABI lacks', () => {
    const err = gestureRevert(
      pickGestureWriteAbi('bidWithEth', [-1n, '', 0n]),
      'BidCstRewardAmountMinLimitNotReached',
      [5n, 6n],
    );
    expect(getContractErrorDescriptor(err)?.key).toBe(
      'gesture.contractErrors.cstRewardBelowMinimum',
    );
  });

  it('still decodes the raw revert data when the ABI used has no error definitions', () => {
    const functionOnly = pickGestureWriteAbi('bidWithEth', [-1n, '', 0n]).filter(
      (item) => item.type === 'function',
    );
    const err = gestureRevert(functionOnly, 'InsufficientReceivedBidAmount', [
      'cost changed',
      1_500_000_000_000_000_000n,
      1_000_000_000_000_000_000n,
    ]);
    expect(getContractErrorDescriptor(err, 1)).toEqual({
      key: 'gesture.contractErrors.ethCostChanged',
      values: { increase: '0.5', required: '1.5' },
      errorName: 'InsufficientReceivedBidAmount',
    });
  });

  it('reads Error(string) and Panic as no custom error', () => {
    const data = encodeErrorResult({
      abi: [{ type: 'error', name: 'Error', inputs: [{ name: 'message', type: 'string' }] }],
      errorName: 'Error',
      args: ['nope'],
    });
    const err = Object.assign(new Error('execution reverted'), { cause: { data } });
    expect(contractErrorNameOf(err)).toBeNull();
    expect(getContractErrorDescriptor(err)).toBeNull();
  });
});

/**
 * extractRevertData must recover the raw revert bytes from the places real
 * providers hide them, so formatCustomContractError can decode them against
 * the ABI. These shapes were all observed on live Arbitrum/Hardhat relays.
 */
describe('extractRevertData', () => {
  // ABI-encoded RoundIsInactive("The current bidding round is not active yet.", actTime, blockTs).
  const ROUND_INACTIVE_DATA =
    '0x16df8bd8' +
    '0000000000000000000000000000000000000000000000000000000000000060' +
    '0000000000000000000000000000000000000000000000000000000067f02202' +
    '0000000000000000000000000000000000000000000000000000000067f021c8' +
    '000000000000000000000000000000000000000000000000000000000000002c' +
    '5468652063757272656e742062696464696e6720726f756e64206973206e6f74' +
    '20616374697665207965742e0000000000000000000000000000000000000000';

  it('recovers revert bytes exposed via nested data (provider.data.data)', () => {
    const err = Object.assign(new Error('execution reverted'), {
      name: 'ContractFunctionExecutionError',
      cause: { data: { data: ROUND_INACTIVE_DATA } },
    });
    expect(extractRevertData(err)).toBe(ROUND_INACTIVE_DATA);
  });

  it('recovers revert bytes embedded only in the message text (Hardhat relay)', () => {
    const err = Object.assign(
      new Error(
        `RPC 0x7a69 Custom eth_sendRawTransaction: Error: VM Exception while processing ` +
          `transaction: reverted with an unrecognized custom error (return data: ${ROUND_INACTIVE_DATA})`,
      ),
      { name: 'ContractFunctionExecutionError' },
    );
    expect(extractRevertData(err)).toBe(ROUND_INACTIVE_DATA);
  });

  it('recovers revert bytes nested in a cause message (viem chain)', () => {
    const err = Object.assign(new Error('The contract function reverted.'), {
      name: 'ContractFunctionExecutionError',
      cause: Object.assign(new Error(`... (return data: ${ROUND_INACTIVE_DATA})`), {
        name: 'InternalRpcError',
      }),
    });
    expect(extractRevertData(err)).toBe(ROUND_INACTIVE_DATA);
  });
});
