import '@testing-library/jest-dom';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import AttachedNFTTable from '@/components/attachments/AttachedNFTTable';

import { render, screen, waitFor, fireEvent, within, checkA11y } from '@/test-utils';

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
  });

  test('with no records', () => {
    render(<AttachedNFTTable list={[]} claimingTokens={[]} />);
    expect(screen.getByText('No attached NFTs yet.')).toBeInTheDocument();
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
    render(<AttachedNFTTable list={mockData} handleClaim={jest.fn()} claimingTokens={[]} />);
    const interactive = within(screen.getAllByRole('table')[0]!);
    expect(
      interactive.getByText(convertTimestampToDateTime(mockData[0]!.TimeStamp)),
    ).toBeInTheDocument();
    expect(interactive.getByText(shortenHex(mockData[0]!.DonorAddr, 6))).toBeInTheDocument();
    expect(interactive.getByText(String(mockData[0]!.RoundNum))).toBeInTheDocument();
    expect(interactive.getByText(shortenHex(mockData[0]!.TokenAddr, 6))).toBeInTheDocument();
    expect(interactive.getByText(String(mockData[0]!.NFTTokenId))).toBeInTheDocument();

    await waitFor(() => {
      const src = screen.getByAltText('NFT').getAttribute('src') ?? '';
      const decoded = new URL(src, 'http://localhost').searchParams.get('url') ?? src;
      expect(decoded).toEqual(mockImageUrl);
    });

    expect(screen.getByTestId('Claim Button').textContent).toEqual('Claim');
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
    render(<AttachedNFTTable list={mockData} handleClaim={jest.fn()} claimingTokens={[]} />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      for (const link of links) {
        if (link.getAttribute('target') === '_blank') {
          expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        }
      }
    });
  });

  test('Claim button click calls handleClaim with token index', async () => {
    const mockHandleClaim = jest.fn();
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

    render(<AttachedNFTTable list={mockData} handleClaim={mockHandleClaim} claimingTokens={[]} />);

    await waitFor(() => {
      expect(screen.getByTestId('Claim Button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('Claim Button'));
    expect(mockHandleClaim).toHaveBeenCalledWith(0);
  });

  test('does not render Claim button for already claimed NFT donations', () => {
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
        Index: 17,
        TokenAddr: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
        NFTTokenId: 13000081,
        NFTTokenURI: 'https://token.artblocks.io/13000081',
        WinnerIndex: 44,
        WinnerAid: 10,
        WinnerAddr: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        DonorAddr: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      },
    ];

    render(<AttachedNFTTable list={mockData} handleClaim={jest.fn()} claimingTokens={[]} />);
    expect(screen.queryByTestId('Claim Button')).not.toBeInTheDocument();
  });

  test('disables Claim button while its donation index is pending', () => {
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
        Index: 17,
        TokenAddr: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
        NFTTokenId: 13000081,
        NFTTokenURI: 'https://token.artblocks.io/13000081',
        WinnerIndex: 44,
        WinnerAid: 10,
        WinnerAddr: '',
        DonorAddr: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      },
    ];

    render(<AttachedNFTTable list={mockData} handleClaim={jest.fn()} claimingTokens={[17]} />);
    expect(screen.getByTestId('Claim Button')).toBeDisabled();
    expect(screen.getByTestId('Claim Button')).toHaveTextContent('Claiming...');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AttachedNFTTable list={[]} claimingTokens={[]} />);
    await checkA11y(container);
  });
});
