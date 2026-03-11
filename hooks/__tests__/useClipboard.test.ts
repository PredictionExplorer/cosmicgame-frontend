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

  it('copies an empty string via clipboard API', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('');
    });

    expect(writeText).toHaveBeenCalledWith('');
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

  it('falls back when clipboard API is completely missing', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const execCommand = jest.fn();
    document.execCommand = execCommand;

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('no clipboard');
    });

    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('fallback textarea has fixed position and zero opacity', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockRejectedValue(new Error('denied')),
      },
      writable: true,
      configurable: true,
    });
    document.execCommand = jest.fn();

    let capturedTextarea: HTMLTextAreaElement | null = null;
    const origAppend = document.body.appendChild.bind(document.body);
    jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLTextAreaElement) capturedTextarea = node;
      return origAppend(node);
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('styled fallback');
    });

    expect(capturedTextarea).not.toBeNull();
    expect(capturedTextarea!.style.position).toBe('fixed');
    expect(capturedTextarea!.style.opacity).toBe('0');
  });

  it('fallback textarea value matches the copied text', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockRejectedValue(new Error('denied')),
      },
      writable: true,
      configurable: true,
    });
    document.execCommand = jest.fn();

    let capturedValue = '';
    const origAppend = document.body.appendChild.bind(document.body);
    jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLTextAreaElement) capturedValue = node.value;
      return origAppend(node);
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('exact text');
    });

    expect(capturedValue).toBe('exact text');
  });

  it('fallback calls select() on the textarea', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockRejectedValue(new Error('denied')),
      },
      writable: true,
      configurable: true,
    });
    document.execCommand = jest.fn();

    const selectSpy = jest.spyOn(HTMLTextAreaElement.prototype, 'select');

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('select me');
    });

    expect(selectSpy).toHaveBeenCalled();
    selectSpy.mockRestore();
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

  it('handles sequential copy calls without interference', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('first');
      await result.current.copy('second');
    });

    expect(writeText).toHaveBeenCalledTimes(2);
    expect(writeText).toHaveBeenNthCalledWith(1, 'first');
    expect(writeText).toHaveBeenNthCalledWith(2, 'second');
  });

  it('returns a stable copy reference across renders', () => {
    const { result, rerender } = renderHook(() => useClipboard());
    const first = result.current.copy;
    rerender();
    expect(result.current.copy).toBe(first);
  });
});
