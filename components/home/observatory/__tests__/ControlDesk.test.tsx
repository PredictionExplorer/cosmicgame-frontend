import userEvent from '@testing-library/user-event';
import { ImageIcon } from 'lucide-react';

import { render, screen, within, checkA11y } from '@/test-utils';

import { AllocationsDisclosure, ControlDesk, DESK_REGION, DeskDisclosure } from '../ControlDesk';

const regions = {
  header: <h1>Observatory</h1>,
  clock: <section aria-label="Clock">Clock</section>,
  calibration: <section aria-label="Calibration">Calibration</section>,
  standings: <section aria-label="Standings">Standings</section>,
  gestureConsole: <section aria-label="Gesture form">Form</section>,
  standing: <section aria-label="Your standing">Standing</section>,
  art: <section aria-label="Latest Signature">Art</section>,
};

/** Classes that draw a box: a border on every side, a fill or a rounded frame. */
const BOX = /(?:^|\s)(?:border(?:\s|$)|bg-surface|rounded-surface)/;

/** The desk's cells in DOM order. */
const cellOrder = () =>
  [
    ...screen.getByTestId('control-desk-grid').querySelectorAll('[data-testid^="control-desk-"]'),
  ].map((node) => node.getAttribute('data-testid'));

/** The 1024px grid placement classes of a cell, which must read in DOM order column by column. */
const placement = (testId: string) =>
  screen
    .getByTestId(testId)
    .className.split(/\s+/)
    .filter((name) => /^lg:(?:col|row)-/.test(name));

