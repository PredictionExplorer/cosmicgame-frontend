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
  it('titles an unnamed Signature by its number and captions its structure and palette', () => {
    render(<SignatureCard tokenId={1} seed="a1" entry={entry} sizes="400px" />);
    const card = screen.getByTestId('signature-card');
    expect(within(card).getByText('#000001')).toBeInTheDocument();
    // The space before the dot does not break: a wrapped caption ends a line with it.
    expect(card.textContent).toMatch(/Orbit Ribbons\u00a0· \S/);
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
    expect(screen.getByText('#000025')).toHaveClass('tabular-nums');
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

  // F252: the glyph alone meant nothing to a sighted newcomer.
  it('names the anchored state in a word tag from `sm`, the glyph alone on a phone', () => {
    render(<SignatureCard tokenId={3} seed="a3" entry={entry} anchored sizes="400px" />);
    const tag = screen.getByTestId('card-tag');
    expect(tag).toHaveTextContent('Anchored');
    expect(tag.firstElementChild).toHaveClass('max-sm:hidden');
    expect(screen.getByTestId('anchored-mark')).toHaveClass('sm:hidden');
  });

  it('carries facts with links of their own after the card link, never inside it', () => {
    render(
      <SignatureCard
        tokenId={3}
        seed="a3"
        entry={entry}
        sizes="400px"
        after={<a href="https://example.com/tx">proof</a>}
      />,
    );
    const cardLink = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('href') === '/detail/3');
    expect(cardLink).not.toContainElement(screen.getByText('proof'));
  });

  describe('in select mode', () => {
    it('is a checkbox’s label instead of a link, with the box in the label row', () => {
      const onCheckedChange = jest.fn();
      render(
        <SignatureCard
          tokenId={3}
          seed="a3"
          entry={entry}
          sizes="400px"
          select={{ checked: false, onCheckedChange, label: 'Select #000003' }}
        />,
      );
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('art-frame'));
      expect(onCheckedChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole('checkbox', { name: 'Select #000003' })).toBeInTheDocument();
    });

    it('marks a chosen card on its plate edge, never over or dimming the art', () => {
      render(
        <SignatureCard
          tokenId={3}
          seed="a3"
          entry={entry}
          sizes="400px"
          select={{ checked: true, onCheckedChange: jest.fn(), label: 'Select #000003' }}
        />,
      );
      const plate = screen.getByTestId('art-frame');
      // Through the plate's own edge variables: a competing after:shadow
      // class lost to the plate's edge in the stylesheet (regression).
      expect(plate.className).toContain('[--art-edge:inset_0_0_0_2px_var(--color-primary)]');
      expect(plate.className).toContain('[--art-edge-active:inset_0_0_0_2px_var(--color-primary)]');
      expect(plate.className).not.toContain('after:shadow-[inset');
      expect(plate.className).not.toMatch(/opacity-/);
      expect(screen.getByTestId('signature-card')).toHaveAttribute('data-selected', 'true');
    });

    it('says why a Signature cannot be chosen, in words, and keeps its art whole', () => {
      render(
        <SignatureCard
          tokenId={3}
          seed="a3"
          entry={entry}
          anchored
          sizes="400px"
          select={{
            checked: false,
            onCheckedChange: jest.fn(),
            label: 'Select #000003',
            unavailable: 'Owner changed',
          }}
        />,
      );
      expect(screen.getByRole('checkbox', { name: 'Select #000003' })).toBeDisabled();
      expect(screen.getByTestId('card-tag')).toHaveTextContent('Owner changed');
      expect(screen.getByTestId('art-frame').className).not.toMatch(/opacity-/);
    });
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
