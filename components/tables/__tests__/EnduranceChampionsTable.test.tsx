import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { formatSeconds } from '@/utils';

import EnduranceChampionsTable from '@/components/tables/EnduranceChampionsTable';

import { render, screen } from '@/test-utils';

const createChampion = (overrides = {}) => ({
  bidder: '0x1234567890abcdef1234567890abcdef12345678',
  championTime: 3600,
  chronoWarrior: 1800,
  ...overrides,
});

describe('EnduranceChampionsTable', () => {
  it('renders loading state when championList is null', () => {
    render(<EnduranceChampionsTable championList={null} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders empty state when championList is empty', () => {
    render(<EnduranceChampionsTable championList={[]} />);
    expect(screen.getByText('No endurance champions yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<EnduranceChampionsTable championList={[createChampion()]} />);
    expect(screen.getAllByText('User Address').length).toBeGreaterThanOrEqual(1);
  });

  it('renders champion data with formatted times', () => {
    render(
      <EnduranceChampionsTable
        championList={[createChampion({ championTime: 3600, chronoWarrior: 1800 })]}
      />,
    );
    expect(screen.getAllByText(/1h/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/30m/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders 0 chrono warrior time as formatted seconds', () => {
    render(<EnduranceChampionsTable championList={[createChampion({ chronoWarrior: 0 })]} />);
    expect(screen.getAllByText(/0s/).length).toBeGreaterThanOrEqual(1);
  });

  it('sorts by championTime desc by default (largest first)', () => {
    const list = [
      createChampion({ bidder: '0x' + '1'.repeat(40), championTime: 60 }),
      createChampion({ bidder: '0x' + '2'.repeat(40), championTime: 300 }),
    ];
    render(<EnduranceChampionsTable championList={list} />);
    const rows = screen.getAllByRole('row');
    const dataRows = rows.filter((r) => r.querySelector('td'));
    const firstRowText = dataRows[0]?.textContent ?? '';
    expect(firstRowText).toContain('5m');
  });

  it('toggles sort direction on same column click', () => {
    const list = [
      createChampion({ bidder: '0x' + '1'.repeat(40), championTime: 60 }),
      createChampion({ bidder: '0x' + '2'.repeat(40), championTime: 300 }),
    ];
    render(<EnduranceChampionsTable championList={list} />);
    const sortButtons = screen.getAllByText('Champion Time');
    const headerButton = sortButtons.find((el) => el.tagName === 'BUTTON') ?? sortButtons[0]!;
    fireEvent.click(headerButton);
    const rows = screen.getAllByRole('row');
    const dataRows = rows.filter((r) => r.querySelector('td'));
    const firstRowText = dataRows[0]?.textContent ?? '';
    expect(firstRowText).toContain('1m');
  });

  it('switches sort field to chronoWarrior', () => {
    const list = [
      createChampion({ bidder: '0x' + '1'.repeat(40), chronoWarrior: 500 }),
      createChampion({ bidder: '0x' + '2'.repeat(40), chronoWarrior: 100 }),
    ];
    render(<EnduranceChampionsTable championList={list} />);
    const sortButtons = screen.getAllByText('Chrono Warrior');
    const headerButton = sortButtons.find((el) => el.tagName === 'BUTTON') ?? sortButtons[0]!;
    fireEvent.click(headerButton);
    const timeCells = screen.getAllByText(formatSeconds(500));
    expect(timeCells.length).toBeGreaterThanOrEqual(1);
  });

  it('hides pagination when list.length <= perPage', () => {
    render(<EnduranceChampionsTable championList={[createChampion()]} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows pagination when list.length > perPage', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createChampion({ bidder: `0x${String(i).padStart(40, '0')}` }),
    );
    render(<EnduranceChampionsTable championList={list} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('pagination click changes visible rows', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createChampion({
        bidder: `0x${String(i).padStart(40, '0')}`,
        championTime: (i + 1) * 1000,
      }),
    );
    render(<EnduranceChampionsTable championList={list} />);

    const rowsBefore = screen.getAllByRole('row').filter((r) => r.querySelector('td'));
    expect(rowsBefore.length).toBe(5);

    const page2Link = screen.getByText('2');
    fireEvent.click(page2Link);

    const rowsAfter = screen.getAllByRole('row').filter((r) => r.querySelector('td'));
    expect(rowsAfter.length).toBe(3);
  });

  it('renders AddressLink with correct href', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<EnduranceChampionsTable championList={[createChampion({ bidder: addr })]} />);
    const links = screen.getAllByRole('link');
    const userLink = links.find((l) => l.getAttribute('href') === `/user/${addr}`);
    expect(userLink).toBeInTheDocument();
  });

  it('sort resets to desc when switching columns', () => {
    const list = [
      createChampion({ bidder: '0x' + '1'.repeat(40), championTime: 100, chronoWarrior: 50 }),
      createChampion({ bidder: '0x' + '2'.repeat(40), championTime: 200, chronoWarrior: 300 }),
    ];
    render(<EnduranceChampionsTable championList={list} />);

    const championBtn =
      screen.getAllByText('Champion Time').find((el) => el.tagName === 'BUTTON') ??
      screen.getByText('Champion Time');
    fireEvent.click(championBtn);

    const chronoBtn =
      screen.getAllByText('Chrono Warrior').find((el) => el.tagName === 'BUTTON') ??
      screen.getByText('Chrono Warrior');
    fireEvent.click(chronoBtn);

    const rows = screen.getAllByRole('row');
    const dataRows = rows.filter((r) => r.querySelector('td'));
    const firstRowText = dataRows[0]?.textContent ?? '';
    expect(firstRowText).toContain(formatSeconds(300));
  });
});