describe('ControlDesk', () => {
  it('reads in one order at every width: clock, Calibration, form, standing, standings, art', () => {
    render(<ControlDesk {...regions} />);
    expect(cellOrder()).toEqual([
      'control-desk-clock',
      'control-desk-calibration',
      'control-desk-gesture',
      'control-desk-standing',
      'control-desk-standings',
      'control-desk-art',
    ]);
    // No visual reordering anywhere: what is drawn is what is read and tabbed.
    for (const cell of screen.getByTestId('control-desk-grid').children) {
      expect(cell.className).not.toMatch(/(?:^|\s)(?:[a-z-]+:)*order-/);
    }
  });

  it('puts the form beside the Cycle column from 1024px, so its action is in the first viewport', () => {
    render(<ControlDesk {...regions} />);
    // Row 1: the Cycle column (5 of 12): clock, Calibration, then the standing.
    expect(placement('control-desk-clock')).toEqual(
      expect.arrayContaining(['lg:col-span-5', 'lg:col-start-1', 'lg:row-start-1']),
    );
    expect(placement('control-desk-calibration')).toEqual(
      expect.arrayContaining(['lg:col-start-1', 'lg:row-start-2']),
    );
    expect(placement('control-desk-standing')).toEqual(
      expect.arrayContaining(['lg:col-start-1', 'lg:row-start-3']),
    );
    // Beside it, the form (7 of 12) spans the column's three rows.
    expect(placement('control-desk-gesture')).toEqual(
      expect.arrayContaining([
        'lg:col-span-7',
        'lg:col-start-6',
        'lg:row-start-1',
        'lg:row-span-3',
      ]),
    );
    // Row 2: the standings (7 of 12) beside the art (5 of 12).
    expect(placement('control-desk-standings')).toEqual(
      expect.arrayContaining(['lg:col-span-7', 'lg:col-start-1', 'lg:row-start-4']),
    );
    expect(placement('control-desk-art')).toEqual(
      expect.arrayContaining(['lg:col-span-5', 'lg:col-start-8', 'lg:row-start-4']),
    );
  });

  it('never moves focus up within a column from 1024px', () => {
    const rowStart = (testId: string) =>
      Number(
        placement(testId)
          .find((name) => name.startsWith('lg:row-start-'))!
          .split('-')
          .pop(),
      );
    const colStart = (testId: string) =>
      Number(
        placement(testId)
          .find((name) => name.startsWith('lg:col-start-'))!
          .split('-')
          .pop(),
      );
    for (const props of [regions, { ...regions, gestureConsole: undefined }]) {
      const { unmount } = render(<ControlDesk {...props} />);
      const cells = cellOrder() as string[];
      for (const [index, cell] of cells.entries()) {
        for (const later of cells.slice(index + 1)) {
          if (colStart(later) !== colStart(cell)) continue;
          expect(rowStart(later)).toBeGreaterThan(rowStart(cell));
        }
      }
      unmount();
    }
  });

  it("gives the art the form's place between cycles, the standings filling row 2", () => {
    render(<ControlDesk {...regions} gestureConsole={undefined} />);
    expect(screen.queryByTestId('control-desk-gesture')).not.toBeInTheDocument();
    expect(cellOrder()).toEqual([
      'control-desk-clock',
      'control-desk-calibration',
      'control-desk-standing',
      'control-desk-art',
      'control-desk-standings',
    ]);
    expect(placement('control-desk-art')).toEqual(
      expect.arrayContaining(['lg:col-span-7', 'lg:col-start-6', 'lg:row-start-1']),
    );
    // The whole row: no empty cell is left beside the standings.
    expect(placement('control-desk-standings')).toEqual(
      expect.arrayContaining(['lg:col-span-12', 'lg:col-start-1', 'lg:row-start-4']),
    );
  });

  it('renders no standing without a wallet', () => {
    render(<ControlDesk {...regions} standing={undefined} />);
    expect(screen.queryByTestId('control-desk-standing')).not.toBeInTheDocument();
  });

  it('keeps phones and tablets in one column', () => {
    render(<ControlDesk {...regions} />);
    // No two-column split before 1024px.
    expect(screen.getByTestId('control-desk-grid').className).not.toMatch(
      /(?:^|\s)(?:md|sm):grid-cols/,
    );
  });

  it('boxes only the form: every other region opens on a hairline on the page ground', () => {
    render(<ControlDesk {...regions} />);
    // The form is the page's one quiet surface: a fill, no border.
    const form = screen.getByTestId('control-desk-gesture');
    expect(form).toHaveClass('bg-surface', 'rounded-surface');
    expect(form.className).not.toMatch(/(?:^|\s)border(?:\s|$)/);
    for (const testId of [
      'control-desk-clock',
      'control-desk-standings',
      'control-desk-calibration',
      'control-desk-art',
      'control-desk-standing',
    ]) {
      const cell = screen.getByTestId(testId);
      expect(cell.className).not.toMatch(BOX);
      expect(cell).toHaveClass(...DESK_REGION.split(' '));
    }
    // A region that continues its column opens on the fainter rule from 1024px.
    expect(screen.getByTestId('control-desk-calibration')).toHaveClass('lg:border-rule-faint');
    expect(screen.getByTestId('control-desk-standing')).toHaveClass('lg:border-rule-faint');
  });

  it('keeps the allocation breakdown in a native disclosure row that names the reserve', async () => {
    const user = userEvent.setup();
    render(
      <AllocationsDisclosure reserveEth={32.29}>
        <p>Ledger</p>
      </AllocationsDisclosure>,
    );
    const disclosure = screen.getByTestId('allocations-disclosure');
    expect(disclosure.tagName).toBe('DETAILS');
    expect(disclosure.className).not.toMatch(BOX);
    expect(disclosure).toHaveClass('border-t', 'border-b');
    expect(disclosure).not.toHaveAttribute('open');
    // Closed, the row already says something: the Cycle Reserve the tracks share.
    expect(screen.getByTestId('allocations-disclosure-figure')).toHaveTextContent(
      /32\.2900\sETH.*Cycle Reserve/,
    );
    await user.click(within(disclosure).getByText('home.orientation.allocationsTitle'));
    expect(disclosure).toHaveAttribute('open');
    expect(within(disclosure).getByText('Ledger')).toBeVisible();
  });

  it('shows no reserve figure until the dashboard reports it', () => {
    render(
      <AllocationsDisclosure reserveEth={null}>
        <p>Ledger</p>
      </AllocationsDisclosure>,
    );
    expect(screen.queryByTestId('allocations-disclosure-figure')).not.toBeInTheDocument();
  });

  it('builds every disclosure row the same way: glyph, title and one line on what opens', () => {
    render(
      <DeskDisclosure testId="row" icon={ImageIcon} title="Story" description="What it holds">
        <p>Notes</p>
      </DeskDisclosure>,
    );
    const row = screen.getByTestId('row');
    expect(row).toHaveClass('border-b');
    expect(row).not.toHaveClass('border-t');
    const summary = row.querySelector('summary')!;
    expect(summary.querySelector('svg')).not.toBeNull();
    expect(within(summary).getByText('Story')).toHaveClass('type-heading-3');
    expect(within(summary).getByText('What it holds')).toHaveClass('type-body-sm');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ControlDesk {...regions} />);
    await checkA11y(container);
  });
});
