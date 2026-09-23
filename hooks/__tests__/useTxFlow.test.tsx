import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { toast } from 'sonner';
import { getConnectorClient, writeContract } from '@wagmi/core';
import { getChainId } from 'viem/actions';

import { WalletUiProvider } from '@/contexts/WalletUiContext';

import { useTxFlow, useTxStageLabel, type TxRunOptions, type TxStage } from '../useTxFlow';

jest.mock('sonner', () => ({
  toast: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    dismiss: jest.fn(),
  },
}));
jest.mock('viem/actions', () => ({ getChainId: jest.fn() }));
jest.mock('../../utils/errors', () => ({
  ...jest.requireActual('../../utils/errors'),
  reportError: jest.fn(),
}));

const APP_CHAIN = 421614;
const mockConfig = { id: 'config' };
let mockAddress: `0x${string}` | undefined = '0xUser';
const mockSwitchChainAsync = jest.fn();
const mockWaitForReceipt = jest.fn();

jest.mock('wagmi', () => ({
  useConfig: () => mockConfig,
  useAccount: () => ({ address: mockAddress, chainId: APP_CHAIN }),
  usePublicClient: () => ({ waitForTransactionReceipt: mockWaitForReceipt }),
  useSwitchChain: () => ({ switchChainAsync: mockSwitchChainAsync }),
}));

const mockToast = toast as unknown as Record<
  'loading' | 'success' | 'error' | 'info' | 'dismiss',
  jest.Mock
>;
const mockWriteContract = writeContract as jest.Mock;
const mockGetConnectorClient = getConnectorClient as jest.Mock;
const mockGetChainId = getChainId as jest.Mock;

const SIGN_REQUEST = { address: '0xContract', abi: [], functionName: 'doIt' } as const;

function baseOptions(overrides: Partial<TxRunOptions> = {}): TxRunOptions {
  return {
    write: (ctx) =>
      ctx.writeContract(SIGN_REQUEST as unknown as Parameters<typeof ctx.writeContract>[0]),
    successMessage: 'Done.',
    failureMessage: 'Action fallback.',
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAddress = '0xUser';
  mockGetConnectorClient.mockResolvedValue({ id: 'connector-client' });
  mockGetChainId.mockResolvedValue(APP_CHAIN);
  mockSwitchChainAsync.mockResolvedValue(undefined);
  mockWriteContract.mockResolvedValue('0xhash');
  mockWaitForReceipt.mockImplementation(async ({ hash }: { hash: string }) => ({
    status: 'success',
    transactionHash: hash,
    logs: [],
  }));
});

async function run(options: TxRunOptions, wrapper?: (props: { children: ReactNode }) => ReactNode) {
  const hook = renderHook(() => useTxFlow(), wrapper ? { wrapper } : undefined);
  let result: Awaited<ReturnType<typeof hook.result.current.run>> | undefined;
  await act(async () => {
    result = await hook.result.current.run(options);
  });
  return { hook, result: result! };
}

