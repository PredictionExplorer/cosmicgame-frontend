import '@testing-library/jest-dom';

import Prize from '@/components/common/Allocation';

import { checkA11y, render, screen } from '@/test-utils';

const mockData = {
  PrizeAmountEth: 1.5,
  RaffleAmountEth: 0.5,
  NumRaffleEthWinnersBidding: 5,
  NumRaffleNFTWinnersBidding: 3,
  NumRaffleNFTWinnersStakingRWalk: 2,
  StakingAmountEth: 0.75,
  CosmicGameBalanceEth: 10,
  ChronoWarriorPercentage: 5,
};

describe('Allocation Breakdown', () => {
  it('renders section heading', () => {
    render(<Prize data={mockData} />);
    expect(screen.getByText('Allocation Breakdown')).toBeInTheDocument();
  });

  it('renders Signature Allocation link', () => {
    render(<Prize data={mockData} />);
    const main = screen.getByText('Signature Allocation');
    expect(main.closest('a')).toHaveAttribute('href', '/faq#main-allocation');
  });

  it('renders Chrono-Warrior Allocation link', () => {
    render(<Prize data={mockData} />);
    const chrono = screen.getByText('Chrono-Warrior Allocation');
    expect(chrono.closest('a')).toHaveAttribute('href', '/faq#chrono-warrior');
  });

  it('renders Endurance Champion link', () => {
    render(<Prize data={mockData} />);
    const endurance = screen.getByText('Endurance Champion');
    expect(endurance.closest('a')).toHaveAttribute('href', '/faq#endurance-champion');
  });

  it('sets target="_blank" on all FAQ links', () => {
    render(<Prize data={mockData} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(3);
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
    }
  });

  it('sets rel="noopener noreferrer" on all target="_blank" links', () => {
    render(<Prize data={mockData} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('displays allocation amounts from data', () => {
    render(<Prize data={mockData} />);
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
    expect(screen.getByText('0.7500 ETH')).toBeInTheDocument();
  });

  it('displays Stellar Selection recipient counts', () => {
    render(<Prize data={mockData} />);
    expect(screen.getByText('5 recipients')).toBeInTheDocument();
    expect(screen.getByText('3 recipients')).toBeInTheDocument();
    expect(screen.getByText('2 recipients')).toBeInTheDocument();
    expect(screen.getAllByText('1 recipient')).toHaveLength(5);
  });

  it('calculates Chrono-Warrior ETH correctly', () => {
    render(<Prize data={mockData} />);
    const expected = ((10 * 5) / 100).toFixed(4);
    expect(screen.getByText(`${expected} ETH`)).toBeInTheDocument();
  });

  it('shows fixed Recognition CST amount for Endurance Champion and Final CST Gesture', () => {
    render(<Prize data={mockData} />);
    const cstAmounts = screen.getAllByText('1,000 CST');
    expect(cstAmounts.length).toBe(3);
  });

  it('renders with null data without crashing', () => {
    render(<Prize data={null} />);
    expect(screen.getByText('Allocation Breakdown')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Prize data={mockData} />);
    await checkA11y(container);
  });
});
