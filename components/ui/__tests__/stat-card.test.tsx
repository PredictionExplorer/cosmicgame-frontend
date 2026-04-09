import '@testing-library/jest-dom';
import { Hash } from 'lucide-react';

import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';

import { render, screen, checkA11y } from '@/test-utils';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Bids" value={42} />);
    expect(screen.getByText('Total Bids')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders the tooltip icon when tooltip prop is provided', () => {
    render(<StatCard label="Pool" value="1.5 ETH" tooltip="ETH prize pool" />);
    const trigger = document.querySelector('[data-state]');
    expect(trigger).toBeInTheDocument();
    expect(trigger!.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render a tooltip icon when tooltip is omitted', () => {
    render(<StatCard label="Pool" value="1.5 ETH" />);
    const trigger = document.querySelector('[data-state]');
    expect(trigger).toBeNull();
  });

  it('renders a loading skeleton when loading is true', () => {
    const { container } = render(<StatCard label="Bids" value={0} loading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('applies gradient text styling when gradient is true', () => {
    render(<StatCard label="Prize" value="5 ETH" gradient />);
    const value = screen.getByText('5 ETH');
    expect(value).toHaveClass('bg-clip-text');
    expect(value).toHaveClass('text-transparent');
  });

  it('applies featured card styling when featured is true', () => {
    const { container } = render(<StatCard label="Featured" value="VIP" featured />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('gradient-border-card');
    expect(card).toHaveClass('gradient-border-card-accent');
  });

  it('renders an icon when provided', () => {
    render(
      <StatCard label="Bids" value={10} icon={<Hash data-testid="icon" className="h-4 w-4" />} />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<StatCard label="A" value="B" className="my-stat" />);
    expect(container.firstChild).toHaveClass('my-stat');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <StatCard
        label="Bids"
        value={42}
        tooltip="Total bids in this round"
        icon={<Hash className="h-4 w-4" />}
      />,
    );
    await checkA11y(container);
  });
});

describe('StatCardSkeleton', () => {
  it('renders skeleton placeholders', () => {
    const { container } = render(<StatCardSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });

  it('applies custom className', () => {
    const { container } = render(<StatCardSkeleton className="custom-skel" />);
    expect(container.firstChild).toHaveClass('custom-skel');
  });
});
