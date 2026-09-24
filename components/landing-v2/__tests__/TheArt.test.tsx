import { fireEvent, render, screen, within } from '@testing-library/react';

import { landingContentEn } from '@/content/landing';

import { TheArt } from '@/components/landing-v2/TheArt';
import { FEATURED_LANDING_ART } from '@/components/landing-v2/featured-art';
import {
  useLandingShowcaseTokens,
  type LandingShowcase,
} from '@/components/landing-v2/useLandingShowcaseTokens';

jest.mock('@/components/landing-v2/useLandingShowcaseTokens', () => ({
  ...jest.requireActual('@/components/landing-v2/useLandingShowcaseTokens'),
  useLandingShowcaseTokens: jest.fn(),
}));

const mockShowcase = jest.mocked(useLandingShowcaseTokens);
const art = landingContentEn.art;
const UNAVAILABLE = landingContentEn.hero.art.formingLabel;

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

describe('<TheArt />', () => {
  const originalMatchMedia = window.matchMedia;
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
  });

  afterEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('shows a verified Signature on its plate, captioned with its number, cycle and seed', () => {
    render(<TheArt art={art} unavailableLabel={UNAVAILABLE} />);

    expect(
      screen.getByAltText(art.showcase.artworkAlt.replace('{tokenLabel}', '#000024')),
    ).toHaveAttribute('src', expect.stringContaining(FEATURED_LANDING_ART[1].imageSrc));
    expect(screen.getByRole('link', { name: 'View Cosmic Signature #000024' })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/detail/24',
    );
    const caption = screen.getByRole('figure').querySelector('figcaption')!;
    expect(caption).toHaveTextContent('#000024');
    expect(caption).toHaveTextContent('landing.timer.cycle.numbered(number=1)');
    expect(caption).toHaveTextContent('Seed5084a873…4dfc33ad');
  });

  it('never waits on the collection for its artwork', () => {
    // Regression: the section used to prefer a live token and sat on
    // "Loading the collection" when that token's image was missing.
    mockShowcase.mockReturnValue({ tokens: [], status: 'failed' });
    render(<TheArt art={art} unavailableLabel={UNAVAILABLE} />);
    expect(screen.queryByText(UNAVAILABLE)).not.toBeInTheDocument();
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
  });

  it('lists the seven pipeline stages as numbered steps', () => {
    render(<TheArt art={art} unavailableLabel={UNAVAILABLE} />);
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
    render(<TheArt art={art} unavailableLabel={UNAVAILABLE} />);

    const figures = within(screen.getByText('Imprinted so far').closest('dl')!);
    expect(figures.getByText('Imprinted so far').nextSibling).toHaveTextContent('48');
    expect(figures.getByText('Native resolution').nextSibling).toHaveTextContent('3456 × 2234');
    expect(figures.getByText('License').nextSibling).toHaveTextContent('CC0 1.0');
    // Wavelength bins, physics steps and candidate orbits are in the stage copy already.
    expect(figures.queryByText(/Wavelength bins/)).not.toBeInTheDocument();
  });

  it('shows an unknown count, never zero, when the collection cannot be read', () => {
    mockShowcase.mockReturnValue({ tokens: [], status: 'failed' });
    render(<TheArt art={art} unavailableLabel={UNAVAILABLE} />);
    const value = screen.getByText('Imprinted so far').nextSibling as HTMLElement;
    expect(value).toHaveTextContent('—');
    expect(value).toHaveTextContent('common.status.unavailable');
    expect(value).not.toHaveTextContent('0');
  });

  it('keeps the still under reduced motion and plays the animation only on request', () => {
    installMatchMedia({ reducedMotion: true, wide: true });
    const { container } = render(<TheArt art={art} unavailableLabel={UNAVAILABLE} />);
    expect(container.querySelector('video')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.playAnimation' }));
    const video = container.querySelector('video')!;
    expect(video).toHaveAttribute(
      'src',
      expect.stringContaining(`0x${FEATURED_LANDING_ART[1].Seed}.mp4`),
    );
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'landing.artwork.pauseAnimation' }));
    expect(container.querySelector('video')).toBeNull();
  });

  it('starts the animation by itself only on wide screens with motion allowed', () => {
    installMatchMedia({ reducedMotion: false, wide: true });
    const { container, unmount } = render(<TheArt art={art} unavailableLabel={UNAVAILABLE} />);
    expect(container.querySelector('video')).not.toBeNull();
    // It is not on screen in jsdom, so it waits rather than plays.
    expect(play).not.toHaveBeenCalled();
    unmount();

    installMatchMedia({ reducedMotion: false, wide: false });
    const phone = render(<TheArt art={art} unavailableLabel={UNAVAILABLE} />);
    expect(phone.container.querySelector('video')).toBeNull();
  });

  it('falls back to the still when the animation cannot load', () => {
    installMatchMedia({ reducedMotion: false, wide: true });
    const { container } = render(<TheArt art={art} unavailableLabel={UNAVAILABLE} />);
    fireEvent.error(container.querySelector('video')!);
    expect(container.querySelector('video')).toBeNull();
    expect(screen.queryByRole('button', { name: /animation/ })).not.toBeInTheDocument();
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
  });

  it('has an id="art" anchor and names the section by its heading', () => {
    const { container } = render(<TheArt art={art} unavailableLabel={UNAVAILABLE} />);
    const section = container.querySelector('#art')!;
    expect(section).toHaveAttribute('aria-labelledby', 'landing-art-heading');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(art.heading);
  });
});
