import type { AbiFunction } from 'viem';

import {
  GESTURE_CST_REWARD_AMOUNT_MIN_LIMIT_V2,
  gestureArgsForV2,
  isUnrecognizedSelectorError,
  normalizeV1GestureArgs,
  pickGestureWriteAbi,
  preferV2GestureArgsFirst,
  readCosmicGameWithFallback,
  withGestureArgsV1ThenV2,
} from '../cosmicGameContractCompat';

describe('cosmicGameContractCompat', () => {
  const selectorError = new Error(
    'The contract function "cstRewardAmountForBidding" reverted: function selector was not recognized',
  );

  test('isUnrecognizedSelectorError detects viem selector failures', () => {
    expect(isUnrecognizedSelectorError(selectorError)).toBe(true);
    expect(
      isUnrecognizedSelectorError(
        new Error(
          "[From http://127.0.0.1:8545] Error: Transaction reverted: function selector was not recognized and there's no fallback function",
        ),
      ),
    ).toBe(true);
    expect(isUnrecognizedSelectorError(new Error('insufficient funds'))).toBe(false);
  });

  test('normalizeV1GestureArgs coerces randomWalk id to bigint', () => {
    expect(normalizeV1GestureArgs('bidWithEth', [-1, 'hello'])).toEqual([-1n, 'hello']);
  });

  test('pickGestureWriteAbi selects overload by argument count', () => {
    const v1 = pickGestureWriteAbi('bidWithEth', [-1n, 'hello']);
    const v2 = pickGestureWriteAbi('bidWithEth', [-1n, 'hello', 0n]);
    expect(v1).toHaveLength(1);
    expect(v2).toHaveLength(1);
    expect((v1[0] as AbiFunction).inputs?.length).toBe(2);
    expect((v2[0] as AbiFunction).inputs?.length).toBe(3);
  });

  test('readCosmicGameWithFallback tries later readers after selector errors', async () => {
    const result = await readCosmicGameWithFallback<bigint>([
      async () => {
        throw selectorError;
      },
      async () => 130n * 10n ** 18n,
    ]);
    expect(result).toBe(130n * 10n ** 18n);
  });

  test('gestureArgsForV2 inserts min limit after message', () => {
    expect(gestureArgsForV2('bidWithEth', [-1, 'hello'])).toEqual([
      -1,
      'hello',
      GESTURE_CST_REWARD_AMOUNT_MIN_LIMIT_V2,
    ]);
    expect(gestureArgsForV2('bidWithEthAndDonateToken', [-1, 'hello', '0xabc', 123n])).toEqual([
      -1,
      'hello',
      GESTURE_CST_REWARD_AMOUNT_MIN_LIMIT_V2,
      '0xabc',
      123n,
    ]);
  });

  test('withGestureArgsV1ThenV2 retries with V2 args on selector error', async () => {
    const calls: unknown[][] = [];
    const result = await withGestureArgsV1ThenV2('bidWithCst', [100n, 'msg'], async (args) => {
      calls.push([...args]);
      if (args.length === 2) throw selectorError;
      return '0xok';
    });
    expect(result).toBe('0xok');
    const expectedV2 = [100n, 'msg', GESTURE_CST_REWARD_AMOUNT_MIN_LIMIT_V2];
    if (preferV2GestureArgsFirst()) {
      expect(calls).toEqual([expectedV2, [100n, 'msg']]);
    } else {
      expect(calls).toEqual([[100n, 'msg'], expectedV2]);
    }
  });
});
