import type { DashboardInfo } from '@/services/api';

import { render, screen, within, act, checkA11y } from '@/test-utils';

import { HomeObservatoryHero } from '../HomeObservatoryHero';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

function makeData(overrides: Partial<DashboardInfo> = {}): DashboardInfo {
  return {
    CurRoundNum: 7,
    CurNumBids: 42,
    PrizeAmountEth: 2.75,
    CharityPercentage: 7,
    ...overrides,
  } as Partial<DashboardInfo> as DashboardInfo;
}

const sampleToken = { seed: 'sample', id: -1 };

describe('HomeObservatoryHero', () => {
  it('renders the page H1 inside a labelled hero region', () => {
    render(<HomeObservatoryHero data={makeData()} bannerToken={sampleToken} canOpenGesturePanel />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Shape the next Cosmic Signature' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Shape the next Cosmic Signature' })).toHaveAttribute(
      'aria-labelledby',
      'home-observatory-title',
    );
  });

  it('shows live cycle stats in the observatory console', () => {
    render(<HomeObservatoryHero data={makeData()} bannerToken={sampleToken} canOpenGesturePanel />);

    const observatory = screen.getByRole('region', { name: 'Current cycle observatory' });
    expect(within(observatory).getByRole('heading', { name: 'Cycle #7' })).toBeInTheDocument();
    expect(within(observatory).getByText('42')).toBeInTheDocument();
    expect(within(observatory).getByText('2.7500 ETH')).toBeInTheDocument();
    expect(within(observatory).getByText('7%')).toBeInTheDocument();
  });

  it('animates the gesture count toward an updated value', () => {
    jest.useFakeTimers();
    try {
      const { rerender } = render(
        <HomeObservatoryHero
          data={makeData({ CurNumBids: 100 })}
          bannerToken={sampleToken}
          canOpenGesturePanel
        />,
      );

      const observatory = screen.getByRole('region', { name: 'Current cycle observatory' });
      expect(within(observatory).getByText('100')).toBeInTheDocument();

      rerender(
        <HomeObservatoryHero
          data={makeData({ CurNumBids: 160 })}
          bannerToken={sampleToken}
          canOpenGesturePanel
        />,
      );

      act(() => {
        jest.advanceTimersByTime(1_000);
      });

      expect(within(observatory).getByText('160')).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it('points the primary CTA at the gesture panel when the cycle is open', () => {
    render(<HomeObservatoryHero data={makeData()} bannerToken={sampleToken} canOpenGesturePanel />);

    expect(screen.getByRole('link', { name: /Make a Gesture/ })).toHaveAttribute(
      'href',
      '#make-gesture',
    );
  });

  it('points the primary CTA at cycle details before the cycle opens', () => {
    render(
      <HomeObservatoryHero
        data={makeData()}
        bannerToken={sampleToken}
        canOpenGesturePanel={false}
      />,
    );

    expect(screen.getByRole('link', { name: /Explore Current Cycle/ })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
  });

  it('links to the previous cycle allocations when one exists', () => {
    render(
      <HomeObservatoryHero
        data={makeData({ CurRoundNum: 5 })}
        bannerToken={sampleToken}
        canOpenGesturePanel
      />,
    );

    expect(screen.getByRole('link', { name: /Cycle 4 allocations/ })).toHaveAttribute(
      'href',
      '/allocation/4',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <HomeObservatoryHero data={makeData()} bannerToken={sampleToken} canOpenGesturePanel />,
    );
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
