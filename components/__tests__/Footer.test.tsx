import '@testing-library/jest-dom';
import { render, screen, checkA11y } from '@/test-utils';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
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

// eslint-disable-next-line import/order
import Footer from '@/components/layout/Footer';

describe('Footer', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  it('renders the logo', () => {
    const logo = screen.getByAltText('Cosmic Signature');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/images/logo2.svg');
  });

  it('renders copyright text', () => {
    expect(screen.getByText(/Cosmic Signature\. All rights reserved\./)).toBeInTheDocument();
    expect(screen.getByText(/\d{4} Cosmic Signature/)).toBeInTheDocument();
  });

  it('renders the terms link', () => {
    const termsLink = screen.getByText('Terms');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink.tagName).toBe('A');
  });

  it('renders the privacy link', () => {
    const privacyLink = screen.getByText('Privacy');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink.tagName).toBe('A');
  });

  it('renders the twitter link pointing to the correct URL', () => {
    const twitterLink = screen.getByLabelText('Twitter');
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/CosmicSignatureNFT');
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
    expect(links.length).toBe(4);
    links.forEach((link) => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders the site map link', () => {
    const siteMapLink = screen.getByText('Site Map');
    expect(siteMapLink).toBeInTheDocument();
    expect(siteMapLink).toHaveAttribute('href', '/site-map');
  });

  it('wraps content in a footer element', () => {
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    await checkA11y(document.body);
  });
});
