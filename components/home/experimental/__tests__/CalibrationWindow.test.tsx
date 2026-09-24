import { zeroAddress } from 'viem';

import type { DashboardInfo } from '@/services/api';
import type { CstGestureData } from '@/utils/cstGesture';

import { render, screen, within } from '@/test-utils';

import { CalibrationWindow } from '../CalibrationWindow';

const data = { LastBidderAddr: '0x1111111111111111111111111111111111111111' } as DashboardInfo;

const cstWindow: CstGestureData = {
  AuctionDuration: 8 * 3600,
  SecondsElapsed: 2 * 3600,
  CSTPrice: 250.5,
  CSTPriceWei: 0n,
  isFree: false,
  source: 'api',
};

function visibleText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[hidden], .sr-only').forEach((node) => node.remove());
  return clone.textContent ?? '';
}

describe('CalibrationWindow', () => {
  it('shows the CST window once the cycle has its first Gesture', () => {
    render(<CalibrationWindow data={data} ethGestureInfo={null} cstGestureData={cstWindow} />);

    const section = screen.getByTestId('calibration-window');
    expect(visibleText(section)).toContain('home.calibration.cstTitle');
    expect(screen.getByTestId('calibration-percent')).toHaveTextContent(
      'home.calibration.percentComplete(percent=25%)',
    );
    const bar = within(section).getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '25');
    expect(bar.firstElementChild).toHaveStyle({ width: '25%' });
    // Length, elapsed and remaining, as durations.
    expect(visibleText(section)).toContain('8h');
    expect(visibleText(section)).toContain('2h');
    expect(visibleText(section)).toContain('6h');
  });

  it('shows the opening ETH window before the first Gesture', () => {
    render(
      <CalibrationWindow
        data={{ LastBidderAddr: zeroAddress } as DashboardInfo}
        ethGestureInfo={{ AuctionDuration: 3600, SecondsElapsed: 900, ETHPrice: 0.1 }}
        cstGestureData={{ ...cstWindow, source: 'empty' }}
      />,
    );

    expect(visibleText(screen.getByTestId('calibration-window'))).toContain(
      'home.calibration.firstGestureTitle',
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  it('shows skeletons, never zeros, while the timing loads', () => {
    render(
      <CalibrationWindow
        data={data}
        ethGestureInfo={null}
        cstGestureData={{ ...cstWindow, source: 'empty' }}
      />,
    );

    const section = screen.getByTestId('calibration-window');
    expect(section).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
    expect(visibleText(section)).not.toMatch(/0s|0%/);
  });

  it('says a CST Gesture is free once the window has ended', () => {
    render(
      <CalibrationWindow
        data={data}
        ethGestureInfo={null}
        cstGestureData={{ ...cstWindow, SecondsElapsed: 9 * 3600, isFree: true }}
      />,
    );

    expect(screen.getByText('home.calibration.cstEndedMessage')).toBeInTheDocument();
  });
});
