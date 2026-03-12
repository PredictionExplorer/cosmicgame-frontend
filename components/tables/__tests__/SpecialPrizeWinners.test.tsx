import '@testing-library/jest-dom';

import { checkA11y, render, screen } from '@/test-utils';

const mockSpecialWinners = {
  EnduranceChampionAddress: '0x1111111111111111111111111111111111111111',
  EnduranceChampionDuration: 3600,
  LastCstBidderAddress: '0x2222222222222222222222222222222222222222',
};

const mockUseCurrentSpecialWinners = jest.fn(() => ({
  data: mockSpecialWinners as typeof mockSpecialWinners | undefined,
}));
jest.mock('../../../hooks/useApiQuery', () => ({
  useCurrentSpecialWinners: () => mockUseCurrentSpecialWinners(),
}));

// eslint-disable-next-line import/order
import { SpecialPrizeWinners } from '@/components/tables/SpecialPrizeWinners';

describe('SpecialPrizeWinners', () => {
  it('renders section heading', () => {
    render(<SpecialPrizeWinners />);
    expect(screen.getByText('Special Prize Leaders')).toBeInTheDocument();
  });

  it('renders all three prize category labels', () => {
    render(<SpecialPrizeWinners />);
    expect(screen.getByText('Endurance Champion')).toBeInTheDocument();
    expect(screen.getByText('Chrono Warrior')).toBeInTheDocument();
    expect(screen.getByText('Last CST Bidder')).toBeInTheDocument();
  });

  it('renders winner addresses as links', () => {
    render(<SpecialPrizeWinners />);
    const links = screen.getAllByRole('link');
    const championLink = links.find((l) =>
      l.getAttribute('href')?.includes(mockSpecialWinners.EnduranceChampionAddress),
    );
    expect(championLink).toBeInTheDocument();
    const cstLink = links.find((l) =>
      l.getAttribute('href')?.includes(mockSpecialWinners.LastCstBidderAddress),
    );
    expect(cstLink).toBeInTheDocument();
  });

  it('shows duration when EnduranceChampionDuration > 0', () => {
    render(<SpecialPrizeWinners />);
    expect(screen.getAllByText(/Held for/).length).toBeGreaterThanOrEqual(1);
  });

  it('hides duration when EnduranceChampionDuration is 0', () => {
    mockUseCurrentSpecialWinners.mockReturnValue({
      data: { ...mockSpecialWinners, EnduranceChampionDuration: 0 },
    });
    render(<SpecialPrizeWinners />);
    expect(screen.queryByText(/Held for/)).not.toBeInTheDocument();
  });

  it('renders without data (undefined specialWinners)', () => {
    mockUseCurrentSpecialWinners.mockReturnValue({ data: undefined });
    render(<SpecialPrizeWinners />);
    expect(screen.getByText('Special Prize Leaders')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SpecialPrizeWinners />);
    await checkA11y(container);
  });
});
