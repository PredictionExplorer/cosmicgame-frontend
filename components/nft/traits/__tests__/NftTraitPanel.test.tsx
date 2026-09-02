import { deriveCollectionTraits } from '@/hooks/useNftTraits';
import { TOKEN_1_METADATA_V2, TOKEN_43_METADATA_V1 } from '@/lib/nftMetadata/__fixtures__/metadata';
import { normalizeTraitEntry, parseCosmicSignatureMetadata } from '@/lib/nftMetadata';

import { render, screen, checkA11y, fireEvent } from '@/test-utils';

import { NftTraitPanel } from '../NftTraitPanel';

const metadata = parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!;
const entry = normalizeTraitEntry(metadata)!;
const legacyMetadata = parseCosmicSignatureMetadata(TOKEN_43_METADATA_V1)!;
const legacyEntry = normalizeTraitEntry(legacyMetadata)!;
const collectionTraits = deriveCollectionTraits({
  version: 1,
  total: 1,
  indexed: 1,
  missing: 0,
  partial: false,
  generatedAt: '2026-09-01T00:00:00.000Z',
  entries: [entry],
});

describe('NftTraitPanel', () => {
  it('renders the composition tab by default with palette facts', () => {
    render(
      <NftTraitPanel
        tokenId={1}
        metadata={metadata}
        entry={entry}
        collectionTraits={collectionTraits}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Signature traits' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Composition' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('476 nm')).toBeInTheDocument();
    expect(screen.getByText('113.1°')).toBeInTheDocument();
  });

  it('shows the simulation record on the physics tab', () => {
    render(<NftTraitPanel tokenId={1} metadata={metadata} entry={entry} />);
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Orbital physics' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Orbital physics' }));
    expect(screen.getByText('Body masses')).toBeInTheDocument();
    expect(screen.getByLabelText('Body 3: mass 162.3')).toBeInTheDocument();
    expect(screen.getByText('Bodies 1 and 2 at distance 4.53')).toBeInTheDocument();
    expect(screen.getByText('25 crossings')).toBeInTheDocument();
    expect(screen.getByText('yoshida4')).toBeInTheDocument();
    expect(screen.getByText('Ejected at step 1,350,000')).toBeInTheDocument();
  });

  it('shows provenance facts including hashes and the rarity rank', () => {
    render(
      <NftTraitPanel
        tokenId={1}
        metadata={metadata}
        entry={entry}
        collectionTraits={collectionTraits}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Provenance' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Provenance' }));
    expect(screen.getByText('2.0.0')).toBeInTheDocument();
    expect(screen.getByText(metadata.image_details!.sha256!)).toBeInTheDocument();
    expect(screen.getByTestId('rarity-rank-chip')).toHaveTextContent('Rank 1 of 1');
    // Image and animation both publish their dimensions.
    expect(screen.getAllByText(/3456 × 2234/)).toHaveLength(2);
  });

  it('lists the media package on the media tab', () => {
    render(<NftTraitPanel tokenId={1} metadata={metadata} entry={entry} />);
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Media' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Media' }));
    expect(screen.getByRole('link', { name: 'Web image (WebP)' })).toHaveAttribute(
      'href',
      metadata.properties!.media!.web_image,
    );
    expect(screen.getByRole('link', { name: 'Spectral sweep' })).toBeInTheDocument();
  });

  it('explains missing traits for legacy documents', () => {
    render(<NftTraitPanel tokenId={43} metadata={legacyMetadata} entry={legacyEntry} />);
    expect(screen.getByText(/has not been published/)).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('shows a skeleton while loading and a retry on error', () => {
    const { rerender } = render(<NftTraitPanel tokenId={1} metadata={undefined} entry={null} />);
    expect(screen.getByLabelText('Loading traits…')).toBeInTheDocument();
    const onRetry = jest.fn();
    rerender(
      <NftTraitPanel tokenId={1} metadata={undefined} entry={null} isError onRetry={onRetry} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <NftTraitPanel
        tokenId={1}
        metadata={metadata}
        entry={entry}
        collectionTraits={collectionTraits}
      />,
    );
    await checkA11y(container);
  });
});
