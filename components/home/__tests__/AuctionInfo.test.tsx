import '@testing-library/jest-dom';

jest.mock('../../../utils', () => ({
  formatSeconds: jest.fn((s: number) => `${s}s`),
}));

import { render, screen, checkA11y } from '@/test-utils';

import { AuctionInfo } from '../AuctionInfo';

describe('AuctionInfo', () => {
  it('keeps all compact timing values and progress visible without duplicating duration', () => {
    render(<AuctionInfo compact secondsElapsed={1350} auctionDuration={5400} />);

    expect(screen.getAllByRole('term')).toHaveLength(3);
    expect(screen.getAllByRole('definition')).toHaveLength(3);
    expect(screen.getAllByText('5400s')).toHaveLength(1);
    expect(screen.getByText('1350s')).toBeVisible();
    expect(screen.getByText('4050s')).toBeVisible();
    expect(screen.getByText('home.calibration.percentComplete(percent=25%)')).toBeVisible();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(screen.queryByText('home.calibration.defaultSubtitle')).toBeNull();
    expect(
      screen.getByRole('button', {
        name: 'More information about home.calibration.defaultTitle',
      }),
    ).toBeVisible();
  });

  it.each([
    [true, '@min-[26rem]:grid-cols-3'],
    [false, '@lg:grid-cols-3'],
  ])('sizes the value grid by its own card (compact=%s), not the viewport', (compact, columns) => {
    // The card sits in the gesture panel and the side column, which stay
    // narrow on wide screens: a viewport breakpoint let the no-wrap values collide.
    render(<AuctionInfo compact={compact} secondsElapsed={1350} auctionDuration={5400} />);
    const grid = screen.getAllByRole('term')[0]?.closest('dl');
    expect(grid?.closest('section')).toHaveClass('@container');
    expect(grid).toHaveClass(columns);
    expect(grid?.className).not.toMatch(/(^|\s)(sm|min-\[26rem\]):grid-cols-3/);
    // A narrow compact card reads each value as one "label … value" row.
    const cell = screen.getAllByRole('term')[0]?.parentElement;
    if (compact) expect(cell).toHaveClass('justify-between', '@min-[26rem]:block');
    else expect(cell).not.toHaveClass('justify-between');
  });

  it('preserves the ended state and all timing values in compact mode', () => {
    render(<AuctionInfo compact secondsElapsed={6000} auctionDuration={5400} />);

    expect(screen.getByText('home.calibration.defaultEndedMessage')).toBeVisible();
    expect(screen.getByText('5400s')).toBeVisible();
    expect(screen.getByText('6000s')).toBeVisible();
    expect(screen.getByText('0s')).toBeVisible();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('renders a prominent dynamic duration and active progress details', () => {
    render(<AuctionInfo secondsElapsed={1350} auctionDuration={5400} />);

    expect(
      screen.getByRole('region', { name: 'home.calibration.defaultTitle' }),
    ).toBeInTheDocument();
    expect(screen.getByText('home.calibration.dynamicDuration')).toBeInTheDocument();
    expect(screen.getAllByText('5400s')).toHaveLength(2);
    expect(screen.getByText('1350s')).toBeInTheDocument();
    expect(screen.getByText('4050s')).toBeInTheDocument();
    expect(screen.getByText('home.calibration.percentComplete(percent=25%)')).toBeInTheDocument();
  });

  it('renders an accessible progressbar with clamped values', () => {
    render(
      <AuctionInfo secondsElapsed={1350} auctionDuration={5400} title="CST Calibration Window" />,
    );

    const progress = screen.getByRole('progressbar', {
      name: 'home.calibration.progressAria(title=CST Calibration Window)',
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

    expect(screen.getByText('home.calibration.percentComplete(percent=0.1%)')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0.1');
  });

  it('shows ended message when elapsed is greater than duration', () => {
    render(<AuctionInfo secondsElapsed={6000} auctionDuration={5400} />);

    expect(screen.getByText('home.calibration.defaultEndedMessage')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('0s')).toBeInTheDocument();
  });

  it('keeps the dynamic window active when elapsed equals duration', () => {
    render(<AuctionInfo secondsElapsed={5400} auctionDuration={5400} />);

    expect(screen.getByText('home.calibration.percentComplete(percent=100%)')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getAllByText('5400s')).toHaveLength(3);
    expect(screen.queryByText('home.calibration.defaultEndedMessage')).not.toBeInTheDocument();
  });

  it('handles zero values gracefully', () => {
    render(<AuctionInfo secondsElapsed={0} auctionDuration={0} />);

    expect(screen.getByText('home.calibration.percentComplete(percent=0%)')).toBeInTheDocument();
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
    expect(screen.queryByText('home.calibration.defaultEndedMessage')).not.toBeInTheDocument();
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
    expect(screen.getByText('home.calibration.percentComplete(percent=50%)')).toBeInTheDocument();
  });

  it.each([false, true])('has no accessibility violations with compact=%s', async (compact) => {
    const { container } = render(
      <AuctionInfo
        compact={compact}
        secondsElapsed={1350}
        auctionDuration={5400}
        title="CST Calibration Window"
      />,
    );
    await checkA11y(container);
  });
});
