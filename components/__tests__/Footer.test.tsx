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
    expect(screen.getByText(/\d{4} Cosmic Signature\. CC0 1\.0/)).toBeInTheDocument();
    expect(screen.getByText(/CC0 · Verified · Reproducible/i)).toBeInTheDocument();
  });

  it('renders build commit and branch when not production deploy', () => {
    const el = screen.getByTestId('build-commit');
    expect(el).toHaveTextContent('deadbee');
    expect(el).toHaveTextContent('local');
  });

  it('renders the terms link', () => {
    const termsLink = screen.getByRole('link', { name: 'Terms' });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  it('renders the privacy link', () => {
    const privacyLink = screen.getByRole('link', { name: 'Privacy' });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('renders the twitter link pointing to the correct URL', () => {
    const twitterLink = screen.getByLabelText('Twitter');
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/CosmicSignature');
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the discord link pointing to the correct URL', () => {
    const discordLink = screen.getByLabelText('Discord');
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
    const pg = screen.getByText('Protocol Guild');
    expect(pg).toBeInTheDocument();
    expect(pg).toHaveAttribute('href', 'https://protocol-guild.readthedocs.io');
    expect(pg).toHaveAttribute('target', '_blank');
  });

  it('renders the Axiom Zero marketplace link', () => {
    const marketplace = screen.getByRole('link', { name: 'Axiom Zero Marketplace' });
    expect(marketplace).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(marketplace).toHaveAttribute('target', '_blank');
    expect(marketplace).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the Chaos Zero predictions link', () => {
    const predictions = screen.getByRole('link', { name: 'Chaos Zero Predictions' });
    expect(predictions).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
    expect(predictions).toHaveAttribute('target', '_blank');
    expect(predictions).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the site map link', () => {
    const siteMapLink = screen.getByText('Site Map');
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
