import { deriveCollectionTraits } from '@/hooks/useNftTraits';
import {
  TOKEN_1_METADATA_V2,
  TOKEN_43_METADATA_V1,
  TOKEN_7_METADATA_V2,
} from '@/lib/nftMetadata/__fixtures__/metadata';
import { normalizeTraitEntry, parseCosmicSignatureMetadata } from '@/lib/nftMetadata';

import { render, screen, checkA11y, fireEvent } from '@/test-utils';

import { NftQuickView } from '../NftQuickView';

let mockReducedMotion = false;
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockReducedMotion,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const {
      fill: _f,
      priority: _p,
      unoptimized: _u,
      loader: _l,
      fetchPriority: _fp,
      ...rest
    } = props;
    return <img {...rest} />;
  },
}));

const collectionTraits = deriveCollectionTraits({
  version: 1,
  total: 3,
  indexed: 3,
  missing: 0,
  partial: false,
  generatedAt: '2026-09-01T00:00:00.000Z',
  entries: [TOKEN_1_METADATA_V2, TOKEN_7_METADATA_V2, TOKEN_43_METADATA_V1].map(
    (doc) => normalizeTraitEntry(parseCosmicSignatureMetadata(doc)!)!,
  ),
});

const items = [
  { TokenId: 1, Seed: 'a1', TokenName: 'NUMBA 1' },
  { TokenId: 7, Seed: 'a7', TokenName: '' },
  { TokenId: 43, Seed: 'a43', TokenName: '' },
];

