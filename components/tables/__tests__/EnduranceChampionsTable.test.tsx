import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import EnduranceChampionsTable from '@/components/tables/EnduranceChampionsTable';

import { checkA11y, render, screen } from '@/test-utils';

const createChampion = (overrides = {}) => ({
  participant: '0x1234567890abcdef1234567890abcdef12345678',
  championTime: 3600,
  chronoWarrior: 1800,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('EnduranceChampionsTable', () => {
  it('holds placeholder rows while the list is computed', () => {
    render(<EnduranceChampionsTable championList={null} />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('tables.skeleton.loadingRows');
  });

  it('renders empty state when championList is empty', () => {
    render(<EnduranceChampionsTable championList={[]} />);
    expect(screen.getByText('tables.empty.enduranceChampions')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<EnduranceChampionsTable championList={[createChampion()]} />);
    expect(screen.getAllByText('tables.columns.userAddress').length).toBeGreaterThanOrEqual(1);
  });

  it('renders champion data with formatted times', () => {
    render(
      <EnduranceChampionsTable
        championList={[createChampion({ championTime: 3600, chronoWarrior: 1800 })]}
      />,
    );
    expect(screen.getAllByText(/1h/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/30m/).length).toBeGreaterThanOrEqual(1);
    // Durations render as machine-readable <time> elements, end-aligned.
    const [duration] = screen.getAllByText(/1h/);
    expect(duration?.closest('time')).toHaveAttribute('datetime', 'PT1H');
    expect(duration?.closest('td')).toHaveAttribute('data-align', 'end');
  });

  it('renders 0 chrono warrior time as formatted seconds', () => {
    render(<EnduranceChampionsTable championList={[createChampion({ chronoWarrior: 0 })]} />);
    expect(screen.getAllByText(/0s/).length).toBeGreaterThanOrEqual(1);
  });

  it('sorts by championTime desc by default (largest first)', () => {
    const list = [
      createChampion({ participant: '0x' + '1'.repeat(40), championTime: 60 }),
      createChampion({ participant: '0x' + '2'.repeat(40), championTime: 300 }),
    ];
    render(<EnduranceChampionsTable championList={list} />);
    const rows = screen.getAllByRole('row');
    const dataRows = rows.filter((r) => r.querySelector('td'));
    const firstRowText = dataRows[0]?.textContent ?? '';
    expect(firstRowText).toContain('5m');
  });

  it('toggles sort direction on same column click', () => {
    const list = [
      createChampion({ participant: '0x' + '1'.repeat(40), championTime: 60 }),
      createChampion({ participant: '0x' + '2'.repeat(40), championTime: 300 }),
    ];
    render(<EnduranceChampionsTable championList={list} />);
    const sortButtons = screen.getAllByText('tables.endurance.championTime');
    const headerButton = sortButtons.find((el) => el.tagName === 'BUTTON') ?? sortButtons[0]!;
    fireEvent.click(headerButton);
    const rows = screen.getAllByRole('row');
    const dataRows = rows.filter((r) => r.querySelector('td'));
    const firstRowText = dataRows[0]?.textContent ?? '';
    expect(firstRowText).toContain('1m');
  });

  it('switches sort field to chronoWarrior', () => {
    const list = [
      createChampion({ participant: '0x' + '1'.repeat(40), chronoWarrior: 500 }),
      createChampion({ participant: '0x' + '2'.repeat(40), chronoWarrior: 100 }),
    ];
    render(<EnduranceChampionsTable championList={list} />);
    const sortButtons = screen.getAllByText('tables.endurance.chronoWarrior');
    const headerButton = sortButtons.find((el) => el.tagName === 'BUTTON') ?? sortButtons[0]!;
    fireEvent.click(headerButton);
    const timeCells = screen.getAllByText('8m 20s');
    expect(timeCells.length).toBeGreaterThanOrEqual(1);
  });

  it('hides pagination when list.length <= perPage', () => {
    render(<EnduranceChampionsTable championList={[createChampion()]} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows pagination when the list is longer than a page', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      createChampion({ participant: `0x${String(i).padStart(40, '0')}` }),
    );
    render(<EnduranceChampionsTable championList={list} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('pagination click changes visible rows', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      createChampion({
        participant: `0x${String(i).padStart(40, '0')}`,
        championTime: (i + 1) * 1000,
      }),
    );
    render(<EnduranceChampionsTable championList={list} />);

    const rowsBefore = screen.getAllByRole('row').filter((r) => r.querySelector('td'));
    expect(rowsBefore.length).toBe(20);

    fireEvent.click(screen.getByRole('button', { name: '2' }));

    const rowsAfter = screen.getAllByRole('row').filter((r) => r.querySelector('td'));
    expect(rowsAfter.length).toBe(5);
  });

  it('links the participant to their page', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<EnduranceChampionsTable championList={[createChampion({ participant: addr })]} />);
    const links = screen.getAllByRole('link');
    const userLink = links.find((l) => l.getAttribute('href') === `/user/${addr}`);
    expect(userLink).toBeInTheDocument();
  });

  it('marks the row matching the latest participant as live', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(
      <EnduranceChampionsTable
        championList={[createChampion({ participant: addr })]}
        lastBidderAddress={addr}
      />,
    );

    expect(screen.getByText('tables.status.live')).toBeInTheDocument();
  });

  it('matches the live row case-insensitively', () => {
    const addr = '0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD';
    render(
      <EnduranceChampionsTable
        championList={[createChampion({ participant: addr.toLowerCase() })]}
        lastBidderAddress={addr}
      />,
    );

    expect(screen.getByText('tables.status.live')).toBeInTheDocument();
  });

  it('does not mark rows live without a latest participant address', () => {
    render(<EnduranceChampionsTable championList={[createChampion()]} />);
    expect(screen.queryByText('tables.status.live')).not.toBeInTheDocument();
  });

  it('marks only the matching latest-participant row as live in a multi-row table', () => {
    const liveAddr = '0x' + 'a'.repeat(40);
    const otherAddr = '0x' + 'b'.repeat(40);

    render(
      <EnduranceChampionsTable
        championList={[
          createChampion({ participant: liveAddr, championTime: 300 }),
          createChampion({ participant: otherAddr, championTime: 200 }),
        ]}
        lastBidderAddress={liveAddr}
      />,
    );

    expect(screen.getAllByText('tables.status.live')).toHaveLength(1);
    const rows = screen.getAllByRole('row').filter((r) => r.querySelector('td'));
    expect(rows[0]).toHaveTextContent('tables.status.live');
    expect(rows[1]).not.toHaveTextContent('tables.status.live');
  });

  it('sort resets to desc when switching columns', () => {
    const list = [
      createChampion({ participant: '0x' + '1'.repeat(40), championTime: 100, chronoWarrior: 50 }),
      createChampion({ participant: '0x' + '2'.repeat(40), championTime: 200, chronoWarrior: 300 }),
    ];
    render(<EnduranceChampionsTable championList={list} />);

    const championBtn =
      screen.getAllByText('tables.endurance.championTime').find((el) => el.tagName === 'BUTTON') ??
      screen.getByText('tables.endurance.championTime');
    fireEvent.click(championBtn);

    const chronoBtn =
      screen.getAllByText('tables.endurance.chronoWarrior').find((el) => el.tagName === 'BUTTON') ??
      screen.getByText('tables.endurance.chronoWarrior');
    fireEvent.click(chronoBtn);

    const rows = screen.getAllByRole('row');
    const dataRows = rows.filter((r) => r.querySelector('td'));
    const firstRowText = dataRows[0]?.textContent ?? '';
    expect(firstRowText).toContain('5m');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<EnduranceChampionsTable championList={[]} />);
    await checkA11y(container);
  });
});
