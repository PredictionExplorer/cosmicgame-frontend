import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { DeckArtCard, HERO_ART_ZOOM } from '../DeckArtCard';
import { REEL_FADE_MS, REEL_START_TIMEOUT_MS } from '../ArtReel';

const mockUseMediaQuery = jest.fn<boolean, [string]>();
const mockUsePrefersReducedMotion = jest.fn<boolean, []>();

jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) => mockUseMediaQuery(query),
}));
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockUsePrefersReducedMotion(),
}));
jest.mock('@/components/nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt = 'NFT' }: { src: string; alt?: string }) => (
    <img data-testid="nft-image" src={src} alt={alt} />
  ),
}));

// The global jsdom IntersectionObserver stub reports "not intersecting",
// which would keep the reel paused; the hero is in view for these tests.
class InViewIntersectionObserver {
  private readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element): void {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

const CURRENT = { seed: '0xaaa111', id: 7 };
const NEXT = { seed: '0xbbb222', id: 8 };

describe('DeckArtCard hero generation reel', () => {
  let playSpy: jest.SpyInstance;
  let pauseSpy: jest.SpyInstance;

  const originalIntersectionObserver = global.IntersectionObserver;
  beforeAll(() => {
    global.IntersectionObserver =
      InViewIntersectionObserver as unknown as typeof IntersectionObserver;
  });
  afterAll(() => {
    global.IntersectionObserver = originalIntersectionObserver;
  });

  beforeEach(() => {
    // jsdom has no media pipeline: play() would log a "not implemented"
    // error (which the test setup turns into a failure).
    playSpy = jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve());
    pauseSpy = jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    mockUseMediaQuery.mockReturnValue(true);
    mockUsePrefersReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function renderHero(overrides: Partial<React.ComponentProps<typeof DeckArtCard>> = {}) {
    const onReelEnded = jest.fn();
    const onReelActiveChange = jest.fn();
    const utils = render(
      <DeckArtCard
        bannerToken={CURRENT}
        nextBannerToken={NEXT}
        variant="hero"
        onReelEnded={onReelEnded}
        onReelActiveChange={onReelActiveChange}
        {...overrides}
      />,
    );
    return { ...utils, onReelEnded, onReelActiveChange };
  }

  it('plays the current clip, pre-loads the next one, and zooms the band', () => {
    const { onReelActiveChange } = renderHero();

    const current = screen.getByTestId('deck-art-reel-current') as HTMLVideoElement;
    expect(current).toHaveAttribute('src', expect.stringContaining('cosmicsignature/0xaaa111.mp4'));
    expect(current).toHaveAttribute(
      'poster',
      expect.stringContaining('cosmicsignature/0xaaa111/thumb_card.webp'),
    );
    expect(current).toHaveAttribute('autoplay');
    expect(current).toHaveAttribute('playsinline');
    expect(current.muted).toBe(true);
    expect(current).toHaveClass('opacity-100');
    expect(playSpy).toHaveBeenCalled();

    const next = screen.getByTestId('deck-art-reel-next') as HTMLVideoElement;
    expect(next).toHaveAttribute('src', expect.stringContaining('cosmicsignature/0xbbb222.mp4'));
    expect(next).toHaveAttribute('preload', 'auto');
    expect(next).not.toHaveAttribute('autoplay');
    expect(next).toHaveClass('opacity-0');

    expect(screen.getByTestId('deck-art-zoom')).toHaveStyle({
      transform: `scale(${HERO_ART_ZOOM})`,
    });
    expect(onReelActiveChange).toHaveBeenLastCalledWith(true);
    // The linked still is replaced by the reel; the detail link stays.
    expect(screen.getByTestId('deck-art-link')).toHaveAttribute('href', '/detail/7');
    expect(screen.queryByTestId('nft-image')).not.toBeInTheDocument();
  });

  it('fades out when the clip ends, then reports the end so the parent advances', () => {
    jest.useFakeTimers();
    const { onReelEnded, rerender } = renderHero();
    const current = screen.getByTestId('deck-art-reel-current');

    fireEvent.ended(current);
    expect(current).toHaveClass('opacity-0');
    expect(onReelEnded).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(REEL_FADE_MS);
    });
    expect(onReelEnded).toHaveBeenCalledTimes(1);

    // Parent advances: the pre-loaded element becomes the visible clip
    // (same node — no reload), and a new hidden sibling pre-loads the one after.
    const preloaded = screen.getByTestId('deck-art-reel-next');
    rerender(
      <DeckArtCard
        bannerToken={NEXT}
        nextBannerToken={{ seed: '0xccc333', id: 9 }}
        variant="hero"
        onReelEnded={onReelEnded}
        onReelActiveChange={jest.fn()}
      />,
    );
    const promoted = screen.getByTestId('deck-art-reel-current');
    expect(promoted).toBe(preloaded);
    expect(promoted).toHaveClass('opacity-100');
    expect(screen.getByTestId('deck-art-reel-next')).toHaveAttribute(
      'src',
      expect.stringContaining('0xccc333.mp4'),
    );
    expect(screen.getByTestId('deck-art-link')).toHaveAttribute('href', '/detail/8');
  });

  it('does not pre-load a duplicate when the next token is the current one', () => {
    renderHero({ nextBannerToken: CURRENT });
    expect(screen.getByTestId('deck-art-reel-current')).toBeInTheDocument();
    expect(screen.queryByTestId('deck-art-reel-next')).not.toBeInTheDocument();
  });

  it('pauses while the tab is hidden and resumes when it is visible again', () => {
    renderHero();
    playSpy.mockClear();

    jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    fireEvent(document, new Event('visibilitychange'));
    expect(pauseSpy).toHaveBeenCalled();

    jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    fireEvent(document, new Event('visibilitychange'));
    expect(playSpy).toHaveBeenCalled();
  });

  it('falls back to the still image when a clip fails, and hands rotation back', () => {
    const { onReelActiveChange } = renderHero();
    fireEvent.error(screen.getByTestId('deck-art-reel-current'));

    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(screen.getByTestId('nft-image')).toHaveAttribute(
      'src',
      expect.stringContaining('0xaaa111/thumb_card.webp'),
    );
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
  });

  it.each([
    ['reduced motion', () => mockUsePrefersReducedMotion.mockReturnValue(true)],
    ['small viewports', () => mockUseMediaQuery.mockReturnValue(false)],
  ])('shows the still image instead of the reel for %s', (_label, arrange) => {
    arrange();
    const { onReelActiveChange } = renderHero();

    const card = screen.getByTestId('deck-art-card');
    expect(within(card).queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(within(card).getByTestId('nft-image')).toHaveAttribute(
      'src',
      expect.stringContaining('0xaaa111/thumb_card.webp'),
    );
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('falls back when the pre-loaded next clip errored while hidden and is then promoted', () => {
    const onReelEnded = jest.fn();
    const onReelActiveChange = jest.fn();
    const { rerender } = render(
      <DeckArtCard
        bannerToken={CURRENT}
        nextBannerToken={NEXT}
        variant="hero"
        onReelEnded={onReelEnded}
        onReelActiveChange={onReelActiveChange}
      />,
    );
    // The hidden sibling 404s while the current clip plays.
    fireEvent.error(screen.getByTestId('deck-art-reel-next'));
    expect(screen.getByTestId('deck-art-reel')).toBeInTheDocument();
    expect(onReelActiveChange).toHaveBeenLastCalledWith(true);

    // Parent advances to it: the reel refuses the dead element and hands
    // rotation back (still image + timer), instead of freezing on a poster.
    rerender(
      <DeckArtCard
        bannerToken={NEXT}
        nextBannerToken={{ seed: '0xccc333', id: 9 }}
        variant="hero"
        onReelEnded={onReelEnded}
        onReelActiveChange={onReelActiveChange}
      />,
    );
    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(screen.getByTestId('nft-image')).toHaveAttribute(
      'src',
      expect.stringContaining('0xbbb222/thumb_card.webp'),
    );
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('falls back to the still when the browser refuses autoplay', async () => {
    playSpy.mockImplementation(() => Promise.reject(new Error('NotAllowedError')));
    const { onReelActiveChange } = renderHero();
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(screen.getByTestId('nft-image')).toBeInTheDocument();
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('falls back to the still when a clip never starts playing', () => {
    jest.useFakeTimers();
    const { onReelActiveChange } = renderHero();
    expect(screen.getByTestId('deck-art-reel')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(REEL_START_TIMEOUT_MS);
    });
    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('keeps the reel once the clip reports playing', () => {
    jest.useFakeTimers();
    renderHero();
    fireEvent.playing(screen.getByTestId('deck-art-reel-current'));
    act(() => {
      jest.advanceTimersByTime(REEL_START_TIMEOUT_MS * 2);
    });
    expect(screen.getByTestId('deck-art-reel')).toBeInTheDocument();
  });

  it('does not re-arm the start watchdog for a clip that is already playing', () => {
    // Regression: after a hand-off the pre-loaded clip starts instantly and
    // `playing` clears the watchdog; a later visibility/scroll sync must not
    // arm it again (no second `playing` will come), or the reel drops to the
    // still 10 s into a perfectly good clip.
    jest.useFakeTimers();
    const { onReelActiveChange } = renderHero();
    const current = screen.getByTestId('deck-art-reel-current') as HTMLVideoElement;
    fireEvent.playing(current);
    Object.defineProperty(current, 'paused', { configurable: true, get: () => false });
    fireEvent(document, new Event('visibilitychange'));
    act(() => {
      jest.advanceTimersByTime(REEL_START_TIMEOUT_MS * 2);
    });
    expect(screen.getByTestId('deck-art-reel')).toBeInTheDocument();
    expect(onReelActiveChange).toHaveBeenLastCalledWith(true);
  });

  it('replays the only clip instead of fading out when there is no next token', () => {
    jest.useFakeTimers();
    const { onReelEnded } = renderHero({ nextBannerToken: null });
    const current = screen.getByTestId('deck-art-reel-current') as HTMLVideoElement;
    playSpy.mockClear();
    fireEvent.ended(current);
    expect(current).toHaveClass('opacity-100');
    expect(current.currentTime).toBe(0);
    expect(playSpy).toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(REEL_FADE_MS * 2);
    });
    expect(onReelEnded).not.toHaveBeenCalled();
  });

  it('drops a pending hand-off if the token changes during the fade', () => {
    jest.useFakeTimers();
    const { onReelEnded, rerender } = renderHero();
    fireEvent.ended(screen.getByTestId('deck-art-reel-current'));
    // The parent swaps tokens on its own before the fade timer fires.
    rerender(
      <DeckArtCard
        bannerToken={NEXT}
        nextBannerToken={{ seed: '0xccc333', id: 9 }}
        variant="hero"
        onReelEnded={onReelEnded}
        onReelActiveChange={jest.fn()}
      />,
    );
    act(() => {
      jest.advanceTimersByTime(REEL_FADE_MS * 2);
    });
    expect(onReelEnded).not.toHaveBeenCalled();
    expect(screen.getByTestId('deck-art-reel-current')).toHaveClass('opacity-100');
  });

  it('never runs the reel in the compact card variant', () => {
    render(<DeckArtCard bannerToken={CURRENT} variant="card" onReelEnded={jest.fn()} />);
    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(screen.getByTestId('nft-image')).toBeInTheDocument();
    expect(screen.queryByTestId('deck-art-zoom')).not.toBeInTheDocument();
  });
});
