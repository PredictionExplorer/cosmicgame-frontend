import userEvent from '@testing-library/user-event';

import { act, checkA11y, fireEvent, render, screen } from '@/test-utils';

import { REEL_FADE_MS } from '../ArtReel';
import { StageArtwork, type StageToken } from '../StageArtwork';

const mockUseMediaQuery = jest.fn<boolean, [string]>(() => false);
jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) => mockUseMediaQuery(query),
}));

const mockReducedMotion = jest.fn(() => false);
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockReducedMotion(),
}));

const TOKEN: StageToken = { id: 30, seed: '0xabc123', name: null, cycle: 1 };
const NEXT: StageToken = { id: 31, seed: '0xdef456', name: null, cycle: 1 };

type StageProps = Parameters<typeof StageArtwork>[0];

function renderStage(props: Partial<StageProps> = {}) {
  const handlers = {
    onPausedChange: jest.fn(),
    onReelActiveChange: jest.fn(),
    onArtStatus: jest.fn(),
  };
  const view = render(
    <StageArtwork token={TOKEN} rotates paused={false} {...handlers} {...props} />,
  );
  const rerenderStage = (next: Partial<StageProps>) =>
    view.rerender(
      <StageArtwork token={TOKEN} rotates paused={false} {...handlers} {...props} {...next} />,
    );
  return { ...view, ...handlers, rerenderStage };
}

/** Asks for the drawing, as the viewer does from the wall label. */
async function watch() {
  await userEvent.click(screen.getByTestId('art-reel-toggle'));
  return screen.getByTestId('deck-art-reel-clip');
}

let playSpy: jest.SpyInstance;
let pauseSpy: jest.SpyInstance;

