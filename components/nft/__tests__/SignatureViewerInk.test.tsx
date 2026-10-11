import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';

import { useInkFilms } from '@/hooks/useInkFilms';
import { mediaFailoverUrl } from '@/utils/urls';
import type { InkFilms, InkFilmVariant } from '@/lib/nftMetadata/ink';

import { render, screen, fireEvent, checkA11y, within, act, waitFor } from '@/test-utils';

import type { InkView } from '../inkLinks';
import { SignatureViewer } from '../SignatureViewer';
import { signatureMedia } from '../signatureArt';

jest.mock('@/hooks/useInkFilms', () => ({ useInkFilms: jest.fn() }));
let mockLinkedView: InkView | null = null;
const mockLinkActions = { open: jest.fn(), select: jest.fn(), close: jest.fn() };
jest.mock('@/components/nft/useInkViewLink', () => ({
  useInkViewLink: () => ({ view: mockLinkedView, ...mockLinkActions }),
}));
jest.mock('@/utils/urls', () => ({
  ...jest.requireActual('@/utils/urls'),
  mediaFailoverUrl: jest.fn(() => null),
}));
let mockReducedMotion = false;
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockReducedMotion,
}));

const allFilms: InkFilms = {
  films: (['short', 'medium', 'slow'] as const).map((variant, i) => ({
    variant,
    url: `https://media.example/${variant}.mp4`,
    durationSeconds: [30, 113, 283][i]!,
  })),
  poster: 'https://media.example/ink.webp',
};
const inkImage = {
  url: 'https://media.example/full.webp',
  sourceUrl: 'https://media.example/source.png',
};

function available(variants: InkFilmVariant[] = ['short', 'medium', 'slow']) {
  jest.mocked(useInkFilms).mockReturnValue({
    data: { ...allFilms, films: allFilms.films.filter((film) => variants.includes(film.variant)) },
  } as ReturnType<typeof useInkFilms>);
}

const viewerProps = {
  tokenId: 48,
  seed: 'abc',
  media: signatureMedia('abc')!,
  alt: 'Original study',
  subject: 'Study',
  tokenLabel: '#000048',
  unavailableLabel: 'Artwork unavailable',
  sizes: '100vw',
};

function openFilm() {
  fireEvent.click(screen.getByRole('radio', { name: 'detail.ink.trigger' }));
  return screen.getByTestId('ink-film-video') as HTMLVideoElement;
}

beforeAll(() => {
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
});

afterAll(() => jest.restoreAllMocks());

beforeEach(() => {
  jest.clearAllMocks();
  mockReducedMotion = false;
  mockLinkedView = null;
  delete document.documentElement.dataset.motion;
  jest.mocked(mediaFailoverUrl).mockReturnValue(null);
  available();
});

