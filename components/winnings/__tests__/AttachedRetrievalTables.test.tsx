import { checkA11y, fireEvent, renderWithQuery, screen, within } from '@/test-utils';

import { AttachedNftRetrievalTable, AttachedTokenRetrievalTable } from '../AttachedRetrievalTables';

jest.mock('../../attachments/useAttachedNftMetadata', () => ({
  useAttachedNftMetadata: () => ({ data: { name: 'Sky Study' } }),
}));
jest.mock('../../attachments/useAttachedErc20Metadata', () => ({
  useAttachedErc20Metadata: () => ({ data: { symbol: 'ARB', decimals: 18 } }),
}));

const NFT = {
  Index: 4,
  RoundNum: 1,
  TokenAddr: '0xC0fFee254729296a45a3885639AC7E10F9d54979',
  NFTTokenId: 1234,
  DonorAddr: '0x7406B34d25A9B7841CAC133E3173919e0af6Bc6c',
  TimeStamp: 1_700_000_000,
  TxHash: '0xabc',
};

const TOKEN = {
  RoundNum: 1,
  TokenAddr: '0x912CE59144191C1204E64559FE8253a0e49E6548',
  DonateClaimDiff: '25000000000000000000',
  DonateClaimDiffEth: '25',
};

describe('AttachedNftRetrievalTable', () => {
  it('names each NFT and retrieves it by its PrizesWallet index', () => {
    const onRetrieve = jest.fn();
    renderWithQuery(
      <AttachedNftRetrievalTable
        rows={[NFT]}
        ariaLabel="Attached NFTs"
        onRetrieve={onRetrieve}
        retrieving={[]}
      />,
    );
    const row = screen.getAllByRole('row')[1]!;
    expect(within(row).getByText('Sky Study')).toBeInTheDocument();
    expect(within(row).getByRole('link', { name: /ethAllocations\.cycle/ })).toHaveAttribute(
      'href',
      '/allocation/1',
    );
    fireEvent.click(within(row).getByRole('button', { name: /myPages\.attached\.retrieveItem/ }));
    expect(onRetrieve).toHaveBeenCalledWith(4);
  });

  it('holds the row button while its retrieve runs', () => {
    renderWithQuery(
      <AttachedNftRetrievalTable
        rows={[NFT]}
        ariaLabel="Attached NFTs"
        onRetrieve={jest.fn()}
        retrieving={[4]}
      />,
    );
    expect(screen.getByRole('button', { name: /myPages\.attached\.retrieveItem/ })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
});

describe('one ledger for a whole history', () => {
  it('reads retrieved rows as such, and waiting rows as not retrieved where the viewer may not retrieve', () => {
    renderWithQuery(
      <AttachedNftRetrievalTable
        rows={[NFT, { ...NFT, Index: 5, NFTTokenId: 99, Claimed: true }]}
        ariaLabel="Attached NFTs"
      />,
    );
    expect(screen.queryByRole('button', { name: /retrieveItem/ })).not.toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'myPages.ethAllocations.columns.status' }),
    ).toBeInTheDocument();
    const [, waiting, retrieved] = screen.getAllByRole('row');
    expect(waiting).toHaveTextContent('myPages.ethAllocations.status.waiting');
    expect(retrieved).toHaveTextContent('myPages.ethAllocations.status.retrieved');
  });

  it('shows a retrieved token by the amount attached, with no action', () => {
    renderWithQuery(
      <AttachedTokenRetrievalTable
        rows={[{ ...TOKEN, Claimed: true, AmountDonatedEth: 40, DonateClaimDiffEth: '0' }]}
        ariaLabel="Attached tokens"
        onRetrieve={jest.fn()}
      />,
    );
    const row = screen.getAllByRole('row')[1]!;
    expect(row).toHaveTextContent('40 ARB');
    expect(row).toHaveTextContent('myPages.ethAllocations.status.retrieved');
    expect(within(row).queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows an unreadable amount as unknown, never blank', () => {
    renderWithQuery(
      <AttachedTokenRetrievalTable
        rows={[{ ...TOKEN, DonateClaimDiffEth: undefined }]}
        ariaLabel="Attached tokens"
        onRetrieve={jest.fn()}
      />,
    );
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('common.status.unavailable');
  });
});

describe('AttachedTokenRetrievalTable', () => {
  it('shows the amount left with the token symbol and retrieves the row', async () => {
    const onRetrieve = jest.fn();
    const { container } = renderWithQuery(
      <AttachedTokenRetrievalTable
        rows={[TOKEN]}
        ariaLabel="Attached tokens"
        onRetrieve={onRetrieve}
        retrieving={['1:0x912ce59144191c1204e64559fe8253a0e49e6548']}
      />,
    );
    const row = screen.getAllByRole('row')[1]!;
    expect(row).toHaveTextContent('25 ARB');
    const button = within(row).getByRole('button', { name: /myPages\.attached\.retrieveItem/ });
    expect(button).toHaveAttribute('aria-busy', 'true');
    await checkA11y(container);
  });
});
