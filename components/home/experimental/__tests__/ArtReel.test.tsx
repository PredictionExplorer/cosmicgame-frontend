import { act, fireEvent, render, screen } from '@/test-utils';

import { ArtReel, REEL_FADE_MS, REEL_START_TIMEOUT_MS, getReelClipUrl } from '../ArtReel';

const TOKEN = { id: 7, seed: '0xfeed' };

/** An observer that reports the reel on screen, as a visible plate is. */
class InViewObserver {
  private readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

let playSpy: jest.SpyInstance;
let pauseSpy: jest.SpyInstance;
const originalObserver = global.IntersectionObserver;

beforeEach(() => {
  jest.useFakeTimers();
  global.IntersectionObserver = InViewObserver as unknown as typeof IntersectionObserver;
  playSpy = jest
    .spyOn(window.HTMLMediaElement.prototype, 'play')
    .mockImplementation(() => Promise.resolve());
  pauseSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => {
  global.IntersectionObserver = originalObserver;
  playSpy.mockRestore();
  pauseSpy.mockRestore();
  jest.useRealTimers();
});

function renderReel(props: Partial<Parameters<typeof ArtReel>[0]> = {}) {
  const handlers = { onPlaying: jest.fn(), onEnded: jest.fn(), onError: jest.fn() };
  const view = render(<ArtReel token={TOKEN} {...handlers} {...props} />);
  return { ...view, ...handlers, clip: screen.getByTestId('deck-art-reel-clip') };
}

describe('ArtReel', () => {
  it('loads the token’s own clip and starts it at once, from its first frame', () => {
    const { clip } = renderReel();

    expect(clip).toHaveAttribute('src', getReelClipUrl('0xfeed'));
    expect(clip).toHaveAttribute('preload', 'auto');
    expect(clip).not.toHaveAttribute('loop');
    expect(playSpy).toHaveBeenCalled();
    // Invisible until it moves: the still beneath shows while it loads.
    expect(clip).toHaveClass('opacity-0');
  });

  it('fades in once playing and fades out before handing back at its end', () => {
    const { clip, onPlaying, onEnded } = renderReel();

    act(() => {
      fireEvent.playing(clip);
    });
    expect(onPlaying).toHaveBeenCalledTimes(1);
    expect(clip).toHaveClass('opacity-100');

    act(() => {
      fireEvent.ended(clip);
    });
    expect(clip).toHaveClass('opacity-0');
    expect(onEnded).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(REEL_FADE_MS);
    });
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it('gives up on a clip that never starts, so the viewer is told', () => {
    const { onError } = renderReel();

    act(() => {
      jest.advanceTimersByTime(REEL_START_TIMEOUT_MS);
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('does not give up on a clip that started', () => {
    const { clip, onError } = renderReel();

    act(() => {
      fireEvent.playing(clip);
      jest.advanceTimersByTime(REEL_START_TIMEOUT_MS * 2);
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it('reports a refused play() and a clip that errors', async () => {
    playSpy.mockImplementation(() => Promise.reject(new Error('NotAllowedError')));
    const refused = renderReel();
    await act(async () => {
      await Promise.resolve();
    });
    expect(refused.onError).toHaveBeenCalled();
    refused.unmount();

    playSpy.mockImplementation(() => Promise.resolve());
    const broken = renderReel();
    act(() => {
      fireEvent.error(broken.clip);
    });
    expect(broken.onError).toHaveBeenCalledTimes(1);
  });

  it('holds its frame while paused and resumes when played', () => {
    const { rerender, onEnded, onError, onPlaying } = renderReel();
    pauseSpy.mockClear();
    playSpy.mockClear();

    rerender(<ArtReel token={TOKEN} paused {...{ onEnded, onError, onPlaying }} />);
    expect(pauseSpy).toHaveBeenCalled();
    expect(playSpy).not.toHaveBeenCalled();

    rerender(<ArtReel token={TOKEN} paused={false} {...{ onEnded, onError, onPlaying }} />);
    expect(playSpy).toHaveBeenCalled();
  });
});
