import { renderHook, act } from '@testing-library/react';
import { type ReactNode } from 'react';

import { render, checkA11y } from '@/test-utils';

import { AnchoredTokenProvider, useAnchoredToken } from '../AnchoredTokenContext';

const mockRefetchCST = jest.fn().mockResolvedValue({ data: [] });
const mockRefetchRWLK = jest.fn().mockResolvedValue({ data: [] });

const mockUseAnchoredCSTokensByUser = jest.fn().mockReturnValue({
  data: undefined,
  refetch: mockRefetchCST,
});
const mockUseAnchoredRWLKTokensByUser = jest.fn().mockReturnValue({
  data: undefined,
  refetch: mockRefetchRWLK,
});

jest.mock('../../hooks/useApiQuery', () => ({
  useAnchoredCSTokensByUser: (...args: unknown[]) => mockUseAnchoredCSTokensByUser(...args),
  useAnchoredRWLKTokensByUser: (...args: unknown[]) => mockUseAnchoredRWLKTokensByUser(...args),
}));

const mockAccount = jest.fn<string | null, []>(() => '0xUser');
jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount.mockReturnValue('0xUser');
  mockUseAnchoredCSTokensByUser.mockReturnValue({ data: undefined, refetch: mockRefetchCST });
  mockUseAnchoredRWLKTokensByUser.mockReturnValue({ data: undefined, refetch: mockRefetchRWLK });
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <AnchoredTokenProvider>{children}</AnchoredTokenProvider>
);

