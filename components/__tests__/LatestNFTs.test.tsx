import LatestNFTs from '@/components/nft/LatestNFTs';

import { render, screen, checkA11y } from '@/test-utils';
import '@testing-library/jest-dom';

describe('LatestNFTs', () => {
  test('with no records', () => {
    render(<LatestNFTs />);
    expect(screen.getByText('Latest NFTs')).toBeInTheDocument();
    expect(screen.getByText('No NFTs yet')).toBeInTheDocument();
    expect(
      screen.getByText('Cosmic Signature NFTs will appear here once the first round completes.'),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LatestNFTs />);
    await checkA11y(container);
  });
});
