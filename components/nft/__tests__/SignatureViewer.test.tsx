import type { InkFilms } from '@/lib/nftMetadata/ink';

import { render, screen, fireEvent, checkA11y, within, act, waitFor } from '@/test-utils';

import { SignatureViewer } from '../SignatureViewer';
import { signatureMedia } from '../signatureArt';

let mockReducedMotion = false;
jest.mock('../../../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockReducedMotion,
}));

const mockUseInkFilms = jest.fn();
jest.mock('@/hooks/useInkFilms', () => ({
  useInkFilms: (...args: unknown[]) => mockUseInkFilms(...args),
}));

const media = signatureMedia('abc123')!;
const inkFilms: InkFilms = {
  films: (['short', 'medium', 'slow'] as const).map((variant, index) => ({
    variant,
    url: `https://media.example/${variant}.mp4`,
    durationSeconds: [30, 113, 283][index]!,
  })),
  poster: 'https://media.example/ink.webp',
  image: { url: 'https://media.example/ink-full.webp' },
};

// jsdom has no media pipeline: play() and pause() only flip `paused`; the
// tests fire the play and pause events a browser would.
const play = jest.fn(function (this: HTMLMediaElement) {
  Object.defineProperty(this, 'paused', { configurable: true, value: false });
  return Promise.resolve();
});
const pause = jest.fn(function (this: HTMLMediaElement) {
  Object.defineProperty(this, 'paused', { configurable: true, value: true });
});
const load = jest.fn();
const originalObserver = global.IntersectionObserver;
const observations = new Map<Element, IntersectionObserverCallback>();
function observation(target: Element, isIntersecting: boolean): IntersectionObserverEntry {
  const rect = target.getBoundingClientRect();
  return {
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: rect,
    intersectionRect: rect,
    rootBounds: rect,
    time: 0,
  };
}

beforeAll(() => {
  jest.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(load);
});

