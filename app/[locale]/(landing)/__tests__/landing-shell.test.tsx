import '@testing-library/jest-dom';

import { getLandingContent } from '@/content/landing';

import { routing } from '@/i18n/routing';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';

import { checkA11y, render, screen, within } from '@/test-utils';

import { LandingShell } from '../landing-shell';

const mockPathname = jest.spyOn(jest.requireMock('next/navigation'), 'usePathname');
const mockLocale = jest.spyOn(jest.requireMock('next-intl'), 'useLocale');

function renderShell(locale = 'en') {
  mockLocale.mockReturnValue(locale);
  return render(
    <LandingShell footer={getLandingContent(locale).footer}>
      <main id="main" tabIndex={-1}>
        <h1>Page content</h1>
      </main>
    </LandingShell>,
  );
}

describe('Landing subpage chrome', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/about');
    mockLocale.mockReturnValue('en');
  });

  it.each(['/about', '/learn', '/learn/gesture', '/white-paper', '/quiz', '/quiz/1'])(
    'renders a complete header and footer around %s',
    (pathname) => {
      mockPathname.mockReturnValue(pathname);
      renderShell();
      expect(screen.getAllByRole('banner')).toHaveLength(1);
      expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
      expect(screen.getAllByRole('main')).toHaveLength(1);
      const navigation = screen.getByRole('navigation', { name: 'nav.primaryLabel' });
      for (const href of ['/about', '/learn', '/white-paper']) {
        expect(navigation.querySelector(`a[href="${href}"]`)).toBeInTheDocument();
      }
      expect(screen.getByRole('contentinfo')).toContainElement(
        screen.getByRole('navigation', { name: 'common.languageSwitcher.label' }),
      );
    },
  );

  it.each(['/', '/landing-site'])('does not duplicate the home composition on %s', (pathname) => {
    mockPathname.mockReturnValue(pathname);
    renderShell();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('identifies the current section on article pages', () => {
    mockPathname.mockReturnValue('/learn/gesture');
    renderShell();
    const navigation = screen.getByRole('navigation', { name: 'nav.primaryLabel' });
    expect(within(navigation).getByRole('link', { name: 'footer.links.learn' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      within(navigation).getByRole('link', { name: 'footer.links.about' }),
    ).not.toHaveAttribute('aria-current');
  });

  it.each(routing.locales)('preserves the %s locale when opening the app', (locale) => {
    renderShell(locale);
    const navigation = screen.getByRole('navigation', { name: 'nav.primaryLabel' });
    expect(
      within(navigation).getByRole('link', { name: 'landing.timer.openLiveCycle' }),
    ).toHaveAttribute('href', localeHref(APP_ORIGIN, '/', locale));
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      getLandingContent(locale).footer.tagline,
    );
  });

  it('has accessible navigation and footer landmarks', async () => {
    const { container } = renderShell();
    await checkA11y(container);
  });
});
