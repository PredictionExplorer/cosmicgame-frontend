import { createRef } from 'react';

import type { InkFilm } from '@/lib/nftMetadata/ink';
import { mediaFailoverUrl } from '@/utils/urls';

import { act, fireEvent, render, screen } from '@/test-utils';

import { InkFilmVideo } from '../InkFilmVideo';

jest.mock('@/utils/urls', () => ({
  ...jest.requireActual('@/utils/urls'),
  mediaFailoverUrl: jest.fn(() => null),
}));

let mockReducedMotion = false;
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockReducedMotion,
}));

const film: InkFilm = {
  variant: 'medium',
  url: 'https://media.example/medium.mp4',
  durationSeconds: 113,
};
const poster = 'https://media.example/ink.webp';
const originalObserver = globalThis.IntersectionObserver;
const observers: {
  notify: (visible: boolean) => void;
  observe: jest.Mock;
  disconnect: jest.Mock;
}[] = [];

beforeAll(() => {
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
  globalThis.IntersectionObserver = originalObserver;
});

beforeEach(() => {
  jest.clearAllMocks();
  observers.length = 0;
  mockReducedMotion = false;
  delete document.documentElement.dataset.motion;
  jest.mocked(mediaFailoverUrl).mockReturnValue(null);
  globalThis.IntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
    const observer = {
      notify: (visible: boolean) =>
        callback(
          [{ isIntersecting: visible } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        ),
      observe: jest.fn(),
      disconnect: jest.fn(),
    };
    observers.push(observer);
    return observer;
  }) as unknown as typeof IntersectionObserver;
});

function renderFilm(overrides: Partial<Parameters<typeof InkFilmVideo>[0]> = {}) {
  return render(<InkFilmVideo film={film} poster={poster} subject="Study" {...overrides} />);
}

