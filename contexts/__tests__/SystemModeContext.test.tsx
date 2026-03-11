import { renderHook, act, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { render, checkA11y } from '@/test-utils';

import { SystemModeProvider, useSystemMode, MAX_CONSECUTIVE_FAILURES } from '../SystemModeContext';

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

  it('stops polling after MAX_CONSECUTIVE_FAILURES consecutive failures', async () => {
    mockSystemMode.mockRejectedValue(new Error('always fails'));

    renderHook(() => useSystemMode(), { wrapper });

    await waitFor(() => {
      expect(mockSystemMode).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });
    expect(mockSystemMode).toHaveBeenCalledTimes(2);

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });
    expect(mockSystemMode).toHaveBeenCalledTimes(MAX_CONSECUTIVE_FAILURES);

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });
    expect(mockSystemMode).toHaveBeenCalledTimes(MAX_CONSECUTIVE_FAILURES);
  });

  it('resets failure counter on success after prior failures', async () => {
    let callCount = 0;
    mockSystemMode.mockImplementation(() => {
      callCount += 1;
      if (callCount <= 2) return Promise.reject(new Error('transient'));
      if (callCount === 3) return Promise.resolve(5);
      return Promise.reject(new Error('transient again'));
    });

    renderHook(() => useSystemMode(), { wrapper });

    await waitFor(() => {
      expect(mockSystemMode).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });
    expect(mockSystemMode).toHaveBeenCalledTimes(2);

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });
    expect(mockSystemMode).toHaveBeenCalledTimes(3);

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });
    expect(mockSystemMode).toHaveBeenCalledTimes(4);

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });
    expect(mockSystemMode).toHaveBeenCalledTimes(5);
  });

  it('limits error reporting to MAX_CONSECUTIVE_FAILURES calls', async () => {
    mockSystemMode.mockRejectedValue(new Error('persistent'));

    renderHook(() => useSystemMode(), { wrapper });

    for (let i = 0; i < MAX_CONSECUTIVE_FAILURES + 2; i++) {
      await act(async () => {
        jest.advanceTimersByTime(12_000);
      });
    }

    expect(mockReportError).toHaveBeenCalledTimes(MAX_CONSECUTIVE_FAILURES);
  });

  it('resumes polling when contract ref changes after failures', async () => {
    mockSystemMode.mockRejectedValue(new Error('fail'));

    const { rerender } = renderHook(() => useSystemMode(), { wrapper });

    for (let i = 0; i < MAX_CONSECUTIVE_FAILURES; i++) {
      await act(async () => {
        jest.advanceTimersByTime(12_000);
      });
    }

    const callsBeforeReconnect = mockSystemMode.mock.calls.length;

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });
    expect(mockSystemMode).toHaveBeenCalledTimes(callsBeforeReconnect);

    const newMockSystemMode = jest.fn().mockResolvedValue(2);
    const newContract = { read: { systemMode: newMockSystemMode } };
    useCosmicGameContract.mockReturnValue(newContract);

    rerender();

    await waitFor(() => {
      expect(newMockSystemMode).toHaveBeenCalled();
    });

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });
    expect(newMockSystemMode.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('handles AbiFunctionNotFoundError gracefully without crashing', async () => {
    const abiError = new Error(
      'Function "systemMode" not found on ABI.\n' +
        'Make sure you are using the correct ABI and that the function exists on it.',
    );
    abiError.name = 'AbiFunctionNotFoundError';
    mockSystemMode.mockRejectedValue(abiError);

    const { result } = renderHook(() => useSystemMode(), { wrapper });

    await waitFor(() => {
      expect(mockReportError).toHaveBeenCalledWith(abiError, 'SystemModeContext.fetchData');
    });

    expect(result.current!.data).toBe(0);

    for (let i = 0; i < MAX_CONSECUTIVE_FAILURES + 2; i++) {
      await act(async () => {
        jest.advanceTimersByTime(12_000);
      });
    }

    expect(mockReportError).toHaveBeenCalledTimes(MAX_CONSECUTIVE_FAILURES);
    expect(result.current!.data).toBe(0);
  });

  it('has no accessibility violations', async () => {
    jest.useRealTimers();
    const { container } = render(
      <SystemModeProvider>
        <div>Test</div>
      </SystemModeProvider>,
    );
    await checkA11y(container);
    jest.useFakeTimers();
  });
});

describe('useSystemMode', () => {
  it('returns undefined outside of provider', () => {
    const { result } = renderHook(() => useSystemMode());
    expect(result.current).toBeUndefined();
  });
});
