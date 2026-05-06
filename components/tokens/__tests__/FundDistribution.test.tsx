import { render, screen, checkA11y } from '@/test-utils';

import { FundDistribution } from '../FundDistribution';

const createData = (overrides = {}) => ({
  PrizePercentage: 25,
  RafflePercentage: 4,
  CharityPercentage: 7,
  StakingPercentage: 6,
  ChronoWarriorPercentage: 8,
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
    expect(screen.getByText('Signature Allocation')).toBeInTheDocument();
    expect(screen.getByText('Stellar Selection')).toBeInTheDocument();
    expect(screen.getByText('Public Goods')).toBeInTheDocument();
    expect(screen.getByText('Anchor Distribution')).toBeInTheDocument();
    expect(screen.getByText('Chrono-Warrior')).toBeInTheDocument();
    expect(screen.getByText('Next cycle')).toBeInTheDocument();
  });

  it('renders percentage values for each category', () => {
    render(<FundDistribution data={createData()} />);
    expect(screen.getByText(/^25%/)).toBeInTheDocument();
    expect(screen.getByText(/^50%/)).toBeInTheDocument();
    expect(screen.getByText(/^8%/)).toBeInTheDocument();
    expect(screen.getByText(/^7%/)).toBeInTheDocument();
    expect(screen.getByText(/^6%/)).toBeInTheDocument();
    expect(screen.getByText(/^4%/)).toBeInTheDocument();
  });

  it('renders ETH amounts', () => {
    render(<FundDistribution data={createData({ CosmicGameBalanceEth: 100 })} />);
    expect(screen.getByText(/25\.0000 ETH/)).toBeInTheDocument();
    expect(screen.getByText(/50\.0000 ETH/)).toBeInTheDocument();
    expect(screen.getByText(/8\.0000 ETH/)).toBeInTheDocument();
    expect(screen.getByText(/7\.0000 ETH/)).toBeInTheDocument();
    expect(screen.getByText(/6\.0000 ETH/)).toBeInTheDocument();
    expect(screen.getByText(/4\.0000 ETH/)).toBeInTheDocument();
  });

  it('computes Next round as the remainder', () => {
    render(<FundDistribution data={createData()} />);
    // 100 - 25 - 4 - 7 - 6 - 8 = 50%
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    render(<FundDistribution />);
    expect(screen.getByTestId('fund-distribution')).toBeInTheDocument();
    expect(screen.getByText('Next cycle')).toBeInTheDocument();
  });

  it('clamps negative percentages to zero', () => {
    render(<FundDistribution data={createData({ PrizePercentage: -10 })} />);
    expect(screen.getByText('Signature Allocation')).toBeInTheDocument();
    const allocationRow = screen.getByText('Signature Allocation').closest('[class*="group"]')!;
    expect(allocationRow).toHaveTextContent('0%');
  });

  it('clamps percentages above 100 to 100', () => {
    render(<FundDistribution data={createData({ RafflePercentage: 200 })} />);
    const stellarSelectionRow = screen.getByText('Stellar Selection').closest('[class*="group"]')!;
    expect(stellarSelectionRow).toHaveTextContent('100%');
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
    expect(labels[0]).toBe('Next cycle');
    expect(labels[1]).toBe('Signature Allocation');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FundDistribution data={createData()} />);
    await checkA11y(container);
  }, 15_000);
});
