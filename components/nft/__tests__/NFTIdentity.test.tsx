import { TOKEN_1_METADATA_V2 } from '@/lib/nftMetadata/__fixtures__/metadata';
import { normalizeTraitEntry, parseCosmicSignatureMetadata } from '@/lib/nftMetadata';

import { render, screen, checkA11y, within } from '@/test-utils';

import { NFTIdentity } from '../NFTIdentity';

const entry = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!)!;
const nft = {
  TimeStamp: 1700000000,
  TxHash: '0xabc',
  WinnerAddr: '0x1111111111111111111111111111111111111111',
  CurOwnerAddr: '0x2222222222222222222222222222222222222222',
  RoundNum: 1,
  Staked: false,
  WasUnstaked: false,
};

describe('NFTIdentity', () => {
  it('reads like a wall label: name, then number, structure and palette', () => {
    render(<NFTIdentity tokenId={25} name="Twisted Mind" nft={nft} entry={entry} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Twisted Mind' })).toBeInTheDocument();
    const meta = screen.getByText('#000025').closest('p')!;
    expect(meta).toHaveTextContent('#000025·Orbit Ribbons·Glacial Split');
    // The number is set like the rest of the label, not in the code face.
    expect(screen.getByText('#000025')).toHaveClass('tabular-nums');
    // The unlabelled hue strip belongs to the Palette tile, not the label.
    expect(screen.queryByTestId('hue-strip')).toBeNull();
    expect(screen.getByTestId('nft-spec-list')).toBeInTheDocument();
  });

  it('sets the H1 through the header, with no display class of its own', () => {
    const { container } = render(
      <NFTIdentity tokenId={25} name="Twisted Mind" titleId="token-title" nft={nft} />,
    );
    const heading = screen.getByRole('heading', { level: 1, name: 'Twisted Mind' });
    expect(heading).toHaveAttribute('id', 'token-title');
    expect(heading).toHaveClass('type-display-sm');
    // A wrapper carrying a display class would be checked for the display face.
    expect(container.querySelector('header[class*="type-display"]')).toBeNull();
  });

  it('gives an unnamed Signature a graceful title without repeating its number', () => {
    render(<NFTIdentity tokenId={7} name={null} nft={nft} entry={entry} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cosmic Signature #000007' }),
    ).toBeInTheDocument();
    const breadcrumb = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
    expect(
      within(breadcrumb).getByRole('link', { name: 'common.breadcrumbs.gallery' }),
    ).toHaveAttribute('href', '/gallery');
    expect(screen.getAllByText(/#000007/)).toHaveLength(1);
  });

  it('places the quiet action row after the ledger', () => {
    render(
      <NFTIdentity
        tokenId={25}
        name="Twisted Mind"
        nft={nft}
        actions={<button type="button">Share</button>}
      />,
    );
    const ledger = screen.getByTestId('nft-spec-list');
    const share = screen.getByRole('button', { name: 'Share' });
    expect(ledger.compareDocumentPosition(share) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <NFTIdentity tokenId={25} name="Twisted Mind" nft={nft} entry={entry} />,
    );
    await checkA11y(container);
  });
});
