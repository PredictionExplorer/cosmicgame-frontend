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
  lastBidder: {
    address: enduranceAddress,
    holdDuration: 3600,
    lastBidTime: 1000,
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

  it('renders all three allocation category labels', () => {
    render(<SpecialAllocationRecipients />);
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

  it('uses the Chrono-Warrior address rather than the Endurance Champion address', () => {
    render(<SpecialAllocationRecipients />);

    const chronoCard = screen.getByTestId('special-allocation-card-chrono-warrior');
    expect(chronoCard).toHaveTextContent(chronoAddress);
    expect(chronoCard).not.toHaveTextContent(enduranceAddress);
  });

  it('shows live and locked status chips for timed roles', () => {
    render(<SpecialAllocationRecipients />);

    expect(screen.getByTestId('champion-live-chip')).toHaveTextContent('Live - growing');
    expect(screen.getByTestId('champion-locked-chip')).toHaveTextContent('Locked record');
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
    expect(cstCard).not.toHaveTextContent('Locked record');
  });

  it('renders empty role copy when addresses are unavailable', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      hasData: true,
      endurance: { ...baseChampions.endurance, address: null, duration: 0, isLive: false },
      chrono: { ...baseChampions.chrono, address: null, duration: 0, isLive: false },
      lastCst: { address: null },
    });

    render(<SpecialAllocationRecipients />);

    expect(screen.getByText('No endurance record yet')).toBeInTheDocument();
    expect(screen.getByText('No Chrono-Warrior record yet')).toBeInTheDocument();
    expect(screen.getByText('Awaiting first CST gesture')).toBeInTheDocument();
  });

  it('renders loading cards when the champions query is loading', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      isLoading: true,
      hasData: false,
    });

    const { container } = render(<SpecialAllocationRecipients />);
    expect(container.querySelectorAll('[data-special-allocation-card]')).toHaveLength(3);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SpecialAllocationRecipients />);
    await checkA11y(container);
  });
});
