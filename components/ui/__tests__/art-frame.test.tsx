import {
  ART_PLATE_CLASS,
  MEDIA_PLATE_CLASS,
  ArtFrame,
  ArtTag,
  PendingPlate,
  WallLabel,
  WallLabelMeta,
  renditionSrcSet,
  type ArtRendition,
} from '@/components/ui/art-frame';

import { render, screen, fireEvent, checkA11y, waitFor } from '@/test-utils';

const THUMB = 'https://media.example/0xabc/thumb_card.webp';
const FULL_WEBP = 'https://media.example/0xabc/images/web/full.webp';
const PNG = 'https://media.example/0xabc.png';

const RENDITIONS: readonly ArtRendition[] = [
  { src: FULL_WEBP, width: 3456 },
  { src: THUMB, width: 640 },
];

describe('renditionSrcSet', () => {
  it('lists each published file once at its real width, narrowest first', () => {
    expect(renditionSrcSet(RENDITIONS)).toBe(`${THUMB} 640w, ${FULL_WEBP} 3456w`);
    expect(renditionSrcSet([{ src: '', width: 320 }, ...RENDITIONS])).toBe(
      `${THUMB} 640w, ${FULL_WEBP} 3456w`,
    );
  });
});

/**
 * jsdom never loads images, so `complete` stays false. These stub it on the
 * rendition `<img>` alone (next/image marks its own with data-nimg) to stand
 * for an image that settled before hydration.
 */
function stubSettledRenditionImage(naturalWidth: number): () => void {
  const proto = HTMLImageElement.prototype;
  const complete = Object.getOwnPropertyDescriptor(proto, 'complete')!;
  const natural = Object.getOwnPropertyDescriptor(proto, 'naturalWidth')!;
  const isRendition = (image: HTMLImageElement) =>
    image.hasAttribute('srcset') && !image.hasAttribute('data-nimg');
  Object.defineProperty(proto, 'complete', {
    configurable: true,
    get(this: HTMLImageElement) {
      return isRendition(this) || Boolean(complete.get?.call(this));
    },
  });
  Object.defineProperty(proto, 'naturalWidth', {
    configurable: true,
    get(this: HTMLImageElement) {
      return isRendition(this) ? naturalWidth : Number(natural.get?.call(this) ?? 0);
    },
  });
  return () => {
    Object.defineProperty(proto, 'complete', complete);
    Object.defineProperty(proto, 'naturalWidth', natural);
  };
}

