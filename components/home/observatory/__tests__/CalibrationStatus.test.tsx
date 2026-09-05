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
  it('shows opening ETH timing before the first Gesture', () => {
    render(<CalibrationStatus {...makeProps(zeroAddress)} />);

    const window = screen.getByRole('region', { name: 'home.calibration.firstGestureTitle' });
    expect(window).toBeVisible();
    expect(within(window).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(within(window).getByText('30m')).toBeVisible();
    expect(within(window).getAllByText('15m')).toHaveLength(2);
  });

  it('switches to CST timing once the first Gesture is present', () => {
    const { rerender } = render(<CalibrationStatus {...makeProps(zeroAddress)} />);
    rerender(<CalibrationStatus {...makeProps()} />);

    const window = screen.getByRole('region', { name: 'home.calibration.cstTitle' });
    expect(window).toBeVisible();
    expect(within(window).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(within(window).getByText('1h')).toBeVisible();
    expect(within(window).getByText('15m')).toBeVisible();
    expect(within(window).getByText('45m')).toBeVisible();
    expect(screen.queryByRole('region', { name: 'home.calibration.firstGestureTitle' })).toBeNull();
  });

  it.each([
    ['dashboard', { ...makeProps(), data: null }],
    ['opening ETH sample', { ...makeProps(zeroAddress), ethGestureInfo: null }],
    ['CST timing sample', { ...makeProps(), cstGestureData: mapCTPriceInfo(null) }],
  ])('shows an explicit loading state when the %s is missing', (_name, props) => {
    render(<CalibrationStatus {...props} />);

    expect(screen.getByRole('region')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('home.calibration.cstEndedMessage')).not.toBeInTheDocument();
  });

  it('shows genuine completed timing without implying a quote has arrived', () => {
    render(
      <CalibrationStatus
        {...makeProps()}
        cstGestureData={mapCTPriceInfo(null, { AuctionDuration: 3600, SecondsElapsed: 4000 })}
      />,
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('home.calibration.defaultEndedMessage')).toBeVisible();
    expect(screen.getByText('home.calibration.dynamicDuration')).toBeVisible();
    expect(screen.getByText('0s')).toBeVisible();
    expect(screen.queryByText('home.calibration.cstEndedMessage')).not.toBeInTheDocument();
  });

  it('keeps live timing visible while the independently requested quote loads', () => {
    render(
      <CalibrationStatus
        {...makeProps()}
        cstGestureData={mapCTPriceInfo(null, { AuctionDuration: 3600, SecondsElapsed: 900 })}
      />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(screen.getByText('45m')).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it.each([0n, 20n * 10n ** 18n])(
    'waits for real timing when only price %s has resolved',
    (price) => {
      render(
        <CalibrationStatus {...makeProps()} cstGestureData={mapCTPriceInfo(null, null, price)} />,
      );
      expect(screen.getByRole('status')).toBeVisible();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByText('0s')).not.toBeInTheDocument();
    },
  );

  it('accepts confirmed zero duration and elapsed time as real timing', () => {
    render(
      <CalibrationStatus
        {...makeProps()}
        cstGestureData={mapCTPriceInfo(null, { AuctionDuration: 0, SecondsElapsed: 0 })}
      />,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getAllByText('0s')).toHaveLength(3);
    expect(screen.getByText('home.calibration.dynamicDuration')).toBeVisible();
  });

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
    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('rejects malformed opening ETH timing', () => {
    render(
      <CalibrationStatus
        {...makeProps(zeroAddress)}
        ethGestureInfo={{ AuctionDuration: Number.NaN, SecondsElapsed: 900, ETHPrice: 0.1 }}
      />,
    );
    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('accepts the signed ETH elapsed time returned before V2 activation', () => {
    render(
      <CalibrationStatus
        {...makeProps(zeroAddress)}
        ethGestureInfo={{ AuctionDuration: 1800, SecondsElapsed: -60, ETHPrice: 0.1 }}
      />,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getAllByText('30m')).toHaveLength(2);
  });

  it('supports older snapshots that predate explicit timing availability', () => {
    const legacy = { ...cstGestureData };
    delete legacy.timingAvailable;
    render(<CalibrationStatus {...makeProps()} cstGestureData={legacy} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  it('keeps completed window values visible with a confirmed zero-cost quote', () => {
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

    expect(screen.getByText('home.calibration.cstEndedMessage')).toBeVisible();
    expect(screen.getByText('home.calibration.dynamicDuration')).toBeVisible();
    expect(screen.getByText('home.calibration.elapsedLabel')).toBeVisible();
    expect(screen.getByText('home.calibration.remainingLabel')).toBeVisible();
    expect(screen.getByText('0s')).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('has no accessibility violations while loading or displaying a live sample', async () => {
    const { container, rerender } = render(<CalibrationStatus {...makeProps()} data={null} />);
    await checkA11y(container);
    rerender(<CalibrationStatus {...makeProps()} />);
    await checkA11y(container);
  });
});
