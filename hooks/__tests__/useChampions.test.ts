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
    expect(state.latestGesture.durationToBeat).toBe(0);
    expect(state.latestGesture.secondsUntilEnduranceChampion).toBe(0);
    expect(state.latestGesture.progressToEnduranceChampion).toBe(0);
  });

  it('grows endurance only when the latest hold exceeds the stored record', () => {
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

  it('computes latest participant progress toward the endurance record', () => {
    const state = deriveChampionsState({
      data: {
        ...baseSnapshot,
        LastBidderAddress: '0x3333333333333333333333333333333333333333',
        LastBidderLastBidTime: 1_040,
      },
      nowMs: 1_100_000,
    });

    expect(state.latestGesture.isCurrentEnduranceChampion).toBe(false);
    expect(state.latestGesture.holdDuration).toBe(60);
    expect(state.latestGesture.durationToBeat).toBe(101);
    expect(state.latestGesture.secondsUntilEnduranceChampion).toBe(41);
    expect(state.latestGesture.progressToEnduranceChampion).toBeCloseTo(59.4, 1);
  });

  it('models the strict endurance threshold as current record plus one second for challengers', () => {
    const tiedState = deriveChampionsState({
      data: {
        ...baseSnapshot,
        LastBidderAddress: '0x3333333333333333333333333333333333333333',
        LastBidderLastBidTime: 1_000,
      },
      nowMs: 1_100_000,
    });

    expect(tiedState.latestGesture.holdDuration).toBe(100);
    expect(tiedState.latestGesture.durationToBeat).toBe(101);
    expect(tiedState.latestGesture.secondsUntilEnduranceChampion).toBe(1);
    expect(tiedState.latestGesture.progressToEnduranceChampion).toBeLessThan(100);

    const thresholdState = deriveChampionsState({
      data: {
        ...baseSnapshot,
        LastBidderAddress: '0x3333333333333333333333333333333333333333',
        LastBidderLastBidTime: 999,
      },
      nowMs: 1_100_000,
    });

    expect(thresholdState.latestGesture.holdDuration).toBe(101);
    expect(thresholdState.latestGesture.secondsUntilEnduranceChampion).toBe(0);
    expect(thresholdState.latestGesture.progressToEnduranceChampion).toBe(100);
  });

  it('does not mark a matching latest participant as live below or at the stored record', () => {
    const belowState = deriveChampionsState({
      data: {
        ...baseSnapshot,
        EnduranceChampionDuration: 500,
        LastBidderLastBidTime: 900,
      },
      nowMs: 1_100_000,
    });

    expect(belowState.endurance.isLive).toBe(false);
    expect(belowState.endurance.duration).toBe(500);
    expect(belowState.latestGesture.isCurrentEnduranceChampion).toBe(true);
    expect(belowState.latestGesture.isExtendingEnduranceRecord).toBe(false);
    expect(belowState.latestGesture.durationToBeat).toBe(501);
    expect(belowState.latestGesture.secondsUntilEnduranceChampion).toBe(301);
    expect(belowState.latestGesture.progressToEnduranceChampion).toBeCloseTo(39.9, 1);

    const equalState = deriveChampionsState({
      data: {
        ...baseSnapshot,
        EnduranceChampionDuration: 200,
        LastBidderLastBidTime: 900,
      },
      nowMs: 1_100_000,
    });

    expect(equalState.endurance.isLive).toBe(false);
    expect(equalState.endurance.duration).toBe(200);
    expect(equalState.latestGesture.secondsUntilEnduranceChampion).toBe(1);
    expect(equalState.latestGesture.progressToEnduranceChampion).toBeLessThan(100);
  });

  it('marks a matching latest participant as extending the record above threshold', () => {
    const state = deriveChampionsState({
      data: {
        ...baseSnapshot,
        EnduranceChampionDuration: 199,
        LastBidderLastBidTime: 900,
      },
      nowMs: 1_100_000,
    });

    expect(state.endurance.isLive).toBe(true);
    expect(state.endurance.duration).toBe(200);
    expect(state.latestGesture.isCurrentEnduranceChampion).toBe(true);
    expect(state.latestGesture.isExtendingEnduranceRecord).toBe(true);
    expect(state.latestGesture.secondsUntilEnduranceChampion).toBe(0);
    expect(state.latestGesture.progressToEnduranceChampion).toBe(100);
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
    expect(state.latestGesture.durationToBeat).toBe(0);
    expect(state.latestGesture.secondsUntilEnduranceChampion).toBe(0);
    expect(state.latestGesture.progressToEnduranceChampion).toBe(0);
    expect(state.lastCst.address).toBeNull();
  });

  it('keeps endurance at the stored duration until the current hold exceeds it', () => {
    const state = deriveChampionsState({
      data: {
        ...baseSnapshot,
        EnduranceChampionDuration: 500,
        LastBidderLastBidTime: 900,
      },
      nowMs: 1_100_000,
    });

    expect(state.endurance.isLive).toBe(false);
    expect(state.latestGesture.holdDuration).toBe(200);
    expect(state.endurance.duration).toBe(500);
    expect(state.latestGesture.isCurrentEnduranceChampion).toBe(true);
    expect(state.latestGesture.isExtendingEnduranceRecord).toBe(false);
    expect(state.latestGesture.secondsUntilEnduranceChampion).toBe(301);
    expect(state.latestGesture.progressToEnduranceChampion).toBeCloseTo(39.9, 1);
  });

  it('does not create negative hold durations when the backend timestamp is ahead of the client', () => {
    const state = deriveChampionsState({
      data: {
        ...baseSnapshot,
        LastBidderAddress: '0x3333333333333333333333333333333333333333',
        LastBidderLastBidTime: 1_200,
      },
      nowMs: 1_100_000,
    });

    expect(state.latestGesture.holdDuration).toBe(0);
    expect(state.endurance.duration).toBe(baseSnapshot.EnduranceChampionDuration);
    expect(state.latestGesture.secondsUntilEnduranceChampion).toBe(101);
    expect(state.latestGesture.progressToEnduranceChampion).toBe(0);
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
    expect(result.current.latestGesture.isCurrentEnduranceChampion).toBe(true);
    expect(result.current.latestGesture.isExtendingEnduranceRecord).toBe(true);
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
