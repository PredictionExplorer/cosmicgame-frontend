import { render, screen } from '@testing-library/react';

import { landingContentEn } from '@/content/landing';

import { Hero } from '@/components/landing-v2/Hero';

jest.mock('../EventHorizonCountdown', () => ({
  EventHorizonCountdown: () => (
    <section aria-label="Live Performance Cycle countdown" data-testid="event-horizon-countdown" />
  ),
}));

jest.mock('../useLandingShowcaseTokens', () => ({
  ...jest.requireActual('../useLandingShowcaseTokens'),
  useLandingShowcaseTokens: () => ({ tokens: [], status: 'loading' }),
}));

const hero = landingContentEn.hero;

describe('<Hero />', () => {
  it('renders the lexicon-safe headline', () => {
    render(<Hero hero={hero} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(hero.headlineLead);
    expect(heading).toHaveTextContent(hero.headlineAccent);
  });

  it('states the loop in the subhead, with the public-goods share from protocol facts', () => {
    render(<Hero hero={hero} />);
    expect(screen.getByText(hero.subhead)).toBeInTheDocument();
    // It says what a gesture is before it asks for one (V168).
    expect(hero.subhead).toMatch(/^Each gesture, made with ETH or CST, extends the cycle’s clock/);
    expect(hero.subhead).toMatch(/new Signatures are imprinted for its recipients/);
    expect(hero.subhead).toMatch(/7% of it to Ethereum’s core contributors/);
  });

  it('offers one commit action, the gesture, in the same tab', () => {
    // V170: the commit gradient is the gesture's, never "Open the app", which
    // the header and footer render solid.
    render(<Hero hero={hero} />);
    const primaryCta = screen.getByRole('link', { name: /make a gesture/i });
    // The same target as The Cycle's gesture: the app home's gesture panel.
    expect(primaryCta.getAttribute('href')).toMatch(
      /^https:\/\/app\.cosmicsignature\.com\/?#make-gesture$/,
    );
    expect(primaryCta).not.toHaveAttribute('target');
    expect(primaryCta.className).toMatch(/bg-signature-gradient/);
    expect(screen.queryByRole('link', { name: /open the app/i })).not.toBeInTheDocument();
  });

  it('offers a quiet second action to the cycle explainer', () => {
    render(<Hero hero={hero} />);
    const secondaryCta = screen.getByRole('link', { name: 'How a cycle works' });
    expect(secondaryCta).toHaveAttribute('href', '#cycle');
    expect(secondaryCta.className).not.toMatch(/bg-signature-gradient/);
  });

  it('reads headline, lede and actions before the exhibit and its controls', () => {
    // Regression: the plate sat between the H1 and the lede in the source, so
    // focus met five exhibit controls before the primary action. The grid
    // still draws the plate under the headline on phones (Landing.module.css).
    const { container } = render(<Hero hero={hero} />);
    const inOrder = [
      screen.getByRole('heading', { level: 1 }),
      screen.getByText(hero.subhead),
      screen.getByRole('link', { name: /make a gesture/i }),
      screen.getByRole('link', { name: hero.secondaryCta.label }),
      screen.getByTestId('hero-art-showcase'),
    ];
    for (let index = 1; index < inOrder.length; index += 1) {
      expect(
        inOrder[index - 1]!.compareDocumentPosition(inOrder[index]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(container.querySelector('img')).toHaveAttribute('fetchpriority', 'high');
  });

  it('sets its type from the tokens alone', () => {
    render(<Hero hero={hero} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('type-display-xl');
    expect(screen.getByText(hero.subhead)).toHaveClass('type-body-md', 'sm:type-lede');
  });

  it('leaves the site header to the landing shell, outside <main>', () => {
    render(<Hero hero={hero} />);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders the live cycle clock inside the hero', () => {
    render(<Hero hero={hero} />);
    expect(screen.getByTestId('event-horizon-countdown')).toBeInTheDocument();
  });

  it('keeps trust claims and tertiary links off the hero', () => {
    // Verification and audit status belong on /security and /audits with
    // their sources (the Verifiability section links them); the hero asks
    // for one decision.
    render(<Hero hero={hero} />);
    for (const claim of ['Verified Contracts', 'Audited Contracts', 'Formally Verified']) {
      expect(screen.queryByText(claim)).not.toBeInTheDocument();
    }
    expect(screen.queryByRole('link', { name: /protocol statistics/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /scroll to/i })).not.toBeInTheDocument();
  });

  it('draws its atmosphere without a canvas or WebGL', () => {
    // The 16%-opacity three.js scene cost ~314 KB gzip on desktop and threw
    // without WebGL; the hero is static CSS now, in every browser.
    const { container } = render(<Hero hero={hero} />);
    expect(container.querySelector('canvas')).toBeNull();
    expect(container.querySelector('.starfield')).toHaveAttribute('aria-hidden', 'true');
  });

  it('contains no banned lexicon terms in the rendered DOM', () => {
    const { container } = render(<Hero hero={hero} />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bbid(?:ding|der|s)?\b/i);
    expect(text).not.toMatch(/\bprize(?:s|d)?\b/i);
    expect(text).not.toMatch(/\braffle(?:s)?\b/i);
    expect(text).not.toMatch(/\bwinner(?:s)?\b/i);
  });

  it('keeps the LCP candidates visible at first paint (no opacity-0 wrappers)', () => {
    // The headline, subhead and first artwork are the page's LCP candidates.
    // If any ancestor rendered at opacity 0 (a scroll reveal), the server
    // HTML would hide them until hydration.
    const { container } = render(<Hero hero={hero} />);
    const candidates = [
      screen.getByRole('heading', { level: 1 }),
      screen.getByText(hero.subhead),
      screen.getByRole('link', { name: /make a gesture/i }),
      container.querySelector('img')!,
    ];
    for (const element of candidates) {
      let node: HTMLElement | null = element;
      while (node && node !== container) {
        expect(node.style.opacity === '' || Number(node.style.opacity) > 0).toBe(true);
        expect(node.className.toString()).not.toMatch(/(?:^|\s)opacity-0(?:\s|$)/);
        node = node.parentElement;
      }
    }
  });
});
