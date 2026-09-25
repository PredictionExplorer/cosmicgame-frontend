import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';

import { render, screen, checkA11y } from '@/test-utils';

import { NftMarketplaceButton } from '../NftMarketplaceButton';

describe('NftMarketplaceButton', () => {
  it('links to the Axiom Zero marketplace with safe external attributes', () => {
    render(<NftMarketplaceButton />);

    const link = screen.getByRole('link', { name: /^nav\.ecosystem\.axiomZero\.defaultLabel/ });
    expect(link).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    const url = new URL(link.getAttribute('href')!);
    expect(url.hostname).toBe('www.axiomzero.market');
    expect(url.pathname).toBe('/cosmic-signature');
  });

  it('is named by its visible label, and says it opens a new tab (WCAG 2.5.3)', () => {
    render(<NftMarketplaceButton />);

    const link = screen.getByRole('link', {
      name: 'nav.ecosystem.axiomZero.defaultLabel nav.link.newTab',
    });
    expect(link).not.toHaveAttribute('aria-label');
  });

  it('uses the page-header label in the Signature action row', () => {
    render(<NftMarketplaceButton variant="action" />);

    expect(
      screen.getByRole('link', { name: /^nav\.ecosystem\.axiomZero\.defaultLabel/ }),
    ).toHaveTextContent('nav.ecosystem.axiomZero.defaultLabel');
  });

  it('supports compact visual copy while keeping the full accessible name', () => {
    render(<NftMarketplaceButton variant="compact" />);

    const link = screen.getByRole('link', { name: 'nav.ecosystem.axiomZero.ariaLabel' });
    expect(link).toHaveTextContent('nav.ecosystem.axiomZero.shortLabel');
  });

  it('names Axiom Zero in the menu variant', () => {
    render(<NftMarketplaceButton variant="menu" />);

    const link = screen.getByRole('link', { name: 'nav.ecosystem.axiomZero.ariaLabel' });
    expect(link).toHaveTextContent('nav.ecosystem.axiomZero.menuLabel');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NftMarketplaceButton />);
    await checkA11y(container);
  });
});
