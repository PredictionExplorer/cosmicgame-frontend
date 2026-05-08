import '@testing-library/jest-dom';

import { SpecialAllocationRecipients } from '@/components/tables/SpecialAllocationRecipients';
import type { ChampionsState } from '@/hooks/useChampions';

import { checkA11y, render, screen } from '@/test-utils';

const enduranceAddress = '0x1111111111111111111111111111111111111111';
const chronoAddress = '0x3333333333333333333333333333333333333333';
const lastCstAddress = '0x2222222222222222222222222222222222222222';

const baseChampions: ChampionsState = {
  isLoading: false,
  hasData: true,
  endurance: {
    address: enduranceAddress,
    duration: 3600,
    lockedDuration: 3000,
    isLive: true,
  },
  chrono: {
    address: chronoAddress,
    duration: 1800,
    lockedDuration: 1800,
    isLive: false,
  },
  lastCst: {
    address: lastCstAddress,
  },
  latestGesture: {
    address: enduranceAddress,
    holdDuration: 3600,
    latestGestureTime: 1000,
    isCurrentEnduranceChampion: true,
    isExtendingEnduranceRecord: true,
    durationToBeat: 3001,
    secondsUntilEnduranceChampion: 0,
    progressToEnduranceChampion: 100,
  },
  raw: null,
};

const mockUseChampions = jest.fn(() => baseChampions);
jest.mock('../../../hooks/useChampions', () => ({
  useChampions: () => mockUseChampions(),
}));