describe('useTxFlow — lifecycle', () => {
  it('writes on the app chain and walks one toast from signature to confirmed', async () => {
    const { hook, result } = await run(baseOptions());

    expect(result).toMatchObject({ status: 'confirmed', hash: '0xhash' });
    expect(mockWriteContract).toHaveBeenCalledWith(
      mockConfig,
      expect.objectContaining({ functionName: 'doIt', chainId: APP_CHAIN }),
    );

    const [firstLoading, secondLoading] = mockToast.loading.mock.calls;
    expect(firstLoading![0]).toBe('toasts.tx.stage.confirm');
    expect(secondLoading![0]).toBe('toasts.tx.stage.pending(network=Arbitrum Sepolia)');
    const toastId = firstLoading![1].id;
    expect(secondLoading![1].id).toBe(toastId);
    expect(mockToast.success).toHaveBeenCalledWith(
      'Done.',
      expect.objectContaining({ id: toastId, duration: 8000 }),
    );
    expect(hook.result.current.stage).toEqual({ status: 'confirmed', hash: '0xhash' });
    expect(hook.result.current.isBusy).toBe(false);
  });

  it('builds the success copy from the receipt and runs onConfirmed first', async () => {
    const order: string[] = [];
    await run(
      baseOptions({
        onConfirmed: () => {
          order.push('confirmed');
        },
        successMessage: (receipt) => {
          order.push('message');
          return `Mined ${receipt.transactionHash}`;
        },
      }),
    );
    expect(order).toEqual(['confirmed', 'message']);
    expect(mockToast.success).toHaveBeenCalledWith('Mined 0xhash', expect.anything());
  });

  it('closes the lifecycle toast when there is no success copy', async () => {
    await run(baseOptions({ successMessage: null }));
    expect(mockToast.success).not.toHaveBeenCalled();
    expect(mockToast.dismiss).toHaveBeenCalled();
  });

  it('sends needed approvals first and counts every wallet prompt', async () => {
    const approvalWrite = jest.fn().mockResolvedValue('0xapprove');
    const labels: string[] = [];
    const { hook } = await run(
      baseOptions({
        approvals: [
          { description: 'Why this prompt', write: approvalWrite },
          { description: 'Already done', isNeeded: async () => false, write: jest.fn() },
        ],
        write: async (ctx) => {
          labels.push(String(mockToast.loading.mock.calls.at(-1)![0]));
          return ctx.writeContract(
            SIGN_REQUEST as unknown as Parameters<typeof ctx.writeContract>[0],
          );
        },
      }),
    );

    expect(approvalWrite).toHaveBeenCalledTimes(1);
    expect(mockToast.loading).toHaveBeenCalledWith(
      'toasts.tx.stage.approve(step=1,total=2)',
      expect.objectContaining({ description: 'Why this prompt' }),
    );
    expect(mockWaitForReceipt).toHaveBeenCalledWith(expect.objectContaining({ hash: '0xapprove' }));
    expect(labels).toEqual(['toasts.tx.stage.confirmStep(step=2,total=2)']);
    expect(hook.result.current.stage.status).toBe('confirmed');
  });

  it('stops quietly when prepare says no', async () => {
    const { result, hook } = await run(baseOptions({ prepare: async () => false }));
    expect(result).toEqual({ status: 'aborted' });
    expect(mockWriteContract).not.toHaveBeenCalled();
    expect(mockToast.dismiss).toHaveBeenCalled();
    expect(hook.result.current.stage).toEqual({ status: 'idle' });
  });

  it('follows a sped-up transaction to its new hash', async () => {
    mockWaitForReceipt.mockImplementation(async ({ hash, onReplaced }) => {
      onReplaced?.({ reason: 'repriced', transaction: { hash: '0xfaster' } });
      return {
        status: 'success',
        transactionHash: hash === '0xhash' ? '0xfaster' : hash,
        logs: [],
      };
    });
    const { result } = await run(baseOptions());
    expect(result).toMatchObject({ status: 'confirmed', hash: '0xfaster' });
  });
});

describe('useTxFlow — chain guard', () => {
  it('asks the wallet to switch before anything else, then writes', async () => {
    mockGetChainId.mockResolvedValue(1);
    const { result } = await run(baseOptions());

    expect(mockSwitchChainAsync).toHaveBeenCalledWith({ chainId: APP_CHAIN });
    expect(mockToast.loading).toHaveBeenCalledWith(
      'toasts.tx.stage.switchNetwork(network=Arbitrum Sepolia)',
      expect.anything(),
    );
    expect(result.status).toBe('confirmed');
  });

  it('reads a declined switch as a cancellation', async () => {
    mockGetChainId.mockResolvedValue(1);
    mockSwitchChainAsync.mockRejectedValue({ code: 4001, message: 'User rejected' });
    const { result, hook } = await run(baseOptions());

    expect(result).toEqual({ status: 'cancelled' });
    expect(mockWriteContract).not.toHaveBeenCalled();
    expect(mockToast.info).toHaveBeenCalledWith(
      'toasts.walletTransactionCancelled',
      expect.anything(),
    );
    expect(hook.result.current.stage).toEqual({ status: 'cancelled' });
  });

  it('names the network when the wallet cannot switch', async () => {
    mockGetChainId.mockResolvedValue(1);
    mockSwitchChainAsync.mockRejectedValue(new Error('Unrecognized chain ID'));
    const { result } = await run(baseOptions());

    expect(result).toMatchObject({ status: 'failed', error: { kind: 'wrong-network' } });
    expect(mockToast.error).toHaveBeenCalledWith(
      'toasts.tx.error.wrongNetwork(network=Arbitrum Sepolia)',
      expect.anything(),
    );
  });
});

