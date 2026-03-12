import { Trophy } from 'lucide-react';

import { render, screen, checkA11y } from '@/test-utils';

import { StatisticsGroup } from '../StatisticsGroup';

describe('StatisticsGroup', () => {
  it('renders the title', () => {
    render(
      <StatisticsGroup title="Prize Economy">
        <p>Content</p>
      </StatisticsGroup>,
    );
    expect(screen.getByText('Prize Economy')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <StatisticsGroup title="Group">
        <p>Child content here</p>
      </StatisticsGroup>,
    );
    expect(screen.getByText('Child content here')).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    render(
      <StatisticsGroup title="Group" icon={<Trophy data-testid="icon" className="h-4 w-4" />}>
        <p>Content</p>
      </StatisticsGroup>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('does not render icon wrapper when no icon is provided', () => {
    const { container } = render(
      <StatisticsGroup title="Group">
        <p>Content</p>
      </StatisticsGroup>,
    );
    const iconWrappers = container.querySelectorAll('svg');
    expect(iconWrappers.length).toBe(0);
  });

  it('applies accentColor left border', () => {
    const { container } = render(
      <StatisticsGroup title="Prizes" accentColor="blue">
        <p>Content</p>
      </StatisticsGroup>,
    );
    expect(container.firstChild).toHaveClass('border-l-2');
  });

  it('uses accent icon background when accentColor is set', () => {
    const { container } = render(
      <StatisticsGroup
        title="Tokens"
        icon={<Trophy data-testid="icon" className="h-4 w-4" />}
        accentColor="purple"
      >
        <p>Content</p>
      </StatisticsGroup>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    const wrapper = screen.getByTestId('icon').parentElement;
    expect(wrapper).toHaveClass('bg-[#AC56FF]/10');
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatisticsGroup title="Group" className="custom-class">
        <p>Content</p>
      </StatisticsGroup>,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders title as an h4 heading', () => {
    render(
      <StatisticsGroup title="Heading">
        <p>Content</p>
      </StatisticsGroup>,
    );
    const heading = screen.getByText('Heading');
    expect(heading.tagName).toBe('H4');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <StatisticsGroup title="Test Group" icon={<Trophy className="h-4 w-4" />}>
        <p>Accessible content</p>
      </StatisticsGroup>,
    );
    await checkA11y(container);
  });

  it('has no accessibility violations without icon', async () => {
    const { container } = render(
      <StatisticsGroup title="Test Group">
        <p>Accessible content</p>
      </StatisticsGroup>,
    );
    await checkA11y(container);
  });
});
