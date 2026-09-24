import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useRetrievalDeadlines } from '../useRetrievalDeadlines';

jest.unmock('@tanstack/react-query');

const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockReadDeadline = jest.fn();
let mockContract: unknown = {
  address: '0xWallet',
  read: { roundTimeoutTimesToWithdrawPrizes: (args: [bigint]) => mockReadDeadline(args) },
};
jest.mock('../../../hooks/useStellarSelectionWalletContract', () => ({
  __esModule: true,
  default: () => mockContract,
}));

let client = createTestQueryClient();
function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  client = createTestQueryClient();
  mockContract = {
    address: '0xWallet',
    read: { roundTimeoutTimesToWithdrawPrizes: (args: [bigint]) => mockReadDeadline(args) },
  };
});

describe('useRetrievalDeadlines', () => {
  it('reads each distinct cycle once', async () => {
    mockReadDeadline.mockImplementation(([cycle]: [bigint]) =>
      Promise.resolve(1_800_000_000n + cycle),
    );
    const { result } = renderHook(() => useRetrievalDeadlines([3, 1, 3]), { wrapper });
    await waitFor(() => expect(result.current.deadlines[3]).toBe(1_800_000_003));
    expect(result.current.deadlines[1]).toBe(1_800_000_001);
    expect(mockReadDeadline).toHaveBeenCalledTimes(2);
  });

  it('keeps the deadlines it could read when others fail, leaving those unknown', async () => {
    mockReadDeadline.mockImplementation(([cycle]: [bigint]) =>
      cycle === 2n
        ? Promise.reject(new Error('execution reverted'))
        : Promise.resolve(1_800_000_000n),
    );
    const { result } = renderHook(() => useRetrievalDeadlines([1, 2]), { wrapper });
    await waitFor(() => expect(result.current.deadlines[1]).toBe(1_800_000_000));
    expect(result.current.deadlines[2]).toBeUndefined();
  });

  it('treats a zero deadline (a cycle the wallet holds nothing for) as unknown', async () => {
    mockReadDeadline.mockResolvedValue(0n);
    const { result } = renderHook(() => useRetrievalDeadlines([4]), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.deadlines).toEqual({});
  });

  it('reads nothing without a contract or without cycles', () => {
    mockContract = null;
    const { result } = renderHook(() => useRetrievalDeadlines([1]), { wrapper });
    expect(result.current.deadlines).toEqual({});
    expect(mockReadDeadline).not.toHaveBeenCalled();
  });
});
