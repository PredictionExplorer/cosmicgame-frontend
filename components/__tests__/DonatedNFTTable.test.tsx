import '@testing-library/jest-dom';

import { formatAddress } from '@/utils';

import AttachedNFTTable from '@/components/attachments/AttachedNFTTable';

import { render, screen, waitFor, within, checkA11y } from '@/test-utils';

const mockUseAttachedNftMetadata = jest.fn(() => ({
  data: undefined as { image?: string; external_url?: string } | undefined,
  isLoading: false,
  isError: false,
}));

jest.mock('../attachments/useAttachedNftMetadata', () => ({
  useAttachedNftMetadata: (_uri: string | null | undefined) => mockUseAttachedNftMetadata(),
}));

describe('AttachedNFTTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAttachedNftMetadata.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
  });

  test('with no records', () => {
    render(<AttachedNFTTable list={[]} />);
    expect(screen.getByText('tables.attachedAssets.nft.empty')).toBeInTheDocument();
  });

  test('with mock data', async () => {
    const mockImageUrl = 'https://example.com/nft-image.png';
    mockUseAttachedNftMetadata.mockReturnValue({
      data: { image: mockImageUrl, external_url: 'https://example.com' },
      isLoading: false,
      isError: false,
    });

    const mockData = [
      {
        RecordId: '45',
        EvtId: 0,
        BlockNum: 71474,
        TimeStamp: 1694659504,
        DateTime: '2023-09-14T02:45:04Z',
        TxId: 2509,
        TxHash: '0xb9166d0e8449d5b63993e221ae888a0a1e57cd258cd45871bb133723a0488486',
        RoundNum: 23,
        Index: 0,
        TokenAddr: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
        NFTTokenId: 13000081,
        NFTTokenURI: 'https://token.artblocks.io/13000081',
        WinnerIndex: 44,
        WinnerAid: 10,
        WinnerAddr: '',
        DonorAddr: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      },
    ];
    render(<AttachedNFTTable list={mockData} />);
    const interactive = within(screen.getAllByRole('table')[0]!);
    for (const header of [
      'tables.attachedAssets.nft.columns.datetime',
      'tables.attachedAssets.nft.columns.contributorAddress',
      'tables.attachedAssets.nft.columns.round',
      'tables.attachedAssets.nft.columns.tokenAddress',
      'tables.attachedAssets.nft.columns.tokenId',
      'tables.attachedAssets.nft.columns.tokenImage',
    ]) {
      expect(interactive.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
    expect(interactive.getByText('Sep 14, 2023, 02:45')).toBeInTheDocument();
    expect(interactive.getByText(formatAddress(mockData[0]!.DonorAddr))).toBeInTheDocument();
    expect(interactive.getByText(String(mockData[0]!.RoundNum))).toBeInTheDocument();
    expect(interactive.getByText(formatAddress(mockData[0]!.TokenAddr))).toBeInTheDocument();
    // Without a name in its metadata, the piece is titled by its number.
    expect(interactive.getByText(`#${mockData[0]!.NFTTokenId}`)).toBeInTheDocument();

    await waitFor(() => {
      // The table's image column, and the phone record's thumbnail beside the name.
      const images = screen.getAllByAltText('tables.attachedAssets.nft.imageAlt(id=13000081)');
      expect(images).toHaveLength(2);
      for (const image of images) {
        const src = image.getAttribute('src') ?? '';
        const decoded = new URL(src, 'http://localhost').searchParams.get('url') ?? src;
        expect(decoded).toEqual(mockImageUrl);
      }
    });
  });

  test('renders the localized unavailable-image state', () => {
    render(
      <AttachedNFTTable
        list={[
          {
            RecordId: '1',
            TxHash: '0xabc',
            TimeStamp: 1700000000,
            DonorAddr: '0x1111111111111111111111111111111111111111',
            RoundNum: 1,
            TokenAddr: '0x2222222222222222222222222222222222222222',
            NFTTokenId: 7,
            Index: 0,
          },
        ]}
      />,
    );

    expect(
      screen.getAllByText('tables.attachedAssets.nft.imageUnavailable').length,
    ).toBeGreaterThan(0);
  });

  test('shows a skeleton, not the unavailable state, while the metadata loads', () => {
    mockUseAttachedNftMetadata.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    render(
      <AttachedNFTTable
        list={[
          {
            RecordId: '1',
            TxHash: '0xabc',
            TimeStamp: 1700000000,
            DonorAddr: '0x1111111111111111111111111111111111111111',
            RoundNum: 1,
            TokenAddr: '0x2222222222222222222222222222222222222222',
            NFTTokenId: 7,
            NFTTokenURI: 'ipfs://bafy/7',
            Index: 0,
          },
        ]}
      />,
    );

    expect(screen.queryByText('tables.attachedAssets.nft.imageUnavailable')).toBeNull();
    for (const plate of screen.getAllByTestId('pending-plate')) {
      expect(plate).toHaveAttribute('aria-busy', 'true');
    }
  });

  test('external links have rel="noopener noreferrer"', async () => {
    mockUseAttachedNftMetadata.mockReturnValue({
      data: { image: 'https://example.com/nft.png', external_url: 'https://example.com' },
      isLoading: false,
      isError: false,
    });

    const mockData = [
      {
        RecordId: '45',
        EvtId: 0,
        BlockNum: 71474,
        TimeStamp: 1694659504,
        DateTime: '2023-09-14T02:45:04Z',
        TxId: 2509,
        TxHash: '0xb9166d0e8449d5b63993e221ae888a0a1e57cd258cd45871bb133723a0488486',
        RoundNum: 23,
        Index: 0,
        TokenAddr: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
        NFTTokenId: 13000081,
        NFTTokenURI: 'https://token.artblocks.io/13000081',
        WinnerIndex: 44,
        WinnerAid: 10,
        WinnerAddr: '',
        DonorAddr: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      },
    ];
    render(<AttachedNFTTable list={mockData} />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      for (const link of links) {
        if (link.getAttribute('target') === '_blank') {
          expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        }
      }
    });
  });

  test('is read-only: retrieving lives in the winnings retrieval ledger', () => {
    render(<AttachedNFTTable list={[]} />);
    expect(screen.queryByTestId('Claim Button')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'tables.attachedAssets.actions.claim' }),
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AttachedNFTTable list={[]} />);
    await checkA11y(container);
  });
});