describe('NftQuickView', () => {
  beforeEach(() => {
    mockReducedMotion = false;
  });

  it('stays closed without a token', () => {
    render(
      <NftQuickView
        tokenId={null}
        items={items}
        onOpenChange={jest.fn()}
        onNavigate={jest.fn()}
        collectionTraits={collectionTraits}
      />,
    );
    expect(screen.queryByTestId('nft-quick-view')).not.toBeInTheDocument();
  });

  it('shows the artwork, the label and the trait sheet of the selected token', () => {
    render(
      <NftQuickView
        tokenId={1}
        items={items}
        onOpenChange={jest.fn()}
        onNavigate={jest.fn()}
        collectionTraits={collectionTraits}
      />,
    );
    expect(screen.getByRole('heading', { name: 'NUMBA 1' })).toBeInTheDocument();
    // The alt text is composed from the traits, not a bare number.
    const art = screen.getByAltText(
      '“NUMBA 1”, Cosmic Signature #000001: Orbit Ribbons structure, Glacial Split palette, spectral class B',
    );
    expect(art).toHaveAttribute('src', expect.stringContaining('/0xa1/images/web/full.webp'));
    // Nothing is layered over the art: the hue strip belongs to the trait sheet.
    expect(screen.getByTestId('art-frame')).not.toContainElement(
      screen.getAllByTestId('hue-strip')[0]!,
    );
    expect(screen.getAllByTestId('spectral-class-badge')[0]).toHaveTextContent('Class B');
    // A named Signature's label carries its number and its rank as caption facts, not chips.
    expect(screen.getByText('#000001')).toHaveClass('tabular-nums');
    expect(screen.getByTestId('quick-view-rank')).toHaveTextContent(
      `Rank 1 of ${collectionTraits.rarity.total}`,
    );
    expect(screen.queryByTestId('rarity-rank-chip')).not.toBeInTheDocument();
    expect(screen.getByTestId('trait-sheet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open full page/ })).toHaveAttribute(
      'href',
      '/detail/1',
    );
  });

  it('sets the title in the 24px display tier, free of the dialog title defaults', () => {
    render(
      <NftQuickView
        tokenId={1}
        items={items}
        onOpenChange={jest.fn()}
        onNavigate={jest.fn()}
        collectionTraits={collectionTraits}
      />,
    );
    const title = screen.getByRole('heading', { name: 'NUMBA 1' });
    // type-heading-2 is Clash at 24px and the display weight. tailwind-merge
    // does not know the type-* utilities, so any size, weight, leading or
    // tracking utility beside it would win in the cascade (18px bold).
    expect(title).toHaveClass('type-heading-2');
    expect(title.className).not.toMatch(
      /\b(text-(xs|sm|base|lg|xl)|font-(semibold|bold)|leading-|tracking-)/,
    );
    expect(screen.getByRole('dialog')).toHaveAccessibleName('NUMBA 1');
  });

  it('navigates with the arrow keys and buttons within the visible items', () => {
    const onNavigate = jest.fn();
    render(
      <NftQuickView
        tokenId={7}
        items={items}
        onOpenChange={jest.fn()}
        onNavigate={onNavigate}
        collectionTraits={collectionTraits}
      />,
    );
    const dialog = screen.getByTestId('nft-quick-view');
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    expect(onNavigate).toHaveBeenLastCalledWith(1);
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(onNavigate).toHaveBeenLastCalledWith(43);
    fireEvent.click(screen.getByRole('button', { name: 'Next Signature' }));
    expect(onNavigate).toHaveBeenLastCalledWith(43);
  });

  it('leaves the arrow keys to the sweep video while it has focus', () => {
    const onNavigate = jest.fn();
    render(
      <NftQuickView
        tokenId={7}
        items={items}
        onOpenChange={jest.fn()}
        onNavigate={onNavigate}
        collectionTraits={collectionTraits}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Play spectral sweep/ }));
    const video = screen.getByTestId('spectral-sweep-video');
    fireEvent.keyDown(video, { key: 'ArrowLeft' });
    fireEvent.keyDown(video, { key: 'ArrowRight' });
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('plays the sweep on request, but waits for Play under reduced motion', () => {
    const view = (
      <NftQuickView
        tokenId={1}
        items={items}
        onOpenChange={jest.fn()}
        onNavigate={jest.fn()}
        collectionTraits={collectionTraits}
      />
    );
    const { unmount } = render(view);
    fireEvent.click(screen.getByRole('button', { name: /Play spectral sweep/ }));
    expect(screen.getByTestId('spectral-sweep-video')).toHaveAttribute('autoplay');
    unmount();

    mockReducedMotion = true;
    render(view);
    fireEvent.click(screen.getByRole('button', { name: /Play spectral sweep/ }));
    expect(screen.getByTestId('spectral-sweep-video')).not.toHaveAttribute('autoplay');
  });

  it('names an unnamed Signature by its number once, and tags an anchored one', () => {
    render(
      <NftQuickView
        tokenId={7}
        items={[{ TokenId: 7, Seed: 'a7', TokenName: '', Staked: true }]}
        onOpenChange={jest.fn()}
        onNavigate={jest.fn()}
        collectionTraits={collectionTraits}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Cosmic Signature #000007' })).toBeInTheDocument();
    expect(screen.getAllByText(/#000007/)).toHaveLength(1);
    expect(screen.getByText('Anchored')).toBeInTheDocument();
  });

  it('disables previous at the start of the list', () => {
    render(
      <NftQuickView
        tokenId={1}
        items={items}
        onOpenChange={jest.fn()}
        onNavigate={jest.fn()}
        collectionTraits={collectionTraits}
      />,
    );
    expect(screen.getByRole('button', { name: 'Previous Signature' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next Signature' })).toBeEnabled();
  });

  it('swaps the artwork for the spectral sweep video on demand', () => {
    render(
      <NftQuickView
        tokenId={1}
        items={items}
        onOpenChange={jest.fn()}
        onNavigate={jest.fn()}
        collectionTraits={collectionTraits}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Play spectral sweep/ }));
    expect(screen.getByTestId('spectral-sweep-video')).toHaveAttribute(
      'src',
      expect.stringContaining('/videos/web/spectral_sweep.mp4'),
    );
    fireEvent.click(screen.getByRole('button', { name: /Back to artwork/ }));
    expect(screen.queryByTestId('spectral-sweep-video')).not.toBeInTheDocument();
  });

  it('closes itself before forwarding a trait selection', () => {
    const onOpenChange = jest.fn();
    const onSelectTrait = jest.fn();
    render(
      <NftQuickView
        tokenId={1}
        items={items}
        onOpenChange={onOpenChange}
        onNavigate={jest.fn()}
        collectionTraits={collectionTraits}
        onSelectTrait={onSelectTrait}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Twin Binary/ }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSelectTrait).toHaveBeenCalledWith('massBalance', 'Twin Binary');
  });

  it('explains missing traits for legacy tokens and shows a skeleton while indexing', () => {
    const { rerender } = render(
      <NftQuickView
        tokenId={43}
        items={items}
        onOpenChange={jest.fn()}
        onNavigate={jest.fn()}
        collectionTraits={collectionTraits}
      />,
    );
    expect(screen.getByText(/has not been published/)).toBeInTheDocument();
    rerender(
      <NftQuickView
        tokenId={43}
        items={items}
        onOpenChange={jest.fn()}
        onNavigate={jest.fn()}
        collectionTraits={undefined}
      />,
    );
    expect(screen.getByLabelText('Loading traits…')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    render(
      <NftQuickView
        tokenId={1}
        items={items}
        onOpenChange={jest.fn()}
        onNavigate={jest.fn()}
        collectionTraits={collectionTraits}
      />,
    );
    await checkA11y(screen.getByTestId('nft-quick-view'));
  });
});
