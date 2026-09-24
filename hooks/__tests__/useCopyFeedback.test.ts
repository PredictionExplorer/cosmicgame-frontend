import { act, renderHook } from '@testing-library/react';

import { COPIED_FEEDBACK_MS, useCopyFeedback } from '../useCopyFeedback';

const mockCopy = jest.fn<Promise<boolean>, [string]>();
jest.mock('../useClipboard', () => ({
  useClipboard: () => ({ copy: mockCopy }),
}));

describe('useCopyFeedback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockCopy.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('confirms a successful copy, then clears the confirmation', async () => {
    mockCopy.mockResolvedValue(true);
    const { result } = renderHook(() => useCopyFeedback());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy('0xabc');
    });
    expect(ok).toBe(true);
    expect(mockCopy).toHaveBeenCalledWith('0xabc');
    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(COPIED_FEEDBACK_MS);
    });
    expect(result.current.copied).toBe(false);
  });

  // The check mark once appeared even when the clipboard write failed.
  it('never confirms a copy the clipboard refused', async () => {
    mockCopy.mockResolvedValue(false);
    const { result } = renderHook(() => useCopyFeedback());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy('0xabc');
    });
    expect(ok).toBe(false);
    expect(result.current.copied).toBe(false);
  });

  it('restarts the confirmation on a second copy', async () => {
    mockCopy.mockResolvedValue(true);
    const { result } = renderHook(() => useCopyFeedback(1_000));

    await act(async () => {
      await result.current.copy('a');
    });
    act(() => {
      jest.advanceTimersByTime(800);
    });
    await act(async () => {
      await result.current.copy('b');
    });
    act(() => {
      jest.advanceTimersByTime(800);
    });
    expect(result.current.copied).toBe(true);
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current.copied).toBe(false);
  });

  it('drops a pending confirmation when a later copy fails', async () => {
    mockCopy.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const { result } = renderHook(() => useCopyFeedback());

    await act(async () => {
      await result.current.copy('a');
    });
    await act(async () => {
      await result.current.copy('b');
    });
    expect(result.current.copied).toBe(false);
  });
});