describe('SignatureViewer ink editions', () => {
  it('keeps ink media unmounted until selected, with the original visible', () => {
    const { container } = render(<SignatureViewer {...viewerProps} />);
    expect(screen.getByRole('radio', { name: 'detail.viewer.original' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'detail.ink.trigger' })).not.toBeChecked();
    expect(screen.getByRole('img', { name: 'Original study' })).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector(`[src="${allFilms.poster}"]`)).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each([undefined, null, { films: [], poster: undefined }])(
    'quietly omits an unavailable study (%s)',
    (data) => {
      jest.mocked(useInkFilms).mockReturnValue({ data } as ReturnType<typeof useInkFilms>);
      render(<SignatureViewer {...viewerProps} />);
      expect(screen.queryByRole('radio', { name: 'detail.ink.trigger' })).toBeNull();
      expect(screen.getByRole('img', { name: 'Original study' })).toBeInTheDocument();
      expect(document.querySelector('video')).toBeNull();
    },
  );

  it('opens the medium film and offers only the published lengths', () => {
    available(['medium', 'slow']);
    render(<SignatureViewer {...viewerProps} />);
    const video = openFilm();
    expect(video).toHaveAttribute('src', allFilms.films[1]!.url);
    expect(video).toHaveAttribute('poster', allFilms.poster);
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('autoplay');
    expect(video).not.toHaveAttribute('loop');
    expect(video.muted).toBe(true);
    expect(video).toHaveAccessibleName('detail.ink.videoLabel(subject=Study)');
    expect(screen.queryByRole('radio', { name: 'detail.ink.seconds(seconds=30)' })).toBeNull();
    expect(screen.getByRole('radio', { name: 'detail.ink.minutes(minutes=2)' })).toBeChecked();
    expect(
      within(screen.getByRole('radiogroup', { name: 'detail.ink.mediaLabel' })).getAllByRole(
        'radio',
      ),
    ).toHaveLength(2);
    expect(screen.queryByRole('img', { name: 'Original study' })).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(within(screen.getByTestId('signature-viewer')).getByTestId('ink-film-video')).toBe(
      video,
    );
  });

  it.each([
    { variants: ['short', 'slow'] as InkFilmVariant[], expected: 'short' },
    { variants: ['slow'] as InkFilmVariant[], expected: 'slow' },
  ])('falls back to $expected when medium is unavailable', ({ variants, expected }) => {
    available(variants);
    render(<SignatureViewer {...viewerProps} />);
    expect(openFilm()).toHaveAttribute('src', `https://media.example/${expected}.mp4`);
    if (variants.length === 1)
      expect(screen.queryByRole('radiogroup', { name: 'detail.ink.mediaLabel' })).toBeNull();
  });

  it('replaces rather than preloads films when the duration changes', () => {
    render(<SignatureViewer {...viewerProps} />);
    const stage = screen.getByTestId('artwork-stage');
    const initial = openFilm();
    fireEvent.click(screen.getByRole('radio', { name: 'detail.ink.minutes(minutes=5)' }));
    expect(initial).not.toBeInTheDocument();
    expect(initial).not.toHaveAttribute('src');
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalled();
    expect(document.querySelectorAll('video')).toHaveLength(1);
    expect(screen.getByTestId('artwork-stage')).toBe(stage);
    expect(stage.querySelectorAll('img, video')).toHaveLength(1);
    expect(screen.getByTestId('ink-film-video')).toHaveAttribute('src', allFilms.films[2]!.url);
  });

  it('releases the film when Original is selected and defaults to medium on returning to ink', async () => {
    const user = userEvent.setup();
    render(<SignatureViewer {...viewerProps} />);
    await user.click(screen.getByRole('radio', { name: 'detail.ink.trigger' }));
    await user.click(screen.getByRole('radio', { name: 'detail.ink.minutes(minutes=5)' }));
    const film = screen.getByTestId('ink-film-video');
    const original = screen.getByRole('radio', { name: 'detail.viewer.original' });
    await user.click(original);
    expect(film).not.toBeInTheDocument();
    expect(film).not.toHaveAttribute('src');
    expect(document.querySelector('video')).toBeNull();
    expect(screen.getByRole('img', { name: 'Original study' })).toBeInTheDocument();
    expect(original).toBeChecked();
    expect(original).toHaveFocus();
    expect(openFilm()).toHaveAttribute('src', allFilms.films[1]!.url);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each(['system', 'site'])('respects the %s reduced-motion setting', (setting) => {
    if (setting === 'system') mockReducedMotion = true;
    else document.documentElement.dataset.motion = 'reduced';
    render(<SignatureViewer {...viewerProps} />);
    const video = openFilm();
    expect(video).not.toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video).toHaveAttribute('controls');
  });

  it('never carries an open film to another artwork', () => {
    const { rerender } = render(<SignatureViewer {...viewerProps} />);
    openFilm();
    rerender(<SignatureViewer {...viewerProps} seed="def" subject="Another study" />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.querySelector('video')).toBeNull();
    expect(useInkFilms).toHaveBeenLastCalledWith('def');
  });

  it('keeps the selected video source through StrictMode ref replay', () => {
    render(
      <StrictMode>
        <SignatureViewer {...viewerProps} />
      </StrictMode>,
    );
    expect(openFilm()).toHaveAttribute('src', allFilms.films[1]!.url);
  });

  it('does not restart playback when a manifest refresh answers from a different mirror', () => {
    const { rerender } = render(<SignatureViewer {...viewerProps} />);
    const video = openFilm();
    video.currentTime = 42;
    jest.mocked(useInkFilms).mockReturnValue({
      data: {
        ...allFilms,
        films: allFilms.films.map((film) => ({
          ...film,
          url: film.url.replace('media.example', 'backup.example'),
        })),
      },
    } as ReturnType<typeof useInkFilms>);
    rerender(<SignatureViewer {...viewerProps} />);
    expect(screen.getByTestId('ink-film-video')).toBe(video);
    expect(video).toHaveAttribute('src', allFilms.films[1]!.url);
    expect(video.currentTime).toBe(42);
  });

  it('offers an image without requesting it before selection, and releases the previous film', () => {
    jest
      .mocked(useInkFilms)
      .mockReturnValue({ data: { ...allFilms, image: inkImage } } as ReturnType<
        typeof useInkFilms
      >);
    render(<SignatureViewer {...viewerProps} />);
    expect(screen.queryByRole('img', { name: 'detail.ink.imageLabel(subject=Study)' })).toBeNull();
    const original = screen.getByRole('img', { name: 'Original study' });
    const video = openFilm();
    expect(original).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: 'detail.ink.image' }));
    expect(video).not.toHaveAttribute('src');
    expect(video).not.toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'detail.ink.imageLabel(subject=Study)' }),
    ).toHaveAttribute('src', inkImage.url);
    expect(screen.getByTestId('ink-image-view')).toHaveAttribute('aria-busy', 'true');
  });

  it('supports an image-only study and retries failed image sources', () => {
    const data: InkFilms = { films: [], image: inkImage, poster: undefined };
    jest.mocked(useInkFilms).mockReturnValue({ data } as ReturnType<typeof useInkFilms>);
    render(<SignatureViewer {...viewerProps} />);
    fireEvent.click(screen.getByRole('radio', { name: 'detail.ink.trigger' }));
    expect(screen.queryByRole('radiogroup', { name: 'detail.ink.mediaLabel' })).toBeNull();
    expect(document.querySelector('video')).toBeNull();
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', inkImage.sourceUrl);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('status')).toHaveTextContent('detail.ink.imageError');
    fireEvent.click(screen.getByRole('button', { name: 'detail.ink.retry' }));
    expect(screen.getByRole('img')).toHaveAttribute('src', inkImage.url);
  });

  it('opens an ink image overlay only through Full screen and returns to the same inline view', async () => {
    const user = userEvent.setup();
    const data: InkFilms = { films: [], image: inkImage, poster: undefined };
    jest.mocked(useInkFilms).mockReturnValue({
      data,
    } as ReturnType<typeof useInkFilms>);
    render(<SignatureViewer {...viewerProps} />);
    await user.click(screen.getByRole('radio', { name: 'detail.ink.trigger' }));
    const stage = screen.getByTestId('artwork-stage');
    const image = screen.getByRole('img', { name: 'detail.ink.imageLabel(subject=Study)' });
    fireEvent.load(image);
    await user.click(image);
    expect(screen.queryByRole('dialog')).toBeNull();

    const fullscreen = screen.getByRole('button', { name: 'detail.viewer.fullscreen' });
    await user.click(fullscreen);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', inkImage.url);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByTestId('artwork-stage')).toBe(stage);
    expect(image).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'detail.ink.trigger' })).toBeChecked();
    expect(fullscreen).toHaveFocus();
  });

  it('opens native fullscreen for the selected film without replacing its source', () => {
    render(<SignatureViewer {...viewerProps} />);
    const video = openFilm();
    const requestFullscreen = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(video, 'requestFullscreen', { value: requestFullscreen });
    fireEvent.click(screen.getByRole('button', { name: 'detail.viewer.fullscreen' }));
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('ink-film-video')).toBe(video);
    expect(video).toHaveAttribute('src', allFilms.films[1]!.url);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each(['image', 'short', 'medium', 'slow'] as const)(
    'opens the exact linked %s view',
    (view) => {
      mockLinkedView = view;
      jest
        .mocked(useInkFilms)
        .mockReturnValue({ data: { ...allFilms, image: inkImage } } as ReturnType<
          typeof useInkFilms
        >);
      render(<SignatureViewer {...viewerProps} inkLinkable />);
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByRole('radio', { name: 'detail.ink.trigger' })).toBeChecked();
      expect(screen.queryByRole('img', { name: 'Original study' })).toBeNull();

      if (view === 'image') {
        expect(screen.getByRole('img')).toHaveAttribute('src', inkImage.url);
        expect(document.querySelector('video')).toBeNull();
      } else {
        expect(screen.getByTestId('ink-film-video')).toHaveAttribute(
          'src',
          `https://media.example/${view}.mp4`,
        );
      }
      fireEvent.click(screen.getByRole('radio', { name: 'detail.viewer.original' }));
      expect(mockLinkActions.close).toHaveBeenCalledTimes(1);
    },
  );

  it('waits for a linked view’s manifest without choosing a different film', () => {
    mockLinkedView = 'slow';
    jest
      .mocked(useInkFilms)
      .mockReturnValue({ data: undefined, isPending: true } as ReturnType<typeof useInkFilms>);
    const { rerender } = render(<SignatureViewer {...viewerProps} inkLinkable />);
    expect(screen.getByRole('status')).toHaveTextContent('detail.ink.loading');
    expect(document.querySelector('video')).toBeNull();
    available();
    rerender(<SignatureViewer {...viewerProps} inkLinkable />);
    expect(screen.getByTestId('ink-film-video')).toHaveAttribute('src', allFilms.films[2]!.url);
  });

  it('explains a missing linked film and makes even a sole alternative actionable', () => {
    mockLinkedView = 'medium';
    available(['short']);
    render(<SignatureViewer {...viewerProps} inkLinkable />);
    expect(screen.getByRole('status')).toHaveTextContent('detail.ink.unavailable');
    expect(document.querySelector('video')).toBeNull();
    const short = screen.getByRole('radio', { name: 'detail.ink.seconds(seconds=30)' });
    expect(short).not.toBeChecked();
    expect(screen.queryByRole('button', { name: 'detail.share.trigger' })).toBeNull();
    fireEvent.click(short);
    expect(mockLinkActions.select).toHaveBeenCalledWith('short');
  });

  it('offers retry for failed link discovery and a return to Original without ink assets', () => {
    mockLinkedView = 'image';
    const refetch = jest.fn();
    jest
      .mocked(useInkFilms)
      .mockReturnValue({ data: undefined, isError: true, refetch } as unknown as ReturnType<
        typeof useInkFilms
      >);
    render(<SignatureViewer {...viewerProps} inkLinkable />);
    expect(screen.getByRole('status')).toHaveTextContent('detail.ink.availabilityError');
    fireEvent.click(screen.getByRole('button', { name: 'detail.ink.retry' }));
    expect(refetch).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('radio', { name: 'detail.viewer.original' }));
    expect(mockLinkActions.close).toHaveBeenCalled();
    expect(document.querySelector('video')).toBeNull();
  });

  it('returns to the original in place when browser history clears a missing ink link', () => {
    mockLinkedView = 'image';
    jest.mocked(useInkFilms).mockReturnValue({ data: null } as ReturnType<typeof useInkFilms>);
    const { rerender } = render(<SignatureViewer {...viewerProps} inkLinkable />);
    expect(screen.getByRole('status')).toHaveTextContent('detail.ink.unavailable');
    const viewer = screen.getByTestId('signature-viewer');
    mockLinkedView = null;
    rerender(<SignatureViewer {...viewerProps} inkLinkable />);
    expect(screen.getByTestId('signature-viewer')).toBe(viewer);
    expect(screen.getByRole('img', { name: 'Original study' })).toBeInTheDocument();
    expect(screen.queryByTestId('ink-image-view')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('allows the edition to be selected by keyboard without moving focus into a dialog', async () => {
    const user = userEvent.setup();
    render(<SignatureViewer {...viewerProps} />);
    const ink = screen.getByRole('radio', { name: 'detail.ink.trigger' });
    ink.focus();
    await user.keyboard(' ');
    expect(ink).toBeChecked();
    expect(ink).toHaveFocus();
    expect(screen.getByTestId('ink-film-video')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('tries the same film on the other media server once, then offers retry', () => {
    jest.mocked(mediaFailoverUrl).mockReturnValue('https://backup.example/medium.mp4');
    render(<SignatureViewer {...viewerProps} />);
    fireEvent.error(openFilm());
    expect(screen.getByTestId('ink-film-video')).toHaveAttribute(
      'src',
      'https://backup.example/medium.mp4',
    );
    fireEvent.error(screen.getByTestId('ink-film-video'));
    expect(mediaFailoverUrl).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('detail.ink.loadError');
    expect(screen.getByRole('radio', { name: 'detail.ink.minutes(minutes=2)' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'detail.ink.retry' }));
    expect(screen.getByTestId('ink-film-video')).toHaveAttribute('src', allFilms.films[1]!.url);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('allows choosing another duration after an error', () => {
    render(<SignatureViewer {...viewerProps} />);
    fireEvent.error(openFilm());
    fireEvent.click(screen.getByRole('radio', { name: 'detail.ink.seconds(seconds=30)' }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByTestId('ink-film-video')).toHaveAttribute('src', allFilms.films[0]!.url);
  });

  it('pauses a film in a hidden browser tab without resuming it unexpectedly', () => {
    const pause = jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const play = jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const visibility = jest.spyOn(document, 'visibilityState', 'get');
    render(<SignatureViewer {...viewerProps} />);
    const video = openFilm();
    pause.mockClear();
    visibility.mockReturnValue('hidden');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(pause.mock.contexts.filter((element) => element === video)).toHaveLength(1);
    visibility.mockReturnValue('visible');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(play).not.toHaveBeenCalled();
    visibility.mockRestore();
  });

  it('has accessible original, playing, and failed states', async () => {
    const { container } = render(<SignatureViewer {...viewerProps} />);
    await checkA11y(container);
    openFilm();
    expect(screen.queryByRole('dialog')).toBeNull();
    await checkA11y(container);
    fireEvent.error(screen.getByTestId('ink-film-video'));
    await checkA11y(container);
  }, 20_000);
});
