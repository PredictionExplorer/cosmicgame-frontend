import '@testing-library/jest-dom';

import Footer from '@/components/layout/Footer';
import { FOOTER_SECTIONS, OUTBOUND_LINKS, footerRoutes } from '@/config/siteNav';
import { LOCALE_LABELS, routing } from '@/i18n/routing';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';

import { act, render, screen, checkA11y, within } from '@/test-utils';

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: () => ({
      matches,
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    }),
  });
}

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe('Footer', () => {
  it('links the wordmark lockup home', () => {
    render(<Footer />);
    const home = screen.getByRole('link', { name: 'nav.brand.homeLabel' });
    expect(home).toHaveAttribute('href', '/');
    expect(home.querySelector('[data-brand-mark]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the copyright, the build commit and a colophon that leads to its sources', () => {
    render(<Footer />);
    expect(screen.getByText(/footer\.copyright\(year=\d{4}\)/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'footer.colophon' })).toHaveAttribute(
      'href',
      '/security',
    );
    const build = screen.getByTestId('build-commit');
    expect(build).toHaveTextContent('deadbee');
    expect(build).toHaveTextContent('local');
  });

  it('renders one column per section of the taxonomy', () => {
    render(<Footer />);
    const nav = screen.getByRole('navigation', { name: 'common.accessibility.footer' });
    for (const section of FOOTER_SECTIONS) {
      expect(
        within(nav).getByRole('heading', { level: 2, name: `nav.sections.${section}` }),
      ).toBeInTheDocument();
      for (const route of footerRoutes(section).filter((candidate) => !candidate.group)) {
        const link = within(nav).getByRole('link', { name: `nav.routes.${route.id}.label` });
        expect(link.getAttribute('href')).toContain(route.path === '/' ? '' : route.path);
      }
    }
  });

  it('collapses the Public Goods ledgers into one link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'nav.groups.publicGoods.label' })).toHaveAttribute(
      'href',
      '/public-goods-contributions-cg',
    );
  });

  it('links Security and Risk Disclosures, and the legal pages underneath', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'nav.routes.security.label' })).toHaveAttribute(
      'href',
      '/security',
    );
    for (const [id, href] of [
      ['terms', '/terms'],
      ['privacy', '/privacy'],
      ['riskDisclosures', '/risk-disclosures'],
    ]) {
      const links = screen.getAllByRole('link', { name: `nav.routes.${id}.label` });
      expect(links.map((link) => link.getAttribute('href'))).toContain(href);
    }
  });

  it('sends links to the project site in the same tab', () => {
    render(<Footer />);
    const whitePaper = screen.getByRole('link', { name: 'nav.routes.whitePaper.label' });
    expect(whitePaper).toHaveAttribute('href', localeHref(LANDING_ORIGIN, '/white-paper', 'en'));
    expect(whitePaper).not.toHaveAttribute('target');
  });

  it('opens every third-party link in a new tab, announced and with safe rel', () => {
    render(<Footer />);
    for (const link of OUTBOUND_LINKS) {
      const anchor = screen.getByRole('link', {
        name: new RegExp(`^nav\\.outbound\\.${link.id}\\.label`),
      });
      expect(anchor).toHaveAttribute('href', link.href);
      expect(anchor).toHaveAttribute('target', '_blank');
      expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
      expect(anchor).toHaveTextContent('nav.link.newTab');
    }
  });

  it('renders the crawlable language directory with a link per locale', () => {
    render(<Footer />);
    const directory = screen.getByRole('navigation', { name: 'common.languageSwitcher.label' });
    for (const locale of routing.locales) {
      expect(within(directory).getByText(LOCALE_LABELS[locale])).toBeInTheDocument();
    }
  });

  it('keeps every group open from 640px', () => {
    mockMatchMedia(false);
    const { container } = render(<Footer />);
    const groups = container.querySelectorAll('details');
    expect(groups.length).toBeGreaterThanOrEqual(FOOTER_SECTIONS.length);
    groups.forEach((group) => expect(group).toHaveAttribute('open'));
  });

  it('folds the groups on phones while keeping every link in the markup', async () => {
    mockMatchMedia(true);
    const { container } = render(<Footer />);
    await act(async () => {});
    container
      .querySelectorAll('details')
      .forEach((group) => expect(group).not.toHaveAttribute('open'));
    expect(
      screen.getByRole('link', { name: 'nav.routes.gallery.label', hidden: true }),
    ).toHaveAttribute('href', '/gallery');
  });

  it('does not expose admin or internal tools', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('a[href*="/internal"]')).toBeNull();
    expect(container.querySelector('a[href*="/admin"]')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Footer />);
    await checkA11y(container);
  });
});
