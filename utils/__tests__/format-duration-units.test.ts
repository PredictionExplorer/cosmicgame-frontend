import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { routing } from '@/i18n/routing';
import { NBSP, formatDuration, formatDurationTick, formatHoursTick } from '@/utils/format';

/**
 * The formatting layer keeps its duration units in code (so a bundle that
 * formats numbers does not ship all eight catalogs), and the catalogs keep
 * the same units under `formats.durationCompact` for components that read
 * them through `useTranslations('formats')`. This pins the two together in
 * every locale.
 */
interface DurationCompact {
  readonly days: string;
  readonly hours: string;
  readonly minutes: string;
  readonly seconds: string;
}

function catalogUnits(locale: string): DurationCompact {
  const path = join(__dirname, '..', '..', 'messages', locale, 'formats.json');
  const catalog = JSON.parse(readFileSync(path, 'utf8')) as { durationCompact: DurationCompact };
  return catalog.durationCompact;
}

describe.each(routing.locales)('duration units in %s', (locale) => {
  const units = catalogUnits(locale);
  const joiner = getLocaleConfig(locale).wordSpacing ? NBSP : '';

  it('prints exactly the formats.durationCompact units', () => {
    // 1d 2h 3m 4s
    expect(formatDuration(93_784, { locale })).toBe(
      [`1${units.days}`, `2${units.hours}`, `3${units.minutes}`, `4${units.seconds}`].join(joiner),
    );
    expect(formatDuration(0, { locale })).toBe(`0${units.seconds}`);
  });

  it('labels chart ticks with the same units', () => {
    expect(formatDurationTick(2 * 86_400, locale)).toBe(`2${units.days}`);
    expect(formatDurationTick(3 * 3_600, locale)).toBe(`3${units.hours}`);
    expect(formatDurationTick(45 * 60, locale)).toBe(`45${units.minutes}`);
    expect(formatHoursTick(0.75, locale)).toBe(`45${units.minutes}`);
  });
});
