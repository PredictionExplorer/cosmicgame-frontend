import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { LANDING_COUNTDOWN_REQUIRE_ROUND_ZERO } from '../landingFlags';

/**
 * The flag holds no logic of its own, so there is no behaviour here to drive.
 * What can regress is the wiring: if the home page stops reading the flag, or
 * starts testing the cycle number for truthiness instead of an exact zero, the
 * pre-launch countdown would cover a live cycle. Both are checked at the
 * source level, which is the only place that failure mode is visible.
 */
const homePageSource = readFileSync(
  resolve(__dirname, '..', '..', 'app', '[locale]', '(app)', 'HomePage.tsx'),
  'utf8',
);

describe('LANDING_COUNTDOWN_REQUIRE_ROUND_ZERO', () => {
  it('is a boolean, so a stringified value can never be truthy by accident', () => {
    expect(typeof LANDING_COUNTDOWN_REQUIRE_ROUND_ZERO).toBe('boolean');
  });

  it('is still imported and read by the home page', () => {
    expect(homePageSource).toContain("from '@/lib/landingFlags'");
    expect(homePageSource).toMatch(/!LANDING_COUNTDOWN_REQUIRE_ROUND_ZERO\s*\|\|/);
  });

  it('gates the countdown on an exact cycle zero rather than a falsy cycle', () => {
    // `!CurRoundNum` would also pass for undefined while the dashboard loads,
    // flashing the countdown over a live cycle on every cold load.
    expect(homePageSource).toMatch(/\(dashboardData\?\.CurRoundNum \?\? -1\) === 0/);
  });

  it('still requires a marketing host and a future activation alongside the flag', () => {
    expect(homePageSource).toMatch(/landingHost && roundOk && launchMs != null/);
    expect(homePageSource).toMatch(/launchMs > localClockUtcEpochMs\(\)/);
  });
});
