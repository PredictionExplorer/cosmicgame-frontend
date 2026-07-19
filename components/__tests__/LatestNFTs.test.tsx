import LatestNFTs from '@/components/nft/LatestNFTs';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';

import { render, screen, checkA11y } from '@/test-utils';
import '@testing-library/jest-dom';

describe('LatestNFTs', () => {
  test('with no records shows a helpful empty state', () => {
    render(<LatestNFTs />);
    expect(screen.getByRole('heading', { name: 'home.latestNfts.title' })).toBeInTheDocument();
    expect(screen.getByText('home.latestNfts.empty.title')).toBeInTheDocument();
    expect(screen.getByText('home.latestNfts.empty.body')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'home.latestNfts.empty.cta' })).toHaveAttribute(
      'href',
      '/gallery',
    );
    expect(screen.getByRole('link', { name: 'nav.ecosystem.axiomZero.ariaLabel' })).toHaveAttribute(
      'href',
      COSMIC_SIGNATURE_MARKETPLACE_URL,
    );
  });

  test('does not use a possessive apostrophe in the heading', () => {
    render(<LatestNFTs />);
    expect(screen.queryByText("Latest NFT's")).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LatestNFTs />);
    await checkA11y(container);
  });
});
