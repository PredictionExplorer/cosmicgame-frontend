import { act, fireEvent, render, screen } from '@testing-library/react';

import { landingContentEn } from '@/content/landing';

import { FEATURED_LANDING_ART } from '@/components/landing-v2/featured-art';
import { HeroArtShowcase, ROTATION_INTERVAL_MS } from '@/components/landing-v2/HeroArtShowcase';
import {
  useLandingShowcaseTokens,
  type LandingShowcase,
} from '@/components/landing-v2/useLandingShowcaseTokens';

// CSS module class names as written, so a test can see which class an element carries.
jest.mock(
  '@/components/landing-v2/Landing.module.css',
  () => new Proxy({}, { get: (_target, key) => (key === '__esModule' ? false : key) }),
);

jest.mock('@/components/landing-v2/useLandingShowcaseTokens', () => ({
  ...jest.requireActual('@/components/landing-v2/useLandingShowcaseTokens'),
  useLandingShowcaseTokens: jest.fn(),
}));

const mockShowcase = jest.mocked(useLandingShowcaseTokens);
const art = landingContentEn.hero.art;
const LIVE: LandingShowcase = {
  status: 'ready',
  tokens: [
    { TokenId: 23, Seed: FEATURED_LANDING_ART[0].Seed, RoundNum: 0 },
    { TokenId: 42, Seed: 'feedbeef', RoundNum: 3 },
  ],
};

const next = () => fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.next' }));
const previous = () =>
  fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.previous' }));

/** The layer that currently owns the plate: the last image inside the link. */
function currentImage(): HTMLImageElement {
  const images = screen.getByTestId('hero-art-link').querySelectorAll('img');
  return images[images.length - 1] as HTMLImageElement;
}

function expectArtwork(tokenId: number, src: string) {
  const tokenLabel = `#${String(tokenId).padStart(6, '0')}`;
  const link = screen.getByTestId('hero-art-link');
  expect(link).toHaveAttribute('href', `https://app.cosmicsignature.com/detail/${tokenId}`);
  expect(link).toHaveAccessibleName(expect.stringContaining(tokenLabel));
  expect(currentImage()).toHaveAttribute('alt', expect.stringContaining(tokenLabel));
  expect(currentImage().getAttribute('src')).toContain(src);
  expect(screen.getByText(tokenLabel)).toBeInTheDocument();
}

function installMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : true,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onchange: null,
      dispatchEvent: jest.fn(),
    })),
  });
}

/** An IntersectionObserver that reports the plate on screen. */
class VisibleObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe() {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

/** Preloads settle at once: jsdom never loads images. */
class LoadingImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  sizes = '';
  srcset = '';
  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

describe('<HeroArtShowcase />', () => {
  const originalObserver = global.IntersectionObserver;
  const originalImage = global.Image;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    mockShowcase.mockReturnValue({ tokens: [], status: 'loading' });
  });

