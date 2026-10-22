import { zeroAddress } from 'viem';

import type { DashboardInfo } from '@/services/api';
import { mapCTPriceInfo } from '@/utils/cstGesture';

import { render, screen, within, checkA11y } from '@/test-utils';

import { CalibrationStatus } from '../CalibrationStatus';

const cstGestureData = mapCTPriceInfo({
  AuctionDuration: '3600',
  SecondsElapsed: '900',
  CSTPrice: '20000000000000000000',
});

const makeProps = (lastAddress = '0x1234') => ({
  data: { LastBidderAddr: lastAddress } as DashboardInfo,
  ethGestureInfo: { AuctionDuration: 1800, SecondsElapsed: 900, ETHPrice: 0.1 },
  cstGestureData,
});

describe('CalibrationStatus', () => {
  it('leads the CST window with the cost now and when it reaches its floor', () => {
    render(<CalibrationStatus {...makeProps()} />);

    const window = screen.getByRole('region', { name: 'home.calibration.cstTitle' });
    expect(within(window).getByTestId('calibration-cost-now')).toHaveTextContent(
      'home.calibration.costNow20 CST',
    );
    // A countdown reads as a clock, like every countdown on the desk.
    expect(within(window).getByTestId('calibration-floor-in')).toHaveTextContent(
      'home.calibration.floorIn(duration=00:45:00)',
    );
    // The floor is named at the end of the track.
    expect(within(window).getByText('home.calibration.floor')).toBeVisible();
  });

  it('stands the cost now over the dot that marks now, never at the line’s origin', () => {
    render(<CalibrationStatus {...makeProps()} />);
    // A quarter of the window has passed: the figure follows the dot, kept on the track.
    const figure = screen.getByTestId('calibration-cost-now');
    expect(figure.style.left).toBe('25%');
    expect(figure.style.transform).toBe('translateX(-25%)');
  });

  it('keeps the region heading plain, like every other heading on the desk', () => {
    render(<CalibrationStatus {...makeProps()} />);
    const heading = screen.getByRole('heading', { name: 'home.calibration.cstTitle' });
    // No concept glyph before it; the only icon beside it is the ⓘ.
    expect(heading.previousElementSibling).toBeNull();
  });

  it('draws the window as a descending price track with an accessible reading', () => {
    render(<CalibrationStatus {...makeProps()} />);

    const track = screen.getByRole('progressbar', {
      name: 'home.calibration.progressAria(title=home.calibration.cstTitle)',
    });
    expect(track).toHaveAttribute('aria-valuenow', '25');
    expect(track).toHaveAttribute(
      'aria-valuetext',
      '20\u00a0CST · home.calibration.reachesFloorIn(duration=00:45:00)',
    );
    // A 36px sparkline in the foreground ink, not a warning-coloured bar.
    expect(track).toHaveClass('h-9', 'text-foreground');
    // The floor is named where the line ends: bottom right.
    expect(screen.getByTestId('calibration-floor')).toHaveClass('self-end');
  });

  it('shows full length and elapsed time separately from the remaining countdown', () => {
    render(<CalibrationStatus {...makeProps()} />);
    expect(screen.getByText('home.calibration.windowLengthLabel')).toBeVisible();
    expect(screen.getByTestId('calibration-window-length')).toHaveTextContent('01:00:00');
    expect(screen.getByText('home.calibration.elapsedLabel')).toBeVisible();
    expect(screen.getByTestId('calibration-elapsed')).toHaveTextContent('00:15:00');
    expect(screen.getByTestId('calibration-floor-in')).toHaveTextContent('duration=00:45:00');
    expect(
      screen.getByRole('button', { name: /home\.calibration\.cstTitle/ }),
    ).toHaveAccessibleDescription(
      'home.calibration.cstSubtitleV3 home.calibration.declineRateExplanation',
    );
  });

  it('shows the on-chain base decline per minute, independent of the final cost quote', () => {
    const props = {
      ...makeProps(),
      cstGestureData: { ...cstGestureData, cstDeclineRateWeiPerSecond: 29387798623316358n },
    };
    const { rerender } = render(<CalibrationStatus {...props} />);
    expect(screen.getByText('home.calibration.declineRateLabel')).toBeVisible();
    expect(screen.getByTestId('calibration-decline-rate')).toHaveTextContent('rate=1.7633');

    // A premium can change the final quote without changing the base decline.
    rerender(
      <CalibrationStatus
        {...props}
        cstGestureData={{ ...props.cstGestureData, CSTPrice: 100, CSTPriceWei: 100n * 10n ** 18n }}
      />,
    );
    expect(screen.getByTestId('calibration-decline-rate')).toHaveTextContent('rate=1.7633');
  });

  it.each([undefined, null, 0n, -1n])('does not invent a decline rate from %s', (rate) => {
    render(
      <CalibrationStatus
        {...makeProps()}
        cstGestureData={{ ...cstGestureData, cstDeclineRateWeiPerSecond: rate }}
      />,
    );
    const metric = screen.getByTestId('calibration-decline-rate');
    expect(within(metric).getByLabelText('common.status.unavailable')).toBeVisible();
    expect(metric).not.toHaveTextContent(/\d/);
  });

  it('keeps a tiny positive rate readable without displaying it as zero', () => {
    render(
      <CalibrationStatus
        {...makeProps()}
        cstGestureData={{ ...cstGestureData, cstDeclineRateWeiPerSecond: 1n }}
      />,
    );
    expect(screen.getByTestId('calibration-decline-rate')).toHaveTextContent('rate=6E-17');
  });

  it('shows the opening ETH window before the first Gesture', () => {
    render(<CalibrationStatus {...makeProps(zeroAddress)} />);

    const window = screen.getByRole('region', { name: 'home.calibration.firstGestureTitle' });
    expect(within(window).getByTestId('calibration-cost-now')).toHaveTextContent('0.1 ETH');
    expect(within(window).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(within(window).getByTestId('calibration-floor-in')).toHaveTextContent(
      'home.calibration.windowEndsIn(duration=00:15:00)',
    );
    // The ETH window's floor is not zero, so none is named.
    expect(within(window).queryByText('home.calibration.floor')).not.toBeInTheDocument();
    expect(within(window).queryByTestId('calibration-decline-rate')).not.toBeInTheDocument();
    expect(within(window).getByTestId('calibration-window-length')).toHaveTextContent('00:30:00');
    expect(within(window).getByTestId('calibration-elapsed')).toHaveTextContent('00:15:00');
  });

  it('switches to the CST window once the first Gesture is present', () => {
    const { rerender } = render(<CalibrationStatus {...makeProps(zeroAddress)} />);
    rerender(<CalibrationStatus {...makeProps()} />);

    expect(screen.getByRole('region', { name: 'home.calibration.cstTitle' })).toBeVisible();
    expect(screen.queryByRole('region', { name: 'home.calibration.firstGestureTitle' })).toBeNull();
  });

  it.each([
    ['dashboard', { ...makeProps(), data: null }],
    ['opening ETH sample', { ...makeProps(zeroAddress), ethGestureInfo: null }],
    ['CST timing sample', { ...makeProps(), cstGestureData: mapCTPriceInfo(null) }],
  ])('keeps its shape with pending figures when the %s is missing', (_name, props) => {
    const { container } = render(<CalibrationStatus {...props} />);

    expect(screen.getByRole('region')).toBeVisible();
    expect(container.querySelector('[data-slot="value-pending"]')).not.toBeNull();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('home.calibration.cstEndedMessage')).not.toBeInTheDocument();
    expect(screen.queryByText(/\b0s\b/)).not.toBeInTheDocument();
  });

  it('never prices a window from timing alone', () => {
    render(
      <CalibrationStatus
        {...makeProps()}
        cstGestureData={mapCTPriceInfo(null, { AuctionDuration: 3600, SecondsElapsed: 900 })}
      />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    const cost = screen.getByTestId('calibration-cost-now');
    expect(cost.querySelector('[data-slot="value-pending"]')).not.toBeNull();
    expect(cost).not.toHaveTextContent(/\d/);
  });

  it.each([0n, 20n * 10n ** 18n])(
    'waits for real timing when only price %s has resolved',
    (price) => {
      render(
        <CalibrationStatus {...makeProps()} cstGestureData={mapCTPriceInfo(null, null, price)} />,
      );
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('calibration-floor-in')).not.toBeInTheDocument();
    },
  );

  it('does not display malformed timing from a priced sample', () => {
    render(
      <CalibrationStatus
        {...makeProps()}
        cstGestureData={mapCTPriceInfo({
          AuctionDuration: 'invalid',
          SecondsElapsed: '900',
          CSTPrice: '20000000000000000000',
        })}
      />,
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('rejects malformed opening ETH timing', () => {
    render(
      <CalibrationStatus
        {...makeProps(zeroAddress)}
        ethGestureInfo={{ AuctionDuration: Number.NaN, SecondsElapsed: 900, ETHPrice: 0.1 }}
      />,
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('accepts the signed ETH elapsed time returned before V2 activation', () => {
    render(
      <CalibrationStatus
        {...makeProps(zeroAddress)}
        ethGestureInfo={{ AuctionDuration: 1800, SecondsElapsed: -60, ETHPrice: 0.1 }}
      />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByTestId('calibration-floor-in')).toHaveTextContent('duration=00:30:00');
  });

  it('supports older snapshots that predate explicit timing availability', () => {
    const legacy = { ...cstGestureData };
    delete legacy.timingAvailable;
    render(<CalibrationStatus {...makeProps()} cstGestureData={legacy} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  it('says the cost is at its floor and gas still applies, in neutral text', () => {
    render(
      <CalibrationStatus
        {...makeProps()}
        cstGestureData={mapCTPriceInfo({
          AuctionDuration: '3600',
          SecondsElapsed: '4000',
          CSTPrice: '0',
        })}
      />,
    );

    const ended = screen.getByTestId('calibration-ended');
    expect(ended).toHaveTextContent('home.calibration.cstEndedMessage');
    expect(ended).toHaveClass('text-muted-foreground');
    expect(ended.className).not.toMatch(/positive|emerald|green/);
    expect(screen.getByTestId('calibration-cost-now')).toHaveTextContent('0 CST');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByTestId('calibration-window-length')).toHaveTextContent('01:00:00');
    expect(screen.getByTestId('calibration-elapsed')).toHaveTextContent('01:06:40');
  });

  it('closes a finished window without a quote with the generic message', () => {
    render(
      <CalibrationStatus
        {...makeProps()}
        cstGestureData={mapCTPriceInfo(null, { AuctionDuration: 3600, SecondsElapsed: 4000 })}
      />,
    );
    expect(screen.getByTestId('calibration-ended')).toHaveTextContent(
      'home.calibration.defaultEndedMessage',
    );
  });

  it('has no accessibility violations while loading or displaying a live sample', async () => {
    const { container, rerender } = render(<CalibrationStatus {...makeProps()} data={null} />);
    await checkA11y(container);
    rerender(<CalibrationStatus {...makeProps()} />);
    await checkA11y(container);
  });
});
