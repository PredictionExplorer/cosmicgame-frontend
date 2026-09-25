import '@testing-library/jest-dom';

import {
  PageHeader,
  PageHeaderFacts,
  PageHeaderFigures,
  PageHeaderTabs,
} from '@/components/layout/PageHeader';
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

    it('puts wide figures after the pairs on phones, or lists every figure as rows', () => {
      const figure = (id: string, size?: 'md') => ({ id, label: id, value: '1', size });
      const { rerender } = render(
        <PageHeader
          title="Ledger"
          figures={[figure('records'), figure('share'), figure('latest', 'md')]}
        />,
      );
      expect(document.querySelector('dl')).toHaveAttribute('data-layout', 'grid');
      // One wide figure takes the full row after the pair.
      expect(document.querySelector('[data-figure="latest"]')).toHaveClass(
        'max-sm:order-last',
        'max-sm:col-span-2',
      );
      expect(document.querySelector('[data-figure="records"]')).not.toHaveClass(
        'max-sm:col-span-2',
      );

      // Two wide figures (a date and an address) share the last row instead
      // of taking a full row each.
      rerender(
        <PageHeader
          title="Record"
          figures={[figure('amount'), figure('cycle'), figure('from', 'md'), figure('date', 'md')]}
        />,
      );
      for (const id of ['from', 'date']) {
        const wide = document.querySelector(`[data-figure="${id}"]`);
        expect(wide).toHaveClass('max-sm:order-last');
        expect(wide).not.toHaveClass('max-sm:col-span-2');
      }

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

    it('sets three compact counts side by side on phones', () => {
      const figure = (id: string, compact = true) => ({ id, label: id, value: '12', compact });
      const { rerender } = render(
        <PageHeader title="Anchoring" figures={['a', 'b', 'c'].map((id) => figure(id))} />,
      );
      expect(document.querySelector('dl')).toHaveAttribute('data-layout', 'strip');
      expect(document.querySelector('dl')).toHaveClass('grid-cols-3', 'sm:grid-cols-3');

      // One figure that is not a short count keeps the rows.
      rerender(
        <PageHeader title="Ledger" figures={[figure('a'), figure('b'), figure('total', false)]} />,
      );
      expect(document.querySelector('dl')).toHaveAttribute('data-layout', 'rows');
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

    it('gives an explained label a 44px touch target without growing the row', () => {
      render(
        <PageHeader
          title="Ledger"
          figures={[{ id: 'total', label: 'Total ETH', value: '1', info: 'The sum.' }]}
        />,
      );
      const trigger = screen.getByRole('button', { name: 'More information about Total ETH' });
      // A standalone trigger: on coarse pointers its own box grows to 44px
      // and a negative margin hands the space back (touch-hit-area).
      expect(trigger).toHaveAttribute('data-placement', 'standalone');
      expect(trigger).toHaveClass('touch-hit-area');
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

  it('gives only third-party related pages the new-tab arrow', () => {
    render(
      <PageHeader
        title="Public Goods"
        related={[
          { href: '/statistics', label: 'Statistics' },
          { href: 'https://cosmicsignature.com/learn/protocol-guild-public-goods', label: 'Guide' },
          { href: 'https://www.protocolguild.org', label: 'Protocol Guild' },
        ]}
        relatedLabel="Related"
      />,
    );
    const icon = (name: string) =>
      screen.getByRole('link', { name: new RegExp(`^${name}`) }).querySelector('svg');
    // The other host (cosmicsignature.com) opens in this tab, like a page here.
    expect(icon('Statistics')).toHaveClass('lucide-arrow-right');
    expect(icon('Guide')).toHaveClass('lucide-arrow-right');
    expect(screen.getByRole('link', { name: 'Guide' })).not.toHaveAttribute('target');
    expect(icon('Protocol Guild')).toHaveClass('lucide-arrow-up-right');
    expect(screen.getByRole('link', { name: /^Protocol Guild/ })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('keeps related pages on phones, as quiet links rather than bordered chips', () => {
    // Phones once dropped the header's only route to sibling pages; the links
    // now wrap there, every one in view, and the visible label steps aside.
    render(
      <PageHeader
        title="Allocation"
        related={[{ href: '/statistics', label: 'Statistics' }]}
        relatedLabel="Related"
      />,
    );
    const related = screen.getByRole('navigation', { name: 'Related' });
    expect(related).not.toHaveClass('max-sm:hidden');
    expect(related.closest('.max-sm\\:hidden')).toBeNull();
    // The visible label repeats the nav's own name, so it is not read twice,
    // and gives its room to the links on phones.
    const label = within(related).getByText('common.pageHeader.relatedPages');
    expect(label).toHaveAttribute('aria-hidden', 'true');
    expect(label).toHaveClass('max-sm:hidden');
    expect(within(related).getByRole('list')).toHaveClass('flex-wrap');
    const link = screen.getByRole('link', { name: 'Statistics' });
    expect(link).toHaveClass('link-quiet', 'pointer-coarse:min-h-11', 'sm:whitespace-nowrap');
    expect(link).not.toHaveClass('border');
  });

  it('keeps the lede at its own size on phones, never under the body text', () => {
    render(<PageHeader title="Security" variant="reading" subtitle="The thesis." />);
    const lede = screen.getByText('The thesis.');
    expect(lede).toHaveClass('type-lede');
    expect(lede.className).not.toMatch(/max-sm:text-/);
  });

  it('gives a date figure its own phone row beside another wide figure', () => {
    render(
      <PageHeaderFigures
        figures={[
          { id: 'records', label: 'Retrievals', value: '2' },
          { id: 'total', label: 'ETH retrieved', value: '4.8 ETH' },
          { id: 'latest', label: 'Latest', value: 'Aug 11, 2026, 19:34', size: 'md', date: true },
          { id: 'beneficiary', label: 'Beneficiary', value: 'Protocol Guild', size: 'md' },
        ]}
      />,
    );
    const latest = document.querySelector('[data-figure="latest"]');
    const beneficiary = document.querySelector('[data-figure="beneficiary"]');
    expect(latest).toHaveClass('max-sm:col-span-2');
    expect(beneficiary).toHaveClass('max-sm:col-span-2');
  });

  it('never clamps the lede of a reading page', () => {
    const { rerender } = render(<PageHeader title="Risk" subtitle="The disclosure." />);
    expect(screen.getByText('The disclosure.')).toHaveAttribute('data-lede-fit');
    rerender(<PageHeader title="Risk" variant="reading" subtitle="The disclosure." />);
    expect(screen.getByText('The disclosure.')).not.toHaveAttribute('data-lede-fit');
    expect(screen.queryByRole('button', { name: 'common.pageHeader.readMore' })).toBeNull();
  });

  it('opens the header with the sibling tabs, above the title, so switching never moves them', () => {
    render(
      <PageHeader
        section="records"
        title="Voluntary contributions"
        subtitle="A lede that is longer on one tab than on another."
        figures={[{ id: 'records', label: 'Contributions', value: '0' }]}
        tabs={
          <PageHeaderTabs
            label="Public Goods"
            items={[
              { href: '/protocol', label: 'Protocol' },
              { href: '/voluntary', label: 'Voluntary', current: true },
            ]}
          />
        }
      />,
    );
    const tabs = screen.getByRole('navigation', { name: 'Public Goods' });
    const heading = screen.getByRole('heading', { level: 1 });
    // Before the H1 in document order, on a rule of its own.
    expect(tabs.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(tabs.parentElement).toHaveClass('border-b', 'border-rule');
    expect(within(tabs).getByRole('link', { name: 'Voluntary' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    // The header keeps its own foot and bottom rule.
    expect(screen.getByRole('banner')).toHaveClass('pb-6', 'border-b');
  });

  it('sets a facts line under the lede, before the related pages', () => {
    render(
      <PageHeader
        section="collection"
        title="Named NFTs"
        subtitle="Signatures their owners have named."
        facts={<PageHeaderFacts facts={[{ id: 'named', label: 'Named NFTs', value: '3' }]} />}
        related={[{ href: '/gallery', label: 'Gallery' }]}
      />,
    );
    const facts = screen.getByTestId('page-header-facts');
    const related = screen.getByRole('navigation', { name: 'common.pageHeader.relatedPages' });
    expect(facts.compareDocumentPosition(related) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('gives the H1 an id for aria-labelledby', () => {
    render(<PageHeader title="Allocation" titleId="allocation-heading" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'allocation-heading');
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