describe('useTxFlow — failures', () => {
  it('treats a dismissed wallet prompt as cancelled, not as an error', async () => {
    mockWriteContract.mockRejectedValue({ code: 4001, message: 'User rejected the request' });
    const { result } = await run(baseOptions());

    expect(result).toEqual({ status: 'cancelled' });
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('keeps a failure on screen with a localized sentence and a Copy details action', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    mockWriteContract.mockRejectedValue(new Error('provider exploded: {"raw":"…"}'));
    const { result, hook } = await run(baseOptions());

    expect(result).toMatchObject({ status: 'failed', error: { kind: 'unknown' } });
    const [message, options] = mockToast.error.mock.calls[0]!;
    expect(message).toBe('Action fallback.');
    expect(options.duration).toBe(Number.POSITIVE_INFINITY);
    expect(options.action.label).toBe('toasts.tx.copyDetails');

    const preventDefault = jest.fn();
    options.action.onClick({ preventDefault });
    expect(preventDefault).toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('provider exploded'));

    const stage = hook.result.current.stage as Extract<TxStage, { status: 'failed' }>;
    expect(stage).toMatchObject({ status: 'failed', message: 'Action fallback.' });
  });

  it('explains a known cause instead of the fallback', async () => {
    mockWriteContract.mockRejectedValue({
      name: 'InsufficientFundsError',
      message: 'insufficient funds for gas',
    });
    await run(baseOptions());
    expect(mockToast.error).toHaveBeenCalledWith(
      'toasts.tx.error.insufficientFunds(network=Arbitrum Sepolia)',
      expect.anything(),
    );
  });

  it('lets the flow describe its own failures', async () => {
    mockWriteContract.mockRejectedValue(new Error('execution reverted'));
    await run(baseOptions({ describeError: (_err, info) => `Flow copy for ${info.kind}` }));
    expect(mockToast.error).toHaveBeenCalledWith('Flow copy for would-revert', expect.anything());
  });

  it('reports an on-chain revert with the explorer link, never as success', async () => {
    mockWaitForReceipt.mockResolvedValue({
      status: 'reverted',
      transactionHash: '0xhash',
      logs: [],
    });
    const { result, hook } = await run(baseOptions());

    expect(result).toMatchObject({ status: 'failed', hash: '0xhash', error: { kind: 'reverted' } });
    expect(mockToast.success).not.toHaveBeenCalled();
    expect(mockToast.error).toHaveBeenCalledWith(
      'toasts.tx.error.reverted',
      expect.objectContaining({ description: expect.anything() }),
    );
    expect(hook.result.current.stage).toMatchObject({ status: 'failed', hash: '0xhash' });
  });

  it('refuses a second run while one is in flight', async () => {
    let release!: (hash: string) => void;
    mockWriteContract.mockImplementationOnce(
      () => new Promise<string>((resolve) => (release = resolve)),
    );
    const hook = renderHook(() => useTxFlow());

    let first!: Promise<unknown>;
    await act(async () => {
      first = hook.result.current.run(baseOptions());
      await Promise.resolve();
    });
    let second: unknown;
    await act(async () => {
      second = await hook.result.current.run(baseOptions());
    });
    expect(second).toEqual({ status: 'busy' });
    expect(mockToast.info).toHaveBeenCalledWith('toasts.tx.busy');

    await act(async () => {
      release('0xhash');
      await first;
    });
  });

  it('asks to connect a wallet when there is none, with a Connect action', async () => {
    mockAddress = undefined;
    const { result } = await run(baseOptions(), ({ children }) => (
      <WalletUiProvider>{children}</WalletUiProvider>
    ));

    expect(result).toEqual({ status: 'aborted' });
    expect(mockToast.error).toHaveBeenCalledWith(
      'toasts.tx.error.walletNotConnected',
      expect.objectContaining({
        action: expect.objectContaining({ label: 'toasts.tx.connectWallet' }),
      }),
    );
  });
});

describe('useTxStageLabel', () => {
  it('keeps the verb visible for every busy stage and stays null otherwise', () => {
    const { result } = renderHook(() => useTxStageLabel());
    const label = result.current;

    expect(label({ status: 'preparing' })).toBe('toasts.tx.button.preparing');
    expect(label({ status: 'switching-network' })).toBe('toasts.tx.button.switchNetwork');
    expect(label({ status: 'approving', step: 1, total: 2, phase: 'signature' })).toBe(
      'toasts.tx.button.approve(step=1,total=2)',
    );
    expect(label({ status: 'approving', step: 1, total: 2, phase: 'pending' })).toBe(
      'toasts.tx.button.approvalPending(step=1,total=2)',
    );
    expect(label({ status: 'awaiting-signature', step: 1, total: 1 })).toBe(
      'toasts.tx.button.confirm',
    );
    expect(label({ status: 'awaiting-signature', step: 2, total: 2 })).toBe(
      'toasts.tx.button.confirmStep(step=2,total=2)',
    );
    expect(label({ status: 'pending', hash: '0x1' })).toBe('toasts.tx.button.pending');
    expect(label({ status: 'idle' })).toBeNull();
    expect(label({ status: 'confirmed', hash: '0x1' })).toBeNull();
  });
});