beforeEach(() => {
  mockUseMediaQuery.mockReturnValue(false);
  mockReducedMotion.mockReturnValue(false);
  playSpy = jest
    .spyOn(window.HTMLMediaElement.prototype, 'play')
    .mockImplementation(() => Promise.resolve());
  pauseSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => {
  playSpy.mockRestore();
  pauseSpy.mockRestore();
  jest.useRealTimers();
});

describe('StageArtwork', () => {
  it('hangs the still on its black plate at the native ratio, linked to its page', () => {
    renderStage();

    const link = screen.getByTestId('deck-art-link');
    expect(link).toHaveAttribute('href', '/detail/30');
    expect(link).toHaveAccessibleName('home.deck.art.viewAria(id=#000030)');
    expect(screen.getByTestId('art-frame')).toHaveClass('art-plate');
    expect(screen.getByTestId('home-art-hero')).toHaveAttribute('data-reel', 'still');
  });

  it('captions the plate with a wall label: name, token number, cycle and imprint', () => {
    renderStage({ token: { ...TOKEN, name: 'Twisted Mind', imprintedAt: 1_786_491_506 } });

    const caption = screen.getByTestId('home-art-hero').querySelector('figcaption')!;
    expect(caption).toHaveTextContent('home.deck.art.titleNamed(name=Twisted Mind)');
    // A name took the title line, so the number leads the meta line.
    expect(caption.querySelector('.type-mono')).toHaveTextContent('#000030');
    expect(caption).toHaveTextContent('home.latestSignature.imprintedIn(number=1)');
    expect(caption.querySelector('time')).toHaveAttribute('dateTime', '2026-08-11T23:38:26.000Z');
  });

  it('never repeats the token number under an unnamed title', () => {
    renderStage();

    const caption = screen.getByTestId('home-art-hero').querySelector('figcaption')!;
    expect(caption).toHaveTextContent('home.deck.art.title(id=#000030)');
    expect(caption.querySelector('.type-mono')).toBeNull();
    expect(caption).toHaveTextContent('home.latestSignature.imprintedIn(number=1)');
  });

  it('keeps the finished still on the plate until the viewer asks to watch it take shape', () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { onReelActiveChange } = renderStage();

    // The clip starts from an empty sky: it never covers the still unasked,
    // and nothing is downloaded until the viewer asks.
    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(screen.getByTestId('art-frame').querySelector('img')).toHaveAttribute(
      'fetchpriority',
      'high',
    );
    expect(screen.getByTestId('home-art-hero')).toHaveAttribute('data-reel', 'available');
    expect(screen.getByTestId('art-reel-toggle')).toHaveAccessibleName(
      'home.deck.art.watchDrawing',
    );
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('draws the Signature on request over the still, holding the rotation meanwhile', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { onReelActiveChange } = renderStage();
    const still = screen.getByTestId('art-frame');

    const clip = await watch();
    expect(onReelActiveChange).toHaveBeenLastCalledWith(true);
    expect(clip).toHaveClass('object-contain');
    expect(clip).not.toHaveAttribute('poster');
    // Loading: the still shows through and the control says so.
    expect(clip).toHaveClass('opacity-0');
    const toggle = screen.getByTestId('art-reel-toggle');
    expect(toggle).toHaveAttribute('aria-busy', 'true');
    expect(toggle).toHaveAccessibleName('home.deck.art.showFinished');

    act(() => {
      fireEvent.playing(clip);
    });
    expect(clip).toHaveClass('opacity-100');
    expect(toggle).not.toHaveAttribute('aria-busy');
    // The still is never swapped out underneath.
    expect(screen.getByTestId('art-frame')).toBe(still);
  });

  it('fades back to the finished still when the drawing ends, and stays there', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { onReelActiveChange } = renderStage();
    const clip = await watch();
    jest.useFakeTimers();

    act(() => {
      fireEvent.playing(clip);
      fireEvent.ended(clip);
    });
    expect(clip).toHaveClass('opacity-0');
    act(() => {
      jest.advanceTimersByTime(REEL_FADE_MS);
    });

    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByTestId('art-reel-toggle')).toHaveAccessibleName(
      'home.deck.art.watchDrawing',
    );
  });

  it('shows the finished work at once when the viewer asks mid-drawing', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { onReelActiveChange } = renderStage();
    const clip = await watch();
    act(() => {
      fireEvent.playing(clip);
    });

    await userEvent.click(screen.getByTestId('art-reel-toggle'));

    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('plays again for a viewer who had paused the artwork and now asks to watch', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { onPausedChange } = renderStage({ paused: true });

    await watch();

    expect(onPausedChange).toHaveBeenCalledWith(false);
  });

  it('ends a drawing when the plate moves to another token', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { rerenderStage, onReelActiveChange } = renderStage();
    await watch();

    rerenderStage({ token: NEXT });

    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('paints the first token at once and fades in only the ones that follow', () => {
    const { container, rerenderStage } = renderStage();
    const still = () => container.querySelector('[data-testid="art-frame"]')!.parentElement!;
    expect(still()).not.toHaveClass('motion-safe:animate-in');

    rerenderStage({ token: NEXT });
    expect(still()).toHaveClass('motion-safe:animate-in', 'motion-safe:fade-in');
  });

  it('does not skip a token whose still failed while its clip covers the plate', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { onArtStatus } = renderStage();
    const clip = await watch();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const image = screen.queryByTestId('art-frame')?.querySelector('img');
      if (image) fireEvent.error(image);
    }
    expect(onArtStatus).not.toHaveBeenCalledWith(30, 'unavailable');

    // The clip gives up too: now the token is reported, and may be skipped.
    act(() => {
      fireEvent.error(clip);
    });
    expect(onArtStatus).toHaveBeenLastCalledWith(30, 'unavailable');
  });

  it('offers no drawing under reduced motion', () => {
    mockUseMediaQuery.mockReturnValue(true);
    mockReducedMotion.mockReturnValue(true);
    const { onReelActiveChange } = renderStage();

    expect(screen.queryByTestId('art-reel-toggle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('offers no drawing below 1024px, where the still is all there is', () => {
    renderStage();

    expect(screen.queryByTestId('art-reel-toggle')).not.toBeInTheDocument();
  });

  it('pauses and resumes the artwork from the label row (WCAG 2.2.2)', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { onPausedChange, rerenderStage } = renderStage();

    const toggle = screen.getByTestId('art-motion-toggle');
    expect(toggle).toHaveAccessibleName('detail.viewer.pause');
    // The control sits in the caption, never over the art or inside its link.
    expect(screen.getByTestId('deck-art-link')).not.toContainElement(toggle);
    await userEvent.click(toggle);
    expect(onPausedChange).toHaveBeenCalledWith(true);

    rerenderStage({ paused: true });
    expect(screen.getByTestId('art-motion-toggle')).toHaveAccessibleName('detail.viewer.play');
  });

  it('holds a drawing on its frame while paused', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { rerenderStage } = renderStage();
    await watch();
    pauseSpy.mockClear();

    rerenderStage({ paused: true });

    expect(pauseSpy).toHaveBeenCalled();
    expect(screen.getByTestId('deck-art-reel')).toBeInTheDocument();
  });

  it('offers no pause when nothing on the plate moves', () => {
    renderStage({ rotates: false });

    expect(screen.queryByTestId('art-motion-toggle')).not.toBeInTheDocument();
  });

  it('keeps the still and says so when the clip cannot play', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { onReelActiveChange } = renderStage();
    const clip = await watch();

    act(() => {
      fireEvent.error(clip);
    });

    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByTestId('art-reel-error')).toHaveTextContent('detail.viewer.motionError');
    // This token's clip is not offered again; the next one's is.
    expect(screen.queryByTestId('art-reel-toggle')).not.toBeInTheDocument();
  });

  it('reports a token whose every file failed, ending in the pending plate', () => {
    const { onArtStatus } = renderStage();

    const image = screen.getByTestId('art-frame').querySelector('img')!;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const current = screen.queryByTestId('art-frame')?.querySelector('img');
      if (current) fireEvent.error(current);
    }
    expect(image).toBeTruthy();
    expect(screen.getByTestId('pending-plate')).toHaveAccessibleName('Cosmic Signature #000030');
    expect(onArtStatus).toHaveBeenLastCalledWith(30, 'unavailable');
  });

  it('shows the designed pending plate before any artwork exists', () => {
    renderStage({ token: null, rotates: false });

    expect(screen.getByTestId('pending-plate')).toBeInTheDocument();
    expect(screen.queryByTestId('deck-art-link')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { container } = renderStage();
    await checkA11y(container);
  });
});
