import { isValidElement } from 'react';
import type { CountdownRenderProps } from 'react-countdown';

import { checkA11y, render, screen } from '@/test-utils';

import Counter from '../Counter';

const baseProps: Omit<CountdownRenderProps, 'days' | 'hours' | 'minutes' | 'seconds'> = {
  api: {} as CountdownRenderProps['api'],
  props: {} as CountdownRenderProps['props'],
  formatted: {} as CountdownRenderProps['formatted'],
  total: 0,
  milliseconds: 0,
  completed: false,
};

describe('Counter', () => {
  it('renders all four time units when days > 0', () => {
    render(<Counter {...baseProps} days={1} hours={2} minutes={30} seconds={45} />);
    expect(screen.getByText('DAYS')).toBeInTheDocument();
    expect(screen.getByText('HRS')).toBeInTheDocument();
    expect(screen.getByText('MIN')).toBeInTheDocument();
    expect(screen.getByText('SEC')).toBeInTheDocument();
  });

  it('hides DAYS when days is 0', () => {
    render(<Counter {...baseProps} days={0} hours={5} minutes={10} seconds={20} />);
    expect(screen.queryByText('DAYS')).not.toBeInTheDocument();
    expect(screen.getByText('HRS')).toBeInTheDocument();
  });

  it('hides DAYS and HRS when both are 0', () => {
    render(<Counter {...baseProps} days={0} hours={0} minutes={15} seconds={30} />);
    expect(screen.queryByText('DAYS')).not.toBeInTheDocument();
    expect(screen.queryByText('HRS')).not.toBeInTheDocument();
    expect(screen.getByText('MIN')).toBeInTheDocument();
    expect(screen.getByText('SEC')).toBeInTheDocument();
  });

  it('zero-pads single-digit values', () => {
    render(<Counter {...baseProps} days={1} hours={2} minutes={3} seconds={4} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('04')).toBeInTheDocument();
  });

  it('does not pad two-digit values', () => {
    render(<Counter {...baseProps} days={10} hours={23} minutes={59} seconds={59} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
  });

  it('renders all zeros', () => {
    render(<Counter {...baseProps} days={0} hours={0} minutes={0} seconds={0} />);
    expect(screen.getByText('MIN')).toBeInTheDocument();
    expect(screen.getByText('SEC')).toBeInTheDocument();
  });

  it('works when called as a plain function (react-countdown pattern)', () => {
    const props = { ...baseProps, days: 0, hours: 1, minutes: 30, seconds: 10 };
    const result = Counter(props);
    expect(isValidElement(result)).toBe(true);

    render(<>{result}</>);
    expect(screen.getByText('HRS')).toBeInTheDocument();
    expect(screen.getByText('MIN')).toBeInTheDocument();
    expect(screen.getByText('SEC')).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('applies urgency styling when under 1 hour', () => {
    const { container } = render(
      <Counter {...baseProps} days={0} hours={0} minutes={45} seconds={0} />,
    );
    const amberElements = container.querySelectorAll('[class*="amber"]');
    expect(amberElements.length).toBeGreaterThan(0);
  });

  it('applies critical styling when under 5 minutes', () => {
    const { container } = render(
      <Counter {...baseProps} days={0} hours={0} minutes={2} seconds={30} />,
    );
    const redElements = container.querySelectorAll('[class*="red"]');
    expect(redElements.length).toBeGreaterThan(0);
  });

  it('does not apply urgency styling when time is zero (completed)', () => {
    const { container } = render(
      <Counter {...baseProps} days={0} hours={0} minutes={0} seconds={0} />,
    );
    const amberElements = container.querySelectorAll('[class*="amber"]');
    const redElements = container.querySelectorAll('[class*="red"]');
    expect(amberElements.length).toBe(0);
    expect(redElements.length).toBe(0);
  });

  it('renders colon separators between time units', () => {
    const { container } = render(
      <Counter {...baseProps} days={1} hours={2} minutes={30} seconds={45} />,
    );
    const colons = container.querySelectorAll('span');
    const colonTexts = Array.from(colons)
      .map((el) => el.textContent)
      .filter((t) => t === ':');
    expect(colonTexts.length).toBe(3);
  });

  it('renders tenths when less than one minute remains', () => {
    render(
      <Counter
        {...baseProps}
        total={12_900}
        days={0}
        hours={0}
        minutes={0}
        seconds={12}
        milliseconds={900}
      />,
    );

    expect(screen.getByTestId('countdown-tenths')).toHaveTextContent('.9');
  });

  it('does not render tenths for longer durations', () => {
    render(
      <Counter
        {...baseProps}
        total={60_000}
        days={0}
        hours={0}
        minutes={1}
        seconds={0}
        milliseconds={900}
      />,
    );

    expect(screen.queryByTestId('countdown-tenths')).not.toBeInTheDocument();
  });

  it('renders with size="sm"', () => {
    const { container } = render(
      <Counter {...baseProps} days={0} hours={1} minutes={30} seconds={0} size="sm" />,
    );
    expect(container.querySelector('[class*="text-xl"]')).toBeInTheDocument();
  });

  it('renders with size="lg"', () => {
    const { container } = render(
      <Counter {...baseProps} days={0} hours={1} minutes={30} seconds={0} size="lg" />,
    );
    expect(container.querySelector('[class*="text-5xl"]')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Counter {...baseProps} days={1} hours={2} minutes={30} seconds={45} />,
    );
    await checkA11y(container);
  });
});
