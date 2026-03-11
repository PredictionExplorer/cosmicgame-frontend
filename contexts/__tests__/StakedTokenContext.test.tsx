import { renderHook, act, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { StakedTokenProvider, useStakedToken } from '../StakedTokenContext';

const mockRefetchCST = jest.fn().mockResolvedValue({ data: [] });
const mockRefetchRWLK = jest.fn().mockResolvedValue({ data: [] });

const mockUseStakedCSTTokensByUser = jest.fn().mockReturnValue({
  data: undefined,
  refetch: mockRefetchCST,
});
const mockUseStakedRWLKTokensByUser = jest.fn().mockReturnValue({
  data: undefined,
  refetch: mockRefetchRWLK,
});

jest.mock('../../hooks/useApiQuery', () => ({
  useStakedCSTTokensByUser: (...args: unknown[]) => mockUseStakedCSTTokensByUser(...args),
  useStakedRWLKTokensByUser: (...args: unknown[]) => mockUseStakedRWLKTokensByUser(...args),
}));

const mockAccount = jest.fn<string | null, []>(() => '0xUser');
jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount.mockReturnValue('0xUser');
  mockUseStakedCSTTokensByUser.mockReturnValue({ data: undefined, refetch: mockRefetchCST });
  mockUseStakedRWLKTokensByUser.mockReturnValue({ data: undefined, refetch: mockRefetchRWLK });
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <StakedTokenProvider>{children}</StakedTokenProvider>
);

describe('StakedTokenContext', () => {
  it('provides empty arrays as default values', () => {
    const { result } = renderHook(() => useStakedToken(), { wrapper });
    expect(result.current.cstokens).toEqual([]);
    expect(result.current.rwlktokens).toEqual([]);
  });

  it('provides CST token data from the hook', () => {
    const cstData = [{ StakeActionId: 1, StakedTokenId: 10, StakeTimeStamp: 100 }];
    mockUseStakedCSTTokensByUser.mockReturnValue({ data: cstData, refetch: mockRefetchCST });

    const { result } = renderHook(() => useStakedToken(), { wrapper });
    expect(result.current.cstokens).toEqual(cstData);
  });

  it('provides RWLK token data from the hook', () => {
    const rwlkData = [{ StakeActionId: 2, StakedTokenId: 20, StakeTimeStamp: 200 }];
    mockUseStakedRWLKTokensByUser.mockReturnValue({ data: rwlkData, refetch: mockRefetchRWLK });

    const { result } = renderHook(() => useStakedToken(), { wrapper });
    expect(result.current.rwlktokens).toEqual(rwlkData);
  });

  it('passes account to both hooks', () => {
    mockAccount.mockReturnValue('0xTest');
    renderHook(() => useStakedToken(), { wrapper });

    expect(mockUseStakedCSTTokensByUser).toHaveBeenCalledWith('0xTest');
    expect(mockUseStakedRWLKTokensByUser).toHaveBeenCalledWith('0xTest');
  });

  it('passes null account when not connected', () => {
    mockAccount.mockReturnValue(null);
    renderHook(() => useStakedToken(), { wrapper });

    expect(mockUseStakedCSTTokensByUser).toHaveBeenCalledWith(null);
    expect(mockUseStakedRWLKTokensByUser).toHaveBeenCalledWith(null);
  });

  it('fetchData triggers refetch on both hooks', async () => {
    const { result } = renderHook(() => useStakedToken(), { wrapper });

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

    const { result } = renderHook(() => useStakedToken(), { wrapper });

    await act(async () => {
      await result.current.fetchData();
    });

    expect(order).toContain('cst');
    expect(order).toContain('rwlk');
  });

  it('throws when used outside of StakedTokenProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useStakedToken())).toThrow(
      'useStakedToken must be used within a StakedTokenProvider',
    );
    consoleSpy.mockRestore();
  });

  it('provides both CST and RWLK data simultaneously', () => {
    const cstData = [{ StakeActionId: 1, StakedTokenId: 10, StakeTimeStamp: 100 }];
    const rwlkData = [{ StakeActionId: 2, StakedTokenId: 20, StakeTimeStamp: 200 }];
    mockUseStakedCSTTokensByUser.mockReturnValue({ data: cstData, refetch: mockRefetchCST });
    mockUseStakedRWLKTokensByUser.mockReturnValue({ data: rwlkData, refetch: mockRefetchRWLK });

    const { result } = renderHook(() => useStakedToken(), { wrapper });
    expect(result.current.cstokens).toEqual(cstData);
    expect(result.current.rwlktokens).toEqual(rwlkData);
    expect(typeof result.current.fetchData).toBe('function');
  });
});
