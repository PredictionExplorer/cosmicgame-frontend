import userEvent from '@testing-library/user-event';

import { render, screen, within, checkA11y } from '@/test-utils';

import { AllocationsDisclosure, ControlDesk } from '../ControlDesk';

const regions = {
  header: <h1>Observatory</h1>,
  clock: <section aria-label="Clock">Clock</section>,
  calibration: <section aria-label="Calibration">Calibration</section>,
  standings: <section aria-label="Standings">Standings</section>,
  gestureConsole: <section aria-label="Gesture form">Form</section>,
  standing: <section aria-label="Your standing">Standing</section>,
  art: <section aria-label="Latest Signature">Art</section>,
};

describe('ControlDesk', () => {
  it('keeps the DOM in the order a phone reads it: clock, form, standing, standings, Calibration, art', () => {
    render(<ControlDesk {...regions} />);

    const grid = screen.getByTestId('control-desk-grid');
    const order = [...grid.querySelectorAll('[data-testid^="control-desk-"]')].map((node) =>
      node.getAttribute('data-testid'),
    );
    expect(order).toEqual([
      'control-desk-cycle',
      'control-desk-clock',
      'control-desk-gesture',
      'control-desk-standing',
      'control-desk-standings',
      'control-desk-calibration',
      'control-desk-art',
    ]);
    // No visual reordering anywhere: what is drawn is what is read and tabbed.
    for (const cell of grid.children) {
      expect(cell.className).not.toMatch(/(?:^|\s)(?:[a-z-]+:)*order-/);
    }
    // The Cycle column's frame is decoration only.
    const frame = screen.getByTestId('control-desk-cycle');
    expect(frame).toHaveAttribute('aria-hidden');
    expect(frame).toBeEmptyDOMElement();
  });

  it('places each cell explicitly from 1024px', () => {
    render(<ControlDesk {...regions} />);
    // Row 1: the Cycle column (5 of 12: clock over Calibration) beside the standings (7 of 12).
    expect(screen.getByTestId('control-desk-cycle')).toHaveClass(
      'lg:col-span-5',
      'lg:col-start-1',
      'lg:row-start-1',
      'lg:row-span-2',
    );
    expect(screen.getByTestId('control-desk-clock')).toHaveClass(
      'lg:col-start-1',
      'lg:row-start-1',
    );
    expect(screen.getByTestId('control-desk-calibration')).toHaveClass(
      'lg:col-start-1',
      'lg:row-start-2',
    );
    expect(screen.getByTestId('control-desk-standings')).toHaveClass(
      'lg:col-span-7',
      'lg:col-start-6',
      'lg:row-span-2',
    );
    // Row 2: the form (8 of 12), and beside it the art over the wallet's standing.
    expect(screen.getByTestId('control-desk-gesture')).toHaveClass(
      'lg:col-span-8',
      'lg:row-start-3',
      'lg:row-span-2',
    );
    expect(screen.getByTestId('control-desk-art')).toHaveClass('lg:col-start-9', 'lg:row-start-3');
    expect(screen.getByTestId('control-desk-standing')).toHaveClass(
      'lg:col-start-9',
      'lg:row-start-4',
    );
  });

  it('hangs the art on the wall and frames the standing only while the desk is one column', () => {
    render(<ControlDesk {...regions} />);
    const art = screen.getByTestId('control-desk-art');
    expect(art.className).not.toMatch(/(?:^|\s)(?:border|bg-surface)/);
    const standing = screen.getByTestId('control-desk-standing');
    expect(standing).toHaveClass('border', 'lg:border-0', 'lg:bg-transparent');
  });

  it('keeps a placeholder standing off phones', () => {
    const { rerender } = render(<ControlDesk {...regions} />);
    expect(screen.getByTestId('control-desk-standing')).not.toHaveClass('max-md:hidden');
    rerender(<ControlDesk {...regions} standingOnPhones={false} />);
    expect(screen.getByTestId('control-desk-standing')).toHaveClass('max-md:hidden');
  });

  it("gives the art the form's place between cycles", () => {
    render(<ControlDesk {...regions} gestureConsole={undefined} />);
    expect(screen.getByTestId('control-desk-art')).toHaveClass('lg:col-span-7', 'lg:row-start-3');
    expect(screen.getByTestId('control-desk-standing')).toHaveClass(
      'lg:col-span-5',
      'lg:row-start-3',
    );
  });

  it('keeps phones and tablets in one column', () => {
    render(<ControlDesk {...regions} />);
    // No two-column split before 1024px.
    expect(screen.getByTestId('control-desk-grid').className).not.toMatch(
      /(?:^|\s)(?:md|sm):grid-cols/,
    );
  });

  it('frames each region once: no bordered box inside a bordered box', () => {
    render(<ControlDesk {...regions} />);
    // The Cycle column's frame is drawn from 1024px; the clock and the
    // Calibration Window drop their own frames there.
    expect(screen.getByTestId('control-desk-cycle')).toHaveClass('lg:block', 'border');
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
    render(
      <AllocationsDisclosure>
        <p>Ledger</p>
      </AllocationsDisclosure>,
    );
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