describe('ArtFrame', () => {
  it('offers the published renditions as a responsive srcset on the black plate', () => {
    render(
      <ArtFrame
        sources={[RENDITIONS, PNG]}
        alt="Cosmic Signature #000025"
        sizes="(min-width: 1024px) 60vw, 100vw"
        unavailableLabel="Artwork unavailable"
      />,
    );
    const img = screen.getByAltText('Cosmic Signature #000025');
    // Exactly the two published files, at their true widths: no invented sizes.
    expect(img).toHaveAttribute('srcset', `${THUMB} 640w, ${FULL_WEBP} 3456w`);
    expect(img).toHaveAttribute('src', THUMB);
    expect(img).toHaveAttribute('sizes', '(min-width: 1024px) 60vw, 100vw');
    expect(img).toHaveAttribute('width', '3456');
    expect(img).toHaveAttribute('height', '2234');
    expect(screen.getByTestId('art-frame')).toHaveClass('art-plate');
  });

  it('replays a rendition that failed before hydration, moving on to the fallback', () => {
    const restore = stubSettledRenditionImage(0);
    try {
      render(
        <ArtFrame
          sources={[RENDITIONS, PNG]}
          alt="Art"
          sizes="100vw"
          unavailableLabel="Unavailable"
        />,
      );
      expect(screen.getByAltText('Art')).toHaveAttribute('src', PNG);
    } finally {
      restore();
    }
  });

  it('replays a rendition that loaded before hydration, lifting the loading mark', async () => {
    const restore = stubSettledRenditionImage(3456);
    try {
      render(
        <ArtFrame sources={[RENDITIONS]} alt="Art" sizes="100vw" unavailableLabel="Unavailable" />,
      );
      await waitFor(() =>
        expect(screen.getByTestId('art-frame')).toHaveAttribute('data-status', 'loaded'),
      );
      expect(screen.getByAltText('Art')).toHaveAttribute('srcset');
    } finally {
      restore();
    }
  });

  it('loads eagerly at high priority above the fold, lazily otherwise', () => {
    const { rerender } = render(
      <ArtFrame sources={[PNG]} alt="Art" sizes="100vw" unavailableLabel="Unavailable" priority />,
    );
    expect(screen.getByAltText('Art')).toHaveAttribute('loading', 'eager');
    expect(screen.getByAltText('Art')).toHaveAttribute('fetchpriority', 'high');
    rerender(<ArtFrame sources={[PNG]} alt="Art" sizes="100vw" unavailableLabel="Unavailable" />);
    expect(screen.getByAltText('Art')).toHaveAttribute('loading', 'lazy');
  });

  it('draws the orbit mark under the image until it loads', async () => {
    render(<ArtFrame sources={[PNG]} alt="Art" sizes="100vw" unavailableLabel="Unavailable" />);
    const frame = screen.getByTestId('art-frame');
    expect(frame).toHaveAttribute('data-status', 'loading');
    expect(screen.getByTestId('orbit-mark')).toBeInTheDocument();
    fireEvent.load(screen.getByAltText('Art'));
    await waitFor(() => expect(frame).toHaveAttribute('data-status', 'loaded'));
    expect(screen.queryByTestId('orbit-mark')).not.toBeInTheDocument();
  });

  it('falls back through its sources and ends in the designed unavailable state', () => {
    const onStatusChange = jest.fn();
    render(
      <ArtFrame
        sources={[FULL_WEBP, PNG]}
        alt="Cosmic Signature #000025"
        sizes="100vw"
        unavailableLabel="Artwork unavailable"
        unavailableDetail="#000025"
        onStatusChange={onStatusChange}
      />,
    );
    expect(screen.getByAltText('Cosmic Signature #000025')).toHaveAttribute('src', FULL_WEBP);

    fireEvent.error(screen.getByAltText('Cosmic Signature #000025'));
    expect(screen.getByAltText('Cosmic Signature #000025')).toHaveAttribute('src', PNG);

    fireEvent.error(screen.getByAltText('Cosmic Signature #000025'));
    const plate = screen.getByRole('img', { name: 'Cosmic Signature #000025' });
    expect(plate).toHaveAccessibleDescription('Artwork unavailable #000025');
    expect(plate).toHaveTextContent('Artwork unavailable');
    expect(plate).toHaveTextContent('#000025');
    expect(screen.queryByAltText('Cosmic Signature #000025')).not.toBeInTheDocument();
    expect(onStatusChange).toHaveBeenLastCalledWith('unavailable');
  });

  it('skips a fallback equal to the URL that already failed', () => {
    render(
      <ArtFrame
        sources={[PNG, PNG]}
        alt="Art"
        sizes="100vw"
        unavailableLabel="Artwork unavailable"
      />,
    );
    fireEvent.error(screen.getByAltText('Art'));
    expect(screen.getByRole('img', { name: 'Art' })).toHaveTextContent('Artwork unavailable');
  });

  it('starts over when its sources change', () => {
    const { rerender } = render(
      <ArtFrame sources={[PNG]} alt="Art" sizes="100vw" unavailableLabel="Unavailable" />,
    );
    fireEvent.error(screen.getByAltText('Art'));
    expect(screen.queryByAltText('Art')).not.toBeInTheDocument();

    rerender(
      <ArtFrame sources={[FULL_WEBP]} alt="Art" sizes="100vw" unavailableLabel="Unavailable" />,
    );
    expect(screen.getByAltText('Art')).toHaveAttribute('src', FULL_WEBP);
  });

  it('renders the unavailable state at once when there is no source', () => {
    render(
      <ArtFrame
        sources={['', undefined, null]}
        alt="Art"
        sizes="100vw"
        unavailableLabel="Artwork unavailable"
      />,
    );
    expect(screen.getByRole('img', { name: 'Art' })).toHaveTextContent('Artwork unavailable');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ArtFrame sources={[PNG]} alt="Art" sizes="100vw" unavailableLabel="Unavailable" />,
    );
    await checkA11y(container);
  });
});

