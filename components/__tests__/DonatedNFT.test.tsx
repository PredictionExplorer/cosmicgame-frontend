import '@testing-library/jest-dom';

import { networkConfig } from '@/config/networks';
import AttachedNFT from '@/components/attachments/AttachedNFT';
import { buildOpenSeaAssetUrl } from '@/components/attachments/attachedNftLinks';

import { act, renderWithQuery, screen, waitFor, checkA11y } from '@/test-utils';

const mockUseAttachedNftMetadata = jest.fn();
jest.mock('../attachments/useAttachedNftMetadata', () => ({
  useAttachedNftMetadata: (...args: unknown[]) => mockUseAttachedNftMetadata(...args),
}));

describe('AttachedNFT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAttachedNftMetadata.mockReturnValue({ data: null, isError: false });
  });

  test('with mock data', async () => {
    const mockImageUrl = 'https://example.com/nft-image.png';
    mockUseAttachedNftMetadata.mockReturnValue({
      data: { image: mockImageUrl, external_url: 'https://example.com' },
      isError: false,
    });

    const mockData = {
      RecordId: 45,
      EvtLogId: 8344,
      BlockNum: 71466,
      TxId: 2501,
      TxHash: '0x6bdec78d3c7d4350a4a57c8adff7c10be92c8eb8e5d3126579475e75a0ef7769',
      TimeStamp: 1694627573,
      DateTime: '2023-09-13T17:52:53Z',
      RoundNum: 23,
      DonorAid: 10,
      DonorAddr: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      TokenAddressId: 27,
      TokenAddr: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
      NFTTokenId: 13000081,
      NFTTokenURI: 'https://token.artblocks.io/13000081',
      Index: 44,
    };
    renderWithQuery(<AttachedNFT nft={mockData} />);
    // Without a name in its metadata, the work is titled by its number.
    expect(screen.getByText(`#${mockData.NFTTokenId}`)).toBeInTheDocument();

    await waitFor(() => {
      const src = screen.getByAltText('Attached NFT').getAttribute('src') ?? '';
      // Next/Image rewrites through /_next/image?url=... — decode to compare.
      const decoded = new URL(src, 'http://localhost').searchParams.get('url') ?? src;
      expect(decoded).toEqual(mockImageUrl);
    });
    // The card links to OpenSea, from the recorded contract and token; the
    // metadata's own site follows as a secondary link that names its host.
    expect(screen.getByRole('link', { name: /View attached NFT/i })).toHaveAttribute(
      'href',
      buildOpenSeaAssetUrl(mockData.TokenAddr, mockData.NFTTokenId, networkConfig.chainId),
    );
    expect(screen.getByRole('link', { name: /example\.com/ })).toHaveAttribute(
      'href',
      'https://example.com/',
    );
    expect(screen.getByText('Project site')).toBeInTheDocument();
  });

  it('names the collection by its contract in the one address style', () => {
    mockUseAttachedNftMetadata.mockReturnValue({
      data: { name: 'Rexy #3114', contract_name: 'Rexy' },
      isError: false,
    });
    renderWithQuery(
      <AttachedNFT
        nft={{ TokenAddr: '0xDA012c97a03fC9cec6e080F186C0259E3ED2E31D', NFTTokenId: 3114 }}
      />,
    );
    expect(
      screen.getByTitle('Rexy · 0xDA012c97a03fC9cec6e080F186C0259E3ED2E31D'),
    ).toHaveTextContent(/^Rexy$/);
  });

  it('shows a contract without a known name as a shortened address, never as a link', () => {
    mockUseAttachedNftMetadata.mockReturnValue({ data: { name: 'Untitled' }, isError: false });
    const { container } = renderWithQuery(
      <AttachedNFT
        nft={{ TokenAddr: '0xDA012c97a03fC9cec6e080F186C0259E3ED2E31D', NFTTokenId: 1 }}
      />,
    );
    const hex = screen.getByTitle('0xDA012c97a03fC9cec6e080F186C0259E3ED2E31D');
    expect(hex).toHaveTextContent(/^0xDA01…/);
    // One link per card: nothing nested inside it.
    expect(container.querySelectorAll('a a')).toHaveLength(0);
  });

  it('reads the Random Walk contract by its name, not its on-chain symbol', () => {
    mockUseAttachedNftMetadata.mockReturnValue({
      data: { name: 'Random Walk #004079', contract_name: 'RandomWalkNFT' },
      isError: false,
    });
    renderWithQuery(
      <AttachedNFT
        nft={{ TokenAddr: '0x895a6F444BE4ba9d124F61DF736605792B35D66b', NFTTokenId: 4079 }}
      />,
    );
    // The /contracts name from the formats catalog (a raw key in this harness).
    expect(screen.getByText('formats.address.known.randomWalk')).toBeInTheDocument();
    expect(screen.queryByText('RandomWalkNFT')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseAttachedNftMetadata.mockReturnValue({
      data: { image: 'https://example.com/nft.png', external_url: 'https://example.com' },
      isError: false,
    });

    const mockData = {
      RecordId: 1,
      EvtLogId: 1,
      BlockNum: 1,
      TxId: 1,
      TxHash: '0xabc',
      TimeStamp: 1701346718,
      DateTime: '2023-11-30T12:18:38Z',
      RoundNum: 1,
      DonorAid: 1,
      DonorAddr: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      TokenAddressId: 1,
      TokenAddr: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
      NFTTokenId: 1,
      NFTTokenURI: 'https://token.artblocks.io/1',
      Index: 0,
    };
    let container: HTMLElement;
    await act(async () => {
      const result = renderWithQuery(<AttachedNFT nft={mockData} />);
      container = result.container;
    });
    await checkA11y(container!);
  });

  it('falls back to a safe link and placeholder when metadata fails', async () => {
    mockUseAttachedNftMetadata.mockReturnValue({ data: null, isError: true });

    const mockData = {
      RecordId: 1,
      EvtLogId: 1,
      BlockNum: 1,
      TxId: 1,
      TxHash: '0xabc',
      TimeStamp: 1701346718,
      DateTime: '2023-11-30T12:18:38Z',
      RoundNum: 1,
      DonorAddr: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      TokenAddr: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
      NFTTokenId: 1,
      NFTTokenURI: 'https://token.artblocks.io/1',
      Index: 0,
    };

    renderWithQuery(<AttachedNFT nft={mockData} />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /View attached NFT 1/i })).toHaveAttribute(
        'href',
        buildOpenSeaAssetUrl(mockData.TokenAddr, mockData.NFTTokenId, networkConfig.chainId),
      );
    });
    expect(screen.getByText('#1')).toBeInTheDocument();
    // The plate keeps its square frame and says the image is unavailable.
    expect(screen.getByTestId('pending-plate')).toBeInTheDocument();
  });
});
