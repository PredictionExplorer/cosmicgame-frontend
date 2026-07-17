import '@testing-library/jest-dom';

import Footer from '@/components/layout/Footer';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';

import { render, screen, checkA11y } from '@/test-utils';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img {...props} />;
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [k: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('Footer', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  it('renders the logo', () => {
    const logo = screen.getByAltText('Cosmic Signature');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/images/logo2.svg');
  });

  it('renders copyright and CC0 colophon', () => {
    expect(screen.getByText(/footer\.copyright\(year=\d{4}\)/)).toBeInTheDocument();
    expect(screen.getByText('footer.colophon')).toBeInTheDocument();
  });

  it('renders build commit and branch when not production deploy', () => {
    const el = screen.getByTestId('build-commit');
    expect(el).toHaveTextContent('deadbee');
    expect(el).toHaveTextContent('local');
  });

  it('renders the terms link', () => {
    const termsLink = screen.getByRole('link', { name: 'footer.links.terms' });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  it('renders the privacy link', () => {
    const privacyLink = screen.getByRole('link', { name: 'footer.links.privacy' });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('renders the twitter link pointing to the correct URL', () => {
    const twitterLink = screen.getByLabelText('footer.social.twitterLabel');
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/CosmicSignature');
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the discord link pointing to the correct URL', () => {
    const discordLink = screen.getByLabelText('footer.social.discordLabel');
    expect(discordLink).toBeInTheDocument();
    expect(discordLink).toHaveAttribute('href', 'https://discord.gg/bGnPn96Qwt');
    expect(discordLink).toHaveAttribute('target', '_blank');
    expect(discordLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('sets rel="noopener noreferrer" on every target="_blank" link', () => {
    const links = document.querySelectorAll('a[target="_blank"]');
    expect(links.length).toBeGreaterThanOrEqual(4);
    links.forEach((link) => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders the new Protocol Guild external link', () => {
    const pg = screen.getByText('footer.links.protocolGuild');
    expect(pg).toBeInTheDocument();
    expect(pg).toHaveAttribute('href', 'https://protocol-guild.readthedocs.io');
    expect(pg).toHaveAttribute('target', '_blank');
  });

  it('renders the Axiom Zero marketplace link', () => {
    const marketplace = screen.getByRole('link', { name: 'footer.links.axiomZero' });
    expect(marketplace).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(marketplace).toHaveAttribute('target', '_blank');
    expect(marketplace).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the Chaos Zero predictions link', () => {
    const predictions = screen.getByRole('link', { name: 'footer.links.chaosZero' });
    expect(predictions).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
    expect(predictions).toHaveAttribute('target', '_blank');
    expect(predictions).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the Uniswap CST trade link in the Ecosystem column', () => {
    const uniswap = screen.getByRole('link', { name: 'footer.links.uniswap' });
    expect(uniswap.getAttribute('href')).toMatch(/^https:\/\/app\.uniswap\.org\//);
    expect(uniswap).toHaveAttribute('target', '_blank');
    expect(uniswap).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('provides server-rendered crawl paths for the header dropdown destinations', () => {
    // The header's Explore panel is a client-only dropdown, so these links
    // must stay present in the footer for non-JS crawlers.
    for (const href of ['/current-cycle', '/allocation', '/anchoring', '/marketing']) {
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it('renders the site map link', () => {
    const siteMapLink = screen.getByText('footer.links.siteMap');
    expect(siteMapLink).toBeInTheDocument();
    expect(siteMapLink).toHaveAttribute('href', '/site-map');
  });

  it('does not expose CST transfer or hidden outreach transfer tools', () => {
    expect(document.querySelector('a[href="/transfer-cst"]')).toBeNull();
    expect(document.querySelector('a[href="/internal/cst-outreach-transfer"]')).toBeNull();
  });

  it('wraps content in a footer element', () => {
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    await checkA11y(document.body);
  });
});
