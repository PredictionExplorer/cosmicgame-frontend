import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';

import { render, screen, checkA11y } from '@/test-utils';

import { NftMarketplaceButton } from '../NftMarketplaceButton';

describe('NftMarketplaceButton', () => {
  it('links to the Cosmic Signature marketplace with safe external attributes', () => {
    render(<NftMarketplaceButton />);

    const link = screen.getByRole('link', { name: 'Open Cosmic Signature marketplace' });
    expect(link).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    const url = new URL(link.getAttribute('href')!);
    expect(url.hostname).toBe('www.axiomzero.market');
    expect(url.pathname).toBe('/cosmic-signature');
  });

  it('supports compact visual copy while keeping the full accessible name', () => {
    render(<NftMarketplaceButton variant="compact" />);

    const link = screen.getByRole('link', { name: 'Open Cosmic Signature marketplace' });
    expect(link).toHaveTextContent('NFT Marketplace');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NftMarketplaceButton />);
    await checkA11y(container);
  });
});
