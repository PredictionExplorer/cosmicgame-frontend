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
    expect(screen.getByTestId('NFTTokenId')).toHaveTextContent(String(mockData.NFTTokenId));

    await waitFor(() => {
      const src = screen.getByAltText('Attached NFT').getAttribute('src') ?? '';
      // Next/Image rewrites through /_next/image?url=... — decode to compare.
      const decoded = new URL(src, 'http://localhost').searchParams.get('url') ?? src;
      expect(decoded).toEqual(mockImageUrl);
    });
    expect(screen.getByRole('link', { name: /View attached NFT/i })).toHaveAttribute(
      'href',
      'https://example.com/',
    );
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
    expect(screen.getByTestId('NFTTokenId')).toHaveTextContent('#1');
  });
});
