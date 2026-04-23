import '@testing-library/jest-dom';

jest.mock('../../../utils', () => ({
  formatSeconds: jest.fn((s: number) => `${s}s`),
}));

import { render, screen, checkA11y } from '@/test-utils';

import { AuctionInfo } from '../AuctionInfo';

describe('AuctionInfo', () => {
  it('renders elapsed time and duration when auction is active', () => {
    render(<AuctionInfo secondsElapsed={900} auctionDuration={3600} />);

    expect(screen.getByText('Elapsed Time:')).toBeInTheDocument();
    expect(screen.getByText('900s')).toBeInTheDocument();
    expect(screen.getByText('Calibration duration:')).toBeInTheDocument();
    expect(screen.getByText('3600s')).toBeInTheDocument();
  });

  it('shows ended message when elapsed > duration', () => {
    render(<AuctionInfo secondsElapsed={4000} auctionDuration={3600} />);

    expect(screen.getByText('Calibration window ended.')).toBeInTheDocument();
    expect(screen.queryByText('Elapsed Time:')).not.toBeInTheDocument();
  });

  it('handles zero values gracefully', () => {
    render(<AuctionInfo secondsElapsed={0} auctionDuration={0} />);

    expect(screen.getByText('Elapsed Time:')).toBeInTheDocument();
    expect(screen.getByText('Calibration duration:')).toBeInTheDocument();
    expect(screen.getAllByText('0s')).toHaveLength(2);
  });

  it('uses custom ended message prop', () => {
    render(
      <AuctionInfo
        secondsElapsed={5000}
        auctionDuration={3600}
        endedMessage="CST window ended — no CST cost for the next CST gesture."
      />,
    );

    expect(
      screen.getByText('CST window ended — no CST cost for the next CST gesture.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Calibration window ended.')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AuctionInfo secondsElapsed={900} auctionDuration={3600} />);
    await checkA11y(container);
  });
});
