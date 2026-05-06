import { render, screen, checkA11y } from '@/test-utils';

import { FundDistribution } from '../components/FundDistribution';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      title,
      className,
      ..._rest
    }: React.HTMLAttributes<HTMLDivElement> & {
      variants?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }) => (
      <div className={className} title={title} data-testid="motion-div">
        {children}
      </div>
    ),
  },
}));

const defaultProps = {
  prizePercentage: 25,
  chronoWarriorPercentage: 8,
  stellarSelectionPercentage: 4,
  stakingPercentage: 6,
  charityPercentage: 7,
};

describe('FundDistribution', () => {
  it('renders all percentage segments with labels', () => {
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByText('Signature Allocation')).toBeInTheDocument();
    expect(screen.getByText('Chrono-Warrior')).toBeInTheDocument();
    expect(screen.getByText('Stellar Selection')).toBeInTheDocument();
    expect(screen.getByText('Anchor Distribution')).toBeInTheDocument();
    expect(screen.getByText('Public Goods')).toBeInTheDocument();
  });

  it('renders percentage values for each segment', () => {
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
    expect(screen.getByText('4%')).toBeInTheDocument();
    expect(screen.getByText('6%')).toBeInTheDocument();
    expect(screen.getByText('7%')).toBeInTheDocument();
  });

  it('renders the Allocation Tracks title', () => {
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByText('Allocation Tracks')).toBeInTheDocument();
  });

  it('renders the distribution bar', () => {
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByRole('img', { name: /allocation tracks bar chart/i })).toBeInTheDocument();
  });

  it('handles zero percentages gracefully', () => {
    render(
      <FundDistribution
        prizePercentage={0}
        chronoWarriorPercentage={0}
        stellarSelectionPercentage={0}
        stakingPercentage={0}
        charityPercentage={0}
      />,
    );
    expect(screen.getByText('Signature Allocation')).toBeInTheDocument();
    const zeros = screen.getAllByText('0%');
    expect(zeros.length).toBe(5);
  });

  it('handles missing percentages with 0 default', () => {
    render(<FundDistribution />);
    const zeros = screen.getAllByText('0%');
    expect(zeros.length).toBe(5);
  });

  it('shows loading skeleton when loading is true', () => {
    const { container } = render(<FundDistribution loading />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FundDistribution {...defaultProps} />);
    await checkA11y(container);
  });
});
