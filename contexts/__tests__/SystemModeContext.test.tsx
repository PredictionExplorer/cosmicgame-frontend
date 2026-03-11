import { renderHook, act, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { SystemModeProvider, useSystemMode } from '../SystemModeContext';

const mockSystemMode = jest.fn();
const mockContract = {
  read: { systemMode: mockSystemMode },
};

jest.mock('../../hooks/useCosmicGameContract', () => ({
  __esModule: true,
  default: jest.fn(() => mockContract),
}));

const mockReportError = jest.fn();
jest.mock('../../utils/errors', () => ({
  reportError: (...args: unknown[]) => mockReportError(...args),
}));

const useCosmicGameContract = require('../../hooks/useCosmicGameContract').default as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  return <SystemModeProvider>{children}</SystemModeProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockSystemMode.mockResolvedValue(0);
  useCosmicGameContract.mockReturnValue(mockContract);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('SystemModeProvider', () => {
  it('renders children', () => {
    const { result } = renderHook(() => useSystemMode(), { wrapper });
    expect(result.current).toBeDefined();
  });

  it('defaults data to 0', () => {
    const { result } = renderHook(() => useSystemMode(), { wrapper });
    expect(result.current!.data).toBe(0);
  });

  it('reads systemMode from contract and updates data', async () => {
    mockSystemMode.mockResolvedValue(2);

    const { result } = renderHook(() => useSystemMode(), { wrapper });

    await waitFor(() => {
      expect(result.current!.data).toBe(2);
    });
  });

  it('polls on interval', async () => {
    mockSystemMode.mockResolvedValue(1);

    renderHook(() => useSystemMode(), { wrapper });

    await waitFor(() => {
      expect(mockSystemMode).toHaveBeenCalledTimes(1);
    });

    mockSystemMode.mockResolvedValue(3);

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });

    expect(mockSystemMode).toHaveBeenCalledTimes(2);
  });

  it('calls reportError when contract read fails', async () => {
    const error = new Error('contract read failed');
    mockSystemMode.mockRejectedValue(error);

    renderHook(() => useSystemMode(), { wrapper });

    await waitFor(() => {
      expect(mockReportError).toHaveBeenCalledWith(error, 'SystemModeContext.fetchData');
    });
  });

  it('does not call contract when contract is null', async () => {
    useCosmicGameContract.mockReturnValue(null);

    renderHook(() => useSystemMode(), { wrapper });

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(mockSystemMode).not.toHaveBeenCalled();
  });

  it('fetchData triggers a new contract read when called manually', async () => {
    mockSystemMode.mockResolvedValue(5);

    const { result } = renderHook(() => useSystemMode(), { wrapper });

    await waitFor(() => {
      expect(result.current!.data).toBe(5);
    });

    mockSystemMode.mockResolvedValue(7);

    await act(async () => {
      await result.current!.fetchData();
    });

    expect(result.current!.data).toBe(7);
    expect(mockSystemMode).toHaveBeenCalledTimes(2);
  });

  it('keeps data at 0 when systemMode returns undefined', async () => {
    mockSystemMode.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSystemMode(), { wrapper });

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current!.data).toBe(0);
  });

  it('converts BigInt values via Number()', async () => {
    mockSystemMode.mockResolvedValue(BigInt(3));

    const { result } = renderHook(() => useSystemMode(), { wrapper });

    await waitFor(() => {
      expect(result.current!.data).toBe(3);
    });
  });

  it('does not crash when read.systemMode is undefined (optional chaining)', async () => {
    useCosmicGameContract.mockReturnValue({ read: {} });

    const { result } = renderHook(() => useSystemMode(), { wrapper });

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current!.data).toBe(0);
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('clears interval on unmount', async () => {
    const clearSpy = jest.spyOn(global, 'clearInterval');
    mockSystemMode.mockResolvedValue(1);

    const { unmount } = renderHook(() => useSystemMode(), { wrapper });

    unmount();

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('updates data value across polls', async () => {
    mockSystemMode.mockResolvedValue(1);

    const { result } = renderHook(() => useSystemMode(), { wrapper });

    await waitFor(() => {
      expect(result.current!.data).toBe(1);
    });

    mockSystemMode.mockResolvedValue(4);

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });

    await waitFor(() => {
      expect(result.current!.data).toBe(4);
    });
  });
});

describe('useSystemMode', () => {
  it('returns undefined outside of provider', () => {
    const { result } = renderHook(() => useSystemMode());
    expect(result.current).toBeUndefined();
  });
});
