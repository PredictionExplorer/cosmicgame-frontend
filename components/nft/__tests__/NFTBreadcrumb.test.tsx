import { render, screen, checkA11y } from '@/test-utils';

import { NFTBreadcrumb } from '../NFTBreadcrumb';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('NFTBreadcrumb', () => {
  it('renders the breadcrumb navigation', () => {
    render(<NFTBreadcrumb tokenId={42} />);
    expect(screen.getByTestId('nft-breadcrumb')).toBeInTheDocument();
  });

  it('renders Home link', () => {
    render(<NFTBreadcrumb tokenId={42} />);
    const homeLink = screen.getByText('Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders Gallery link', () => {
    render(<NFTBreadcrumb tokenId={42} />);
    const galleryLink = screen.getByText('Gallery');
    expect(galleryLink).toBeInTheDocument();
    expect(galleryLink.closest('a')).toHaveAttribute('href', '/gallery');
  });

  it('shows formatted token ID when no name is provided', () => {
    render(<NFTBreadcrumb tokenId={42} />);
    expect(screen.getByText('Token #000042')).toBeInTheDocument();
  });

  it('shows token name when provided', () => {
    render(<NFTBreadcrumb tokenId={42} tokenName="My Token" />);
    expect(screen.getByText('My Token')).toBeInTheDocument();
  });

  it('has aria-label for navigation', () => {
    render(<NFTBreadcrumb tokenId={0} />);
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTBreadcrumb tokenId={42} />);
    await checkA11y(container);
  });
});
