import '@testing-library/jest-dom';
import axios from 'axios';

import DonatedNFT from '@/components/donations/DonatedNFT';

import { render, screen, waitFor } from '@/test-utils';

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
      expect(screen.getByAltText('nft image').getAttribute('src')).toEqual(mockImageUrl);
    });
  });
});
