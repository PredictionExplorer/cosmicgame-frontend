/**
 * A stand-in for `useTxFlow` in tests of hooks that BUILD transactions
 * (useClaimAllocations, useAnchorActions, useGestureForm…). It runs the same
 * option callbacks in the same order as the real flow — prepare, approvals
 * that are still needed, write, onConfirmed, successMessage — without the
 * chain guard, receipts or toasts, which `useTxFlow.test.tsx` covers.
 *
 *   const mockTx = createFakeTxFlow();
 *   jest.mock('../useTxFlow', () => ({ useTxFlow: () => mockTx.flow }));
 *   …
 *   expect(mockTx.lastSuccessMessage()).toBe('toasts.claim.nftSuccess');
 */
import type { TransactionReceipt } from 'viem';

import type { TxContext, TxResult, TxRunOptions, UseTxFlowResult } from '@/hooks/useTxFlow';
import { classifyTxError } from '@/lib/txErrors';

export interface FakeTxFlow {
  flow: UseTxFlowResult;
  /** `ctx.writeContract` handed to the callbacks. */
  writeContract: jest.Mock;
  /** `ctx.sendTransaction` (plain ETH sends) handed to the callbacks. */
  sendTransaction: jest.Mock;
  /** Every `run` call's options, in order. */
  runs: TxRunOptions[];
  /** Receipt the fake "mines" (override `logs` to test receipt parsing). */
  receipt: TransactionReceipt;
  /** The success copy the flow would toast for the last confirmed run. */
  lastSuccessMessage: () => string | null | undefined;
  /** The failure copy the flow would toast for the last failed run. */
  lastFailureMessage: () => string | null | undefined;
  /** Approvals the last run actually sent (their descriptions). */
  sentApprovals: () => string[];
  reset: () => void;
}

export function createFakeTxFlow(account: `0x${string}` = '0xUser' as `0x${string}`): FakeTxFlow {
  const writeContract = jest.fn(async () => '0xctxhash' as `0x${string}`);
  const sendTransaction = jest.fn(async () => '0xsendhash' as `0x${string}`);
  const state: {
    success: string | null | undefined;
    failure: string | null | undefined;
    approvals: string[];
  } = { success: undefined, failure: undefined, approvals: [] };

  const fake: FakeTxFlow = {
    writeContract,
    sendTransaction,
    runs: [],
    receipt: {
      status: 'success',
      transactionHash: '0xreceipt',
      logs: [],
    } as unknown as TransactionReceipt,
    lastSuccessMessage: () => state.success,
    lastFailureMessage: () => state.failure,
    sentApprovals: () => state.approvals,
    reset: () => {
      fake.runs.length = 0;
      state.success = undefined;
      state.failure = undefined;
      state.approvals = [];
      writeContract.mockClear();
      sendTransaction.mockClear();
      run.mockClear();
    },
    flow: undefined as unknown as UseTxFlowResult,
  };

  const run = jest.fn(async (options: TxRunOptions): Promise<TxResult> => {
    fake.runs.push(options);
    state.success = undefined;
    state.failure = undefined;
    state.approvals = [];
    const ctx = { account, writeContract, sendTransaction } as unknown as TxContext;
    try {
      if (options.prepare && (await options.prepare(ctx)) === false) return { status: 'aborted' };
      for (const approval of options.approvals ?? []) {
        if (!approval.isNeeded || (await approval.isNeeded(ctx))) {
          await approval.write(ctx);
          state.approvals.push(approval.description);
        }
      }
      const hash = await options.write(ctx);
      const receipt = { ...fake.receipt, transactionHash: hash } as TransactionReceipt;
      // Like the real flow, nothing after confirmation turns it into a failure.
      try {
        await options.onConfirmed?.(receipt, ctx);
        state.success =
          typeof options.successMessage === 'function'
            ? await options.successMessage(receipt)
            : options.successMessage;
      } catch {
        state.success = 'toasts.tx.confirmedRefresh';
      }
      return { status: 'confirmed', hash, receipt };
    } catch (err) {
      const info = classifyTxError(err);
      if (info.kind === 'rejected') return { status: 'cancelled' };
      state.failure = options.describeError?.(err, info) ?? options.failureMessage ?? null;
      return { status: 'failed', error: info };
    }
  });

  fake.flow = { stage: { status: 'idle' }, isBusy: false, run, reset: jest.fn() };
  return fake;
}
