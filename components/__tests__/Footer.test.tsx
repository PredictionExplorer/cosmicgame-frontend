import '@testing-library/jest-dom';
import { render, screen } from '@/test-utils';

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
    const logo = screen.getByAltText('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/images/logo2.svg');
  });

  it('renders copyright text', () => {
    expect(screen.getByText(/Copyright/)).toBeInTheDocument();
    expect(screen.getByText(/2025 Cosmic Signature/)).toBeInTheDocument();
  });

  it('renders the terms and conditions link', () => {
    const termsLink = screen.getByText('Terms and conditions');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('target', '_blank');
    expect(termsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the privacy policy link', () => {
    const privacyLink = screen.getByText('Privacy policy');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('target', '_blank');
    expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the twitter link pointing to the correct URL', () => {
    const twitterLink = screen.getByLabelText('twitter');
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/CosmicSignatureNFT');
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the discord link pointing to the correct URL', () => {
    const discordLink = screen.getByLabelText('discord');
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

  it('renders the site-map link', () => {
    const siteMapLink = screen.getByLabelText('site-map');
    expect(siteMapLink).toBeInTheDocument();
    expect(siteMapLink).toHaveAttribute('href', '/site-map');
  });

  it('wraps content in a footer element', () => {
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });
});
