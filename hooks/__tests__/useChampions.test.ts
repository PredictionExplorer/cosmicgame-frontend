import { renderHook } from '@testing-library/react';

import { deriveChampionsState, useChampions } from '@/hooks/useChampions';
import type { SpecialRecipients } from '@/services/api/types';

import { useCurrentSpecialRecipients } from '../useApiQuery';
import { useNow } from '../useNow';

jest.mock('../useApiQuery', () => ({
  useCurrentSpecialRecipients: jest.fn(),
}));

jest.mock('../useNow', () => ({
  useNow: jest.fn(),
}));

const mockUseCurrentSpecialRecipients = useCurrentSpecialRecipients as jest.MockedFunction<
  typeof useCurrentSpecialRecipients
>;
const mockUseNow = useNow as jest.MockedFunction<typeof useNow>;

const baseSnapshot: SpecialRecipients = {
  EnduranceChampionAddress: '0x1111111111111111111111111111111111111111',
  EnduranceChampionDuration: 100,
  ChronoWarriorAddress: '0x1111111111111111111111111111111111111111',
  ChronoWarriorDuration: 50,
  LastBidderAddress: '0x1111111111111111111111111111111111111111',
  LastBidderLastBidTime: 900,
  LastCstBidderAddress: '0x2222222222222222222222222222222222222222',
};

function mockChampionQuery(data: SpecialRecipients | null | undefined, dataUpdatedAt = 1_095_000) {
  mockUseCurrentSpecialRecipients.mockReturnValue({
    data,
    dataUpdatedAt,
    isLoading: false,
  } as ReturnType<typeof useCurrentSpecialRecipients>);
}

describe('deriveChampionsState', () => {
  it('returns safe defaults when data is missing', () => {
    const state = deriveChampionsState({ data: undefined, nowMs: 1_100_000 });

    expect(state.hasData).toBe(false);
    expect(state.endurance.address).toBeNull();
    expect(state.endurance.duration).toBe(0);
    expect(state.chrono.address).toBeNull();
    expect(state.lastCst.address).toBeNull();
  });

  it('grows endurance only when the endurance champion is the latest participant', () => {
    const liveState = deriveChampionsState({ data: baseSnapshot, nowMs: 1_100_000 });
    expect(liveState.endurance.isLive).toBe(true);
    expect(liveState.endurance.duration).toBe(200);

    const lockedState = deriveChampionsState({
      data: {
        ...baseSnapshot,
        LastBidderAddress: '0x3333333333333333333333333333333333333333',
      },
      nowMs: 1_100_000,
    });
    expect(lockedState.endurance.isLive).toBe(false);
    expect(lockedState.endurance.duration).toBe(100);
  });

  it('extends chrono only while chrono warrior and endurance champion match', () => {
    const liveState = deriveChampionsState({
      data: baseSnapshot,
      nowMs: 1_100_000,
      dataUpdatedAt: 1_095_000,
    });
    expect(liveState.chrono.isLive).toBe(true);
    expect(liveState.chrono.duration).toBe(55);

    const lockedState = deriveChampionsState({
      data: {
        ...baseSnapshot,
        ChronoWarriorAddress: '0x4444444444444444444444444444444444444444',
      },
      nowMs: 1_100_000,
      dataUpdatedAt: 1_095_000,
    });
    expect(lockedState.chrono.isLive).toBe(false);
    expect(lockedState.chrono.duration).toBe(50);
  });

  it('compares addresses case-insensitively', () => {
    const state = deriveChampionsState({
      data: {
        ...baseSnapshot,
        EnduranceChampionAddress: '0xABCDEF0000000000000000000000000000000000',
        LastBidderAddress: '0xabcdef0000000000000000000000000000000000',
        ChronoWarriorAddress: '0xabcdef0000000000000000000000000000000000',
      },
      nowMs: 1_100_000,
      dataUpdatedAt: 1_099_000,
    });

    expect(state.endurance.isLive).toBe(true);
    expect(state.chrono.isLive).toBe(true);
  });

  it('normalizes zero addresses to empty UI state', () => {
    const state = deriveChampionsState({
      data: {
        EnduranceChampionAddress: '0x0000000000000000000000000000000000000000',
        EnduranceChampionDuration: 100,
        ChronoWarriorAddress: '0x0000000000000000000000000000000000000000',
        ChronoWarriorDuration: 200,
        LastBidderAddress: '0x0000000000000000000000000000000000000000',
        LastBidderLastBidTime: 900,
        LastCstBidderAddress: '0x0000000000000000000000000000000000000000',
      },
      nowMs: 1_100_000,
    });

    expect(state.endurance.address).toBeNull();
    expect(state.endurance.isLive).toBe(false);
    expect(state.chrono.address).toBeNull();
    expect(state.chrono.isLive).toBe(false);
    expect(state.latestGesture.address).toBeNull();
    expect(state.lastCst.address).toBeNull();
  });

  it('keeps live endurance at the locked duration until the current hold exceeds it', () => {
    const state = deriveChampionsState({
      data: {
        ...baseSnapshot,
        EnduranceChampionDuration: 500,
        LastBidderLastBidTime: 900,
      },
      nowMs: 1_100_000,
    });

    expect(state.endurance.isLive).toBe(true);
    expect(state.latestGesture.holdDuration).toBe(200);
    expect(state.endurance.duration).toBe(500);
  });

  it('does not create negative hold durations when the backend timestamp is ahead of the client', () => {
    const state = deriveChampionsState({
      data: {
        ...baseSnapshot,
        LastBidderLastBidTime: 1_200,
      },
      nowMs: 1_100_000,
    });

    expect(state.latestGesture.holdDuration).toBe(0);
    expect(state.endurance.duration).toBe(baseSnapshot.EnduranceChampionDuration);
  });

  it('does not extend chrono when query dataUpdatedAt is in the future', () => {
    const state = deriveChampionsState({
      data: baseSnapshot,
      nowMs: 1_100_000,
      dataUpdatedAt: 1_200_000,
    });

    expect(state.chrono.isLive).toBe(true);
    expect(state.chrono.duration).toBe(baseSnapshot.ChronoWarriorDuration);
  });
});

describe('useChampions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNow.mockReturnValue(1_100_000);
  });

  it('derives state from useCurrentSpecialRecipients and useNow', () => {
    mockChampionQuery(baseSnapshot, 1_095_000);

    const { result } = renderHook(() => useChampions());

    expect(result.current.endurance.duration).toBe(200);
    expect(result.current.chrono.duration).toBe(55);
    expect(result.current.lastCst.address).toBe(baseSnapshot.LastCstBidderAddress);
  });

  it('passes loading state through when data is unavailable', () => {
    mockUseCurrentSpecialRecipients.mockReturnValue({
      data: undefined,
      dataUpdatedAt: 0,
      isLoading: true,
    } as ReturnType<typeof useCurrentSpecialRecipients>);

    const { result } = renderHook(() => useChampions());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasData).toBe(false);
  });
});
