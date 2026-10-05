import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';

import { render, screen, checkA11y } from '@/test-utils';

import { NftMarketplaceButton } from '../NftMarketplaceButton';

describe('NftMarketplaceButton', () => {
  it('links to the Axiom Zero marketplace with safe external attributes', () => {
    render(<NftMarketplaceButton />);

    const link = screen.getByRole('link', { name: /nav\.ecosystem\.axiomZero\.label/ });
    expect(link).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    const url = new URL(link.getAttribute('href')!);
    expect(url.hostname).toBe('www.axiomzero.market');
    expect(url.pathname).toBe('/cosmic-signature');
  });

  it('has one label, and its name starts with the words it shows (WCAG 2.5.3)', () => {
    render(<NftMarketplaceButton />);
    const link = screen.getByRole('link', { name: /nav\.ecosystem\.axiomZero\.label/ });
    expect(link).not.toHaveAttribute('aria-label');
    expect(link).toHaveTextContent(/^nav\.ecosystem\.axiomZero\.label/);
    // A new tab is announced, as on every external link.
    expect(link).toHaveTextContent('nav.link.newTab');
  });

  it('has one look: an outline button, never the commit gradient or a hand-set radius', () => {
    render(<NftMarketplaceButton size="sm" />);
    const link = screen.getByRole('link', { name: /nav\.ecosystem\.axiomZero\.label/ });
    expect(link.className).not.toMatch(/rounded-full|rounded-md|text-white|gradient/);
    expect(link).toHaveClass('border-input');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NftMarketplaceButton />);
    await checkA11y(container);
  });
});
