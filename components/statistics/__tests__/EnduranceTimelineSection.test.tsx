import userEvent from '@testing-library/user-event';

import { render, screen } from '@/test-utils';

import { EnduranceTimelineSection } from '../EnduranceTimelineChart';

const mockUseGestureListByCycle = jest.fn();
const mockUseRoundInfo = jest.fn();
const mockUseCurrentTime = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
  useCurrentTime: (...args: unknown[]) => mockUseCurrentTime(...args),
}));

jest.mock('../../../hooks/useNow', () => ({
  useNow: () => 1_700_000_000_000,
}));

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGestureListByCycle.mockReturnValue(okQuery([]));
  mockUseRoundInfo.mockReturnValue(okQuery(null));
  mockUseCurrentTime.mockReturnValue(okQuery(1_700_000_000));
});

describe('EnduranceTimelineSection round picker', () => {
  it('starts on the live round', () => {
    render(<EnduranceTimelineSection currentRoundNum={5} />);
    expect(screen.getByRole('spinbutton', { name: 'Cycle number' })).toHaveValue(5);
    expect(screen.getByText('Live cycle')).toBeInTheDocument();
  });

  it('follows the live round when it advances (regression: stale selection)', () => {
    const { rerender } = render(<EnduranceTimelineSection currentRoundNum={5} />);
    rerender(<EnduranceTimelineSection currentRoundNum={6} />);
    expect(screen.getByRole('spinbutton', { name: 'Cycle number' })).toHaveValue(6);
    expect(screen.getByText('Live cycle')).toBeInTheDocument();
  });

  it('keeps a user-pinned round when the live round advances', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<EnduranceTimelineSection currentRoundNum={5} />);

    await user.click(screen.getByRole('button', { name: 'Previous cycle' }));
    expect(screen.getByRole('spinbutton', { name: 'Cycle number' })).toHaveValue(4);

    rerender(<EnduranceTimelineSection currentRoundNum={6} />);
    expect(screen.getByRole('spinbutton', { name: 'Cycle number' })).toHaveValue(4);
  });

  it('resumes following live after "Jump to live"', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<EnduranceTimelineSection currentRoundNum={5} />);

    await user.click(screen.getByRole('button', { name: 'Previous cycle' }));
    await user.click(screen.getByRole('button', { name: 'Jump to live' }));
    expect(screen.getByRole('spinbutton', { name: 'Cycle number' })).toHaveValue(5);

    rerender(<EnduranceTimelineSection currentRoundNum={7} />);
    expect(screen.getByRole('spinbutton', { name: 'Cycle number' })).toHaveValue(7);
  });

  it('re-pins to live when stepping forward to the newest round', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<EnduranceTimelineSection currentRoundNum={5} />);

    await user.click(screen.getByRole('button', { name: 'Previous cycle' }));
    await user.click(screen.getByRole('button', { name: 'Next cycle' }));
    expect(screen.getByText('Live cycle')).toBeInTheDocument();

    rerender(<EnduranceTimelineSection currentRoundNum={6} />);
    expect(screen.getByRole('spinbutton', { name: 'Cycle number' })).toHaveValue(6);
  });

  it('follows a late-arriving dashboard round (initial -1)', () => {
    const { rerender } = render(<EnduranceTimelineSection currentRoundNum={-1} />);
    expect(screen.getByRole('spinbutton', { name: 'Cycle number' })).toHaveValue(0);

    rerender(<EnduranceTimelineSection currentRoundNum={4} />);
    expect(screen.getByRole('spinbutton', { name: 'Cycle number' })).toHaveValue(4);
  });
});
