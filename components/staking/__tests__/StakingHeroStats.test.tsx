import { Coins, Users } from 'lucide-react';

import { checkA11y, render, screen } from '@/test-utils';

import { StakingHeroStats } from '../StakingHeroStats';
import type { StakingStatItem } from '../StakingHeroStats';

const baseStats: StakingStatItem[] = [
  {
    label: 'Staking Pool',
    value: '1.5000 ETH',
    tooltip: 'Total ETH in the staking pool.',
    icon: <Coins className="h-4 w-4" />,
    featured: true,
    gradient: true,
  },
  {
    label: 'CST Tokens Staked',
    value: '42',
    tooltip: 'Total CST tokens staked.',
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: 'RWLK Tokens Staked',
    value: '7',
    tooltip: 'Total RWLK tokens staked.',
  },
];

describe('StakingHeroStats', () => {
  it('renders all stat cards with correct labels and values', () => {
    render(<StakingHeroStats stats={baseStats} />);
    expect(screen.getByText('Staking Pool')).toBeInTheDocument();
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
    expect(screen.getByText('CST Tokens Staked')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('RWLK Tokens Staked')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders skeleton placeholders when loading', () => {
    render(<StakingHeroStats stats={baseStats} loading />);
    expect(screen.getByTestId('staking-stats-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('1.5000 ETH')).not.toBeInTheDocument();
  });

  it('does not render skeleton when not loading', () => {
    render(<StakingHeroStats stats={baseStats} />);
    expect(screen.queryByTestId('staking-stats-skeleton')).not.toBeInTheDocument();
  });

  it('renders with empty stats array', () => {
    const { container } = render(<StakingHeroStats stats={[]} />);
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });

  it('renders a single stat correctly', () => {
    render(<StakingHeroStats stats={[baseStats[0]!]} />);
    expect(screen.getByText('Staking Pool')).toBeInTheDocument();
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<StakingHeroStats stats={baseStats} className="mb-10" />);
    expect(container.firstChild).toHaveClass('mb-10');
  });

  it('renders stat without icon', () => {
    render(<StakingHeroStats stats={[baseStats[2]!]} />);
    expect(screen.getByText('RWLK Tokens Staked')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StakingHeroStats stats={baseStats} />);
    await checkA11y(container);
  });

  it('has no accessibility violations in loading state', async () => {
    const { container } = render(<StakingHeroStats stats={baseStats} loading />);
    await checkA11y(container);
  });
});
