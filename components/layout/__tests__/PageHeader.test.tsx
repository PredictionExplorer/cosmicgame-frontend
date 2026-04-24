import '@testing-library/jest-dom';

import { PageHeader } from '@/components/layout/PageHeader';

import { render, screen, checkA11y } from '@/test-utils';

describe('PageHeader', () => {
  it('renders a heading and optional subtitle', () => {
    render(<PageHeader title="Allocation" subtitle="Recipients for current cycle" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/allocation/i);
    expect(screen.getByText(/recipients for current cycle/i)).toBeInTheDocument();
  });

  it('renders breadcrumbs with home link chevron separators', () => {
    render(
      <PageHeader
        title="Cycle #42 Details"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Allocation', href: '/allocation' },
          { label: 'Cycle #42' },
        ]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /allocation/i })).toHaveAttribute(
      'href',
      '/allocation',
    );
    // Last crumb is not a link — scope the match to the breadcrumb nav
    expect(nav).toHaveTextContent('Cycle #42');
    // The h1 is distinct from the breadcrumb.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/cycle #42 details/i);
  });

  it('renders eyebrow + meta slots', () => {
    render(
      <PageHeader
        eyebrow="Live · Cycle 42"
        title="Allocation Tracks"
        meta={<span data-testid="meta">Last updated 2m ago</span>}
      />,
    );
    expect(screen.getByText(/live · cycle 42/i)).toBeInTheDocument();
    expect(screen.getByTestId('meta')).toBeInTheDocument();
  });

  it('renders actions slot', () => {
    render(<PageHeader title="Allocation" actions={<button data-testid="act">Refresh</button>} />);
    expect(screen.getByTestId('act')).toBeInTheDocument();
  });

  it('supports gradient title variant', () => {
    render(<PageHeader title="Nebula" gradientTitle="nebula" />);
    expect(screen.getByText('Nebula')).toHaveClass('text-gradient-nebula');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PageHeader
        eyebrow="Live"
        title="Allocation"
        subtitle="Recipients"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Allocation' }]}
      />,
    );
    await checkA11y(container);
  });
});
