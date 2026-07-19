import type { DashboardInfo } from '@/services/api';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

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

const liveToken = { seed: '0xabc123', id: 12 };
const liveProps = {
  data: makeData(),
  bannerToken: liveToken,
  canOpenGesturePanel: true,
  phase: 'live' as const,
};

describe('HomeObservatoryHero', () => {
  it('renders the page H1 inside a labelled hero region', () => {
    render(<HomeObservatoryHero {...liveProps} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'home.hero.phase.live.headline' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'home.hero.phase.live.headline' })).toHaveAttribute(
      'aria-labelledby',
      'home-observatory-title',
    );
  });

  it('shows live cycle stats in the observatory console', () => {
    render(<HomeObservatoryHero {...liveProps} />);

    const observatory = screen.getByRole('region', { name: 'home.hero.console.ariaLabel' });
    expect(
      within(observatory).getByRole('heading', { name: 'home.hero.cycleNumber(number=7)' }),
    ).toBeInTheDocument();
    expect(within(observatory).getByText('42')).toBeInTheDocument();
    expect(within(observatory).getByText('2.7500 ETH')).toBeInTheDocument();
    expect(within(observatory).getByText('7%')).toBeInTheDocument();
  });

  it('links real artwork to its token detail page and shows the token number', () => {
    render(<HomeObservatoryHero {...liveProps} />);

    const observatory = screen.getByRole('region', { name: 'home.hero.console.ariaLabel' });
    expect(
      within(observatory).getByRole('link', {
        name: 'home.hero.console.viewSignatureAria(id=#000012)',
      }),
    ).toHaveAttribute('href', '/detail/12');
    expect(
      within(observatory).getByText('home.hero.console.signatureBadge(id=#000012)'),
    ).toBeInTheDocument();
    expect(
      within(observatory).getByAltText('home.hero.console.artworkAlt(id=#000012)'),
    ).toBeInTheDocument();
  });

  it('shows a neutral state instead of sample art when no real token is available', () => {
    render(<HomeObservatoryHero {...liveProps} bannerToken={null} />);

    const observatory = screen.getByRole('region', { name: 'home.hero.console.ariaLabel' });
    expect(within(observatory).getByText('home.hero.artUnavailable.eyebrow')).toBeInTheDocument();
    expect(
      within(observatory).queryByRole('link', { name: /home\.hero\.console\.viewSignatureAria/ }),
    ).not.toBeInTheDocument();
  });

  it('animates the gesture count toward an updated value', () => {
    jest.useFakeTimers();
    try {
      const { rerender } = render(
        <HomeObservatoryHero {...liveProps} data={makeData({ CurNumBids: 100 })} />,
      );

      const observatory = screen.getByRole('region', { name: 'home.hero.console.ariaLabel' });
      expect(within(observatory).getByText('100')).toBeInTheDocument();

      rerender(<HomeObservatoryHero {...liveProps} data={makeData({ CurNumBids: 160 })} />);

      act(() => {
        jest.advanceTimersByTime(1_000);
      });

      expect(within(observatory).getByText('160')).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it('points the primary CTA at the gesture panel when the cycle is open', () => {
    render(<HomeObservatoryHero {...liveProps} />);

    expect(screen.getByRole('link', { name: /home\.hero\.phase\.live\.cta/ })).toHaveAttribute(
      'href',
      '#make-gesture',
    );
  });

  it('links visitors to trade CST on Uniswap', () => {
    render(<HomeObservatoryHero {...liveProps} />);

    expect(screen.getByRole('link', { name: 'nav.ecosystem.uniswap.ariaLabel' })).toHaveAttribute(
      'href',
      CST_UNISWAP_SWAP_URL,
    );
  });

  it('shows opening-soon copy and points the primary CTA at cycle details before the cycle opens', () => {
    render(
      <HomeObservatoryHero
        {...liveProps}
        data={makeData()}
        canOpenGesturePanel={false}
        phase="opening-soon"
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'home.hero.phase.openingSoon.headline' }),
    ).toBeInTheDocument();
    expect(screen.getByText('home.hero.phase.openingSoon.badge')).toBeInTheDocument();
    expect(
      screen.getByText(
        'home.hero.phase.openingSoon.body(cycleLabel=home.hero.cycleNumber(number=7))',
      ),
    ).toHaveClass('font-medium', 'text-foreground/90');
    const cycleDetailLinks = screen.getAllByRole('link', { name: 'home.hero.viewCycleDetails' });
    expect(cycleDetailLinks.length).toBeGreaterThanOrEqual(2);
    for (const link of cycleDetailLinks) {
      expect(link).toHaveAttribute('href', '/current-cycle');
    }
  });

  it('shows first-Gesture copy when the cycle is open but no Gesture has started the clock', () => {
    render(<HomeObservatoryHero {...liveProps} phase="waiting-first-gesture" />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'home.hero.phase.waitingFirstGesture.headline(cycleLabel=home.hero.cycleNumber(number=7))',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('home.hero.phase.waitingFirstGesture.badge')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /home\.hero\.phase\.waitingFirstGesture\.cta/ }),
    ).toHaveAttribute('href', '#make-gesture');
  });

  it('links to the previous cycle allocations when one exists', () => {
    render(<HomeObservatoryHero {...liveProps} data={makeData({ CurRoundNum: 5 })} />);

    expect(
      screen.getByRole('link', { name: /home\.hero\.console\.previousAllocations\(number=4\)/ }),
    ).toHaveAttribute('href', '/allocation/4');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HomeObservatoryHero {...liveProps} />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
