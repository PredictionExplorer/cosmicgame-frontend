import { render, screen, checkA11y } from '@/test-utils';

import { FundDistribution } from '../FundDistribution';

const createData = (overrides = {}) => ({
  PrizePercentage: 25,
  RafflePercentage: 10,
  CharityPercentage: 10,
  StakingPercentage: 5,
  ChronoWarriorPercentage: 5,
  CosmicGameBalanceEth: 10,
  ...overrides,
});

describe('FundDistribution', () => {
  it('renders the container', () => {
    render(<FundDistribution data={createData()} />);
    expect(screen.getByTestId('fund-distribution')).toBeInTheDocument();
  });

  it('renders all six category labels', () => {
    render(<FundDistribution data={createData()} />);
    expect(screen.getByText('Prize')).toBeInTheDocument();
    expect(screen.getByText('Raffle')).toBeInTheDocument();
    expect(screen.getByText('Charity')).toBeInTheDocument();
    expect(screen.getByText('Staking')).toBeInTheDocument();
    expect(screen.getByText('Chrono Warrior')).toBeInTheDocument();
    expect(screen.getByText('Next round')).toBeInTheDocument();
  });

  it('renders percentage values for each category', () => {
    render(<FundDistribution data={createData()} />);
    expect(screen.getByText(/^25%/)).toBeInTheDocument();
    expect(screen.getByText(/^45%/)).toBeInTheDocument();
    // 10% appears twice (Raffle and Charity)
    expect(screen.getAllByText(/^10%/)).toHaveLength(2);
    // 5% appears twice (Staking and Chrono Warrior)
    expect(screen.getAllByText(/^5%/)).toHaveLength(2);
  });

  it('renders ETH amounts', () => {
    render(<FundDistribution data={createData({ CosmicGameBalanceEth: 100 })} />);
    expect(screen.getByText(/25\.0000 ETH/)).toBeInTheDocument();
    expect(screen.getByText(/45\.0000 ETH/)).toBeInTheDocument();
    // 10.0000 ETH appears twice (Raffle and Charity)
    expect(screen.getAllByText(/10\.0000 ETH/)).toHaveLength(2);
  });

  it('computes Next round as the remainder', () => {
    render(<FundDistribution data={createData()} />);
    // 100 - 25 - 10 - 10 - 5 - 5 = 45%
    expect(screen.getByText(/45%/)).toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    render(<FundDistribution />);
    expect(screen.getByTestId('fund-distribution')).toBeInTheDocument();
    expect(screen.getByText('Next round')).toBeInTheDocument();
  });

  it('clamps negative percentages to zero', () => {
    render(<FundDistribution data={createData({ PrizePercentage: -10 })} />);
    expect(screen.getByText('Prize')).toBeInTheDocument();
    const prizeRow = screen.getByText('Prize').closest('[class*="group"]')!;
    expect(prizeRow).toHaveTextContent('0%');
  });

  it('clamps percentages above 100 to 100', () => {
    render(<FundDistribution data={createData({ RafflePercentage: 200 })} />);
    const raffleRow = screen.getByText('Raffle').closest('[class*="group"]')!;
    expect(raffleRow).toHaveTextContent('100%');
  });

  it('renders tooltip icons for each category', () => {
    const { container } = render(<FundDistribution data={createData()} />);
    const tooltipTriggers = container.querySelectorAll('[data-state="closed"]');
    expect(tooltipTriggers.length).toBeGreaterThanOrEqual(6);
  });

  it('sorts categories in descending order by value', () => {
    const { container } = render(<FundDistribution data={createData()} />);
    const rows = container.querySelectorAll('[class*="group"]');
    const labels = Array.from(rows).map((row) => {
      const labelEl = row.querySelector('.text-sm.font-medium.text-white');
      return labelEl?.textContent;
    });
    expect(labels[0]).toBe('Next round');
    expect(labels[1]).toBe('Prize');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FundDistribution data={createData()} />);
    await checkA11y(container);
  }, 15_000);
});
