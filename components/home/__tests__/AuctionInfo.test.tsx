import '@testing-library/jest-dom';

jest.mock('../../../utils', () => ({
  formatSeconds: jest.fn((s: number) => `${s}s`),
}));

import { render, screen, checkA11y } from '@/test-utils';

import { AuctionInfo } from '../AuctionInfo';

describe('AuctionInfo', () => {
  it('renders a prominent dynamic duration and active progress details', () => {
    render(<AuctionInfo secondsElapsed={1350} auctionDuration={5400} />);

    expect(screen.getByRole('region', { name: 'Calibration Window' })).toBeInTheDocument();
    expect(screen.getByText('Dynamic Duration')).toBeInTheDocument();
    expect(screen.getAllByText('5400s')).toHaveLength(2);
    expect(screen.getByText('1350s')).toBeInTheDocument();
    expect(screen.getByText('4050s')).toBeInTheDocument();
    expect(screen.getByText('25% complete')).toBeInTheDocument();
  });

  it('renders an accessible progressbar with clamped values', () => {
    render(
      <AuctionInfo secondsElapsed={1350} auctionDuration={5400} title="CST Calibration Window" />,
    );

    const progress = screen.getByRole('progressbar', {
      name: 'CST Calibration Window progress',
    });
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-valuenow', '25');
    expect(progress.firstElementChild).toHaveStyle({ width: '25%' });
  });

  it('shows one decimal place when progress would otherwise look static', () => {
    render(
      <AuctionInfo secondsElapsed={43} auctionDuration={43200} title="CST Calibration Window" />,
    );

    expect(screen.getByText('0.1% complete')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0.1');
  });

  it('shows ended message when elapsed is greater than duration', () => {
    render(<AuctionInfo secondsElapsed={6000} auctionDuration={5400} />);

    expect(screen.getByText('Calibration Window closed.')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('0s')).toBeInTheDocument();
  });

  it('keeps the dynamic window active when elapsed equals duration', () => {
    render(<AuctionInfo secondsElapsed={5400} auctionDuration={5400} />);

    expect(screen.getByText('100% complete')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getAllByText('5400s')).toHaveLength(3);
    expect(screen.queryByText('Calibration Window closed.')).not.toBeInTheDocument();
  });

  it('handles zero values gracefully', () => {
    render(<AuctionInfo secondsElapsed={0} auctionDuration={0} />);

    expect(screen.getByText('0% complete')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getAllByText('0s')).toHaveLength(4);
    expect(screen.queryByText('NaN')).not.toBeInTheDocument();
  });

  it('uses custom ended message prop', () => {
    render(
      <AuctionInfo
        secondsElapsed={5000}
        auctionDuration={3600}
        endedMessage="Calibration Window closed, you can gesture for free."
      />,
    );

    expect(
      screen.getByText('Calibration Window closed, you can gesture for free.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Calibration Window closed.')).not.toBeInTheDocument();
  });

  it('supports custom labels for CST-specific display copy', () => {
    render(
      <AuctionInfo
        secondsElapsed={2700}
        auctionDuration={5400}
        title="CST Calibration Window"
        subtitle="The CST gesture cost descends through this dynamic contract window."
      />,
    );

    expect(screen.getByRole('region', { name: 'CST Calibration Window' })).toBeInTheDocument();
    expect(
      screen.getByText('The CST gesture cost descends through this dynamic contract window.'),
    ).toBeInTheDocument();
    expect(screen.getByText('50% complete')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AuctionInfo secondsElapsed={1350} auctionDuration={5400} title="CST Calibration Window" />,
    );
    await checkA11y(container);
  });
});
