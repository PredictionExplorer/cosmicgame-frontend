import type { AbiFunction } from 'viem';

import {
  GESTURE_CST_REWARD_AMOUNT_MIN_LIMIT_V2,
  gestureArgsForV2,
  isMissingFunctionReadError,
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

  /**
   * The nested error shape viem produces when `readContract` hits a revert: an outer
   * ContractFunctionExecutionError whose cause is a ContractFunctionRevertedError. On an
   * empty-data revert (missing selector behind the UUPS proxy on live geth/Arbitrum
   * nodes) the inner error carries no reason, signature, or data, and both messages are
   * just `The contract function "x" reverted.` — no Hardhat-style marker text.
   */
  function makeViemRevertError(
    fields: { reason?: string; signature?: string; data?: unknown; raw?: string } = {},
  ) {
    const detail = fields.reason ? ` with the following reason:\n${fields.reason}` : '.';
    const reverted = Object.assign(
      new Error(`The contract function "mainPrizeNumCosmicSignatureNfts" reverted${detail}`),
      { name: 'ContractFunctionRevertedError', ...fields },
    );
    return Object.assign(
      new Error(
        `The contract function "mainPrizeNumCosmicSignatureNfts" reverted${detail}\n\n` +
          'Contract Call:\n  address:   0x6a714Ae7B5b6eA520F6BCA23d2E609C4Fd5863F2\n' +
          '  function:  mainPrizeNumCosmicSignatureNfts()',
        { cause: reverted },
      ),
      { name: 'ContractFunctionExecutionError' },
    );
  }

  // Regression: this shape was reported on every production page load when the V3
  // detection probe in useGestureForm ran against the live V2 contract.
  test('isMissingFunctionReadError treats a reasonless live-node revert as selector absent', () => {
    expect(isMissingFunctionReadError(makeViemRevertError())).toBe(true);
    expect(isMissingFunctionReadError(makeViemRevertError({ raw: '0x' }))).toBe(true);
  });

  test('isMissingFunctionReadError keeps reporting reverts that carry a reason or data', () => {
    expect(isMissingFunctionReadError(makeViemRevertError({ reason: 'RoundIsInactive' }))).toBe(
      false,
    );
    expect(
      isMissingFunctionReadError(
        makeViemRevertError({ data: { errorName: 'RoundIsInactive', args: [] } }),
      ),
    ).toBe(false);
    expect(isMissingFunctionReadError(new Error('insufficient funds'))).toBe(false);
  });

  test('isMissingFunctionReadError still accepts Hardhat-style reasonless reverts', () => {
    expect(
      isMissingFunctionReadError(new Error('Transaction reverted without a reason string')),
    ).toBe(true);
    expect(
      isMissingFunctionReadError(
        new Error('The contract function "x" returned no data ("0x")', {
          cause: new Error('call revert exception'),
        }),
      ),
    ).toBe(true);
  });

  test('normalizeV1GestureArgs coerces randomWalk id to bigint', () => {
    expect(normalizeV1GestureArgs('bidWithEth', [-1, 'hello'])).toEqual([-1n, 'hello']);
  });

  test('pickGestureWriteAbi selects overload by argument count', () => {
    const v1 = pickGestureWriteAbi('bidWithEth', [-1n, 'hello']);
    const v2 = pickGestureWriteAbi('bidWithEth', [-1n, 'hello', 0n]);
    // Exactly one function fragment (the matched overload) — the rest are error
    // definitions carried along so custom revert reasons decode into readable text.
    const v1Functions = v1.filter((item) => item.type === 'function');
    const v2Functions = v2.filter((item) => item.type === 'function');
    expect(v1Functions).toHaveLength(1);
    expect(v2Functions).toHaveLength(1);
    expect((v1Functions[0] as AbiFunction).inputs?.length).toBe(2);
    expect((v2Functions[0] as AbiFunction).inputs?.length).toBe(3);
    expect(v1.some((item) => item.type === 'error' && item.name === 'RoundIsInactive')).toBe(true);
    expect(v1.every((item) => item.type !== 'event')).toBe(true);
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

  test('gestureArgsForV2 accepts a dynamic min limit', () => {
    expect(gestureArgsForV2('bidWithCst', [100n, 'msg'], 42n)).toEqual([100n, 'msg', 42n]);
  });

  test('withGestureArgsV1ThenV2 retries with V2 args on selector error', async () => {
    const calls: unknown[][] = [];
    const result = await withGestureArgsV1ThenV2(
      'bidWithCst',
      [100n, 'msg'],
      async (args) => {
        calls.push([...args]);
        if (args.length === 2) throw selectorError;
        return '0xok';
      },
      { preferV2First: false },
    );
    expect(result).toBe('0xok');
    const expectedV2 = [100n, 'msg', GESTURE_CST_REWARD_AMOUNT_MIN_LIMIT_V2];
    expect(calls).toEqual([[100n, 'msg'], expectedV2]);
  });

  test('withGestureArgsV1ThenV2 can prefer V2 args with a dynamic min limit', async () => {
    const calls: unknown[][] = [];
    const result = await withGestureArgsV1ThenV2(
      'bidWithCst',
      [100n, 'msg'],
      async (args) => {
        calls.push([...args]);
        return '0xok';
      },
      { cstRewardAmountMinLimit: 99n, preferV2First: true },
    );
    expect(result).toBe('0xok');
    expect(calls).toEqual([[100n, 'msg', 99n]]);
    expect(preferV2GestureArgsFirst()).toBe(true);
  });
});
