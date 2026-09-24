import { render, screen, checkA11y } from '@/test-utils';

import { AuctionInfo } from '../AuctionInfo';

describe('AuctionInfo', () => {
  it('shows the window length, elapsed and remaining as tabular figures with a progress rule', () => {
    render(<AuctionInfo compact secondsElapsed={1350} auctionDuration={5400} />);

    expect(screen.getAllByRole('term')).toHaveLength(3);
    expect(screen.getAllByRole('definition')).toHaveLength(3);
    expect(screen.getByText('1h 30m')).toBeVisible();
    expect(screen.getByText('22m 30s')).toBeVisible();
    expect(screen.getByText('1h 7m 30s')).toBeVisible();
    expect(screen.getByText('1h 30m')).toHaveClass('type-figure-sm');
    expect(screen.getByText('home.calibration.percentComplete(percent=25%)')).toBeVisible();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '25');
    expect(bar.firstElementChild).toHaveStyle({ width: '25%' });
    // The subtitle lives in the explanation, not as a paragraph.
    expect(
      screen.queryByText('home.calibration.defaultSubtitle', { ignore: '[hidden], script, style' }),
    ).toBeNull();
    expect(
      screen.getByRole('button', { name: 'More information about home.calibration.defaultTitle' }),
    ).toBeVisible();
  });

  it.each([
    [true, '@min-[26rem]:grid-cols-3'],
    [false, '@lg:grid-cols-3'],
  ])('sizes the value grid by its own card (compact=%s), not the viewport', (compact, columns) => {
    render(<AuctionInfo compact={compact} secondsElapsed={1350} auctionDuration={5400} />);
    const grid = screen.getAllByRole('term')[0]?.closest('dl');
    expect(grid?.closest('section')).toHaveClass('@container');
    expect(grid).toHaveClass(columns);
  });

  it('says the window ended in neutral words and keeps its figures', () => {
    render(<AuctionInfo compact secondsElapsed={6000} auctionDuration={5400} />);

    const ended = screen.getByText('home.calibration.defaultEndedMessage');
    expect(ended).toBeVisible();
    expect(ended.className).not.toMatch(/emerald|positive|green/);
    expect(screen.getByText('1h 40m')).toBeVisible();
    expect(screen.getByText('0s')).toBeVisible();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('shows one decimal place when progress would otherwise look static', () => {
    render(
      <AuctionInfo secondsElapsed={43} auctionDuration={43200} title="CST Calibration Window" />,
    );
    expect(screen.getByText('home.calibration.percentComplete(percent=0.1%)')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0.1');
  });

  it('keeps the window active when elapsed equals its length', () => {
    render(<AuctionInfo secondsElapsed={5400} auctionDuration={5400} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.queryByText('home.calibration.defaultEndedMessage')).not.toBeInTheDocument();
  });

  it('handles zero values without NaN', () => {
    render(<AuctionInfo secondsElapsed={0} auctionDuration={0} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getAllByText('0s')).toHaveLength(3);
    expect(screen.queryByText('NaN')).not.toBeInTheDocument();
  });

  it('accepts custom copy for the CST window', () => {
    render(
      <AuctionInfo
        secondsElapsed={5000}
        auctionDuration={3600}
        title="CST Calibration Window"
        endedMessage="The CST cost is at its floor."
      />,
    );
    expect(screen.getByRole('region', { name: 'CST Calibration Window' })).toBeInTheDocument();
    expect(screen.getByText('The CST cost is at its floor.')).toBeVisible();
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
