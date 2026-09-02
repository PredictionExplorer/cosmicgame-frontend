import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { LOCALE_LABELS, routing } from '@/i18n/routing';

import { render, screen, within } from '@/test-utils';

const mockReplace = jest.fn();
let mockLocale = 'en';

// The switcher only reads the active locale and one aria-label; a local mock
// lets each test pick the locale (the global next-intl mock pins 'en').
jest.mock('next-intl', () => ({
  useLocale: () => mockLocale,
  useTranslations: () => (key: string) => `common.${key}`,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/gallery',
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockLocale = 'en';
    window.history.replaceState(null, '', '/gallery?tab=traits#top');
  });

  it('labels the trigger with the current language in its own name', () => {
    render(<LanguageSwitcher />);
    const trigger = screen.getByRole('button', { name: 'common.languageSwitcher.label' });
    expect(trigger).toHaveTextContent(LOCALE_LABELS.en);
  });

  it('lists one option per routing locale, each tagged with its own lang attribute', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', { name: 'common.languageSwitcher.label' }));
    const menu = await screen.findByRole('menu');
    const items = within(menu).getAllByRole('menuitem');

    expect(items.map((item) => item.textContent)).toEqual(
      routing.locales.map((locale) => LOCALE_LABELS[locale]),
    );
    expect(items.map((item) => item.getAttribute('lang'))).toEqual([...routing.locales]);
  });

  it('never translates language names, and names Chinese variants by script and region', () => {
    expect(LOCALE_LABELS.en).toBe('English');
    expect(LOCALE_LABELS.zh).toBe('简体中文');
    expect(LOCALE_LABELS['zh-TW']).toBe('繁體中文（台灣）');
    expect(LOCALE_LABELS['zh-HK']).toBe('繁體中文（香港）');
    expect(LOCALE_LABELS.uk).toBe('Українська');
  });

  it('replaces the current route (with query and hash) under the chosen locale', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', { name: 'common.languageSwitcher.label' }));
    await user.click(await screen.findByRole('menuitem', { name: LOCALE_LABELS.uk }));

    expect(mockReplace).toHaveBeenCalledWith('/gallery?tab=traits#top', { locale: 'uk' });
  });

  it('is a no-op when the current locale is chosen again', async () => {
    mockLocale = 'uk';
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    expect(screen.getByRole('button', { name: 'common.languageSwitcher.label' })).toHaveTextContent(
      LOCALE_LABELS.uk,
    );
    await user.click(screen.getByRole('button', { name: 'common.languageSwitcher.label' }));
    await user.click(await screen.findByRole('menuitem', { name: LOCALE_LABELS.uk }));

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
