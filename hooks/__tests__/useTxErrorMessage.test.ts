import { renderHook } from '@testing-library/react';

import type { TxErrorInfo, TxErrorKind } from '@/lib/txErrors';

import { useTxErrorMessage } from '../useTxErrorMessage';

function info(kind: TxErrorKind): TxErrorInfo {
  return { kind, name: null, contractErrorName: null, details: '' };
}

describe('useTxErrorMessage', () => {
  it.each<[TxErrorKind, string]>([
    ['rejected', 'toasts.walletTransactionCancelled'],
    ['insufficient-funds', 'toasts.tx.error.insufficientFunds(network=Arbitrum Sepolia)'],
    ['wrong-network', 'toasts.tx.error.wrongNetwork(network=Arbitrum Sepolia)'],
    ['wallet-not-connected', 'toasts.tx.error.walletNotConnected'],
    ['wallet-busy', 'toasts.tx.error.walletBusy'],
    ['reverted', 'toasts.tx.error.reverted'],
    ['timeout', 'toasts.tx.error.timeout(explorer=Arbiscan)'],
    ['network', 'toasts.tx.error.network'],
  ])('explains %s with a cause-plus-next-step sentence', (kind, expected) => {
    const { result } = renderHook(() => useTxErrorMessage());
    expect(result.current(info(kind), 'Action fallback')).toBe(expected);
  });

  it('prefers the action-specific sentence for unnamed causes and bare reverts', () => {
    const { result } = renderHook(() => useTxErrorMessage());
    expect(result.current(info('unknown'), 'Retrieve did not go through.')).toBe(
      'Retrieve did not go through.',
    );
    expect(result.current(info('would-revert'), 'Retrieve did not go through.')).toBe(
      'Retrieve did not go through.',
    );
  });

  it('falls back to the generic sentences without one', () => {
    const { result } = renderHook(() => useTxErrorMessage());
    expect(result.current(info('unknown'))).toBe('toasts.generic.rpcFailure');
    expect(result.current(info('would-revert'))).toBe('toasts.tx.error.wouldRevert');
  });
});
