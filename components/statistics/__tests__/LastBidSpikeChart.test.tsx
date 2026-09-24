// lexicon-allow-start: analytics fixtures mirror sealed backend wire names
import userEvent from '@testing-library/user-event';

import type { BidSpike } from '@/services/api/types';

import { checkA11y, render, screen, within } from '@/test-utils';

import { LastBidSpikeChart, defaultSpikeIndex } from '../LastBidSpikeChart';

const mockUseBidTimeBounds = jest.fn();
const mockUseBiddingActivity = jest.fn();
const mockUseBidFrequency = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useBidTimeBounds: (...args: unknown[]) => mockUseBidTimeBounds(...args),
  useBiddingActivity: (...args: unknown[]) => mockUseBiddingActivity(...args),
  useBidFrequency: (...args: unknown[]) => mockUseBidFrequency(...args),
}));
jest.mock('../../../hooks/useNow', () => ({ useNow: () => NOW_SEC * 1000 }));
jest.mock('recharts', () => require('@/test-utils/recharts').rechartsStub());

const HOUR = 3600;
/** 2026-08-12 00:00 UTC. */
const AUG_12 = Date.UTC(2026, 7, 12) / 1000;
const NOW_SEC = AUG_12 + 40 * 86_400;

const spike = (index: number, peakTs: number, peak: number): BidSpike => ({
  Index: index,
  StartTs: peakTs - HOUR,
  EndTs: peakTs + HOUR,
  PeakTs: peakTs,
  PeakNumBids: peak,
  TotalBids: peak + 5,
  BucketCount: 3,
});

const spikes = [
  spike(0, AUG_12 + 9 * HOUR, 34),
  spike(1, AUG_12 + 15 * HOUR, 20),
  spike(2, AUG_12 + 20 * 86_400, 12),
];

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseBidTimeBounds.mockReturnValue(ok({ MinTs: AUG_12 - 86_400, MaxTs: NOW_SEC }));
  mockUseBiddingActivity.mockReturnValue(ok({ Spikes: spikes, RecentSpikeIndex: -1 }));
  mockUseBidFrequency.mockReturnValue(
    ok([
      { BucketTs: AUG_12 + 19 * 86_400, NumBids: 2 },
      { BucketTs: AUG_12 + 20 * 86_400, NumBids: 12 },
    ]),
  );
});

describe('defaultSpikeIndex', () => {
  it('prefers the recent spike, else the latest by start', () => {
    expect(defaultSpikeIndex(spikes, 1)).toBe(1);
    expect(defaultSpikeIndex(spikes, -1)).toBe(2);
    expect(defaultSpikeIndex([], -1)).toBeNull();
  });
});

describe('LastBidSpikeChart', () => {
  it('opens on the latest spike when none is recent, never on an empty frame', () => {
    render(<LastBidSpikeChart label="Gesture spikes" />);
    expect(screen.getByRole('radio', { checked: true })).toHaveTextContent('Sep 1');
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-point-count', '2');
    expect(screen.getByText('No spikes recently.')).toBeInTheDocument();
  });

  it('names each spike by its date, adding the hour when two share a day', () => {
    render(<LastBidSpikeChart label="Gesture spikes" />);
    const names = screen.getAllByRole('radio').map((el) => el.textContent);
    expect(names).toEqual(['Aug 12 09:00', 'Aug 12 15:00', 'Sep 1']);
    expect(screen.getByRole('radiogroup', { name: /Spikes \(3\)/ })).toBeInTheDocument();
  });

  it('loads the hours around the spike a reader picks', async () => {
    const user = userEvent.setup();
    render(<LastBidSpikeChart label="Gesture spikes" />);
    await user.click(screen.getByRole('radio', { name: /Aug 12.*09:00/ }));
    const [from, to] = mockUseBidFrequency.mock.calls.at(-1)!;
    expect(from as number).toBeLessThan(spikes[0]!.StartTs);
    expect(to as number).toBeGreaterThan(spikes[0]!.EndTs);
  });

  it('lists the hours as a table on request', async () => {
    const user = userEvent.setup();
    render(<LastBidSpikeChart label="Gesture spikes" />);
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    expect(
      within(screen.getByRole('table', { name: 'Gesture spikes' })).getByText('12'),
    ).toBeInTheDocument();
  });

  it('says there are no spikes when the history has none', () => {
    mockUseBiddingActivity.mockReturnValue(ok({ Spikes: [], RecentSpikeIndex: -1 }));
    render(<LastBidSpikeChart label="Gesture spikes" />);
    expect(screen.getByText('No gesture spikes detected in indexed history.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<LastBidSpikeChart label="Gesture spikes" />);
    await checkA11y(container);
  });
});
// lexicon-allow-end
