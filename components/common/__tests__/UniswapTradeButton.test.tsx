import { CST_TOKEN_ADDRESS_ARBITRUM, CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

import { render, screen, checkA11y } from '@/test-utils';

import { UniswapTradeButton } from '../UniswapTradeButton';

describe('UniswapTradeButton', () => {
  it('links to the CST swap on Uniswap for Arbitrum', () => {
    render(<UniswapTradeButton />);

    const link = screen.getByRole('link', { name: 'nav.ecosystem.uniswap.ariaLabel' });
    expect(link).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    const url = new URL(link.getAttribute('href')!);
    expect(url.hostname).toBe('app.uniswap.org');
    expect(url.pathname).toBe('/swap');
    expect(url.searchParams.get('chain')).toBe('arbitrum');
    expect(url.searchParams.get('inputCurrency')).toBe('NATIVE');
    expect(url.searchParams.get('outputCurrency')).toBe(CST_TOKEN_ADDRESS_ARBITRUM);
  });

  it('supports compact visual copy while keeping the full accessible name', () => {
    render(<UniswapTradeButton variant="compact" />);

    const link = screen.getByRole('link', { name: 'nav.ecosystem.uniswap.ariaLabel' });
    expect(link).toHaveTextContent('nav.ecosystem.uniswap.shortLabel');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniswapTradeButton />);
    await checkA11y(container);
  });
});
