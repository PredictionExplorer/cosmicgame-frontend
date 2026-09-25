import { renderHook } from '@testing-library/react';

import { mayShowMessage, useGestureModeration } from '@/hooks/useGestureModeration';

const mockUseBannedGestures = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  useBannedGestures: (options: { enabled?: boolean }) => mockUseBannedGestures(options),
}));

beforeEach(() => mockUseBannedGestures.mockReset());

describe('useGestureModeration', () => {
  it('shows every message but the hidden ones once the list is read', () => {
    mockUseBannedGestures.mockReturnValue({ data: [{ bid_id: 2 }], isError: false });
    const { result } = renderHook(() => useGestureModeration());
    expect(result.current.status).toBe('ready');
    expect(mayShowMessage(result.current, 2)).toBe(false);
    expect(mayShowMessage(result.current, 3)).toBe(true);
  });

  it('shows no message while the list loads', () => {
    mockUseBannedGestures.mockReturnValue({ data: undefined, isError: false });
    const { result } = renderHook(() => useGestureModeration());
    expect(result.current).toEqual({ status: 'pending' });
    expect(mayShowMessage(result.current, 3)).toBe(false);
  });

  it('fails closed, with a retry, when the list cannot be read', () => {
    const refetch = jest.fn();
    mockUseBannedGestures.mockReturnValue({ data: undefined, isError: true, refetch });
    const { result } = renderHook(() => useGestureModeration());
    expect(result.current.status).toBe('failed');
    expect(mayShowMessage(result.current, 3)).toBe(false);
    if (result.current.status === 'failed') result.current.retry();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps a list already read in force while a refresh of it fails', () => {
    mockUseBannedGestures.mockReturnValue({ data: [{ bid_id: 2 }], isError: true });
    const { result } = renderHook(() => useGestureModeration());
    expect(result.current.status).toBe('ready');
    expect(mayShowMessage(result.current, 2)).toBe(false);
    expect(mayShowMessage(result.current, 3)).toBe(true);
  });

  it('reads nothing and hides nothing where the server already moderated', () => {
    mockUseBannedGestures.mockReturnValue({ data: undefined, isError: false });
    const { result } = renderHook(() => useGestureModeration({ enabled: false }));
    expect(mockUseBannedGestures).toHaveBeenCalledWith({ enabled: false });
    expect(result.current.status).toBe('ready');
    expect(mayShowMessage(result.current, 2)).toBe(true);
  });
});
