import '@testing-library/jest-dom';

import { landingContentEn } from '@/content/landing';

import { FOOTER_SECTIONS } from '@/config/siteNav';
import { LOCALE_LABELS, routing } from '@/i18n/routing';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { LandingFooter } from '@/components/landing-v2/LandingFooter';

import { checkA11y, render, screen, within } from '@/test-utils';

describe('<LandingFooter />', () => {
  it('renders the wordmark link back to the landing root and the landing tagline', () => {
    render(<LandingFooter footer={landingContentEn.footer} />);
    expect(screen.getByRole('link', { name: 'nav.brand.homeLabel' })).toHaveAttribute('href', '/');
    expect(screen.getByText(landingContentEn.footer.tagline)).toBeInTheDocument();
  });

  it('renders the same section columns as the app footer', () => {
    render(<LandingFooter footer={landingContentEn.footer} />);
    const nav = screen.getByRole('navigation', { name: 'common.accessibility.footer' });
    for (const section of FOOTER_SECTIONS) {
      expect(
        within(nav).getByRole('heading', { level: 2, name: `nav.sections.${section}` }),
      ).toBeInTheDocument();
    }
  });

  it('keeps landing pages on the router and sends app pages to the app in the same tab', () => {
    render(<LandingFooter footer={landingContentEn.footer} />);
    expect(screen.getByRole('link', { name: 'nav.routes.whitePaper.label' })).toHaveAttribute(
      'href',
      '/white-paper',
    );
    const faq = screen.getByRole('link', { name: 'nav.routes.faq.label' });
    expect(faq).toHaveAttribute('href', localeHref(APP_ORIGIN, '/faq', 'en'));
    expect(faq).not.toHaveAttribute('target');
  });

  it('never links an in-page anchor that only exists on the home page', () => {
    const { container } = render(<LandingFooter footer={landingContentEn.footer} />);
    const anchors = Array.from(container.querySelectorAll('a[href^="#"]'));
    expect(anchors).toHaveLength(0);
  });

  it('offers a way into the app', () => {
    render(<LandingFooter footer={landingContentEn.footer} />);
    expect(screen.getByRole('link', { name: 'nav.cta.openApp' })).toHaveAttribute(
      'href',
      localeHref(APP_ORIGIN, '/', 'en'),
    );
  });

  it('renders the crawlable language directory', () => {
    render(<LandingFooter footer={landingContentEn.footer} />);
    const directory = screen.getByRole('navigation', { name: 'common.languageSwitcher.label' });
    for (const locale of routing.locales) {
      expect(within(directory).getByText(LOCALE_LABELS[locale])).toBeInTheDocument();
    }
  });

  it('renders the copyright with the current year and the colophon', () => {
    render(<LandingFooter footer={landingContentEn.footer} />);
    const year = String(new Date().getFullYear());
    expect(
      screen.getByText(landingContentEn.footer.copyright.replace('{year}', year)),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: landingContentEn.footer.colophon })).toHaveAttribute(
      'href',
      localeHref(APP_ORIGIN, '/security', 'en'),
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LandingFooter footer={landingContentEn.footer} />);
    await checkA11y(container);
  });
});
