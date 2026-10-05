import { emptyContractAddresses, publishDashboardContractAddresses } from '@/config/networks';
import { TOKEN_1_METADATA_V2 } from '@/lib/nftMetadata/__fixtures__/metadata';
import { normalizeTraitEntry, parseCosmicSignatureMetadata } from '@/lib/nftMetadata';

import { render, screen, fireEvent, checkA11y, within, waitFor } from '@/test-utils';

import { NFTSeed, NFTSpecList, type NFTLedgerRecord } from '../NFTMetadata';

jest.mock('../../../utils', () => ({
  getExplorerUrl: (type: string, hash: string) => `https://explorer/${type}/${hash}`,
  getRelativeTime: (ts: number) => `rel-${ts}`,
}));

const fullNft: NFTLedgerRecord = {
  TimeStamp: 1700000000,
  TxHash: '0xABC',
  WinnerAddr: '0x1111111111111111111111111111111111111111',
  CurOwnerAddr: '0x2222222222222222222222222222222222222222',
  RecordType: 3,
  RoundNum: 42,
  Staked: false,
  WasUnstaked: false,
};

const entry = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!)!;

function row(testId: string) {
  return screen.getByTestId(testId);
}

describe('NFTSpecList', () => {
  afterEach(() => {
    publishDashboardContractAddresses(emptyContractAddresses());
  });

  it('lists the provenance as label / value rows of one ledger', () => {
    render(<NFTSpecList nft={fullNft} />);
    const list = screen.getByTestId('nft-spec-list');
    expect(list.tagName).toBe('DL');
    expect(within(row('spec-cycle')).getByRole('term')).toHaveTextContent('detail.metadata.cycle');
    expect(within(row('spec-imprinted')).getByRole('term')).toHaveTextContent(
      'detail.metadata.imprinted',
    );
  });

  it('links the cycle to its allocation page, marked as a link at rest', () => {
    render(<NFTSpecList nft={fullNft} />);
    const cycle = within(row('spec-cycle')).getByRole('link', {
      name: 'detail.metadata.roundNumber(round=42)',
    });
    expect(cycle).toHaveAttribute('href', '/allocation/42');
    // The quiet underline only shows on hover, so a trailing arrow says it leads on.
    expect(cycle.querySelector('svg.lucide-arrow-right')).not.toBeNull();
  });

  it('links the imprint date to its transaction and ages it once the time is known', async () => {
    render(<NFTSpecList nft={fullNft} />);
    const imprinted = row('spec-imprinted');
    const link = within(imprinted).getByRole('link');
    expect(link).toHaveAttribute('href', 'https://explorer/tx/0xABC');
    expect(within(link).getByText(/2023/)).toHaveAttribute('dateTime');
    await waitFor(() => expect(imprinted).toHaveTextContent('rel-1700000000'));
  });

  it('names the allocation from the traits, else from the record type', () => {
    const { rerender } = render(<NFTSpecList nft={fullNft} entry={entry} />);
    // The glossary's name for the metadata's "Last CST Gesture" (as on every other page).
    expect(row('spec-allocation')).toHaveTextContent('Final CST Gesture');
    rerender(<NFTSpecList nft={fullNft} />);
    expect(row('spec-allocation')).toHaveTextContent('detail.badges.cycleRecipient');
    rerender(<NFTSpecList nft={{ ...fullNft, RecordType: 5 }} />);
    expect(screen.queryByTestId('spec-allocation')).not.toBeInTheDocument();
  });

  it('shows the recipient and owner as address chips', () => {
    render(<NFTSpecList nft={fullNft} />);
    expect(within(row('spec-recipient')).getByRole('link')).toHaveAttribute(
      'href',
      `/user/${fullNft.WinnerAddr}`,
    );
    expect(within(row('spec-owner')).getByRole('link')).toHaveAttribute(
      'href',
      `/user/${fullNft.CurOwnerAddr}`,
    );
  });

  it('lets a protocol contract’s name wrap instead of cutting it short', () => {
    publishDashboardContractAddresses({
      ...emptyContractAddresses(),
      charity: fullNft.CurOwnerAddr!,
    });
    render(<NFTSpecList nft={fullNft} />);
    const name = within(row('spec-owner')).getByText('formats.address.known.publicGoods');
    expect(name).not.toHaveClass('truncate');
  });

  it('shows the rarity rank with the rarest trait when the collection is indexed', () => {
    render(
      <NFTSpecList
        nft={fullNft}
        rarity={{
          id: 1,
          rank: 4,
          score: 9,
          rarest: { key: 'accent', value: 'Stipple Constellation', count: 1, share: 0.02 },
        }}
        rarityTotal={48}
      />,
    );
    expect(row('spec-rarity')).toHaveTextContent('Rank 4 of 48');
    expect(row('spec-rarity')).toHaveTextContent('Rarest trait · Stipple Constellation');
  });

  it('states anchoring in a neutral tone and links eligible tokens to anchoring', () => {
    const { rerender } = render(<NFTSpecList nft={fullNft} />);
    const eligible = within(row('spec-anchoring')).getByRole('link', {
      name: 'detail.badges.eligibleForAnchoring',
    });
    expect(eligible).toHaveAttribute('href', '/anchoring');
    expect(eligible.querySelector('svg.lucide-arrow-right')).not.toBeNull();

    rerender(<NFTSpecList nft={{ ...fullNft, Staked: true }} />);
    const anchored = within(row('spec-anchoring')).getByText('detail.badges.alreadyAnchored');
    expect(anchored.className).not.toMatch(/red|critical|destructive/);
    expect(row('spec-anchoring').innerHTML).not.toMatch(/red-|critical|destructive/);

    rerender(<NFTSpecList nft={{ ...fullNft, WasUnstaked: true }} />);
    expect(row('spec-anchoring')).toHaveTextContent('detail.badges.alreadyAnchored');
  });

  it('reads unknown values as unknown, never as a blank', () => {
    render(<NFTSpecList nft={{}} />);
    for (const id of ['spec-cycle', 'spec-imprinted', 'spec-recipient', 'spec-owner']) {
      expect(row(id)).toHaveTextContent('—');
      expect(row(id)).toHaveTextContent('common.status.unavailable');
    }
  });

  it('renders the ledger rows without anchoring for a missing token', () => {
    render(<NFTSpecList nft={null} />);
    expect(screen.getByTestId('nft-spec-list')).toBeInTheDocument();
    expect(screen.queryByTestId('spec-anchoring')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTSpecList nft={fullNft} entry={entry} />);
    await checkA11y(container);
  });
});

describe('NFTSeed', () => {
  it('shows the full seed in a well', () => {
    render(<NFTSeed seed="deadbeef" />);
    expect(screen.getByTestId('seed-value')).toHaveTextContent('deadbeef');
    expect(
      screen.getByRole('heading', { level: 2, name: 'detail.metadata.seed' }),
    ).toBeInTheDocument();
  });

  it('can sit inside a section as a level-3 heading', () => {
    render(<NFTSeed seed="deadbeef" headingLevel={3} />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'detail.metadata.seed' }),
    ).toBeInTheDocument();
  });

  it('copies the seed and confirms it', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    render(<NFTSeed seed="deadbeef" />);
    fireEvent.click(screen.getByRole('button', { name: 'detail.metadata.copySeed' }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('deadbeef');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'common.actions.copied' })).toBeInTheDocument(),
    );
  });

  it('never confirms a copy the browser refused', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
    });
    render(<NFTSeed seed="deadbeef" />);
    fireEvent.click(screen.getByRole('button', { name: 'detail.metadata.copySeed' }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'common.actions.copied' })).toBeNull();
  });

  it('renders nothing without a seed', () => {
    const { container } = render(<NFTSeed />);
    expect(container).toBeEmptyDOMElement();
  });
});
