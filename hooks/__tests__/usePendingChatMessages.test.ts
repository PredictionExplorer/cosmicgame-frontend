import { act, renderHook } from '@testing-library/react';

import type { GestureInfo } from '@/services/api';

import {
  PENDING_MESSAGE_EXPIRY_MS,
  PENDING_MESSAGE_STALE_MS,
  usePendingChatMessages,
} from '../usePendingChatMessages';

const ADDRESS = '0x1111111111111111111111111111111111111111';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('usePendingChatMessages', () => {
  it('shows a sent message at once with its transaction', () => {
    const { result } = renderHook(() => usePendingChatMessages([]));
    act(() => result.current.record(ADDRESS, 'hello', '0xabc'));
    expect(result.current.pending).toEqual([
      expect.objectContaining({ address: ADDRESS, message: 'hello', txHash: '0xabc' }),
    ]);
    expect(result.current.pending[0]!.stale).toBeUndefined();
  });

  it('says "still indexing" when the indexer is slow instead of dropping the row', () => {
    const { result } = renderHook(() => usePendingChatMessages([]));
    act(() => result.current.record(ADDRESS, 'hello', '0xabc'));

    act(() => {
      jest.advanceTimersByTime(PENDING_MESSAGE_STALE_MS);
    });
    expect(result.current.pending).toHaveLength(1);
    expect(result.current.pending[0]!.stale).toBe(true);

    act(() => {
      jest.advanceTimersByTime(PENDING_MESSAGE_EXPIRY_MS - PENDING_MESSAGE_STALE_MS);
    });
    expect(result.current.pending).toHaveLength(0);
  });

  it('gives way to the indexed row as soon as the indexer echoes it', () => {
    const { result, rerender } = renderHook(
      ({ gestures }: { gestures: GestureInfo[] }) => usePendingChatMessages(gestures),
      { initialProps: { gestures: [] as GestureInfo[] } },
    );
    act(() => result.current.record(ADDRESS, 'hello', null));
    rerender({
      gestures: [
        {
          BidderAddr: ADDRESS.toUpperCase().replace('0X', '0x'),
          Message: ' hello ',
        } as GestureInfo,
      ],
    });
    expect(result.current.pending).toHaveLength(0);
  });

  it('matches the indexed row by transaction, so a repeated message never hides a new one', () => {
    const earlier = {
      BidderAddr: ADDRESS,
      Message: 'gm',
      TxHash: '0xold',
    } as GestureInfo;
    const { result, rerender } = renderHook(
      ({ gestures }: { gestures: GestureInfo[] }) => usePendingChatMessages(gestures),
      { initialProps: { gestures: [earlier] } },
    );
    act(() => result.current.record(ADDRESS, 'gm', '0xNEW'));
    expect(result.current.pending).toHaveLength(1);

    rerender({ gestures: [{ ...earlier, TxHash: '0xnew' }, earlier] });
    expect(result.current.pending).toHaveLength(0);
  });

  it('forgets an echoed row, so it never returns when the feed window moves on', () => {
    const echo = { BidderAddr: ADDRESS, Message: 'hello', TxHash: '0xabc' } as GestureInfo;
    const { result, rerender } = renderHook(
      ({ gestures }: { gestures: GestureInfo[] }) => usePendingChatMessages(gestures),
      { initialProps: { gestures: [] as GestureInfo[] } },
    );
    act(() => result.current.record(ADDRESS, 'hello', '0xabc'));
    rerender({ gestures: [echo] });
    expect(result.current.pending).toHaveLength(0);

    act(() => {
      jest.advanceTimersByTime(PENDING_MESSAGE_STALE_MS);
    });
    rerender({ gestures: [] });
    expect(result.current.pending).toHaveLength(0);
  });
});
