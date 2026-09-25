import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { checkA11y, render, screen } from '@/test-utils';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: jest.fn() }),
}));

// eslint-disable-next-line import/order
import { SystemModesTable } from '@/components/tables/SystemModesTable';

const createEvent = (overrides = {}) => ({
  RoundNum: 5,
  EvtLogId: 100,
  NextEvtLogId: 200,
  TimeStamp: 1701346718,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('SystemModesTable', () => {
  it('renders empty state when list is empty', () => {
    render(<SystemModesTable list={[]} />);
    expect(screen.getByText('tables.empty.modeChanges')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<SystemModesTable list={[createEvent()]} />);
    expect(screen.getAllByText('tables.columns.round').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('tables.columns.started').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('tables.columns.ended').length).toBeGreaterThanOrEqual(1);
  });

  it('carries no info button on headers that say what they hold', () => {
    render(<SystemModesTable list={[createEvent()]} />);
    expect(
      screen.queryAllByRole('button', { name: /^tables\.tableHeaderHelp\.explainColumn/ }),
    ).toHaveLength(0);
  });

  it('names each row link by what it shows, then where it leads', () => {
    render(<SystemModesTable list={[createEvent({ RoundNum: 5 })]} />);
    const link = screen.getByRole('link', {
      name: 'tables.allocation.cycle(cycle=5) tables.systemModes.viewEvent',
    });
    expect(link).toHaveAttribute('href', '/system-event/5/100/200');
  });

  it('shows "Deployment" for RoundNum 0', () => {
    render(<SystemModesTable list={[createEvent({ RoundNum: 0 })]} />);
    expect(screen.getByText('tables.status.deployment')).toBeInTheDocument();
  });

  it('shows "Currently Active" for the first item (no prevRow)', () => {
    render(<SystemModesTable list={[createEvent()]} />);
    expect(screen.getByText('tables.status.currentlyActive')).toBeInTheDocument();
  });

  it('shows prevRow timestamp for non-first items', () => {
    const list = [
      createEvent({ EvtLogId: 1, TimeStamp: 1701346718 }),
      createEvent({ EvtLogId: 2, TimeStamp: 1701433118 }),
    ];
    render(<SystemModesTable list={list} />);
    expect(screen.getByText('tables.status.currentlyActive')).toBeInTheDocument();
    expect(screen.getAllByText('Nov 30, 2023, 12:18').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates on row click with correct URL', () => {
    render(
      <SystemModesTable list={[createEvent({ RoundNum: 5, EvtLogId: 100, NextEvtLogId: 200 })]} />,
    );
    const row = screen.getByText('tables.allocation.cycle(cycle=5)').closest('tr');
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith('/system-event/5/100/200');
  });

  it('shows 20 rows a page with the row range', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      createEvent({ EvtLogId: i, RoundNum: i + 1 }),
    );
    const { container } = render(<SystemModesTable list={list} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(screen.getByText('tables.pagination.range(from=1,to=20,total=25)')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SystemModesTable list={[]} />);
    await checkA11y(container);
  });
});
