import { checkA11y, render, screen } from '@/test-utils';

import SiteMapPage from '../SiteMapPage';

describe('SiteMapPage', () => {
  it('renders the page heading', () => {
    render(<SiteMapPage />);
    expect(screen.getByText('Site Map')).toBeInTheDocument();
  });

  it('renders the per-user section heading', () => {
    render(<SiteMapPage />);
    expect(screen.getByText('Per-user information')).toBeInTheDocument();
  });

  it('renders all per-user links', () => {
    render(<SiteMapPage />);
    const expectedLinks = [
      { label: 'My Tokens', href: '/my-tokens' },
      { label: 'My Unclaimed Winnings', href: '/my-winnings' },
      { label: 'History of My Winnings', href: '/winning-history' },
      { label: 'My Staking', href: '/my-staking' },
    ];
    for (const { label, href } of expectedLinks) {
      const link = screen.getByRole('link', { name: label });
      expect(link).toHaveAttribute('href', href);
    }
  });

  it('renders the system section heading', () => {
    render(<SiteMapPage />);
    expect(screen.getByText('Overall system information')).toBeInTheDocument();
  });

  it('renders all system links', () => {
    render(<SiteMapPage />);
    const expectedLinks = [
      { label: 'CosmicSignature Gallery', href: '/gallery' },
      { label: 'Rounds Played', href: '/prize' },
      { label: 'Staking Rewards', href: '/staking' },
      { label: 'Marketing Rewards', href: '/marketing' },
      { label: 'System Statistics', href: '/statistics' },
      { label: 'Contract Addresses', href: '/contracts' },
      { label: 'FAQ', href: '/faq' },
    ];
    for (const { label, href } of expectedLinks) {
      const link = screen.getByRole('link', { name: label });
      expect(link).toHaveAttribute('href', href);
    }
  });

  it('renders the correct total number of links', () => {
    render(<SiteMapPage />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(11);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SiteMapPage />);
    await checkA11y(container);
  });
});
