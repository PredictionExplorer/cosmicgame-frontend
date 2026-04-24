import '@testing-library/jest-dom';
import axios from 'axios';

import DonatedNFT from '@/components/donations/DonatedNFT';

import { act, render, screen, waitFor, checkA11y } from '@/test-utils';

jest.mock('axios');

describe('DonatedNFT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('with mock data', async () => {
    const mockImageUrl = 'https://example.com/nft-image.png';
    (axios.get as jest.Mock).mockResolvedValue({
      data: { image: mockImageUrl, external_url: 'https://example.com' },
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
    render(<DonatedNFT nft={mockData} />);
    expect(screen.getByTestId('NFTTokenId')).toHaveTextContent(String(mockData.NFTTokenId));

    await waitFor(() => {
      const src = screen.getByAltText('NFT').getAttribute('src') ?? '';
      // Next/Image rewrites through /_next/image?url=... — decode to compare.
      const decoded = new URL(src, 'http://localhost').searchParams.get('url') ?? src;
      expect(decoded).toEqual(mockImageUrl);
    });
  });

  it('has no accessibility violations', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { image: 'https://example.com/nft.png', external_url: 'https://example.com' },
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
      const result = render(<DonatedNFT nft={mockData} />);
      container = result.container;
    });
    await checkA11y(container!);
  });
});
