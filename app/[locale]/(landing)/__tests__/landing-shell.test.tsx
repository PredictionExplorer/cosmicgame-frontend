import '@testing-library/jest-dom';

import { LandingFooter } from '@/components/landing-v2/LandingFooter';
import { routing } from '@/i18n/routing';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';

import { act, checkA11y, fireEvent, render, screen, within } from '@/test-utils';

import { LandingShell } from '../landing-shell';

const mockPathname = jest.spyOn(jest.requireMock('next/navigation'), 'usePathname');
const mockLocale = jest.spyOn(jest.requireMock('next-intl'), 'useLocale');

const SECTIONS = { cycle: 'The Cycle', art: 'The Art', tracks: 'Allocation Tracks' };

function renderShell(locale = 'en') {
  mockLocale.mockReturnValue(locale);
  return render(
    <LandingShell footer={<LandingFooter />} sections={SECTIONS}>
      <main id="main" tabIndex={-1}>
        <h1>Page content</h1>
      </main>
    </LandingShell>,
  );
}

describe('Landing chrome', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/about');
    mockLocale.mockReturnValue('en');
  });

  it.each(['/', '/landing-site', '/about', '/learn', '/learn/gesture', '/white-paper', '/quiz'])(
    'places one header and one footer around <main> on %s',
    (pathname) => {
      mockPathname.mockReturnValue(pathname);
      renderShell();
      const banner = screen.getByRole('banner');
      const footer = screen.getByRole('contentinfo');
      const main = screen.getByRole('main');
      expect(main).not.toContainElement(banner);
      expect(main).not.toContainElement(footer);
      expect(footer).toContainElement(
        screen.getByRole('navigation', { name: 'common.languageSwitcher.label' }),
      );
    },
  );

  it('links the home sections in place on the home page and back to them elsewhere', () => {
    mockPathname.mockReturnValue('/');
    const { unmount } = renderShell();
    const onHome = screen.getAllByRole('navigation', { name: 'nav.primaryLabel' })[0]!;
    expect(within(onHome).getByRole('link', { name: 'The Cycle' })).toHaveAttribute(
      'href',
      '#cycle',
    );
    unmount();

    mockPathname.mockReturnValue('/about');
    renderShell();
    const onAbout = screen.getAllByRole('navigation', { name: 'nav.primaryLabel' })[0]!;
    expect(within(onAbout).getByRole('link', { name: 'The Cycle' })).toHaveAttribute(
      'href',
      '/#cycle',
    );
  });

  it('identifies the current page on article pages', () => {
    mockPathname.mockReturnValue('/learn/gesture');
    renderShell();
    const navigation = screen.getAllByRole('navigation', { name: 'nav.primaryLabel' })[0]!;
    expect(
      within(navigation).getByRole('link', { name: 'nav.routes.learnHub.label' }),
    ).toHaveAttribute('aria-current', 'true');
    // Beside the wordmark, About goes by its compact name.
    expect(
      within(navigation).getByRole('link', { name: 'nav.routes.about.short' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('shows "Open the app" on reading pages, in the same tab', () => {
    renderShell();
    const open = within(screen.getByRole('banner')).getByRole('link', { name: 'nav.cta.openApp' });
    expect(open).toHaveAttribute('href', localeHref(APP_ORIGIN, '/', 'en'));
    expect(open).not.toHaveAttribute('target');
  });

  it('leaves "Open the app" to the hero until it scrolls away on the home page', () => {
    let report: (entries: Array<{ isIntersecting: boolean }>) => void = () => {};
    const observe = jest.fn();
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: jest.fn((callback: typeof report) => {
        report = callback;
        return { observe, disconnect: jest.fn() };
      }),
    });
    mockPathname.mockReturnValue('/');
    mockLocale.mockReturnValue('en');
    render(
      <LandingShell footer={<LandingFooter />} sections={SECTIONS}>
        <main id="main" tabIndex={-1}>
          <section aria-labelledby="landing-headline">
            <h1 id="landing-headline">Hero</h1>
          </section>
        </main>
      </LandingShell>,
    );
    const banner = screen.getByRole('banner');
    act(() => report([{ isIntersecting: true }]));
    expect(within(banner).queryByRole('link', { name: 'nav.cta.openApp' })).toBeNull();
    act(() => report([{ isIntersecting: false }]));
    expect(within(banner).getByRole('link', { name: 'nav.cta.openApp' })).toBeInTheDocument();
    delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
  });

  it('resolves the FAQ to the app on every landing page', () => {
    renderShell();
    expect(
      within(screen.getByRole('contentinfo')).getByRole('link', { name: 'nav.routes.faq.label' }),
    ).toHaveAttribute('href', localeHref(APP_ORIGIN, '/faq', 'en'));
  });

  it.each(routing.locales)('preserves the %s locale when opening the app', (locale) => {
    renderShell(locale);
    expect(
      within(screen.getByRole('banner')).getByRole('link', { name: 'nav.cta.openApp' }),
    ).toHaveAttribute('href', localeHref(APP_ORIGIN, '/', locale));
    // The footer's copy is the app's, from the one footer catalog.
    expect(screen.getByRole('contentinfo')).toHaveTextContent('footer.tagline');
  });

  it('has accessible navigation and footer landmarks', async () => {
    const { container } = renderShell();
    await checkA11y(container);
  });

  it('takes keyboard focus to a home section, not only the view (V415)', () => {
    Element.prototype.scrollIntoView = jest.fn();
    mockPathname.mockReturnValue('/');
    render(
      <LandingShell footer={null} sections={SECTIONS}>
        <main id="main" tabIndex={-1}>
          <section id="cycle" aria-labelledby="cycle-heading">
            <h2 id="cycle-heading">A Performance Cycle</h2>
          </section>
        </main>
      </LandingShell>,
    );
    const navigation = screen.getAllByRole('navigation', { name: 'nav.primaryLabel' })[0]!;
    fireEvent.click(within(navigation).getByRole('link', { name: 'The Cycle' }));
    expect(screen.getByRole('heading', { name: 'A Performance Cycle' })).toHaveFocus();
  });
});
