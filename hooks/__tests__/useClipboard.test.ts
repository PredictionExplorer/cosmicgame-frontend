import { renderHook, act } from '@testing-library/react';

import { useClipboard } from '../useClipboard';

describe('useClipboard', () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
    jest.restoreAllMocks();
  });

  it('calls navigator.clipboard.writeText on copy', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to execCommand when clipboard API throws', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockRejectedValue(new Error('not allowed')),
      },
      writable: true,
      configurable: true,
    });

    const execCommand = jest.fn();
    document.execCommand = execCommand;

    const appendSpy = jest.spyOn(document.body, 'appendChild');
    const removeSpy = jest.spyOn(document.body, 'removeChild');

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('fallback text');
    });

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });

  it('cleans up the textarea after fallback copy', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockRejectedValue(new Error('denied')),
      },
      writable: true,
      configurable: true,
    });
    document.execCommand = jest.fn();

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('clean up');
    });

    const textareas = document.querySelectorAll('textarea');
    textareas.forEach((ta) => {
      expect(ta.parentNode).not.toBe(document.body);
    });
  });

  it('returns a stable copy reference across renders', () => {
    const { result, rerender } = renderHook(() => useClipboard());
    const first = result.current.copy;
    rerender();
    expect(result.current.copy).toBe(first);
  });
});
