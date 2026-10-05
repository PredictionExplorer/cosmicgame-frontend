import { act, renderHook } from '@testing-library/react';

import { reportError } from '@/utils/errors';

import { useWalletAccount } from '../useWalletAccount';

const ACCOUNT = '0x1Ec14a00000000000000000000000000000d7E99';
const mockDisconnectAsync = jest.fn();
const mockCopy = jest.fn();
const mockRequestConnectModal = jest.fn();
let mockAccount: string | null = ACCOUNT;

jest.mock('wagmi', () => ({
  useConnection: () => ({ connector: { name: 'MetaMask' } }),
  useDisconnect: () => ({ mutateAsync: mockDisconnectAsync, isPending: false }),
}));
jest.mock('../web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount, chainId: 421614, active: !!mockAccount }),
}));
jest.mock('../useClipboard', () => ({ useClipboard: () => ({ copy: mockCopy }) }));
jest.mock('../useWalletNetwork', () => ({
  useWalletNetwork: () => ({
    requiredChainName: 'Arbitrum Sepolia',
    connectedChainName: 'Ethereum',
    isWrongChain: true,
    isSwitching: false,
    switchToRequiredChain: jest.fn(),
  }),
}));
jest.mock('../../contexts/WalletUiContext', () => ({
  useOptionalWalletUi: () => ({ requestConnectModal: mockRequestConnectModal }),
}));
jest.mock('../../utils/errors', () => ({ reportError: jest.fn() }));

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockAccount = ACCOUNT;
  mockDisconnectAsync.mockResolvedValue(undefined);
  mockCopy.mockResolvedValue(true);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useWalletAccount', () => {
  it('describes the connected account, its wallet, network and explorer page', () => {
    const { result } = renderHook(() => useWalletAccount());
    expect(result.current).toMatchObject({
      address: ACCOUNT,
      isConnected: true,
      walletName: 'MetaMask',
      explorerUrl: `https://sepolia.arbiscan.io/address/${ACCOUNT}`,
      explorerName: 'Arbiscan',
      requiredChainName: 'Arbitrum Sepolia',
      connectedChainName: 'Ethereum',
      isWrongChain: true,
    });
  });

  it('reports nothing connected without an account', () => {
    mockAccount = null;
    const { result } = renderHook(() => useWalletAccount());
    expect(result.current.isConnected).toBe(false);
    expect(result.current.explorerUrl).toBeNull();
  });

  it('copies the address and shows "copied" for two seconds', async () => {
    const { result } = renderHook(() => useWalletAccount());
    await act(async () => {
      await result.current.copyAddress();
    });
    expect(mockCopy).toHaveBeenCalledWith(ACCOUNT);
    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2_000);
    });
    expect(result.current.copied).toBe(false);
  });

  it('never says "copied" when the copy failed', async () => {
    mockCopy.mockResolvedValue(false);
    const { result } = renderHook(() => useWalletAccount());
    await act(async () => {
      await result.current.copyAddress();
    });
    expect(result.current.copied).toBe(false);
  });

  it('switches wallet by disconnecting first, then opening the wallet list', async () => {
    const order: string[] = [];
    mockDisconnectAsync.mockImplementation(async () => {
      order.push('disconnect');
    });
    mockRequestConnectModal.mockImplementation(() => order.push('open'));
    const { result } = renderHook(() => useWalletAccount());

    await act(async () => {
      await result.current.switchWallet();
    });
    expect(order).toEqual(['disconnect', 'open']);
  });

  it('reports a failed disconnect instead of throwing', async () => {
    const failure = new Error('connector gone');
    mockDisconnectAsync.mockRejectedValueOnce(failure);
    const { result } = renderHook(() => useWalletAccount());

    await act(async () => {
      await result.current.disconnect();
    });
    expect(reportError).toHaveBeenCalledWith(failure, 'wallet-disconnect');
  });
});
