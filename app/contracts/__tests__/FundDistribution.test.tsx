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
  chronoWarriorPercentage: 10,
  rafflePercentage: 25,
  stakingPercentage: 30,
  charityPercentage: 10,
};

describe('FundDistribution', () => {
  it('renders all percentage segments with labels', () => {
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByText('Signature')).toBeInTheDocument();
    expect(screen.getByText('Chrono-Warrior')).toBeInTheDocument();
    expect(screen.getByText('Stellar Selection')).toBeInTheDocument();
    expect(screen.getByText('Anchors')).toBeInTheDocument();
    expect(screen.getByText('Public goods')).toBeInTheDocument();
  });

  it('renders percentage values for each segment', () => {
    render(<FundDistribution {...defaultProps} />);
    const values25 = screen.getAllByText('25%');
    expect(values25.length).toBe(2);
    const values10 = screen.getAllByText('10%');
    expect(values10.length).toBe(2);
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('renders the Fund Distribution title', () => {
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByText('Fund Distribution')).toBeInTheDocument();
  });

  it('renders the distribution bar', () => {
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByRole('img', { name: /fund distribution bar chart/i })).toBeInTheDocument();
  });

  it('handles zero percentages gracefully', () => {
    render(
      <FundDistribution
        prizePercentage={0}
        chronoWarriorPercentage={0}
        rafflePercentage={0}
        stakingPercentage={0}
        charityPercentage={0}
      />,
    );
    expect(screen.getByText('Signature')).toBeInTheDocument();
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
