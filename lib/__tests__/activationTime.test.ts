import { localClockUtcEpochMs, parseActivationMsFromDashboard } from '@/lib/activationTime';

import type { DashboardInfo } from '@/services/api/types';

describe('localClockUtcEpochMs', () => {
  it('matches Date.now()', () => {
    const a = Date.now();
    const b = localClockUtcEpochMs();
    const c = Date.now();
    expect(b).toBeGreaterThanOrEqual(a);
    expect(b).toBeLessThanOrEqual(c);
  });
});

describe('parseActivationMsFromDashboard', () => {
  it('converts Unix seconds to ms', () => {
    const d = {
      CurRoundStats: { ActivationTime: 1775682254 },
    } as DashboardInfo;
    expect(parseActivationMsFromDashboard(d)).toBe(1775682254000);
  });

  it('accepts numeric string', () => {
    const d = {
      CurRoundStats: { ActivationTime: '1775682254' },
    } as unknown as DashboardInfo;
    expect(parseActivationMsFromDashboard(d)).toBe(1775682254000);
  });

  it('passes through ms when already large', () => {
    const ms = 1775682254000;
    const d = { CurRoundStats: { ActivationTime: ms } } as DashboardInfo;
    expect(parseActivationMsFromDashboard(d)).toBe(ms);
  });

  it('returns null when missing', () => {
    expect(parseActivationMsFromDashboard(null)).toBeNull();
    expect(parseActivationMsFromDashboard({} as DashboardInfo)).toBeNull();
  });
});
