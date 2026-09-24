import '@testing-library/jest-dom';
import { Sparkles } from 'lucide-react';
import userEvent from '@testing-library/user-event';

import { StatCard, StatCardSkeleton, StatGrid } from '@/components/ui/stat-card';

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

  it('draws emphasis as the signature ring alone, with no border underneath', () => {
    const { container } = render(<StatCard label="x" value="1" emphasis />);
    expect(container.firstElementChild).toHaveClass('gradient-border-card', 'border-transparent');
    expect(container.firstElementChild).not.toHaveClass('border-rule-faint');
  });

  it('maps the deprecated featured and gradient flags onto emphasis', () => {
    const { container } = render(
      <>
        <StatCard label="a" value="1" featured />
        <StatCard label="b" value="2" gradient />
      </>,
    );
    const cards = container.querySelectorAll('[data-emphasis]');
    expect(cards).toHaveLength(2);
  });

  it.each([
    ['hero', 'type-figure-lg'],
    ['md', 'text-2xl'],
    ['compact', 'text-base'],
  ] as const)('sets the %s figure in tabular Inter', (size, sizeClass) => {
    render(<StatCard label="Gestures" value="1,135" size={size} />);
    const value = screen.getByText('1,135');
    expect(value).toHaveClass(sizeClass);
    if (size !== 'hero') expect(value).toHaveClass('tabular-nums', 'slashed-zero');
  });

  it('keeps the label in sentence case and hyphenates it instead of chopping a word', () => {
    render(<StatCard label="Signature Allocations received" value="8" />);
    const label = screen.getByText('Signature Allocations received');
    expect(label).toHaveClass('type-label', 'hyphens-auto');
    expect(label).not.toHaveClass('type-eyebrow');
  });

  it('renders as a definition-list group with an sr-only description', () => {
    render(
      <dl>
        <StatCard
          label="Active Performance Cycle"
          value="2"
          semantics="definition"
          srDescription="The cycle that is open now."
        />
      </dl>,
    );
    expect(screen.getByRole('term')).toHaveTextContent('Active Performance Cycle');
    const definitions = screen.getAllByRole('definition');
    expect(definitions[0]).toHaveTextContent('2');
    expect(screen.getByText('The cycle that is open now.')).toHaveClass('sr-only');
  });

  it('lays out compact cards two across from the smallest phone', () => {
    const { container } = render(
      <StatGrid size="compact">
        <StatCard label="a" value="1" size="compact" />
      </StatGrid>,
    );
    expect(container.firstElementChild).toHaveClass('grid-cols-2');
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

  it('explains the figure from its label instead of an extra icon', async () => {
    const user = userEvent.setup();
    render(<StatCard label="Contract Balance" value="1 ETH" tooltip="ETH held by the contract." />);

    const label = screen.getByRole('button', { name: 'More information about Contract Balance' });
    expect(label).toHaveTextContent('Contract Balance');
    expect(label.querySelector('svg')).toBeNull();
    await user.hover(label);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('ETH held by the contract.');
  });

  it('renders a visible caption under the value, but not while loading', () => {
    const { rerender } = render(
      <StatCard label="Distribution per NFT" value="—" caption="No anchored NFTs indexed yet" />,
    );
    expect(screen.getByText('No anchored NFTs indexed yet')).toBeVisible();

    rerender(
      <StatCard
        label="Distribution per NFT"
        value="—"
        caption="No anchored NFTs indexed yet"
        loading
      />,
    );
    expect(screen.queryByText('No anchored NFTs indexed yet')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StatCard label="Cycles" value={42} />);
    await checkA11y(container);
  });
});

describe('StatCardSkeleton', () => {
  it('renders a placeholder container', () => {
    const { container } = render(<StatCardSkeleton />);
    expect(container.firstElementChild).toHaveClass('rounded-surface');
  });
});
