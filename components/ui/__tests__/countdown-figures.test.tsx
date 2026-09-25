import { render, screen } from '@testing-library/react';
import { parse, TYPE } from '@formatjs/icu-messageformat-parser';

import {
  CountdownFigures,
  countdownFontSize,
  countdownGroups,
  countdownPartsFromMs,
  padCountdown,
} from '@/components/ui/countdown-figures';
import { routing } from '@/i18n/routing';
import { clockUnitLabels } from '@/utils/format/durations';

const groups = [
  { id: 'days', value: 6, label: 'days' },
  { id: 'hours', value: 1, label: 'hour' },
  { id: 'minutes', value: 11, label: 'minutes' },
  { id: 'seconds', value: 2, label: 'seconds' },
];

describe('<CountdownFigures />', () => {
  it('pads every group to two digits and captions it beneath', () => {
    render(<CountdownFigures groups={groups} />);
    const values = screen.getAllByTestId('countdown-value').map((node) => node.textContent);
    expect(values).toEqual(['06', '01', '11', '02']);
    const hours = document.querySelector('[data-countdown-unit="hours"]');
    expect(hours).toHaveTextContent('01hour');
  });

  it('is decorative: the timer around it carries the spoken duration', () => {
    render(<CountdownFigures groups={groups} />);
    expect(screen.getByTestId('countdown-figures')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws dashes at the final size while the first reading is on its way', () => {
    render(<CountdownFigures groups={groups} tone="placeholder" data-testid="placeholder" />);
    const placeholder = screen.getByTestId('placeholder');
    expect(placeholder).toHaveTextContent('––');
    expect(screen.queryAllByTestId('countdown-value')).toHaveLength(0);
    expect(placeholder.querySelectorAll('[data-countdown-unit]')).toHaveLength(0);
  });

  it('fits the row to its container by digit count within the size bounds', () => {
    expect(countdownFontSize(8, 'hero')).toBe(
      'clamp(2rem, calc(100cqi / (8 * 0.62 + 2.6)), 4.5rem)',
    );
    expect(countdownFontSize(9, 'desk')).toContain('(9 * 0.62 + 2.6)');
    render(<CountdownFigures groups={[{ id: 'days', value: 120, label: 'days' }]} size="hero" />);
    // 100cqi / (3 digits * 0.62 + 2.6) = 22.42cqi
    expect(screen.getByTestId('countdown-figures').style.fontSize).toMatch(/22\.42\d*cqi/);
  });

  it('never shows a negative or fractional value', () => {
    expect(padCountdown(-3)).toBe('00');
    expect(padCountdown(4.8)).toBe('04');
    expect(padCountdown(123)).toBe('123');
  });
});

describe('the one Cycle clock', () => {
  const FIVE_DAYS = ((5 * 24 + 10) * 3600 + 55 * 60 + 19) * 1000;

  it('builds DD:HH:MM:SS while days remain, then HH:MM:SS, on every surface', () => {
    const withDays = countdownGroups(countdownPartsFromMs(FIVE_DAYS), 'en');
    expect(withDays.map((group) => group.id)).toEqual(['days', 'hours', 'minutes', 'seconds']);
    expect(withDays.map((group) => padCountdown(group.value))).toEqual(['05', '10', '55', '19']);
    const underADay = countdownGroups(countdownPartsFromMs(5 * 60_000), 'en');
    expect(underADay.map((group) => group.id)).toEqual(['hours', 'minutes', 'seconds']);
    expect(countdownPartsFromMs(-1)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('sets the dock one-line form in the same padded groups, without captions', () => {
    render(
      <CountdownFigures
        groups={countdownGroups(countdownPartsFromMs(FIVE_DAYS), 'en')}
        size="inline"
      />,
    );
    const figures = screen.getByTestId('countdown-figures');
    expect(figures).toHaveTextContent(/^05:10:55:19$/);
    expect(figures).toHaveClass('type-figure-sm');
  });

  it('marks each value for the pre-hydration tick when given a deadline', () => {
    const { rerender } = render(
      <CountdownFigures
        groups={countdownGroups(countdownPartsFromMs(FIVE_DAYS), 'en')}
        deadlineMs={123}
      />,
    );
    const figures = screen.getByTestId('countdown-figures');
    expect(figures).toHaveAttribute('data-deadline', '123');
    expect(figures).not.toHaveAttribute('data-hydrated');
    expect(figures.querySelectorAll('[data-unit]')).toHaveLength(4);
    rerender(
      <CountdownFigures
        groups={countdownGroups(countdownPartsFromMs(FIVE_DAYS), 'en')}
        deadlineMs={123}
        hydrated
      />,
    );
    expect(screen.getByTestId('countdown-figures')).toHaveAttribute('data-hydrated', 'true');
  });

  it.each(routing.locales)('%s captions each unit with one fixed plain word', (locale) => {
    const labels = clockUnitLabels(locale);
    for (const unit of ['days', 'hours', 'minutes', 'seconds'] as const) {
      const [element, ...rest] = parse(labels[unit]);
      // Plain text: a plural caption would flip word and width as a group
      // passes 1 ("01 hour" beside "02 hours").
      expect(rest).toEqual([]);
      expect(element?.type).toBe(TYPE.literal);
    }
    expect(countdownGroups(countdownPartsFromMs(FIVE_DAYS), locale)[0]!.label).toBe(labels.days);
  });
});
