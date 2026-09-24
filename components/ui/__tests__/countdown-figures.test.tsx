import { render, screen } from '@testing-library/react';

import {
  CountdownFigures,
  countdownFontSize,
  padCountdown,
} from '@/components/ui/countdown-figures';

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
