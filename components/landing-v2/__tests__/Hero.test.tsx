import { render, screen } from '@testing-library/react';

import { landingContentEn } from '@/content/landing';

import { Hero } from '@/components/landing-v2/Hero';

jest.mock('../EventHorizonCountdown', () => ({
  EventHorizonCountdown: () => (
    <section aria-label="Live Performance Cycle countdown" data-testid="event-horizon-countdown" />
  ),
}));

describe('<Hero />', () => {
  it('renders the lexicon-safe headline', () => {
    render(<Hero hero={landingContentEn.hero} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(landingContentEn.hero.headlineLead);
    expect(heading).toHaveTextContent(landingContentEn.hero.headlineAccent);
  });

  it('renders the primary CTA linking to the app subdomain in the same tab', () => {
    render(<Hero hero={landingContentEn.hero} />);
    const primaryCta = screen.getByRole('link', { name: /open the app/i });
    expect(primaryCta).toHaveAttribute('href', 'https://app.cosmicsignature.com');
    expect(primaryCta).not.toHaveAttribute('target');
  });

  it('leaves the site header to the landing shell, outside <main>', () => {
    render(<Hero hero={landingContentEn.hero} />);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
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
    expect(screen.getByText('7% to Protocol Guild')).toBeInTheDocument();
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

  it('draws its atmosphere without a canvas or WebGL', () => {
    // The 16%-opacity three.js scene cost ~314 KB gzip on desktop and threw
    // without WebGL; the hero is static CSS now, in every browser.
    const { container } = render(<Hero hero={landingContentEn.hero} />);
    expect(container.querySelector('canvas')).toBeNull();
    expect(container.querySelector('.starfield')).toHaveAttribute('aria-hidden', 'true');
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