describe('InkFilmVideo', () => {
  it('provides native playback controls and an uncropped film within its parent stage', () => {
    renderFilm();
    const video = screen.getByTestId('ink-film-video') as HTMLVideoElement;
    expect(video).toHaveAttribute('src', film.url);
    expect(video).toHaveAttribute('poster', poster);
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('autoplay');
    expect(video).not.toHaveAttribute('loop');
    expect(video.muted).toBe(true);
    expect(video).toHaveAccessibleName('detail.ink.videoLabel(subject=Study)');
    expect(video).toHaveClass('h-full', 'w-full', 'object-contain');
  });

  it.each(['system', 'site'])('waits for native Play with %s reduced motion', (setting) => {
    if (setting === 'system') mockReducedMotion = true;
    else document.documentElement.dataset.motion = 'reduced';
    renderFilm();
    expect(screen.getByTestId('ink-film-video')).not.toHaveAttribute('autoplay');
    expect(screen.getByTestId('ink-film-video')).toHaveAttribute('preload', 'none');
  });

  it('retains playback across a manifest refresh from another mirror', () => {
    const { rerender } = renderFilm();
    const video = screen.getByTestId('ink-film-video') as HTMLVideoElement;
    video.currentTime = 42;
    rerender(
      <InkFilmVideo
        film={{ ...film, url: 'https://backup.example/medium.mp4' }}
        poster={poster}
        subject="Study"
      />,
    );
    expect(screen.getByTestId('ink-film-video')).toBe(video);
    expect(video).toHaveAttribute('src', film.url);
    expect(video.currentTime).toBe(42);
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
  });

  it('releases sources and observers in StrictMode without breaking the forwarded ref', () => {
    const videoRef = createRef<HTMLVideoElement>();
    const { unmount } = render(
      <InkFilmVideo film={film} poster={poster} subject="Study" videoRef={videoRef} />,
      { reactStrictMode: true },
    );
    const video = screen.getByTestId('ink-film-video');
    expect(video).toHaveAttribute('src', film.url);
    expect(videoRef.current).toBe(video);
    expect(observers[0]!.disconnect).toHaveBeenCalledTimes(1);
    unmount();
    expect(video).not.toHaveAttribute('src');
    expect(videoRef.current).toBeNull();
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalled();
    expect(observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
    jest.mocked(HTMLMediaElement.prototype.pause).mockClear();
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    fireEvent.play(video);
    expect(HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
  });

  it('clears the old forwarded ref when the parent replaces it', () => {
    const first = createRef<HTMLVideoElement>();
    const next = createRef<HTMLVideoElement>();
    const { rerender, unmount } = renderFilm({ videoRef: first });
    rerender(<InkFilmVideo film={film} poster={poster} subject="Study" videoRef={next} />);
    expect(first.current).toBeNull();
    expect(next.current).toBe(screen.getByTestId('ink-film-video'));
    expect(next.current).toHaveAttribute('src', film.url);
    unmount();
    expect(next.current).toBeNull();
  });

  it('tries one mirror, releases each failed source, and retries the original film', () => {
    jest.mocked(mediaFailoverUrl).mockReturnValue('https://backup.example/medium.mp4');
    const videoRef = createRef<HTMLVideoElement>();
    renderFilm({ videoRef });
    const initial = screen.getByTestId('ink-film-video');
    fireEvent.error(initial);
    const mirror = screen.getByTestId('ink-film-video');
    expect(initial).not.toHaveAttribute('src');
    expect(mirror).toHaveAttribute('src', 'https://backup.example/medium.mp4');
    expect(videoRef.current).toBe(mirror);
    fireEvent.error(mirror);
    expect(mirror).not.toHaveAttribute('src');
    expect(videoRef.current).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('detail.ink.loadError');
    expect(mediaFailoverUrl).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'detail.ink.retry' }));
    expect(screen.getByTestId('ink-film-video')).toHaveAttribute('src', film.url);
    expect(videoRef.current).toBe(screen.getByTestId('ink-film-video'));
  });

  it('reports readiness, mirror recovery, final failure, and retry to the parent controls', () => {
    jest.mocked(mediaFailoverUrl).mockReturnValue('https://backup.example/medium.mp4');
    const onStatusChange = jest.fn();
    renderFilm({ onStatusChange });
    expect(onStatusChange).toHaveBeenLastCalledWith('loading');
    fireEvent.loadedData(screen.getByTestId('ink-film-video'));
    expect(onStatusChange).toHaveBeenLastCalledWith('loaded');
    fireEvent.error(screen.getByTestId('ink-film-video'));
    expect(onStatusChange).toHaveBeenLastCalledWith('loading');
    fireEvent.loadedData(screen.getByTestId('ink-film-video'));
    expect(onStatusChange).toHaveBeenLastCalledWith('loaded');
    fireEvent.error(screen.getByTestId('ink-film-video'));
    expect(onStatusChange).toHaveBeenLastCalledWith('unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'detail.ink.retry' }));
    expect(onStatusChange).toHaveBeenLastCalledWith('loading');
  });

  it('pauses offscreen and guards delayed autoplay without automatically resuming', () => {
    renderFilm();
    const video = screen.getByTestId('ink-film-video');
    const observer = observers[0]!;
    expect(observer.observe).toHaveBeenCalledWith(video);
    act(() => observer.notify(false));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    fireEvent.play(video);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(2);
    act(() => observer.notify(true));
    fireEvent.play(video);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(2);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it('pauses while hidden even if an intersection callback reports visible', () => {
    const visibility = jest.spyOn(document, 'visibilityState', 'get');
    try {
      renderFilm();
      const video = screen.getByTestId('ink-film-video');
      visibility.mockReturnValue('hidden');
      act(() => document.dispatchEvent(new Event('visibilitychange')));
      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
      act(() => observers[0]!.notify(true));
      fireEvent.play(video);
      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(3);
      visibility.mockReturnValue('visible');
      act(() => document.dispatchEvent(new Event('visibilitychange')));
      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    } finally {
      visibility.mockRestore();
    }
  });

  it('still pauses hidden playback when IntersectionObserver is unavailable', () => {
    globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
    const visibility = jest.spyOn(document, 'visibilityState', 'get');
    try {
      visibility.mockReturnValue('hidden');
      renderFilm();
      expect(screen.getByTestId('ink-film-video')).toHaveAttribute('controls');
      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    } finally {
      visibility.mockRestore();
    }
  });
});
