import { Coins, Users } from 'lucide-react';

import { checkA11y, render, screen } from '@/test-utils';

import { AnchoringHeroStats } from '../AnchoringHeroStats';
import type { AnchoringStatItem } from '../AnchoringHeroStats';

const baseStats: AnchoringStatItem[] = [
  {
    label: 'Anchor Distribution Pool',
    value: '1.5000 ETH',
    tooltip: 'Total ETH in the Anchor Distribution pool.',
    icon: <Coins className="h-4 w-4" />,
    featured: true,
    gradient: true,
  },
  {
    label: 'CST Tokens Anchored',
    value: '42',
    tooltip: 'Total CST tokens anchored.',
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: 'RWLK Tokens Anchored',
    value: '7',
    tooltip: 'Total RWLK tokens anchored.',
  },
];

describe('AnchoringHeroStats', () => {
  it('renders all stat cards with correct labels and values', () => {
    render(<AnchoringHeroStats stats={baseStats} />);
    expect(screen.getByText('Anchor Distribution Pool')).toBeInTheDocument();
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
    expect(screen.getByText('CST Tokens Anchored')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('RWLK Tokens Anchored')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders skeleton placeholders when loading', () => {
    render(<AnchoringHeroStats stats={baseStats} loading />);
    expect(screen.getByTestId('anchoring-stats-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('1.5000 ETH')).not.toBeInTheDocument();
  });

  it('does not render skeleton when not loading', () => {
    render(<AnchoringHeroStats stats={baseStats} />);
    expect(screen.queryByTestId('anchoring-stats-skeleton')).not.toBeInTheDocument();
  });

  it('renders with empty stats array', () => {
    const { container } = render(<AnchoringHeroStats stats={[]} />);
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });

  it('renders a single stat correctly', () => {
    render(<AnchoringHeroStats stats={[baseStats[0]!]} />);
    expect(screen.getByText('Anchor Distribution Pool')).toBeInTheDocument();
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<AnchoringHeroStats stats={baseStats} className="mb-10" />);
    expect(container.firstChild).toHaveClass('mb-10');
  });

  it('renders stat without icon', () => {
    render(<AnchoringHeroStats stats={[baseStats[2]!]} />);
    expect(screen.getByText('RWLK Tokens Anchored')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchoringHeroStats stats={baseStats} />);
    await checkA11y(container);
  });

  it('has no accessibility violations in loading state', async () => {
    const { container } = render(<AnchoringHeroStats stats={baseStats} loading />);
    await checkA11y(container);
  });
});
