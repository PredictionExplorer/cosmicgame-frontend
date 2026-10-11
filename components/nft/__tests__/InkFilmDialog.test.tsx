import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';

import { useInkFilms } from '@/hooks/useInkFilms';
import { mediaFailoverUrl } from '@/utils/urls';
import type { InkFilms, InkFilmVariant } from '@/lib/nftMetadata/ink';

import { render, screen, fireEvent, checkA11y, waitFor, within, act } from '@/test-utils';

import { InkFilmDialog } from '../InkFilmDialog';

jest.mock('@/hooks/useInkFilms', () => ({ useInkFilms: jest.fn() }));
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

function available(variants: InkFilmVariant[] = ['short', 'medium', 'slow']) {
  jest.mocked(useInkFilms).mockReturnValue({
    data: { ...allFilms, films: allFilms.films.filter((film) => variants.includes(film.variant)) },
  } as ReturnType<typeof useInkFilms>);
}

function openFilm() {
  fireEvent.click(screen.getByRole('button', { name: 'detail.ink.trigger' }));
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
  delete document.documentElement.dataset.motion;
  jest.mocked(mediaFailoverUrl).mockReturnValue(null);
  available();
});

describe('InkFilmDialog', () => {
  it('keeps films and their poster unmounted until explicitly opened', () => {
    const { container } = render(<InkFilmDialog seed="abc" subject="Study" />);
    expect(screen.getByRole('button', { name: 'detail.ink.trigger' })).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each([undefined, null, { films: [], poster: undefined }])(
    'quietly omits an unavailable study (%s)',
    (data) => {
      jest.mocked(useInkFilms).mockReturnValue({ data } as ReturnType<typeof useInkFilms>);
      const { container } = render(<InkFilmDialog seed="abc" subject="Study" />);
      expect(container).toBeEmptyDOMElement();
    },
  );

  it('opens the medium film and offers only the published lengths', () => {
    available(['medium', 'slow']);
    render(<InkFilmDialog seed="abc" subject="Study" />);
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
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it.each([
    { variants: ['short', 'slow'] as InkFilmVariant[], expected: 'short' },
    { variants: ['slow'] as InkFilmVariant[], expected: 'slow' },
  ])('falls back to $expected when medium is unavailable', ({ variants, expected }) => {
    available(variants);
    render(<InkFilmDialog seed="abc" subject="Study" />);
    expect(openFilm()).toHaveAttribute('src', `https://media.example/${expected}.mp4`);
    if (variants.length === 1) expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  it('replaces rather than preloads films when the duration changes', () => {
    render(<InkFilmDialog seed="abc" subject="Study" />);
    const initial = openFilm();
    fireEvent.click(screen.getByRole('radio', { name: 'detail.ink.minutes(minutes=5)' }));
    expect(initial).not.toBeInTheDocument();
    expect(initial).not.toHaveAttribute('src');
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalled();
    expect(document.querySelectorAll('video')).toHaveLength(1);
    expect(screen.getByTestId('ink-film-video')).toHaveAttribute('src', allFilms.films[2]!.url);
  });

  it('releases the video on close, restores focus, and starts with medium on reopening', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    render(<InkFilmDialog seed="abc" subject="Study" onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button', { name: 'detail.ink.trigger' });
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.click(screen.getByRole('radio', { name: 'detail.ink.minutes(minutes=5)' }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.querySelector('video')).toBeNull();
    expect(trigger).toHaveFocus();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(openFilm()).toHaveAttribute('src', allFilms.films[1]!.url);
  });

  it.each(['system', 'site'])('respects the %s reduced-motion setting', (setting) => {
    if (setting === 'system') mockReducedMotion = true;
    else document.documentElement.dataset.motion = 'reduced';
    render(<InkFilmDialog seed="abc" subject="Study" />);
    const video = openFilm();
    expect(video).not.toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video).toHaveAttribute('controls');
  });

  it('never carries an open film to another artwork', () => {
    const { rerender } = render(<InkFilmDialog seed="abc" subject="Study" />);
    openFilm();
    rerender(<InkFilmDialog seed="def" subject="Another study" />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.querySelector('video')).toBeNull();
    expect(useInkFilms).toHaveBeenLastCalledWith('def');
  });

  it('keeps the selected video source through StrictMode ref replay', () => {
    render(
      <StrictMode>
        <InkFilmDialog seed="abc" subject="Study" />
      </StrictMode>,
    );
    expect(openFilm()).toHaveAttribute('src', allFilms.films[1]!.url);
  });

  it('does not restart playback when a manifest refresh answers from a different mirror', () => {
    const { rerender } = render(<InkFilmDialog seed="abc" subject="Study" />);
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
    rerender(<InkFilmDialog seed="abc" subject="Study" />);
    expect(screen.getByTestId('ink-film-video')).toBe(video);
    expect(video).toHaveAttribute('src', allFilms.films[1]!.url);
    expect(video.currentTime).toBe(42);
  });

  it('keeps arrow keys inside the study, including on the close button', () => {
    const navigate = jest.fn();
    render(
      <div onKeyDown={navigate}>
        <InkFilmDialog seed="abc" subject="Study" />
      </div>,
    );
    openFilm();
    fireEvent.keyDown(screen.getByRole('button', { name: 'common.actions.close' }), {
      key: 'ArrowRight',
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('tries the same film on the other media server once, then offers retry', () => {
    jest.mocked(mediaFailoverUrl).mockReturnValue('https://backup.example/medium.mp4');
    render(<InkFilmDialog seed="abc" subject="Study" />);
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
    render(<InkFilmDialog seed="abc" subject="Study" />);
    fireEvent.error(openFilm());
    fireEvent.click(screen.getByRole('radio', { name: 'detail.ink.seconds(seconds=30)' }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByTestId('ink-film-video')).toHaveAttribute('src', allFilms.films[0]!.url);
  });

  it('pauses a film in a hidden browser tab without resuming it unexpectedly', () => {
    const pause = jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const visibility = jest.spyOn(document, 'visibilityState', 'get');
    render(<InkFilmDialog seed="abc" subject="Study" />);
    openFilm();
    visibility.mockReturnValue('hidden');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(pause).toHaveBeenCalledTimes(1);
    visibility.mockRestore();
  });

  it('has accessible closed, playing, and failed states', async () => {
    const { container } = render(<InkFilmDialog seed="abc" subject="Study" />);
    await checkA11y(container);
    openFilm();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading')).toHaveTextContent(
      'detail.ink.title(subject=Study)',
    );
    await checkA11y(dialog);
    fireEvent.error(screen.getByTestId('ink-film-video'));
    await checkA11y(dialog);
  }, 20_000);
});
