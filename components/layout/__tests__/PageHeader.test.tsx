import '@testing-library/jest-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { PAGE_SECTIONS } from '@/components/layout/pageSections';

import { render, screen, within, checkA11y } from '@/test-utils';

/** The next-intl test mock renders `common` strings as their keys. */
const HOME = 'common.breadcrumbs.home';
const section = (id: string) => `nav.sections.${id}`;

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
          section="explore"
          breadcrumbs={[{ label: 'Participants', href: '/statistics/participation' }]}
          title="0xA169…63B6"
        />,
      );
      const nav = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
      const links = within(nav).getAllByRole('link');
      expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
        [HOME, '/'],
        [section('explore'), PAGE_SECTIONS.explore.hub],
        ['Participants', '/statistics/participation'],
      ]);
      // The trail replaces the eyebrow: the section appears once.
      expect(screen.getAllByText(section('explore'))).toHaveLength(1);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('0xA169…63B6');
    });

    it('leads Records, which has no single ledger page, to its part of the site map', () => {
      const { rerender } = render(<PageHeader section="records" title="Allocation Recipients" />);
      expect(screen.getByRole('link', { name: section('records') })).toHaveAttribute(
        'href',
        '/site-map#records',
      );

      rerender(
        <PageHeader
          section="records"
          breadcrumbs={[{ label: 'Allocation Recipients', href: '/allocation' }]}
          title="Cycle #2"
        />,
      );
      const nav = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
      expect(
        within(nav)
          .getAllByRole('link')
          .map((link) => link.getAttribute('href')),
      ).toEqual(['/', '/site-map#records', '/allocation']);
    });

    it('skips the section crumb when the section hub is Home or already in the trail', () => {
      const { rerender } = render(
        <PageHeader section="participate" breadcrumbs={[]} title="Contribution #12" />,
      );
      let nav = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
      expect(within(nav).getAllByRole('link')).toHaveLength(1);

      rerender(
        <PageHeader
          section="explore"
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
      expect(
        within(figure as HTMLElement)
          .getByText('Imprinted')
          .closest('dt'),
      ).not.toBeNull();
      expect(within(figure as HTMLElement).getByText('48').tagName).toBe('DD');
      expect(within(figure as HTMLElement).getByText('this cycle')).toBeInTheDocument();
    });

    it('keeps a long figure at figure-md where counts step up to figure-lg', () => {
      render(
        <PageHeader
          title="Ledger"
          figures={[
            { id: 'count', label: 'Changes', value: '3' },
            { id: 'date', label: 'Changed', value: 'Aug 06, 2026, 04:44', size: 'md' },
          ]}
        />,
      );
      const value = (id: string) => document.querySelector(`[data-figure="${id}"] dd`);
      expect(value('count')).toHaveClass('type-figure-md', 'lg:type-figure-lg');
      expect(value('date')).toHaveClass('type-figure-md');
      expect(value('date')).not.toHaveClass('lg:type-figure-lg');
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

    it('keeps the label its own text node, so an exact-text lookup finds it beside an info button', () => {
      render(
        <PageHeader
          title="Statistics"
          figures={[{ id: 'balance', label: 'Contract Balance', value: '1', info: 'ETH held.' }]}
        />,
      );
      const label = screen.getByText('Contract Balance', { exact: true });
      expect(label.textContent).toBe('Contract Balance');
      expect(label.closest('dt')).not.toBeNull();
    });

    it('shows an unknown figure as a dash with a visible "Unavailable" heard only once', () => {
      render(
        <PageHeader title="Ledger" figures={[{ id: 'total', label: 'Total', value: null }]} />,
      );
      const value = document.querySelector('[data-figure="total"] dd') as HTMLElement;
      // Heard once, from the dash's sr-only label; the visible word is generated content.
      expect(value).toHaveTextContent(/^—common\.status\.unavailable$/);
      const caption = value.querySelector('[data-caption]');
      expect(caption).toHaveAttribute('data-caption', 'common.status.unavailable');
      expect(caption).toHaveAttribute('aria-hidden', 'true');
      expect(caption).toHaveClass('after:content-[attr(data-caption)]');
    });

    it('puts full-width figures after the pairs on phones, or lists every figure as rows', () => {
      const figure = (id: string, size?: 'md') => ({ id, label: id, value: '1', size });
      const { rerender } = render(
        <PageHeader
          title="Record"
          figures={[figure('amount'), figure('cycle'), figure('from', 'md'), figure('date', 'md')]}
        />,
      );
      expect(document.querySelector('dl')).toHaveAttribute('data-layout', 'grid');
      expect(document.querySelector('[data-figure="from"]')).toHaveClass(
        'max-sm:order-last',
        'max-sm:col-span-2',
      );
      expect(document.querySelector('[data-figure="amount"]')).not.toHaveClass('max-sm:col-span-2');

      // Three paired figures would leave a hole beside the third.
      rerender(
        <PageHeader
          title="Ledger"
          figures={[figure('records'), figure('total'), figure('share'), figure('latest', 'md')]}
        />,
      );
      expect(document.querySelector('dl')).toHaveAttribute('data-layout', 'rows');
    });

    it('keeps a wrapped value at the end edge of its phone row', () => {
      const figure = (id: string) => ({ id, label: id, value: '1' });
      render(<PageHeader title="Ledger" figures={['a', 'b', 'c'].map(figure)} />);
      expect(document.querySelector('[data-figure="a"] dd')).toHaveClass(
        'max-sm:ms-auto',
        'max-sm:text-right',
      );
    });

    it('shares label, value and caption rows across figures, so values align however labels wrap', () => {
      render(
        <PageHeader
          title="Ledger"
          figures={[
            { id: 'a', label: 'A label long enough to wrap', value: '1' },
            { id: 'b', label: 'B', value: '2' },
          ]}
        />,
      );
      for (const id of ['a', 'b']) {
        expect(document.querySelector(`[data-figure="${id}"]`)).toHaveClass(
          'grid-rows-subgrid',
          'row-span-3',
        );
        expect(document.querySelector(`[data-figure="${id}"] dd`)).toHaveClass('self-baseline');
      }
    });

    it('lists an odd count as rows on phones, so no grid cell is left empty', () => {
      const figure = (id: string) => ({ id, label: id.toUpperCase(), value: '1' });
      const { rerender } = render(
        <PageHeader title="Ledger" figures={['a', 'b', 'c'].map(figure)} />,
      );
      expect(document.querySelector('dl')).toHaveAttribute('data-layout', 'rows');
      expect(document.querySelector('dl')).toHaveClass('grid-cols-1', 'sm:grid-cols-3');

      rerender(<PageHeader title="Ledger" figures={['a', 'b', 'c', 'd'].map(figure)} />);
      expect(document.querySelector('dl')).toHaveAttribute('data-layout', 'grid');
      expect(document.querySelector('dl')).toHaveClass('grid-cols-2', 'sm:grid-cols-4');
    });

    it('makes an explained label its own trigger, named after the label, with no info icon', () => {
      render(
        <PageHeader
          title="Ledger"
          figures={[{ id: 'total', label: 'Total ETH', value: '1', info: 'The sum.' }]}
        />,
      );
      const trigger = screen.getByRole('button', { name: 'More information about Total ETH' });
      expect(trigger.tagName).toBe('SPAN');
      expect(trigger).toHaveTextContent('Total ETH');
      expect(trigger).toHaveAccessibleDescription('The sum.');
      expect(document.querySelector('[data-slot="info-tooltip"]')).toBeNull();
    });

    it('gives an explained label a 44px touch pad on phones without growing the row', () => {
      render(
        <PageHeader
          title="Ledger"
          figures={[{ id: 'total', label: 'Total ETH', value: '1', info: 'The sum.' }]}
        />,
      );
      const trigger = screen.getByRole('button', { name: 'More information about Total ETH' });
      // The mobile tap-target audit measures the pad the attribute declares.
      expect(trigger).toHaveAttribute('data-touch-target', 'extended');
      expect(trigger).toHaveClass('relative', 'after:h-11', 'after:w-11', 'sm:after:hidden');
      // The value is positioned after it, so a linked value stays above the pad.
      expect(document.querySelector('[data-figure="total"] dd')).toHaveClass('max-sm:relative');
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

  it('keeps related pages off phones and draws them on the control radius', () => {
    render(
      <PageHeader
        title="Allocation"
        related={[{ href: '/statistics', label: 'Statistics' }]}
        relatedLabel="Related"
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Related' })).toHaveClass('max-sm:hidden');
    const chip = screen.getByRole('link', { name: 'Statistics' });
    expect(chip).toHaveClass('rounded-control', 'pointer-coarse:min-h-11');
    expect(chip).not.toHaveClass('rounded-pill');
  });

  it('never clamps the lede of a reading page', () => {
    const { rerender } = render(<PageHeader title="Risk" subtitle="The disclosure." />);
    expect(screen.getByText('The disclosure.')).toHaveAttribute('data-lede-fit');
    rerender(<PageHeader title="Risk" variant="reading" subtitle="The disclosure." />);
    expect(screen.getByText('The disclosure.')).not.toHaveAttribute('data-lede-fit');
    expect(screen.queryByRole('button', { name: 'common.pageHeader.readMore' })).toBeNull();
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
