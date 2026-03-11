import '@testing-library/jest-dom';

import Prize from '@/components/common/Prize';

import { render, screen } from '@/test-utils';


const mockData = {
  PrizeAmountEth: 1.5,
  RaffleAmountEth: 0.5,
  NumRaffleEthWinnersBidding: 5,
  NumRaffleNFTWinnersBidding: 3,
  NumRaffleNFTWinnersStakingRWalk: 2,
  StakingAmountEth: 0.75,
  CosmicGameBalanceEth: 10,
  ChronoWarriorPercentage: 5,
  CurNumBids: 100,
};

describe('Prize', () => {
  it('renders table heading', () => {
    render(<Prize data={mockData} />);
    expect(screen.getByText('LIST OF AVAILABLE PRIZES')).toBeInTheDocument();
  });

  it('renders Main Prize link', () => {
    render(<Prize data={mockData} />);
    const mainPrize = screen.getByText('Main Prize');
    expect(mainPrize.closest('a')).toHaveAttribute('href', '/faq#main-prize');
  });

  it('renders Chrono Warrior link', () => {
    render(<Prize data={mockData} />);
    const chrono = screen.getByText('Chrono Warrior');
    expect(chrono.closest('a')).toHaveAttribute('href', '/faq#chrono-warrior');
  });

  it('renders Endurance Champion link', () => {
    render(<Prize data={mockData} />);
    const endurance = screen.getByText('Endurance Champion');
    expect(endurance.closest('a')).toHaveAttribute('href', '/faq#endurance-champion');
  });

  it('sets target="_blank" on all external links', () => {
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

  it('displays prize amounts from data', () => {
    render(<Prize data={mockData} />);
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
    expect(screen.getByText('0.7500 ETH')).toBeInTheDocument();
  });

  it('displays raffle winner counts', () => {
    render(<Prize data={mockData} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2 or 0')).toBeInTheDocument();
  });

  it('calculates Chrono Warrior ETH correctly', () => {
    render(<Prize data={mockData} />);
    const expected = ((10 * 5) / 100).toFixed(4);
    expect(screen.getByText(`${expected} ETH`)).toBeInTheDocument();
  });

  it('calculates CST amounts from bid count', () => {
    render(<Prize data={mockData} />);
    const cstAmounts = screen.getAllByText('1000 CST');
    expect(cstAmounts.length).toBe(2);
  });

  it('renders with null data without crashing', () => {
    render(<Prize data={null} />);
    expect(screen.getByText('LIST OF AVAILABLE PRIZES')).toBeInTheDocument();
  });
});
