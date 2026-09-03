import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import { LanguageDirectory } from '@/components/layout/LanguageDirectory';
import { LOCALE_COOKIE_NAME } from '@/i18n/localeCookie';
import { LOCALE_LABELS, routing, TRANSLATED_LOCALES } from '@/i18n/routing';

import { checkA11y, fireEvent, render, screen, within } from '@/test-utils';

const mockReplace = jest.fn();
let mockLocale = 'en';

// The directory only reads the active locale and one aria-label; a local mock
// lets each test pick the locale (the global next-intl mock pins 'en').
jest.mock('next-intl', () => ({
  useLocale: () => mockLocale,
  useTranslations: () => (key: string) => `common.${key}`,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/gallery',
}));

const NAV = { name: 'common.languageSwitcher.label' };

const clearLocaleCookie = () => {
  document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
};

const localeCookieValue = () =>
  document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${LOCALE_COOKIE_NAME}=`))
    ?.slice(LOCALE_COOKIE_NAME.length + 1);

/**
 * Dispatches a click the component is expected to leave to the browser and
 * reports whether it did. jsdom cannot navigate, so the event is cancelled
 * AFTER the component's handler ran (bubble phase on `document`).
 */
const clickLeftToBrowser = (target: HTMLElement, init: MouseEventInit): boolean => {
  let leftToBrowser = false;
  const stopNavigation = (event: Event) => {
    leftToBrowser = !event.defaultPrevented;
    event.preventDefault();
  };
  document.addEventListener('click', stopNavigation);
  fireEvent.click(target, init);
  document.removeEventListener('click', stopNavigation);
  return leftToBrowser;
};

const auxClick = (target: HTMLElement, button: number) =>
  fireEvent(target, new MouseEvent('auxclick', { button, bubbles: true, cancelable: true }));

describe('LanguageDirectory', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockLocale = 'en';
    clearLocaleCookie();
    window.history.replaceState(null, '', '/gallery?tab=traits#top');
  });

  it('is a navigation landmark listing one crawlable link per routing locale, in its own language', () => {
    render(<LanguageDirectory />);
    const nav = screen.getByRole('navigation', NAV);
    const links = within(nav).getAllByRole('link');

    expect(links.map((link) => link.textContent)).toEqual(
      routing.locales.map((locale) => LOCALE_LABELS[locale]),
    );
    expect(links.map((link) => link.getAttribute('lang'))).toEqual([...routing.locales]);
    expect(links.map((link) => link.getAttribute('hreflang'))).toEqual([...routing.locales]);
  });

  it('links every language to the current page at its canonical URL', () => {
    render(<LanguageDirectory />);
    const nav = screen.getByRole('navigation', NAV);

    // English is unprefixed (`localePrefix: 'as-needed'`), every other locale
    // lives under its prefix — the same URLs the hreflang alternates advertise,
    // so no directory link goes through a redirect.
    expect(within(nav).getByRole('link', { name: LOCALE_LABELS.en })).toHaveAttribute(
      'href',
      '/gallery',
    );
    for (const locale of TRANSLATED_LOCALES) {
      expect(within(nav).getByRole('link', { name: LOCALE_LABELS[locale] })).toHaveAttribute(
        'href',
        `/${locale}/gallery`,
      );
    }
  });

  it('marks exactly the active language as current and the others as alternates', () => {
    mockLocale = 'vi';
    render(<LanguageDirectory />);
    const links = within(screen.getByRole('navigation', NAV)).getAllByRole('link');

    expect(links.map((link) => link.getAttribute('aria-current'))).toEqual(
      routing.locales.map((locale) => (locale === 'vi' ? 'true' : null)),
    );
    expect(links.map((link) => link.getAttribute('rel'))).toEqual(
      routing.locales.map((locale) => (locale === 'vi' ? null : 'alternate')),
    );
  });

  it('switches like the pill on a plain click: same route, query and hash kept, no history entry', async () => {
    const user = userEvent.setup();
    render(<LanguageDirectory />);

    await user.click(screen.getByRole('link', { name: LOCALE_LABELS.vi }));

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/gallery?tab=traits#top', { locale: 'vi' });
  });

  it('lets a modified click open the canonical URL natively and remembers the choice first', () => {
    mockLocale = 'vi';
    render(<LanguageDirectory />);
    const english = screen.getByRole('link', { name: LOCALE_LABELS.en });

    // Cmd/Ctrl-click opens a new tab; the browser follows `href` itself, so
    // the router must NOT run — but the cookie has to say "en" before that
    // request leaves, or the middleware would bounce /gallery back to /vi/gallery.
    expect(clickLeftToBrowser(english, { metaKey: true })).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(localeCookieValue()).toBe('en');
  });

  it('remembers the choice on a middle click as well', () => {
    mockLocale = 'ja';
    render(<LanguageDirectory />);

    auxClick(screen.getByRole('link', { name: LOCALE_LABELS.uk }), 1);
    expect(localeCookieValue()).toBe('uk');
  });

  it('leaves the cookie alone on a right click and on the current language', () => {
    mockLocale = 'ja';
    render(<LanguageDirectory />);

    auxClick(screen.getByRole('link', { name: LOCALE_LABELS.uk }), 2);
    expect(
      clickLeftToBrowser(screen.getByRole('link', { name: LOCALE_LABELS.ja }), { metaKey: true }),
    ).toBe(true);
    expect(localeCookieValue()).toBeUndefined();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    render(<LanguageDirectory />);
    await checkA11y(document.body);
  });
});
