/**
 * The states the transfer forms gate on: `idle` with no address, `checking`
 * until the chain answers, `failed` when it cannot, `ready` with the warning
 * the facts call for. A send is held while `checking` (see `transferGate`),
 * so the hook must never report `ready` or `idle` before the answer is in.
 */
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Address } from 'viem';

import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';

import { useRecipientFacts } from '../useRecipientFacts';

jest.unmock('@tanstack/react-query');

const mockClient = {
  getTransactionCount: jest.fn<Promise<number>, [{ address: Address }]>(),
  getCode: jest.fn<Promise<`0x${string}` | undefined>, [{ address: Address }]>(),
};
let mockHasClient = true;

jest.mock('wagmi', () => ({
  usePublicClient: () => (mockHasClient ? mockClient : undefined),
}));

jest.mock('@/contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => TEST_APP_CONTRACT_ADDRESSES,
}));

const WALLET = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed' as Address;

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  mockHasClient = true;
  mockClient.getTransactionCount.mockReset();
  mockClient.getCode.mockReset();
});

describe('useRecipientFacts', () => {
  it('is idle without an address, and asks the chain nothing', () => {
    const { result } = renderHook(() => useRecipientFacts(null), { wrapper: wrapper() });
    expect(result.current).toEqual({ status: 'idle' });
    expect(mockClient.getTransactionCount).not.toHaveBeenCalled();
  });

  it('stays checking until the chain answers, then reports what it found', async () => {
    let answer: (count: number) => void = () => undefined;
    mockClient.getTransactionCount.mockReturnValue(
      new Promise<number>((resolve) => {
        answer = resolve;
      }),
    );
    mockClient.getCode.mockResolvedValue('0x');

    const { result } = renderHook(() => useRecipientFacts(WALLET), { wrapper: wrapper() });
    expect(result.current).toEqual({ status: 'checking' });
    await waitFor(() => expect(mockClient.getTransactionCount).toHaveBeenCalled());
    expect(result.current).toEqual({ status: 'checking' });

    answer(0);
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current).toEqual({
      status: 'ready',
      facts: { transactionCount: 0, isContract: false },
      known: null,
      warning: 'fresh',
    });
  });

  it('names a protocol contract and warns against it', async () => {
    mockClient.getTransactionCount.mockResolvedValue(1);
    mockClient.getCode.mockResolvedValue('0x6080');
    const token = TEST_APP_CONTRACT_ADDRESSES.cosmicToken as Address;

    const { result } = renderHook(() => useRecipientFacts(token), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current).toMatchObject({ known: 'cst', warning: 'protocol' });
  });

  it('lets an active wallet through without a warning', async () => {
    mockClient.getTransactionCount.mockResolvedValue(12);
    mockClient.getCode.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRecipientFacts(WALLET), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current).toMatchObject({ warning: null });
  });

  it('fails once the read and its retry fail', async () => {
    mockClient.getTransactionCount.mockRejectedValue(new Error('rpc down'));
    mockClient.getCode.mockResolvedValue('0x');

    const { result } = renderHook(() => useRecipientFacts(WALLET), { wrapper: wrapper() });
    expect(result.current).toEqual({ status: 'checking' });
    await waitFor(() => expect(result.current).toEqual({ status: 'failed' }));
    expect(mockClient.getTransactionCount).toHaveBeenCalledTimes(2);
  });

  it('fails when there is no client for the chain to ask', () => {
    mockHasClient = false;
    const { result } = renderHook(() => useRecipientFacts(WALLET), { wrapper: wrapper() });
    expect(result.current).toEqual({ status: 'failed' });
  });
});