afterAll(() => {
  jest.restoreAllMocks();
  global.IntersectionObserver = originalObserver;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockReducedMotion = false;
  observations.clear();
  global.IntersectionObserver = jest
    .fn()
    .mockImplementation((callback: IntersectionObserverCallback) => ({
      observe: (element: Element) => {
        observations.set(element, callback);
        callback([observation(element, true)], {} as IntersectionObserver);
      },
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  mockUseInkFilms.mockReturnValue({ data: undefined });
});

function renderViewer(overrides: Partial<Parameters<typeof SignatureViewer>[0]> = {}) {
  return render(
    <SignatureViewer
      tokenId={25}
      media={media}
      alt="“Twisted Mind”, Cosmic Signature #000025"
      subject="Twisted Mind"
      tokenLabel="#000025"
      unavailableLabel="Artwork unavailable"
      sizes="100vw"
      {...overrides}
    />,
  );
}

/** A segment of the Still / In motion control: the shared SegmentedControl's radios. */
function modeButton(name: RegExp) {
  return within(screen.getByRole('radiogroup', { name: 'detail.viewer.modeLabel' })).getByRole(
    'radio',
    { name },
  );
}

describe('SignatureViewer', () => {
  it('shows the still by default, eagerly loaded, on its plate', () => {
    renderViewer();
    const art = screen.getByAltText('“Twisted Mind”, Cosmic Signature #000025');
    expect(art).toHaveAttribute('loading', 'eager');
    expect(modeButton(/detail.viewer.still/)).toBeChecked();
    expect(modeButton(/detail.viewer.motion/)).not.toBeChecked();
    expect(screen.queryByTestId('signature-motion')).not.toBeInTheDocument();
  });

  it('offers no animation beside a render that is still pending', () => {
    renderViewer({ media: null, renderPending: true, unavailableLabel: 'Rendering' });
    expect(screen.queryByRole('group', { name: 'detail.viewer.modeLabel' })).toBeNull();
    expect(screen.getByText('Rendering')).toBeInTheDocument();
  });

  it('plays the animation in the same plate when In motion is chosen, with a pause control', async () => {
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    const video = screen.getByTestId('signature-motion');
    expect(video).toHaveAttribute('src', media.video);
    expect(video).toHaveAttribute('poster', media.webImage);
    expect(video).toHaveAccessibleName('detail.viewer.motionLabel(subject=Twisted Mind)');
    await waitFor(() => expect(play).toHaveBeenCalled());
    fireEvent.play(video);
    const toggle = screen.getByRole('button', { name: 'detail.viewer.pause' });
    fireEvent.click(toggle);
    expect(pause).toHaveBeenCalled();
    fireEvent.pause(video);
    expect(screen.getByRole('button', { name: 'detail.viewer.play' })).toBeInTheDocument();
  });

  it('waits for Play under reduced motion', () => {
    mockReducedMotion = true;
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    expect(screen.getByTestId('signature-motion')).toBeInTheDocument();
    expect(play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'detail.viewer.play' }));
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('releases the original animation when changing editions and returns to a still', async () => {
    mockUseInkFilms.mockReturnValue({ data: inkFilms });
    renderViewer({ seed: 'abc123' });
    fireEvent.click(modeButton(/detail.viewer.motion/));
    const primary = screen.getByTestId('signature-motion') as HTMLVideoElement;
    await waitFor(() => expect(play).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('radio', { name: 'detail.ink.trigger' }));
    expect(primary).not.toBeInTheDocument();
    expect(primary).not.toHaveAttribute('src');
    expect(primary.paused).toBe(true);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByTestId('ink-film-video')).toHaveAttribute('src', inkFilms.films[1]!.url);
    fireEvent.click(screen.getByRole('radio', { name: 'detail.viewer.original' }));
    expect(screen.queryByTestId('ink-film-video')).toBeNull();
    expect(screen.getByAltText('“Twisted Mind”, Cosmic Signature #000025')).toBeInTheDocument();
    expect(modeButton(/detail.viewer.still/)).toBeChecked();
  });

  it('pauses while the tab is hidden and resumes when it returns', async () => {
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
    const visibility = jest.spyOn(document, 'visibilityState', 'get');
    visibility.mockReturnValue('hidden');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(pause).toHaveBeenCalledTimes(1);
    visibility.mockReturnValue('visible');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(play).toHaveBeenCalledTimes(2);
    visibility.mockRestore();
  });

  it('falls back to the still and says so when the animation cannot load', () => {
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    fireEvent.error(screen.getByTestId('signature-motion'));
    expect(screen.queryByTestId('signature-motion')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('detail.viewer.motionError');
    expect(modeButton(/detail.viewer.motion/)).toBeDisabled();
  });

  it('opens the full-screen viewer only from its explicit control', () => {
    renderViewer();
    fireEvent.click(screen.getByRole('button', { name: /detail.viewer.fullscreen/ }));
    expect(screen.getByRole('dialog', { name: 'Twisted Mind' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'common.actions.close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByAltText('“Twisted Mind”, Cosmic Signature #000025'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('uses the browser’s own full screen for the animation', () => {
    const requestFullscreen = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLVideoElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    fireEvent.click(screen.getByRole('button', { name: /detail.viewer.fullscreen/ }));
    expect(requestFullscreen).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the browser’s controls while the animation fills the screen, and only then', () => {
    let current: Element | null = null;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => current,
    });
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    const video = screen.getByTestId('signature-motion') as HTMLVideoElement;
    expect(video.controls).toBe(false);

    current = video;
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(video.controls).toBe(true);
    // The native controls own the click: the page does not toggle it a second time.
    const plays = play.mock.calls.length;
    const pauses = pause.mock.calls.length;
    fireEvent.click(video);
    expect(play).toHaveBeenCalledTimes(plays);
    expect(pause).toHaveBeenCalledTimes(pauses);

    current = null;
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(video.controls).toBe(false);
    Reflect.deleteProperty(document, 'fullscreenElement');
  });

  it('draws the pending plate with the token number when there is no seed yet', () => {
    renderViewer({ media: null });
    const plate = screen.getByRole('img', { name: '“Twisted Mind”, Cosmic Signature #000025' });
    expect(plate).toHaveTextContent('Artwork unavailable');
    expect(plate).toHaveTextContent('#000025');
    expect(
      screen.queryByRole('group', { name: 'detail.viewer.modeLabel' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /detail.viewer.fullscreen/ }),
    ).not.toBeInTheDocument();
  });

  it('rejects initial and delayed playback while the browser tab is hidden', () => {
    const visibility = jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    try {
      renderViewer();
      fireEvent.click(modeButton(/detail.viewer.motion/));
      const video = screen.getByTestId('signature-motion');
      expect(play).not.toHaveBeenCalled();
      fireEvent.play(video);
      expect(pause.mock.contexts).toContain(video);
      expect(screen.getByRole('button', { name: 'detail.viewer.play' })).toBeInTheDocument();
    } finally {
      visibility.mockRestore();
    }
  });

  it('never resumes an offscreen animation just because the browser tab becomes visible', async () => {
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
    const stage = screen.getByTestId('artwork-stage');
    act(() => observations.get(stage)!([observation(stage, false)], {} as IntersectionObserver));
    const visibility = jest.spyOn(document, 'visibilityState', 'get');
    try {
      visibility.mockReturnValue('hidden');
      act(() => document.dispatchEvent(new Event('visibilitychange')));
      visibility.mockReturnValue('visible');
      act(() => document.dispatchEvent(new Event('visibilitychange')));
      expect(play).toHaveBeenCalledTimes(1);
      act(() => observations.get(stage)!([observation(stage, true)], {} as IntersectionObserver));
      expect(play).toHaveBeenCalledTimes(2);
    } finally {
      visibility.mockRestore();
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = renderViewer();
    await checkA11y(container);
  });
});