  afterEach(() => {
    jest.useRealTimers();
    global.IntersectionObserver = originalObserver;
    global.Image = originalImage;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('paints bundled, verified artwork first, eagerly, before the collection answers', () => {
    render(<HeroArtShowcase art={art} />);

    expect(screen.getByTestId('hero-art-showcase')).toBeInTheDocument();
    expectArtwork(23, FEATURED_LANDING_ART[0].imageSrc);
    expect(currentImage()).toHaveAttribute('loading', 'eager');
    expect(currentImage()).toHaveAttribute('fetchpriority', 'high');
  });

  it('captions the plate with a wall label: the name, then the token number and cycle', () => {
    render(<HeroArtShowcase art={art} />);
    const caption = screen.getByTestId('hero-art-showcase').querySelector('figcaption')!;
    // An unnamed token takes the unnamed form, "Signature #000023".
    expect(caption).toHaveTextContent('landing.artwork.untitled(tokenLabel=#000023)');
    expect(caption).toHaveTextContent('#000023');
    expect(caption).toHaveTextContent('landing.timer.cycle.numbered(number=0)');
    expect(screen.getByRole('link', { name: /Browse the full gallery/ })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/gallery',
    );
  });

  it('steps through the featured pieces and the collection without repeating a piece', () => {
    mockShowcase.mockReturnValue(LIVE);
    render(<HeroArtShowcase art={art} />);
    expectArtwork(23, FEATURED_LANDING_ART[0].imageSrc);

    next();
    expectArtwork(24, FEATURED_LANDING_ART[1].imageSrc);
    next();
    expectArtwork(42, '/0xfeedbeef/thumb_card.webp');
    expect(currentImage().getAttribute('srcset')).toContain('/0xfeedbeef/images/web/full.webp');
    // The featured #23 from the API is not a second slide.
    next();
    expectArtwork(23, FEATURED_LANDING_ART[0].imageSrc);
    previous();
    expectArtwork(42, '/0xfeedbeef/thumb_card.webp');
  });

  it('never moves by itself under reduced motion and offers no pause control there', () => {
    jest.useFakeTimers();
    installMatchMedia(true);
    global.IntersectionObserver = VisibleObserver as unknown as typeof IntersectionObserver;
    mockShowcase.mockReturnValue(LIVE);
    render(<HeroArtShowcase art={art} />);

    act(() => jest.advanceTimersByTime(ROTATION_INTERVAL_MS * 4));
    expectArtwork(23, FEATURED_LANDING_ART[0].imageSrc);
    expect(screen.queryByRole('button', { name: /rotation/ })).not.toBeInTheDocument();
  });

  it('rotates while on screen when motion is allowed, and the pause control stops it', async () => {
    jest.useFakeTimers();
    installMatchMedia(false);
    global.IntersectionObserver = VisibleObserver as unknown as typeof IntersectionObserver;
    global.Image = LoadingImage as unknown as typeof Image;
    mockShowcase.mockReturnValue(LIVE);
    render(<HeroArtShowcase art={art} />);
    expect(screen.getByTestId('hero-art-showcase')).toHaveAttribute('data-rotating', 'true');

    await act(async () => {
      jest.advanceTimersByTime(ROTATION_INTERVAL_MS);
    });
    expectArtwork(24, FEATURED_LANDING_ART[1].imageSrc);

    fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.pauseRotation' }));
    expect(screen.getByTestId('hero-art-showcase')).toHaveAttribute('data-rotating', 'false');
    await act(async () => {
      jest.advanceTimersByTime(ROTATION_INTERVAL_MS * 3);
    });
    expectArtwork(24, FEATURED_LANDING_ART[1].imageSrc);
    expect(
      screen.getByRole('button', { name: 'landing.artwork.resumeRotation' }),
    ).toBeInTheDocument();
  });

  it('holds still while the visitor points at or focuses the exhibit', () => {
    installMatchMedia(false);
    global.IntersectionObserver = VisibleObserver as unknown as typeof IntersectionObserver;
    mockShowcase.mockReturnValue(LIVE);
    render(<HeroArtShowcase art={art} />);
    const showcase = screen.getByTestId('hero-art-showcase');

    fireEvent.mouseEnter(showcase);
    expect(showcase).toHaveAttribute('data-rotating', 'false');
    fireEvent.mouseLeave(showcase);
    expect(showcase).toHaveAttribute('data-rotating', 'true');
    fireEvent.focus(screen.getByTestId('hero-art-link'));
    expect(showcase).toHaveAttribute('data-rotating', 'false');
  });

  it('falls back through the published files and ends in the designed unavailable plate', () => {
    mockShowcase.mockReturnValue(LIVE);
    render(<HeroArtShowcase art={art} />);
    next();
    next();

    fireEvent.error(currentImage());
    expectArtwork(42, '/0xfeedbeef/images/web/full.webp');
    fireEvent.error(currentImage());
    expectArtwork(42, '/cosmicsignature/0xfeedbeef.png');
    fireEvent.error(currentImage());
    // The terminal state says the art is unavailable, never that it is still coming.
    expect(screen.getByText('landing.artwork.unavailable')).toBeInTheDocument();
    expect(screen.getByTestId('hero-art-link')).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/detail/42',
    );
    previous();
    expectArtwork(24, FEATURED_LANDING_ART[1].imageSrc);
  });

  it('announces a piece only when the visitor moves to it', () => {
    mockShowcase.mockReturnValue(LIVE);
    render(<HeroArtShowcase art={art} />);
    const region = screen
      .getByTestId('hero-art-showcase')
      .querySelector('[aria-live="polite"]') as HTMLElement;
    expect(region).toBeEmptyDOMElement();
    next();
    expect(region).toHaveTextContent('landing.artwork.untitled(tokenLabel=#000024)');
  });

  it('titles a named Signature by its name', () => {
    mockShowcase.mockReturnValue({
      status: 'ready',
      tokens: [{ TokenId: 42, Seed: 'feedbeef', RoundNum: 3, TokenName: ' Orbit Song ' }],
    });
    render(<HeroArtShowcase art={art} />);
    const region = screen
      .getByTestId('hero-art-showcase')
      .querySelector('[aria-live="polite"]') as HTMLElement;
    previous();
    const caption = screen.getByTestId('hero-art-showcase').querySelector('figcaption')!;
    expect(caption.querySelector('p')).toHaveTextContent(/^Orbit Song$/);
    expect(region).toHaveTextContent('Orbit Song #000042');
  });

  it('offers the rotation controls only where JavaScript runs', () => {
    render(<HeroArtShowcase art={art} />);
    const controls = screen.getByRole('button', { name: 'landing.artwork.next' }).parentElement!;
    // Landing.module.css hides this class under @media (scripting: none).
    expect(controls).toHaveClass('scriptedControl');
    expect(screen.getByRole('link', { name: /Browse the full gallery/ })).not.toHaveClass(
      'scriptedControl',
    );
  });

  it('contains no banned lexicon terms in the rendered DOM', () => {
    const { container } = render(<HeroArtShowcase art={art} />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bbid(?:ding|der|s)?\b/i);
    expect(text).not.toMatch(/\bmint(?:ing|ed|s)?\b/i);
    expect(text).not.toMatch(/\bprize(?:s|d)?\b/i);
  });
});
