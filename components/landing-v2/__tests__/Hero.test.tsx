import { render, screen } from '@testing-library/react';

import { landingContentEn } from '@/content/landing';
import { ethDistributionFacts } from '@/content/protocol-facts';

import { Hero } from '@/components/landing-v2/Hero';

// HeroCanvas uses dynamic() + ssr:false, which renders a loading state on
// the server and first client render. We don't need to assert the WebGL;
// we just need the section chrome to render. Mounting the stub is the
// observable proxy for "the three.js chunk import was triggered".
jest.mock('next/dynamic', () => () => {
  const Stub = () => <div data-testid="hero-canvas-stub" />;
  Stub.displayName = 'HeroCanvasStub';
  return Stub;
});

jest.mock('@/components/three/ReducedMotionFallback', () => ({
  ReducedMotionFallback: () => <div data-testid="reduced-motion-fallback" />,
}));

jest.mock('../EventHorizonCountdown', () => ({
  EventHorizonCountdown: () => (
    <section aria-label="Live Performance Cycle countdown" data-testid="event-horizon-countdown" />
  ),
}));

function installMatchMedia({
  highQuality,
  reducedMotion = false,
}: {
  highQuality: boolean;
  reducedMotion?: boolean;
}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : highQuality,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onchange: null,
      dispatchEvent: jest.fn(),
    })),
  });
}

describe('<Hero />', () => {
  beforeEach(() => {
    installMatchMedia({ highQuality: true });
  });
  it('renders the lexicon-safe headline', () => {
    render(<Hero hero={landingContentEn.hero} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Cosmic Signature/i);
    expect(heading).toHaveTextContent(/Procedural On-Chain Art/i);
    expect(heading).toHaveTextContent(/Arbitrum/i);
  });

  it('renders the primary CTA linking to the app subdomain', () => {
    render(<Hero hero={landingContentEn.hero} />);
    const primaryCta = screen.getByRole('link', { name: /open the app/i });
    expect(primaryCta).toHaveAttribute('href', 'https://app.cosmicsignature.com');
    expect(primaryCta).toHaveAttribute('rel', 'noopener');
  });

  it('renders the secondary CTA anchoring to the cycle section', () => {
    render(<Hero hero={landingContentEn.hero} />);
    const secondaryCta = screen.getByRole('link', { name: /explore the cycle/i });
    expect(secondaryCta).toHaveAttribute('href', '#cycle');
  });

  it('renders the live Event Horizon countdown inside the hero', () => {
    render(<Hero hero={landingContentEn.hero} />);
    expect(screen.getByTestId('event-horizon-countdown')).toBeInTheDocument();
    expect(screen.getByLabelText('Live Performance Cycle countdown')).toBeInTheDocument();
  });

  it('renders the scroll-to-cycle chevron with an accessible label', () => {
    render(<Hero hero={landingContentEn.hero} />);
    const chevron = screen.getByRole('link', { name: /scroll to the cycle section/i });
    expect(chevron).toHaveAttribute('href', '#cycle');
  });

  it('renders the marquee credibility chips', () => {
    render(<Hero hero={landingContentEn.hero} />);
    expect(screen.getByText('CC0')).toBeInTheDocument();
    expect(screen.getByText('Verified Contracts')).toBeInTheDocument();
    expect(
      screen.getByText(`${ethDistributionFacts.publicGoodsPercentage}% to Protocol Guild`),
    ).toBeInTheDocument();
  });

  it('avoids unsupported audit claims in the marquee chips', () => {
    // Audit/formal-verification status is published on /audits; the hero
    // must not assert it as a blanket fact.
    render(<Hero hero={landingContentEn.hero} />);
    expect(screen.queryByText('Formally Verified')).not.toBeInTheDocument();
    expect(screen.queryByText('Audited Contracts')).not.toBeInTheDocument();
  });

  it('contains no banned lexicon terms in the rendered DOM', () => {
    const { container } = render(<Hero hero={landingContentEn.hero} />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bbid(?:ding|der|s)?\b/i);
    expect(text).not.toMatch(/\bprize(?:s|d)?\b/i);
    expect(text).not.toMatch(/\braffle(?:s)?\b/i);
    expect(text).not.toMatch(/\bwinner(?:s)?\b/i);
  });

  it('mounts the hero canvas on large viewports without reduced motion', () => {
    render(<Hero hero={landingContentEn.hero} />);
    expect(screen.getByTestId('hero-canvas-stub')).toBeInTheDocument();
  });

  it('never triggers the three.js dynamic import on small viewports', () => {
    // The gate must run OUTSIDE the dynamically imported component: mounting
    // it is what downloads the ~320KB three.js chunk, which phones render
    // nothing with. The static gradient fallback renders instead.
    installMatchMedia({ highQuality: false });
    render(<Hero hero={landingContentEn.hero} />);
    expect(screen.queryByTestId('hero-canvas-stub')).not.toBeInTheDocument();
    expect(screen.getByTestId('reduced-motion-fallback')).toBeInTheDocument();
  });

  it('never triggers the three.js dynamic import under reduced motion', () => {
    installMatchMedia({ highQuality: true, reducedMotion: true });
    render(<Hero hero={landingContentEn.hero} />);
    expect(screen.queryByTestId('hero-canvas-stub')).not.toBeInTheDocument();
    expect(screen.getByTestId('reduced-motion-fallback')).toBeInTheDocument();
  });

  it('keeps the LCP candidates visible at first paint (no opacity-0 wrappers)', () => {
    // The headline and subhead are the page's LCP candidates. If any
    // ancestor renders with opacity: 0 (e.g. a framer-motion fade-in), the
    // server HTML hides them until the whole bundle hydrates, and mobile
    // LCP degrades by seconds. Entrances here must be transform-only.
    const { container } = render(<Hero hero={landingContentEn.hero} />);
    const heading = screen.getByRole('heading', { level: 1 });
    const subhead = screen.getByText(landingContentEn.hero.subhead);
    const primaryCta = screen.getByRole('link', { name: /open the app/i });

    for (const element of [heading, subhead, primaryCta]) {
      let node: HTMLElement | null = element;
      while (node && node !== container) {
        const opacity = node.style.opacity;
        expect(opacity === '' || Number(opacity) > 0).toBe(true);
        node = node.parentElement;
      }
    }
  });
});
