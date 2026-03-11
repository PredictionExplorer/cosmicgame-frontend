import { renderHook, act } from '@testing-library/react';
import { type ReactNode } from 'react';

import { NotificationProvider, useNotification } from '../NotificationContext';

const mockToast = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastInfo = jest.fn();
const mockToastWarning = jest.fn();
const mockToastError = jest.fn();

jest.mock('sonner', () => {
  const toastFn = (...args: unknown[]) => mockToast(...args);
  toastFn.success = (...args: unknown[]) => mockToastSuccess(...args);
  toastFn.info = (...args: unknown[]) => mockToastInfo(...args);
  toastFn.warning = (...args: unknown[]) => mockToastWarning(...args);
  toastFn.error = (...args: unknown[]) => mockToastError(...args);
  return { toast: toastFn };
});

beforeEach(() => {
  jest.clearAllMocks();
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe('NotificationProvider', () => {
  it('provides setNotification function', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    expect(typeof result.current.setNotification).toBe('function');
  });

  it('setNotification is memoized across re-renders', () => {
    const { result, rerender } = renderHook(() => useNotification(), { wrapper });
    const first = result.current.setNotification;
    rerender();
    expect(result.current.setNotification).toBe(first);
  });
});

describe('toast type dispatch', () => {
  it('calls toast.success for success type', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.setNotification({ text: 'Done!', type: 'success', visible: true });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('Done!');
    expect(mockToastInfo).not.toHaveBeenCalled();
    expect(mockToastWarning).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('calls toast.info for info type', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.setNotification({ text: 'FYI', type: 'info', visible: true });
    });

    expect(mockToastInfo).toHaveBeenCalledWith('FYI');
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('calls toast.warning for warning type', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.setNotification({ text: 'Careful', type: 'warning', visible: true });
    });

    expect(mockToastWarning).toHaveBeenCalledWith('Careful');
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('calls toast.error for error type', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.setNotification({ text: 'Oops', type: 'error', visible: true });
    });

    expect(mockToastError).toHaveBeenCalledWith('Oops');
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('calls toast() directly for unknown type (default branch)', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.setNotification({
        text: 'generic',
        type: 'other' as 'success',
        visible: true,
      });
    });

    expect(mockToast).toHaveBeenCalledWith('generic');
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });
});

describe('visibility gate', () => {
  it('does not call any toast when visible is false', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.setNotification({ text: 'hidden', type: 'error', visible: false });
    });

    expect(mockToast).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockToastInfo).not.toHaveBeenCalled();
    expect(mockToastWarning).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });
});

describe('function updater', () => {
  it('receives default state { text: "", type: "error", visible: false }', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    const updater = jest.fn((prev) => ({ ...prev, visible: true }));

    act(() => {
      result.current.setNotification(updater);
    });

    expect(updater).toHaveBeenCalledWith({ text: '', type: 'error', visible: false });
  });

  it('shows toast when updater returns visible: true', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.setNotification(() => ({
        text: 'from updater',
        type: 'success',
        visible: true,
      }));
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('from updater');
  });

  it('does not show toast when updater returns visible: false', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.setNotification(() => ({
        text: 'suppressed',
        type: 'error',
        visible: false,
      }));
    });

    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });
});

describe('integration', () => {
  it('passes correct message text through to toast', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.setNotification({
        text: 'Transaction confirmed: 0xABC',
        type: 'success',
        visible: true,
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('Transaction confirmed: 0xABC');
  });

  it('handles multiple sequential notifications', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.setNotification({ text: 'first', type: 'info', visible: true });
      result.current.setNotification({ text: 'second', type: 'error', visible: true });
      result.current.setNotification({ text: 'third', type: 'success', visible: true });
    });

    expect(mockToastInfo).toHaveBeenCalledWith('first');
    expect(mockToastError).toHaveBeenCalledWith('second');
    expect(mockToastSuccess).toHaveBeenCalledWith('third');
  });

  it('handles empty string message', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.setNotification({ text: '', type: 'info', visible: true });
    });

    expect(mockToastInfo).toHaveBeenCalledWith('');
  });
});

describe('useNotification', () => {
  it('throws when used outside of NotificationProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useNotification())).toThrow(
      'useNotification must be used within a NotificationProvider',
    );
    consoleSpy.mockRestore();
  });
});
