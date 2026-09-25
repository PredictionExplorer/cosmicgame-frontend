import { TOKEN_1_METADATA_V2 } from '@/lib/nftMetadata/__fixtures__/metadata';
import { normalizeTraitEntry, parseCosmicSignatureMetadata } from '@/lib/nftMetadata';

import { checkA11y, fireEvent, render, screen, within } from '@/test-utils';

import { SignatureCard, signatureCardSources } from '../SignatureCard';
import { SignatureGridSkeleton } from '../SignatureGrid';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill: _f, priority: _p, unoptimized: _u, fetchPriority: _fp, ...rest } = props;
    return <img {...rest} />;
  },
}));

const entry = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!)!;

const link = () => screen.getByRole('link');

describe('SignatureCard', () => {
  it('titles an unnamed Signature "Signature #…" and captions its structure and palette', () => {
    render(<SignatureCard tokenId={1} seed="a1" entry={entry} sizes="400px" />);
    const card = screen.getByTestId('signature-card');
    // The wall-label rule: the localized noun, the number in the identifier face.
    expect(within(card).getByText('#000001')).toHaveClass('type-mono-inline');
    expect(within(card).getByText('#000001').parentElement).toHaveTextContent(
      'common.signature.untitled(id=#000001)',
    );
    // The space before the dot does not break: a wrapped caption ends a line with it.
    expect(card.textContent).toMatch(/Orbit Ribbons\u00a0· \S/);
  });

  it("keeps a phone's two-across title to the number alone (regression)", () => {
    // "Signature #000047" wrapped to two lines beside the anchor at 390px, and
    // every card wrapped at 320px: below sm the noun hides and the number stays.
    render(<SignatureCard tokenId={47} seed="a1" entry={entry} anchored sizes="400px" />);
    const number = screen.getByText('#000047');
    expect(number).not.toHaveClass('max-sm:hidden');
    const noun = screen.getByText('common.signature.untitled(id=');
    expect(noun).toHaveClass('max-sm:hidden');
    // The whole title is still one text for tests and the alt text beside it.
    expect(number.parentElement).toHaveTextContent('common.signature.untitled(id=#000047)');
  });

  it('says "Rendering" for a fresh imprint without art, as its own page does', () => {
    const imprintedAt = Math.floor(Date.now() / 1000) - 5 * 60;
    render(<SignatureCard tokenId={420} imprintedAt={imprintedAt} sizes="400px" />);
    expect(screen.getByTestId('pending-plate')).toHaveTextContent('detail.image.rendering');
  });

  it('says "Artwork unavailable" once the render window has passed', () => {
    const imprintedAt = Math.floor(Date.now() / 1000) - 2 * 60 * 60;
    render(<SignatureCard tokenId={420} imprintedAt={imprintedAt} sizes="400px" />);
    expect(screen.getByTestId('pending-plate')).toHaveTextContent(
      'detail.image.artworkUnavailable',
    );
  });

  it('puts the number in the caption of a named Signature', () => {
    render(
      <SignatureCard tokenId={25} seed="a1" name="Twisted Mind" entry={entry} sizes="400px" />,
    );
    expect(screen.getByText('Twisted Mind')).toBeInTheDocument();
    expect(screen.getByText('#000025')).toHaveClass('type-mono');
  });

  it('is one link to the detail page, named by the alt text composed from the traits', () => {
    render(
      <SignatureCard tokenId={25} seed="a1" name="Twisted Mind" entry={entry} sizes="400px" />,
    );
    expect(link()).toHaveAttribute('href', '/detail/25');
    expect(link()).toHaveAccessibleName(
      /^“Twisted Mind”, Cosmic Signature #000025: Orbit Ribbons structure/,
    );
  });

  it('says it is anchored to assistive technology and shows a quiet anchor', () => {
    render(<SignatureCard tokenId={3} seed="a3" entry={entry} anchored sizes="400px" />);
    expect(screen.getByTestId('anchored-mark')).toBeInTheDocument();
    expect(link()).toHaveAccessibleName(/Anchored$/);
  });

  it('shows a skeleton caption while the traits load, and says when they are not published', () => {
    const { rerender } = render(<SignatureCard tokenId={3} seed="a3" sizes="400px" />);
    expect(screen.getByTestId('trait-skeleton')).toBeInTheDocument();
    rerender(<SignatureCard tokenId={3} seed="a3" entry={null} sizes="400px" />);
    expect(screen.getByText('Traits pending')).toBeInTheDocument();
  });

  it('draws the designed unavailable plate without a seed', () => {
    render(<SignatureCard tokenId={9} seed={null} entry={null} sizes="400px" />);
    expect(screen.getByTestId('pending-plate')).toBeInTheDocument();
  });

  it('keeps the quick view off the art, in the label row, for a mouse', () => {
    const onQuickView = jest.fn();
    render(
      <SignatureCard tokenId={7} seed="a7" entry={entry} sizes="400px" onQuickView={onQuickView} />,
    );
    const button = screen.getByTestId('quick-view-button');
    // A touch has no hover; tapping the card opens the page instead.
    expect(button).toHaveClass('pointer-coarse:hidden');
    // Outside the link, so it is never a control inside a control.
    expect(link()).not.toContainElement(button);
    fireEvent.click(button);
    expect(onQuickView).toHaveBeenCalledWith(7);
  });

  it('adds extra caption facts where the page has them', () => {
    render(
      <SignatureCard
        tokenId={7}
        seed="a7"
        entry={entry}
        sizes="400px"
        extraMeta={['Stellar Selection']}
      />,
    );
    expect(link()).toHaveAccessibleName(/Stellar Selection/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SignatureCard
        tokenId={7}
        seed="a7"
        entry={entry}
        anchored
        sizes="400px"
        onQuickView={jest.fn()}
      />,
    );
    await checkA11y(container);
  });
});

describe('signatureCardSources', () => {
  it('starts with the thumbnail and falls back to the full-size files', () => {
    const sources = signatureCardSources('0xAB');
    expect(sources).toHaveLength(3);
    expect(sources[0]).toMatch(/0xab\/thumb_card\.webp$/i);
    expect(sources[1]).toMatch(/full\.webp$/);
    expect(sources[2]).toMatch(/\.png$/);
    expect(signatureCardSources(null)).toEqual([]);
  });
});

describe('SignatureGridSkeleton', () => {
  it('announces once and draws a plate per card', () => {
    render(<SignatureGridSkeleton count={4} />);
    const skeleton = screen.getByRole('status');
    expect(skeleton.children).toHaveLength(4);
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });
});
