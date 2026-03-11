import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { convertTimestampToDateTime } from '@/utils';

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
    expect(screen.getByText('No mode changes yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<SystemModesTable list={[createEvent()]} />);
    expect(screen.getAllByText('Round').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Started').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ended').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Deployment" for RoundNum 0', () => {
    render(<SystemModesTable list={[createEvent({ RoundNum: 0 })]} />);
    expect(screen.getByText('Deployment')).toBeInTheDocument();
  });

  it('shows "Currently Active" for the first item (no prevRow)', () => {
    render(<SystemModesTable list={[createEvent()]} />);
    expect(screen.getByText('Currently Active')).toBeInTheDocument();
  });

  it('shows prevRow timestamp for non-first items', () => {
    const list = [
      createEvent({ EvtLogId: 1, TimeStamp: 1701346718 }),
      createEvent({ EvtLogId: 2, TimeStamp: 1701433118 }),
    ];
    render(<SystemModesTable list={list} />);
    expect(screen.getByText('Currently Active')).toBeInTheDocument();
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('navigates on row click with correct URL', () => {
    render(
      <SystemModesTable list={[createEvent({ RoundNum: 5, EvtLogId: 100, NextEvtLogId: 200 })]} />,
    );
    const row = screen.getByText('5').closest('tr');
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith('/system-event/5/100/200');
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) => createEvent({ EvtLogId: i, RoundNum: i + 1 }));
    render(<SystemModesTable list={list} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('6')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SystemModesTable list={[]} />);
    await checkA11y(container);
  });
});
