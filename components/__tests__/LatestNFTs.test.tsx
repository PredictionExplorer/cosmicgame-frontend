import LatestNFTs from '@/components/nft/LatestNFTs';

import { render, screen } from '@/test-utils';
import '@testing-library/jest-dom';

describe('LatestNFTs', () => {
  test('with no records', () => {
    render(<LatestNFTs />);
    expect(screen.getByText("Latest NFT's")).toBeInTheDocument();
    expect(screen.getByText('There is no NFT yet.')).toBeInTheDocument();
  });
});
