import '@testing-library/jest-dom';

import { formatId, getAssetsUrl } from '@/utils';

import NFT from '@/components/nft/NFT';

import { render, screen, checkA11y } from '@/test-utils';

describe('NFT', () => {
  test('with mock data', () => {
    const mockData = {
      EvtLogId: 8285,
      BlockNum: 59198,
      TimeStamp: 1694133281,
      DateTime: '2023-09-08T00:34:41Z',
      TxId: 2491,
      TxHash: '0x3b4001ea7d348cd9dd7d10fa4a7c3e73942ad7f4572031395d85f805a81ae600',
      LogIndex: 0,
      ContractAddr: '',
      TokenId: '211',
      WinnerAid: 10,
      WinnerAddr: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      CurOwnerAid: 22,
      CurOwnerAddr: '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a',
      Seed: '35e6548c4475b6e4322a3ef49c273563251f2e12cfdfb34fa034af404564839b',
      RoundNum: 21,
      RecordType: 1,
      TokenName: 'Six',
    };
    render(<NFT nft={mockData} />);

    const image = getAssetsUrl(`cosmicsignature/0x${mockData.Seed}.png`);
    const src = screen.getByAltText('NFT').getAttribute('src') ?? '';
    const decoded = new URL(src, 'http://localhost').searchParams.get('url') ?? src;
    expect(decoded).toContain(image);
    expect(screen.getByText(formatId(mockData.TokenId))).toBeInTheDocument();
    expect(screen.getByText(mockData.TokenName)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const mockData = {
      EvtLogId: 8285,
      BlockNum: 59198,
      TimeStamp: 1694133281,
      DateTime: '2023-09-08T00:34:41Z',
      TxId: 2491,
      TxHash: '0x3b4001ea7d348cd9dd7d10fa4a7c3e73942ad7f4572031395d85f805a81ae600',
      LogIndex: 0,
      ContractAddr: '',
      TokenId: '211',
      WinnerAid: 10,
      WinnerAddr: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      CurOwnerAid: 22,
      CurOwnerAddr: '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a',
      Seed: '35e6548c4475b6e4322a3ef49c273563251f2e12cfdfb34fa034af404564839b',
      RoundNum: 21,
      RecordType: 1,
      TokenName: 'Six',
    };
    const { container } = render(<NFT nft={mockData} />);
    await checkA11y(container);
  });
});
