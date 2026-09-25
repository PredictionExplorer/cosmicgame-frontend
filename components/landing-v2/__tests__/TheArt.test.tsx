import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { landingContentEn } from '@/content/landing';

import { TheArt } from '@/components/landing-v2/TheArt';
import { FEATURED_LANDING_ART } from '@/components/landing-v2/featured-art';
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
const art = landingContentEn.art;
const UNAVAILABLE = 'landing.artwork.unavailable';

function installMatchMedia({ reducedMotion, wide }: { reducedMotion: boolean; wide: boolean }) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : wide,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onchange: null,
      dispatchEvent: jest.fn(),
    })),
  });
}

/** Observers the test moves on and off screen; they start off screen. */
const observers = new Set<ScrollObserver>();

class ScrollObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe() {
    observers.add(this);
  }
  unobserve() {}
  disconnect() {
    observers.delete(this);
  }
  takeRecords() {
    return [];
  }
  report(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

/** Scrolls the plate into (or out of) the observers' view. */
function scrollPlate(isIntersecting: boolean) {
  act(() => {
    for (const observer of observers) observer.report(isIntersecting);
  });
}

describe('<TheArt />', () => {
  const originalMatchMedia = window.matchMedia;
  const originalObserver = global.IntersectionObserver;
  const play = jest.fn(() => Promise.resolve());
  const pause = jest.fn();

  beforeAll(() => {
    Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: play });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: pause,
    });
  });

  beforeEach(() => {
    mockShowcase.mockReturnValue({ tokens: [], status: 'loading' });
    global.IntersectionObserver = ScrollObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    jest.clearAllMocks();
    observers.clear();
    global.IntersectionObserver = originalObserver;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('shows a verified Signature on its plate, captioned with its number, cycle and seed', () => {
    render(<TheArt art={art} />);

    expect(
      screen.getByAltText(art.showcase.artworkAlt.replace('{tokenLabel}', '#000024')),
    ).toHaveAttribute('src', expect.stringContaining(FEATURED_LANDING_ART[1].imageSrc));
    expect(screen.getByRole('link', { name: 'View Cosmic Signature #000024' })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/detail/24',
    );
    const caption = screen.getByRole('figure').querySelector('figcaption')!;
    // The unnamed form, "Signature #000024", titles the label.
    expect(caption).toHaveTextContent('landing.artwork.untitled(tokenLabel=#000024)');
    expect(caption.textContent?.match(/#000024/g)).toHaveLength(1);
    expect(caption).toHaveTextContent('landing.timer.cycle.numbered(number=1)');
    expect(caption).toHaveTextContent('Aug 2026');
    expect(caption).toHaveTextContent('Seed5084a8…⁠33ad');
  });

  it('never waits on the collection for its artwork', () => {
    // Regression: the section used to prefer a live token and sat on
    // "Loading the collection" when that token's image was missing.
    mockShowcase.mockReturnValue({ tokens: [], status: 'failed' });
    render(<TheArt art={art} />);
    expect(screen.queryByText(UNAVAILABLE)).not.toBeInTheDocument();
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
  });

  it('says the artwork is unavailable when every file fails, never that it is coming', () => {
    render(<TheArt art={art} />);
    fireEvent.error(screen.getByRole('figure').querySelector('img')!);
    expect(screen.getByText(UNAVAILABLE)).toBeInTheDocument();
  });

  it('lists the seven pipeline stages as numbered steps', () => {
    render(<TheArt art={art} />);
    const stages = screen.getAllByRole('heading', { level: 3 });
    expect(stages.map((stage) => stage.textContent)).toEqual(art.stages.map((s) => s.title));
    expect(screen.getAllByText(`${art.stageLabel}`, { exact: false })).toHaveLength(7);
  });

  it('shows the collection figures without repeating the stages', () => {
    mockShowcase.mockReturnValue({
      status: 'ready',
      tokens: [
        { TokenId: 47, Seed: 'aa' },
        { TokenId: 46, Seed: 'bb' },
      ],
    } satisfies LandingShowcase);
    render(<TheArt art={art} />);

    const figures = within(screen.getByText('Imprinted so far').closest('dl')!);
    expect(figures.getByText('Imprinted so far').nextSibling).toHaveTextContent('48');
    expect(figures.getByText('Native resolution').nextSibling).toHaveTextContent('3456 × 2234');
    expect(figures.getByText('License').nextSibling).toHaveTextContent('CC0 1.0');
    // Wavelength bins, physics steps and candidate orbits are in the stage copy already.
    expect(figures.queryByText(/Wavelength bins/)).not.toBeInTheDocument();
  });

  it('shows an unknown count, never zero, when the collection cannot be read', () => {
    mockShowcase.mockReturnValue({ tokens: [], status: 'failed' });
    render(<TheArt art={art} />);
    const value = screen.getByText('Imprinted so far').nextSibling as HTMLElement;
    expect(value).toHaveTextContent('—');
    expect(value).toHaveTextContent('common.status.unavailable');
    expect(value).not.toHaveTextContent('0');
  });

  it('names the loading count with text a screen reader announces', () => {
    render(<TheArt art={art} />);
    const value = screen.getByText('Imprinted so far').nextSibling as HTMLElement;
    // A role-less span cannot carry an aria-label; the name is a text node.
    expect(within(value).getByText('common.status.loading')).toHaveClass('sr-only');
    expect(value.querySelector('[aria-label]')).toBeNull();
  });

  it('keeps the finished still at rest and never requests the animation by itself', () => {
    // V165: the animation opens on a nearly empty black frame, so it never
    // replaces the still unasked, on any screen, with motion allowed or not.
    installMatchMedia({ reducedMotion: false, wide: true });
    const { container } = render(<TheArt art={art} />);
    scrollPlate(true);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('[src$=".mp4"]')).toBeNull();
    expect(play).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'landing.artwork.playAnimation' })).toBeVisible();
  });

  it('plays the animation once on request, with its progress, then returns to the still', () => {
    installMatchMedia({ reducedMotion: true, wide: false });
    const { container } = render(<TheArt art={art} />);
    scrollPlate(true);

    fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.playAnimation' }));
    const video = container.querySelector('video')!;
    expect(video).toHaveAttribute(
      'src',
      expect.stringContaining(`0x${FEATURED_LANDING_ART[1].Seed}.mp4`),
    );
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute('playsinline');
    expect(video).not.toHaveAttribute('loop');
    expect(video).toHaveAttribute('aria-hidden', 'true');
    expect(play).toHaveBeenCalledTimes(1);
    // Until the first frame plays, the still shows and the control is busy.
    expect(video).not.toHaveClass('animationVisible');
    expect(screen.getByRole('button', { name: 'landing.artwork.pauseAnimation' })).toHaveAttribute(
      'aria-busy',
      'true',
    );

    fireEvent.playing(video);
    expect(video).toHaveClass('animationVisible');
    Object.defineProperty(video, 'currentTime', { configurable: true, writable: true, value: 8.4 });
    fireEvent.timeUpdate(video);
    expect(container.querySelector('figcaption')).toHaveTextContent('0:08 / 0:30');
    expect(container.querySelector('.animationProgress')).toHaveStyle({ '--progress': '0.28' });

    fireEvent.ended(video);
    expect(video).not.toHaveClass('animationVisible');
    expect(container.querySelector('.animationProgress')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.replayAnimation' }));
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('holds the frame on pause and resumes where it stopped', () => {
    installMatchMedia({ reducedMotion: false, wide: true });
    const { container } = render(<TheArt art={art} />);
    scrollPlate(true);
    fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.playAnimation' }));
    const video = container.querySelector('video')!;
    fireEvent.playing(video);

    fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.pauseAnimation' }));
    expect(pause).toHaveBeenCalled();
    expect(video).toHaveClass('animationVisible');
    fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.resumeAnimation' }));
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('pauses while the plate is off screen and picks up again on the way back', () => {
    installMatchMedia({ reducedMotion: false, wide: true });
    const { container } = render(<TheArt art={art} />);
    scrollPlate(true);
    fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.playAnimation' }));
    fireEvent.playing(container.querySelector('video')!);

    scrollPlate(false);
    expect(pause).toHaveBeenCalled();
    scrollPlate(true);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('falls back to the still when the animation cannot load', () => {
    installMatchMedia({ reducedMotion: false, wide: true });
    const { container } = render(<TheArt art={art} />);
    scrollPlate(true);
    fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.playAnimation' }));
    fireEvent.error(container.querySelector('video')!);
    expect(container.querySelector('video')).toBeNull();
    expect(screen.queryByRole('button', { name: /animation/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
  });

  it('offers the play control only where JavaScript runs', () => {
    render(<TheArt art={art} />);
    // Landing.module.css hides this class under @media (scripting: none).
    expect(
      screen.getByRole('button', { name: 'landing.artwork.playAnimation' }).parentElement,
    ).toHaveClass('scriptedControl');
  });

  it('has an id="art" anchor and names the section by its heading', () => {
    const { container } = render(<TheArt art={art} />);
    const section = container.querySelector('#art')!;
    expect(section).toHaveAttribute('aria-labelledby', 'landing-art-heading');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(art.heading);
  });
});
