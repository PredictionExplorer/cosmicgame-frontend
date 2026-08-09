/**
 * Every hook must hand React Query's per-query abort signal to the API layer,
 * so navigating away (or a superseded refetch) cancels the in-flight request
 * instead of letting it settle into a cache nobody reads.
 */
import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import api from '@/services/api';

import {
  useCSTList,
  useClaimsByRound,
  useDashboardInfo,
  useGestureListByCycle,
  useRoiLeaderboard,
  useRoundInfo,
  useSystemEvents,
  useUserInfo,
} from '../useApiQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, error: null })),
}));

jest.mock('../../lib/uxCycleScenarios', () => ({
  useUxScenarioSnapshot: () => null,
}));

// A stable mock per endpoint (unlike a proxy that mints a new jest.fn() per
// access) so the forwarded arguments can be asserted.
jest.mock('../../services/api', () => {
  const fns: Record<string, jest.Mock> = {};
  return {
    __esModule: true,
    default: new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop !== 'string') return undefined;
          fns[prop] ??= jest.fn();
          return fns[prop];
        },
      },
    ),
  };
});

const mockUseQuery = useQuery as jest.Mock;
const controller = new AbortController();
const signal = controller.signal;

function runQueryFn(renderHookCallback: () => unknown): void {
  renderHook(renderHookCallback);
  const options = mockUseQuery.mock.calls[0]?.[0] as {
    queryFn: (context: { signal: AbortSignal }) => unknown;
  };
  options.queryFn({ signal });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useApiQuery abort-signal forwarding', () => {
  it('forwards the signal on a read with no other arguments', () => {
    runQueryFn(() => useDashboardInfo());

    expect(api.get_dashboard_info).toHaveBeenCalledWith({ signal });
  });

  it('forwards the signal after a positional argument', () => {
    runQueryFn(() => useRoundInfo(5));

    expect(api.get_round_info).toHaveBeenCalledWith(5, { signal });
  });

  it('forwards the signal after every positional argument', () => {
    runQueryFn(() => useGestureListByCycle(7, 'desc'));

    expect(api.get_bid_list_by_round).toHaveBeenCalledWith(7, 'desc', { signal });
  });

  it('forwards the signal on paged list reads without a positional placeholder', () => {
    runQueryFn(() => useCSTList());

    expect(api.get_cst_list).toHaveBeenCalledWith({ signal });
  });

  it('forwards the signal on address-scoped reads', () => {
    runQueryFn(() => useUserInfo('0xabc'));

    expect(api.get_user_info).toHaveBeenCalledWith('0xabc', { signal });
  });

  it('forwards the signal on claim data reads', () => {
    runQueryFn(() => useClaimsByRound());

    expect(api.get_claims_by_round).toHaveBeenCalledWith({ signal });
  });

  it('forwards the signal alongside leaderboard sort options', () => {
    runQueryFn(() => useRoiLeaderboard('net_pl', 10));

    expect(api.get_roi_leaderboard).toHaveBeenCalledWith('net_pl', 10, { signal });
  });

  it('forwards the signal on range reads', () => {
    runQueryFn(() => useSystemEvents(1, 2));

    expect(api.get_system_events).toHaveBeenCalledWith(1, 2, { signal });
  });
});