describe('MEDIA_PLATE_CLASS', () => {
  it('is the art plate without its ratio: the ground, the radius and the print edge', () => {
    expect(ART_PLATE_CLASS).toContain('art-plate');
    expect(MEDIA_PLATE_CLASS).not.toContain('art-plate');
    expect(MEDIA_PLATE_CLASS).not.toMatch(/aspect-/);
    for (const part of ['bg-art-ground', 'rounded-edge', 'overflow-hidden', 'isolate']) {
      expect(MEDIA_PLATE_CLASS.split(' ')).toContain(part);
    }
    // The same edge, above the image, brightening on hover and focus.
    for (const part of [
      'after:shadow-[var(--art-edge)]',
      'hover:after:shadow-[var(--art-edge-active)]',
      'focus-within:after:shadow-[var(--art-edge-active)]',
    ]) {
      expect(MEDIA_PLATE_CLASS.split(' ')).toContain(part);
      expect(ART_PLATE_CLASS.split(' ')).toContain(part);
    }
  });
});

describe('PendingPlate', () => {
  it('draws the orbit mark with its caption at full density', () => {
    render(
      <PendingPlate label="Artwork unavailable" detail="#000007" alt="Cosmic Signature #000007" />,
    );
    const plate = screen.getByRole('img', { name: 'Cosmic Signature #000007' });
    expect(plate).toHaveClass('aspect-art');
    expect(plate).toHaveTextContent('Artwork unavailable');
    expect(screen.getByTestId('orbit-mark')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps the label as the description when compact hides the caption', () => {
    render(<PendingPlate label="Artwork unavailable" alt="RandomWalk #12" density="compact" />);
    const plate = screen.getByRole('img', { name: 'RandomWalk #12' });
    expect(plate).toHaveAccessibleDescription('Artwork unavailable');
    // No visible caption: only the hidden description carries the label.
    expect(plate.querySelector('p')).toBeNull();
  });

  it('is a neutral well without the orbit mark for non-Signature media', () => {
    render(<PendingPlate label="Artwork unavailable" variant="media" />);
    const plate = screen.getByRole('img', { name: 'Artwork unavailable' });
    expect(plate).toHaveClass('aspect-video', 'bg-surface-sunken');
    expect(screen.queryByTestId('orbit-mark')).not.toBeInTheDocument();
  });

  it('is an unnamed busy skeleton without a label', () => {
    render(<PendingPlate busy />);
    const plate = screen.getByTestId('pending-plate');
    expect(plate).toHaveAttribute('aria-busy', 'true');
    expect(plate).not.toHaveAttribute('role');
  });
});

describe('WallLabel', () => {
  it('sets the name, the dotted caption line, the traits line and its tags', () => {
    render(
      <WallLabel
        title="Twisted Mind"
        titleAs="h2"
        meta={['#000025', null, 'Cycle 1', '', '2026']}
        tags={<ArtTag tone="positive">Anchored</ArtTag>}
      >
        <p>Orbit Ribbons · Solar Mono</p>
      </WallLabel>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Twisted Mind' })).toBeInTheDocument();
    expect(screen.getByText('#000025').closest('p')).toHaveTextContent('#000025·Cycle 1·2026');
    expect(screen.getByText('Orbit Ribbons · Solar Mono')).toBeInTheDocument();
    expect(screen.getByText('Anchored')).toBeInTheDocument();
  });

  it('renders nothing for a caption line without facts', () => {
    const { container } = render(<WallLabelMeta items={[null, '', false]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
