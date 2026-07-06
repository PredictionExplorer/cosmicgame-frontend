import { ECOSYSTEM_DESTINATIONS } from '@/config/ecosystem';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

import { render, screen, checkA11y } from '@/test-utils';

import { EcosystemDock } from '../EcosystemDock';

describe('EcosystemDock', () => {
  it('renders one labelled group with all ecosystem destinations', () => {
    render(<EcosystemDock />);

    const group = screen.getByRole('group', { name: 'Cosmic Signature ecosystem' });
    const links = Array.from(group.querySelectorAll('a'));
    expect(links).toHaveLength(ECOSYSTEM_DESTINATIONS.length);
  });

  it('links Trade CST to Uniswap', () => {
    render(<EcosystemDock />);

    const link = screen.getByRole('link', { name: 'Trade CST on Uniswap' });
    expect(link).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);
    expect(link).toHaveTextContent('Trade CST');
  });

  it('links Axiom Zero to the NFT marketplace', () => {
    render(<EcosystemDock />);

    const link = screen.getByRole('link', { name: 'Axiom Zero NFT marketplace' });
    expect(link).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(link).toHaveTextContent('Axiom Zero');
  });

  it('links Chaos Zero to the prediction market', () => {
    render(<EcosystemDock />);

    const link = screen.getByRole('link', { name: 'Make predictions on Chaos Zero' });
    expect(link).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
    expect(link).toHaveTextContent('Chaos Zero');
  });

  it('opens every destination in a new tab with safe rel attributes', () => {
    render(<EcosystemDock />);

    const group = screen.getByRole('group', { name: 'Cosmic Signature ecosystem' });
    const links = Array.from(group.querySelectorAll('a'));
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('merges a custom className onto the group container', () => {
    render(<EcosystemDock className="hidden lg:flex" />);

    const group = screen.getByRole('group', { name: 'Cosmic Signature ecosystem' });
    expect(group).toHaveClass('hidden', 'lg:flex');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<EcosystemDock />);
    await checkA11y(container);
  });
});
