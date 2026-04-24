import '@testing-library/jest-dom';
import { Sparkles } from 'lucide-react';

import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';

import { render, screen, checkA11y } from '@/test-utils';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total ETH" value="1,234" />);
    expect(screen.getByText(/total eth/i)).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('shows a skeleton when loading', () => {
    const { container } = render(<StatCard label="X" value="1" loading />);
    expect(container.querySelector('.overflow-hidden')).not.toBeNull();
    expect(screen.queryByText('1')).toBeNull();
  });

  it('renders an icon in a tinted slot', () => {
    render(<StatCard label="x" value="1" icon={<Sparkles data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies gradient-border-card for featured variant', () => {
    const { container } = render(<StatCard label="x" value="1" featured />);
    expect(container.firstElementChild).toHaveClass('gradient-border-card');
  });

  it('renders an up-trend pill when delta is positive', () => {
    render(
      <StatCard label="Contributors" value="42" trend={{ delta: 12.5, label: 'vs last cycle' }} />,
    );
    expect(screen.getByText(/\+12\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/vs last cycle/i)).toBeInTheDocument();
  });

  it('renders a down-trend pill when delta is negative', () => {
    render(
      <StatCard
        label="Time to finalize"
        value="8.1s"
        trend={{ delta: -4.0, label: 'faster than last' }}
      />,
    );
    expect(screen.getByText(/-4\.0%/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StatCard label="Cycles" value={42} />);
    await checkA11y(container);
  });
});

describe('StatCardSkeleton', () => {
  it('renders a placeholder container', () => {
    const { container } = render(<StatCardSkeleton />);
    expect(container.firstElementChild).toHaveClass('rounded-[var(--radius-card)]');
  });
});
