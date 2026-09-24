import userEvent from '@testing-library/user-event';

import { act, checkA11y, fireEvent, render, screen } from '@/test-utils';

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
    onReelEnded: jest.fn(),
    onReelActiveChange: jest.fn(),
    onArtStatus: jest.fn(),
  };
  const view = render(
    <StageArtwork token={TOKEN} nextToken={NEXT} rotates paused={false} {...handlers} {...props} />,
  );
  return { ...view, ...handlers };
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

  it('captions the plate with a wall label: name, token number and cycle', () => {
    renderStage({ token: { ...TOKEN, name: 'Twisted Mind' } });

    const caption = screen.getByTestId('home-art-hero').querySelector('figcaption');
    expect(caption).toHaveTextContent('home.deck.art.titleNamed(name=Twisted Mind)');
    expect(caption).toHaveTextContent('#000030');
    expect(caption).toHaveTextContent('home.hero.cycleNumber(number=1)');
  });

  it('plays the generation reel on wide screens and hands rotation to it', () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { onReelActiveChange } = renderStage();

    expect(screen.getByTestId('deck-art-reel-current')).toBeInTheDocument();
    expect(screen.getByTestId('deck-art-reel-current')).toHaveClass('object-contain');
    expect(onReelActiveChange).toHaveBeenLastCalledWith(true);
  });

  it('keeps the reel unmounted under reduced motion', () => {
    mockUseMediaQuery.mockReturnValue(true);
    mockReducedMotion.mockReturnValue(true);
    const { onReelActiveChange } = renderStage();

    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(onReelActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('pauses and resumes the artwork from the label row (WCAG 2.2.2)', async () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { onPausedChange, rerender } = renderStage();

    const toggle = screen.getByTestId('art-motion-toggle');
    expect(toggle).toHaveAccessibleName('detail.viewer.pause');
    // The control sits in the caption, never over the art or inside its link.
    expect(screen.getByTestId('deck-art-link')).not.toContainElement(toggle);
    await userEvent.click(toggle);
    expect(onPausedChange).toHaveBeenCalledWith(true);

    pauseSpy.mockClear();
    rerender(
      <StageArtwork
        token={TOKEN}
        nextToken={NEXT}
        rotates
        paused
        onPausedChange={onPausedChange}
        onReelEnded={jest.fn()}
        onReelActiveChange={jest.fn()}
      />,
    );
    expect(pauseSpy).toHaveBeenCalled();
    expect(screen.getByTestId('art-motion-toggle')).toHaveAccessibleName('detail.viewer.play');
  });

  it('offers no pause when nothing on the plate moves', () => {
    renderStage({ rotates: false });

    expect(screen.queryByTestId('art-motion-toggle')).not.toBeInTheDocument();
  });

  it('falls back to the still when the clip cannot play', () => {
    mockUseMediaQuery.mockReturnValue(true);
    renderStage();

    act(() => {
      fireEvent.error(screen.getByTestId('deck-art-reel-current'));
    });
    expect(screen.queryByTestId('deck-art-reel')).not.toBeInTheDocument();
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
  });

  it('reports a token whose every file failed, ending in the pending plate', () => {
    const { onArtStatus } = renderStage();

    const image = screen.getByTestId('art-frame').querySelector('img')!;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const current = screen.queryByTestId('art-frame')?.querySelector('img');
      if (current) fireEvent.error(current);
    }
    expect(image).toBeTruthy();
    expect(screen.getByTestId('pending-plate')).toHaveAccessibleName(
      'home.deck.art.alt(id=#000030)',
    );
    expect(onArtStatus).toHaveBeenLastCalledWith(30, 'unavailable');
  });

  it('shows the designed pending plate before any artwork exists', () => {
    renderStage({ token: null, nextToken: null, rotates: false });

    expect(screen.getByTestId('pending-plate')).toBeInTheDocument();
    expect(screen.queryByTestId('deck-art-link')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderStage();
    await checkA11y(container);
  });
});
