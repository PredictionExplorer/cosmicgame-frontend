import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import Footer from '@/components/layout/Footer';
import { FOOTER_SECTIONS, OUTBOUND_LINKS, footerRoutes } from '@/config/siteNav';
import { LOCALE_LABELS, routing } from '@/i18n/routing';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';

import { render, screen, checkA11y, within } from '@/test-utils';

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

  it('folds each group on phones with CSS, so the server HTML needs no correction', () => {
    render(<Footer />);
    const toggles = screen.getAllByRole('button', { expanded: false });
    // Six sections, and one fold for the ecosystem, community and language rows.
    expect(toggles).toHaveLength(FOOTER_SECTIONS.length + 1);
    for (const toggle of toggles) {
      const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
      expect(panel).toHaveClass('max-sm:hidden');
      expect(toggle).toHaveClass('sm:hidden');
    }
    // Folded groups keep their links in the markup for crawlers.
    expect(screen.getByRole('link', { name: 'nav.routes.gallery.label' })).toHaveAttribute(
      'href',
      '/gallery',
    );
  });

  it('names each phone toggle after its heading and unfolds on tap', async () => {
    render(<Footer />);
    const toggle = screen.getByRole('button', { name: 'nav.sections.trust' });
    const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
    await userEvent.setup().click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveClass('max-sm:hidden');
    expect(within(panel!).getByRole('link', { name: 'nav.routes.siteMap.label' })).toBeVisible();
  });

  it('keeps the ecosystem, community and language rows in one phone fold', async () => {
    render(<Footer />);
    const toggle = screen.getByRole('button', { name: 'nav.footer.linksAndLanguages' });
    // From 640px the fold's own heading is for screen readers only.
    expect(
      screen.getByRole('heading', { level: 2, name: 'nav.footer.linksAndLanguages' }),
    ).toHaveClass('sm:sr-only');
    const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '')!;
    for (const name of [
      'nav.sections.ecosystem',
      'nav.sections.community',
      'common.languageSwitcher.label',
    ]) {
      expect(within(panel).getByRole('heading', { level: 3, name })).toBeInTheDocument();
    }
    await userEvent.setup().click(toggle);
    expect(panel).not.toHaveClass('max-sm:hidden');
  });

  it('drops the tagline on phones and keeps the legal line clear of a fixed dock', () => {
    render(<Footer />);
    expect(screen.getByText('footer.tagline')).toHaveClass('max-sm:hidden');
    const legal = screen.getByRole('link', { name: 'footer.colophon' }).parentElement!
      .parentElement!;
    expect(legal.className).toContain('var(--dock-clearance');
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