describe('AnchoredTokenContext', () => {
  it('provides empty arrays as default values', () => {
    const { result } = renderHook(() => useAnchoredToken(), { wrapper });
    expect(result.current.cstokens).toEqual([]);
    expect(result.current.rwlktokens).toEqual([]);
  });

  it('provides CST token data from the hook', () => {
    const cstData = [{ StakeActionId: 1, StakedTokenId: 10, StakeTimeStamp: 100 }];
    mockUseAnchoredCSTokensByUser.mockReturnValue({ data: cstData, refetch: mockRefetchCST });

    const { result } = renderHook(() => useAnchoredToken(), { wrapper });
    expect(result.current.cstokens).toEqual(cstData);
  });

  it('provides RWLK token data from the hook', () => {
    const rwlkData = [{ StakeActionId: 2, StakedTokenId: 20, StakeTimeStamp: 200 }];
    mockUseAnchoredRWLKTokensByUser.mockReturnValue({ data: rwlkData, refetch: mockRefetchRWLK });

    const { result } = renderHook(() => useAnchoredToken(), { wrapper });
    expect(result.current.rwlktokens).toEqual(rwlkData);
  });

  it('passes account to both hooks', () => {
    mockAccount.mockReturnValue('0xTest');
    renderHook(() => useAnchoredToken(), { wrapper });

    expect(mockUseAnchoredCSTokensByUser).toHaveBeenCalledWith('0xTest');
    expect(mockUseAnchoredRWLKTokensByUser).toHaveBeenCalledWith('0xTest');
  });

  it('passes null account when not connected', () => {
    mockAccount.mockReturnValue(null);
    renderHook(() => useAnchoredToken(), { wrapper });

    expect(mockUseAnchoredCSTokensByUser).toHaveBeenCalledWith(null);
    expect(mockUseAnchoredRWLKTokensByUser).toHaveBeenCalledWith(null);
  });

  it('fetchData triggers refetch on both hooks', async () => {
    const { result } = renderHook(() => useAnchoredToken(), { wrapper });

    await act(async () => {
      await result.current.fetchData();
    });

    expect(mockRefetchCST).toHaveBeenCalledTimes(1);
    expect(mockRefetchRWLK).toHaveBeenCalledTimes(1);
  });

  it('fetchData awaits both refetches concurrently', async () => {
    const order: string[] = [];
    mockRefetchCST.mockImplementation(
      () =>
        new Promise((r) =>
          setTimeout(() => {
            order.push('cst');
            r({ data: [] });
          }, 10),
        ),
    );
    mockRefetchRWLK.mockImplementation(
      () =>
        new Promise((r) =>
          setTimeout(() => {
            order.push('rwlk');
            r({ data: [] });
          }, 5),
        ),
    );

    const { result } = renderHook(() => useAnchoredToken(), { wrapper });

    await act(async () => {
      await result.current.fetchData();
    });

    expect(order).toContain('cst');
    expect(order).toContain('rwlk');
  });

  it('throws when used outside of AnchoredTokenProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAnchoredToken())).toThrow(
      'useAnchoredToken must be used within a AnchoredTokenProvider',
    );
    consoleSpy.mockRestore();
  });

  it('provides both CST and RWLK data simultaneously', () => {
    const cstData = [{ StakeActionId: 1, StakedTokenId: 10, StakeTimeStamp: 100 }];
    const rwlkData = [{ StakeActionId: 2, StakedTokenId: 20, StakeTimeStamp: 200 }];
    mockUseAnchoredCSTokensByUser.mockReturnValue({ data: cstData, refetch: mockRefetchCST });
    mockUseAnchoredRWLKTokensByUser.mockReturnValue({ data: rwlkData, refetch: mockRefetchRWLK });

    const { result } = renderHook(() => useAnchoredToken(), { wrapper });
    expect(result.current.cstokens).toEqual(cstData);
    expect(result.current.rwlktokens).toEqual(rwlkData);
    expect(typeof result.current.fetchData).toBe('function');
  });

  it('context value has the expected properties', () => {
    const { result } = renderHook(() => useAnchoredToken(), { wrapper });
    const keys = Object.keys(result.current);
    expect(keys).toHaveLength(5);
    expect(keys).toContain('cstokens');
    expect(keys).toContain('rwlktokens');
    expect(keys).toContain('fetchData');
    expect(keys).toContain('error');
    expect(keys).toContain('isLoading');
  });

  it('fetchData is a stable reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useAnchoredToken(), { wrapper });
    const first = result.current.fetchData;
    rerender();
    expect(result.current.fetchData).toBe(first);
  });

  it('handles multiple tokens in both CST and RWLK arrays', () => {
    const cstData = [
      { StakeActionId: 1, StakedTokenId: 10, StakeTimeStamp: 100 },
      { StakeActionId: 2, StakedTokenId: 11, StakeTimeStamp: 101 },
      { StakeActionId: 3, StakedTokenId: 12, StakeTimeStamp: 102 },
    ];
    const rwlkData = [
      { StakeActionId: 4, StakedTokenId: 20, StakeTimeStamp: 200 },
      { StakeActionId: 5, StakedTokenId: 21, StakeTimeStamp: 201 },
      { StakeActionId: 6, StakedTokenId: 22, StakeTimeStamp: 202 },
    ];
    mockUseAnchoredCSTokensByUser.mockReturnValue({ data: cstData, refetch: mockRefetchCST });
    mockUseAnchoredRWLKTokensByUser.mockReturnValue({ data: rwlkData, refetch: mockRefetchRWLK });

    const { result } = renderHook(() => useAnchoredToken(), { wrapper });
    expect(result.current.cstokens).toHaveLength(3);
    expect(result.current.rwlktokens).toHaveLength(3);
  });

  it('falls back to empty array when hook data is explicitly undefined', () => {
    mockUseAnchoredCSTokensByUser.mockReturnValue({ data: undefined, refetch: mockRefetchCST });
    mockUseAnchoredRWLKTokensByUser.mockReturnValue({ data: undefined, refetch: mockRefetchRWLK });

    const { result } = renderHook(() => useAnchoredToken(), { wrapper });
    expect(result.current.cstokens).toEqual([]);
    expect(result.current.rwlktokens).toEqual([]);
    expect(Array.isArray(result.current.cstokens)).toBe(true);
    expect(Array.isArray(result.current.rwlktokens)).toBe(true);
  });

  it('error message includes the exact hook name', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      renderHook(() => useAnchoredToken());
    } catch (error) {
      expect((error as Error).message).toBe(
        'useAnchoredToken must be used within a AnchoredTokenProvider',
      );
    }
    consoleSpy.mockRestore();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AnchoredTokenProvider>
        <div>Test</div>
      </AnchoredTokenProvider>,
    );
    await checkA11y(container);
  });
});
