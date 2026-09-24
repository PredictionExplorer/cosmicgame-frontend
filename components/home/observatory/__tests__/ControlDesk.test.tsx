import userEvent from '@testing-library/user-event';

import { render, screen, within, checkA11y } from '@/test-utils';

import { ControlDesk } from '../ControlDesk';

const regions = {
  header: <h1>Observatory</h1>,
  clock: <section aria-label="Clock">Clock</section>,
  calibration: <section aria-label="Calibration">Calibration</section>,
  standings: <section aria-label="Standings">Standings</section>,
  gestureConsole: <section aria-label="Gesture form">Form</section>,
  allocationLedger: <p>Ledger</p>,
};

describe('ControlDesk', () => {
  it('keeps the desk in desktop reading order: cycle column, standings, then the form', () => {
    render(<ControlDesk {...regions} />);

    const grid = screen.getByTestId('control-desk-grid');
    const order = [...grid.querySelectorAll('[data-testid^="control-desk-"]')].map((node) =>
      node.getAttribute('data-testid'),
    );
    expect(order).toEqual([
      'control-desk-cycle',
      'control-desk-clock',
      'control-desk-calibration',
      'control-desk-standings',
      'control-desk-gesture',
    ]);
    // Row 1: the Cycle column (5 of 12) beside the standings (7 of 12); row 2: the form.
    expect(screen.getByTestId('control-desk-cycle')).toHaveClass('lg:col-span-5');
    expect(screen.getByTestId('control-desk-standings')).toHaveClass('lg:col-span-7');
    expect(screen.getByTestId('control-desk-gesture')).toHaveClass('lg:col-span-12');
  });

  it('keeps tablets in one column and moves the form under the clock on phones', () => {
    render(<ControlDesk {...regions} />);
    // No two-column split before 1024px.
    expect(screen.getByTestId('control-desk-grid').className).not.toMatch(
      /(?:^|\s)(?:md|sm):grid-cols/,
    );
    expect(screen.getByTestId('control-desk-clock')).toHaveClass('max-md:order-1');
    expect(screen.getByTestId('control-desk-gesture')).toHaveClass('max-md:order-2');
    expect(screen.getByTestId('control-desk-standings')).toHaveClass('max-md:order-3');
    expect(screen.getByTestId('control-desk-calibration')).toHaveClass('max-md:order-4');
  });

  it('frames each region once: no bordered box inside a bordered box', () => {
    render(<ControlDesk {...regions} />);
    const cycle = screen.getByTestId('control-desk-cycle');
    // The Cycle column is the frame from 1024px; its parts drop theirs there.
    expect(cycle).toHaveClass('lg:border');
    expect(screen.getByTestId('control-desk-clock')).toHaveClass('lg:border-0');
    expect(screen.getByTestId('control-desk-calibration')).toHaveClass('lg:border-0');
    // The form is the page's one quiet surface: a fill, no border.
    expect(screen.getByTestId('control-desk-gesture')).toHaveClass('bg-surface');
    expect(screen.getByTestId('control-desk-gesture').className).not.toMatch(
      /(?:^|\s)border(?:\s|$)/,
    );
  });

  it('keeps the allocation breakdown in a native disclosure', async () => {
    const user = userEvent.setup();
    render(<ControlDesk {...regions} />);
    const disclosure = screen.getByTestId('allocations-disclosure');
    expect(disclosure).not.toHaveAttribute('open');
    await user.click(within(disclosure).getByText('home.orientation.allocationsTitle'));
    expect(disclosure).toHaveAttribute('open');
    expect(within(disclosure).getByText('Ledger')).toBeVisible();
  });

  it('omits the form between cycles without leaving a gap', () => {
    render(<ControlDesk {...regions} gestureConsole={undefined} />);
    expect(screen.queryByTestId('control-desk-gesture')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ControlDesk {...regions} />);
    await checkA11y(container);
  });
});
