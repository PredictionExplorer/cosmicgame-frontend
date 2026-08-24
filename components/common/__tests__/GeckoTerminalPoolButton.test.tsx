import { CST_GECKOTERMINAL_POOL_URL } from '@/config/geckoterminal';

import { render, screen, checkA11y } from '@/test-utils';

import { GeckoTerminalPoolButton } from '../GeckoTerminalPoolButton';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

describe('GeckoTerminalPoolButton', () => {
  it('links to the CST pool on GeckoTerminal with official branding', () => {
    render(<GeckoTerminalPoolButton />);

    const link = screen.getByRole('link', {
      name: 'nav.ecosystem.geckoTerminal.ariaLabel',
    });
    expect(link).toHaveAttribute('href', CST_GECKOTERMINAL_POOL_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('nav.ecosystem.geckoTerminal.shortLabel');
    expect(link.querySelector('img')).toHaveAttribute(
      'src',
      '/images/brands/geckoterminal-symbol.svg',
    );

    const url = new URL(link.getAttribute('href')!);
    expect(url.hostname).toBe('www.geckoterminal.com');
    expect(url.pathname).toBe(
      '/arbitrum/pools/0xe9a78d2e24d354522ca61548fca0dd528c823e29b5f21089c8d3f23588699b3d',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GeckoTerminalPoolButton />);
    await checkA11y(container);
  });
});
