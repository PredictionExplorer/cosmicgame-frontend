import '@testing-library/jest-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { PAGE_SECTIONS } from '@/components/layout/pageSections';

import { render, screen, within, checkA11y } from '@/test-utils';

/** The next-intl test mock renders `common` strings as their keys. */
const HOME = 'common.breadcrumbs.home';
const section = (id: string) => `common.pageHeader.sections.${id}`;

describe('PageHeader', () => {
  it('renders one H1 and the lede', () => {
    render(<PageHeader title="Allocation" subtitle="Recipients for current cycle" />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/allocation/i);
    expect(screen.getByText(/recipients for current cycle/i)).toBeInTheDocument();
  });

  it('sets one H1 size per template: display-sm for data pages, display-md for reading pages', () => {
    const { rerender } = render(<PageHeader title="Named NFTs" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('type-display-sm');
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveClass('type-display-lg');

    rerender(<PageHeader title="Terms of Service" variant="reading" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('type-display-md');
  });

  describe('wayfinding', () => {
    it('names the section in the eyebrow, linked to its hub', () => {
      render(<PageHeader section="collection" title="Named Cosmic Signature NFTs" />);
      expect(screen.getByRole('link', { name: section('collection') })).toHaveAttribute(
        'href',
        PAGE_SECTIONS.collection.hub,
      );
      expect(screen.queryByRole('navigation', { name: /breadcrumb/i })).not.toBeInTheDocument();
    });

    it('does not link a hub to itself', () => {
      render(<PageHeader section="collection" sectionHub title="Gallery" />);
      expect(screen.getByText(section('collection'))).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: section('collection') })).toBeNull();
    });

    it('drops the eyebrow of a hub titled with its section name', () => {
      // The catalog mock answers with keys, so a title equal to the key is the echo.
      render(<PageHeader section="admin" sectionHub title={section('admin')} />);
      expect(screen.getAllByText(section('admin'))).toHaveLength(1);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(section('admin'));
    });

    it('builds a record page trail as Home › section › parents, the H1 naming the page', () => {
      render(
        <PageHeader
          section="records"
          breadcrumbs={[{ label: 'Cycle #2', href: '/allocation/2' }]}
          title="Gesture #1135"
        />,
      );
      const nav = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
      const links = within(nav).getAllByRole('link');
      expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
        [HOME, '/'],
        [section('records'), PAGE_SECTIONS.records.hub],
        ['Cycle #2', '/allocation/2'],
      ]);
      // The trail replaces the eyebrow: the section appears once.
      expect(screen.getAllByText(section('records'))).toHaveLength(1);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gesture #1135');
    });

    it('skips the section crumb when the section hub is Home or already in the trail', () => {
      const { rerender } = render(
        <PageHeader section="participate" breadcrumbs={[]} title="Contribution #12" />,
      );
      let nav = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
      expect(within(nav).getAllByRole('link')).toHaveLength(1);

      rerender(
        <PageHeader
          section="insights"
          breadcrumbs={[
            { label: 'Statistics', href: '/statistics' },
            { label: 'Participation', href: '/statistics/participation' },
          ]}
          title="0xA169…63B6"
        />,
      );
      nav = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
      expect(
        within(nav)
          .getAllByRole('link')
          .map((link) => link.getAttribute('href')),
      ).toEqual(['/', '/statistics', '/statistics/participation']);
    });

    it('keeps legacy trails working: a leading Home crumb and a current-page crumb', () => {
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
      // The shared Home label replaces the caller's.
      expect(within(nav).getByRole('link', { name: HOME })).toHaveAttribute('href', '/');
      expect(within(nav).queryByRole('link', { name: 'Home' })).toBeNull();
      expect(within(nav).getByRole('link', { name: 'Allocation' })).toHaveAttribute(
        'href',
        '/allocation',
      );
      expect(within(nav).getByText('Cycle #42')).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/cycle #42 details/i);
    });

    it('still renders a custom eyebrow', () => {
      render(<PageHeader eyebrow="Live · Cycle 42" title="Allocation Tracks" />);
      expect(screen.getByText(/live · cycle 42/i)).toBeInTheDocument();
    });
  });

  describe('figures', () => {
    it('renders the summary as one definition list, label over value', () => {
      render(
        <PageHeader
          title="Named NFTs"
          figures={[
            { id: 'named', label: 'Named', value: '3' },
            { id: 'imprinted', label: 'Imprinted', value: '48', caption: 'this cycle' },
          ]}
        />,
      );
      const figure = document.querySelector('[data-figure="imprinted"]');
      expect(figure).not.toBeNull();
      expect(within(figure as HTMLElement).getByText('Imprinted').tagName).toBe('DT');
      expect(within(figure as HTMLElement).getByText('48').tagName).toBe('DD');
      expect(within(figure as HTMLElement).getByText('this cycle')).toBeInTheDocument();
    });

    it('renders an unknown figure as a dash announced as unavailable, never as zero', () => {
      render(
        <PageHeader title="Ledger" figures={[{ id: 'total', label: 'Total', value: null }]} />,
      );
      const value = document.querySelector('[data-figure="total"] dd');
      expect(value).toHaveTextContent('—');
      expect(value).toHaveTextContent('common.status.unavailable');
      expect(value).not.toHaveTextContent(/\d/);
    });

    it('names each figure info button after its label', () => {
      render(
        <PageHeader
          title="Ledger"
          figures={[{ id: 'total', label: 'Total ETH', value: '1', info: 'The sum.' }]}
        />,
      );
      expect(
        screen.getByRole('button', { name: 'More information about Total ETH' }),
      ).toBeInTheDocument();
    });
  });

  it('renders meta, actions and related pages', () => {
    render(
      <PageHeader
        title="Allocation"
        meta={<span data-testid="meta">Snapshot</span>}
        actions={<button data-testid="act">Refresh</button>}
        related={[
          { href: '/statistics', label: 'Statistics' },
          { href: 'https://cosmicsignature.com/learn', label: 'Learn' },
        ]}
        relatedLabel="Allocation related pages"
      />,
    );
    expect(screen.getByTestId('meta')).toBeInTheDocument();
    expect(screen.getByTestId('act')).toBeInTheDocument();
    const related = screen.getByRole('navigation', { name: 'Allocation related pages' });
    expect(within(related).getByRole('link', { name: 'Statistics' })).toHaveAttribute(
      'href',
      '/statistics',
    );
    expect(within(related).getByRole('link', { name: 'Learn' })).toHaveAttribute(
      'href',
      'https://cosmicsignature.com/learn',
    );
  });

  it('gives the H1 an id for aria-labelledby', () => {
    render(<PageHeader title="Allocation" titleId="allocation-heading" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'allocation-heading');
  });

  it('keeps the deprecated title level and gradient props working', () => {
    const { rerender } = render(<PageHeader title="Summary" titleLevel={2} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('type-display-sm');
    rerender(<PageHeader title="Nebula" gradientTitle="nebula" />);
    expect(screen.getByText('Nebula')).toHaveClass('text-gradient-nebula');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PageHeader
        section="records"
        breadcrumbs={[{ label: 'Allocation Recipients', href: '/allocation' }]}
        title="Cycle #1"
        subtitle="Recipients"
        figures={[
          { id: 'eth', label: 'ETH', value: '1.0000', info: 'Signature Allocation ETH.' },
          { id: 'gestures', label: 'Gestures', value: null },
        ]}
        meta={<span>Snapshot</span>}
        related={[{ href: '/statistics', label: 'Statistics' }]}
      />,
    );
    await checkA11y(container);
  });
});
