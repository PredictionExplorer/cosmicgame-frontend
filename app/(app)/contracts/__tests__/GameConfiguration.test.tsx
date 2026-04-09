import { render, screen, checkA11y } from '@/test-utils';

import { GameConfiguration } from '../components/GameConfiguration';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ..._rest
    }: React.HTMLAttributes<HTMLDivElement> & {
      variants?: unknown;
      initial?: unknown;
      animate?: unknown;
    }) => (
      <div className={className} data-testid="motion-div">
        {children}
      </div>
    ),
  },
}));

jest.mock('../../../../utils', () => ({
  formatSeconds: (s: number) => (s > 0 ? `${s}s` : '0s'),
}));

const defaultProps = {
  priceIncrease: 1,
  timeIncrease: 1,
  timeIncrement: 3600,
  cstRewardPerBid: 200,
  maxMessageLength: 280,
  claimTimeout: 86400,
  initialIncrement: 43200,
};

describe('GameConfiguration', () => {
  it('renders all stat cards with correct values', () => {
    render(<GameConfiguration {...defaultProps} />);
    expect(screen.getByText('Price Increase')).toBeInTheDocument();
    expect(screen.getByText('1%')).toBeInTheDocument();
    expect(screen.getByText('Time Increase')).toBeInTheDocument();
    expect(screen.getByText('3600s')).toBeInTheDocument();
    expect(screen.getByText('CST Reward per Bid')).toBeInTheDocument();
    expect(screen.getByText('200 CST')).toBeInTheDocument();
    expect(screen.getByText('Max Message Length')).toBeInTheDocument();
    expect(screen.getByText('280')).toBeInTheDocument();
  });

  it('renders the Game Configuration section title', () => {
    render(<GameConfiguration {...defaultProps} />);
    expect(screen.getByText('Game Configuration')).toBeInTheDocument();
  });

  it('renders formatted time values', () => {
    render(<GameConfiguration {...defaultProps} />);
    expect(screen.getByText('Claim Timeout')).toBeInTheDocument();
    expect(screen.getByText('86400s')).toBeInTheDocument();
    expect(screen.getByText('Initial Time Increment')).toBeInTheDocument();
    expect(screen.getByText('43200s')).toBeInTheDocument();
  });

  it('handles zero/missing values with "--" fallback', () => {
    render(
      <GameConfiguration
        priceIncrease={0}
        timeIncrease={0}
        timeIncrement={0}
        cstRewardPerBid={0}
        maxMessageLength={0}
        claimTimeout={0}
        initialIncrement={0}
      />,
    );
    const dashes = screen.getAllByText('--');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it('displays time increment as duration, not the increase percentage', () => {
    render(<GameConfiguration {...defaultProps} timeIncrease={5} timeIncrement={7200} />);
    expect(screen.getByText('7200s')).toBeInTheDocument();
    expect(screen.queryByText('5%')).not.toBeInTheDocument();
  });

  it('shows "--" for Time Increase when timeIncrement is 0 regardless of timeIncrease', () => {
    render(<GameConfiguration {...defaultProps} timeIncrease={1} timeIncrement={0} />);
    const dashes = screen.getAllByText('--');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading skeletons when loading is true', () => {
    const { container } = render(<GameConfiguration {...defaultProps} loading />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GameConfiguration {...defaultProps} />);
    await checkA11y(container);
  });
});