describe('SpecialAllocationRecipients', () => {
  beforeEach(() => {
    mockUseChampions.mockReturnValue(baseChampions);
  });

  it('renders section heading', () => {
    render(<SpecialAllocationRecipients />);
    expect(screen.getByTestId('special-allocation-heading')).toHaveTextContent(
      'Special Allocation Leaders',
    );
  });

  it('renders all four allocation category labels', () => {
    render(<SpecialAllocationRecipients />);
    expect(screen.getByText('Latest Participant')).toBeInTheDocument();
    expect(screen.getByText('Endurance Champion')).toBeInTheDocument();
    expect(screen.getByText('Chrono-Warrior')).toBeInTheDocument();
    expect(screen.getByText('Final CST Gesture')).toBeInTheDocument();
  });

  it('renders all recipient addresses as links', () => {
    render(<SpecialAllocationRecipients />);
    const links = screen.getAllByRole('link');

    expect(links.some((l) => l.getAttribute('href') === `/user/${enduranceAddress}`)).toBe(true);
    expect(links.some((l) => l.getAttribute('href') === `/user/${chronoAddress}`)).toBe(true);
    expect(links.some((l) => l.getAttribute('href') === `/user/${lastCstAddress}`)).toBe(true);
  });

  it('renders the Latest Participant card with current hold and extending state', () => {
    render(<SpecialAllocationRecipients />);

    const latestCard = screen.getByTestId('special-allocation-card-latest-participant');
    expect(latestCard).toHaveTextContent(enduranceAddress);
    expect(latestCard).toHaveTextContent('Current hold');
    expect(latestCard).toHaveTextContent('1h');
    expect(latestCard).toHaveTextContent('Extending Endurance Champion record');
  });

  it('shows remaining time and accessible progress when a different latest participant is still challenging', () => {
    const latestAddress = '0x4444444444444444444444444444444444444444';
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      endurance: {
        ...baseChampions.endurance,
        isLive: false,
        duration: 100,
      },
      latestGesture: {
        address: latestAddress,
        holdDuration: 60,
        latestGestureTime: 1040,
        isCurrentEnduranceChampion: false,
        isExtendingEnduranceRecord: false,
        durationToBeat: 101,
        secondsUntilEnduranceChampion: 41,
        progressToEnduranceChampion: 59.4,
      },
    });

    render(<SpecialAllocationRecipients />);

    const latestCard = screen.getByTestId('special-allocation-card-latest-participant');
    expect(latestCard).toHaveTextContent(latestAddress);
    expect(screen.getByTestId('latest-participant-remaining')).toHaveTextContent(
      'Needs 41s more to become Endurance Champion',
    );

    const progress = screen.getByRole('progressbar', {
      name: 'Progress toward Endurance Champion',
    });
    expect(progress).toHaveAttribute('aria-valuenow', '59');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows a progress bar without live-growing the endurance card when the same participant is under threshold', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      endurance: {
        ...baseChampions.endurance,
        isLive: false,
        duration: 500,
      },
      latestGesture: {
        ...baseChampions.latestGesture,
        holdDuration: 200,
        isCurrentEnduranceChampion: true,
        isExtendingEnduranceRecord: false,
        durationToBeat: 501,
        secondsUntilEnduranceChampion: 301,
        progressToEnduranceChampion: 39.9,
      },
    });

    render(<SpecialAllocationRecipients />);

    const enduranceCard = screen.getByTestId('special-allocation-card-endurance-champion');
    expect(enduranceCard).not.toHaveTextContent('Live - growing');
    expect(enduranceCard).toHaveTextContent('Record standing');

    expect(screen.getByTestId('latest-participant-remaining')).toHaveTextContent(
      'Needs 5m 1s more to extend record',
    );
    expect(
      screen.getByRole('progressbar', { name: 'Progress toward Endurance Champion' }),
    ).toHaveAttribute('aria-valuenow', '39');
  });

  it('uses the Chrono-Warrior address rather than the Endurance Champion address', () => {
    render(<SpecialAllocationRecipients />);

    const chronoCard = screen.getByTestId('special-allocation-card-chrono-warrior');
    expect(chronoCard).toHaveTextContent(chronoAddress);
    expect(chronoCard).not.toHaveTextContent(enduranceAddress);
  });

  it('shows live and locked status chips for timed roles', () => {
    render(<SpecialAllocationRecipients />);

    expect(screen.getAllByTestId('champion-live-chip').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('champion-locked-chip')).toHaveTextContent('Record standing');
  });

  it('renders distinct duration labels and formatted durations for both timed roles', () => {
    render(<SpecialAllocationRecipients />);

    const enduranceCard = screen.getByTestId('special-allocation-card-endurance-champion');
    expect(enduranceCard).toHaveTextContent('Endurance window');
    expect(enduranceCard).toHaveTextContent('1h');

    const chronoCard = screen.getByTestId('special-allocation-card-chrono-warrior');
    expect(chronoCard).toHaveTextContent('Champion reign');
    expect(chronoCard).toHaveTextContent('30m');
  });

  it('does not render a live or locked timer badge on the Final CST card', () => {
    render(<SpecialAllocationRecipients />);

    const cstCard = screen.getByTestId('special-allocation-card-final-cst-gesture');
    expect(cstCard).not.toHaveTextContent('Live - growing');
    expect(cstCard).not.toHaveTextContent('Record standing');
  });

  it('renders empty role copy when addresses are unavailable', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      hasData: true,
      latestGesture: {
        ...baseChampions.latestGesture,
        address: null,
        holdDuration: 0,
        latestGestureTime: null,
        isCurrentEnduranceChampion: false,
        isExtendingEnduranceRecord: false,
        durationToBeat: 0,
        secondsUntilEnduranceChampion: 0,
        progressToEnduranceChampion: 0,
      },
      endurance: { ...baseChampions.endurance, address: null, duration: 0, isLive: false },
      chrono: { ...baseChampions.chrono, address: null, duration: 0, isLive: false },
      lastCst: { address: null },
    });

    render(<SpecialAllocationRecipients />);

    expect(screen.getByText('No latest gesture yet')).toBeInTheDocument();
    expect(screen.getByText('No endurance record yet')).toBeInTheDocument();
    expect(screen.getByText('No Chrono-Warrior record yet')).toBeInTheDocument();
    expect(screen.getByText('Awaiting first CST gesture')).toBeInTheDocument();
  });

  it('shows first-record copy when latest participant exists before an endurance record', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      endurance: { ...baseChampions.endurance, address: null, duration: 0, isLive: false },
      latestGesture: {
        ...baseChampions.latestGesture,
        isCurrentEnduranceChampion: false,
        isExtendingEnduranceRecord: false,
        durationToBeat: 0,
        secondsUntilEnduranceChampion: 0,
        progressToEnduranceChampion: 0,
      },
    });

    render(<SpecialAllocationRecipients />);

    expect(screen.getByText('First endurance record forming')).toBeInTheDocument();
  });

  it('renders loading cards when the champions query is loading', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      isLoading: true,
      hasData: false,
    });

    const { container } = render(<SpecialAllocationRecipients />);
    expect(container.querySelectorAll('[data-special-allocation-card]')).toHaveLength(4);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SpecialAllocationRecipients />);
    await checkA11y(container);
  });
});
