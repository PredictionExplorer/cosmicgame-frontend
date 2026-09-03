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

const TRIGGER = { name: 'common.languageSwitcher.label' };

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockLocale = 'en';
    window.history.replaceState(null, '', '/gallery?tab=traits#top');
  });

  it('labels the trigger with the current language in its own name and language', () => {
    mockLocale = 'ja';
    render(<LanguageSwitcher />);
    const trigger = screen.getByRole('button', TRIGGER);
    expect(trigger).toHaveTextContent(LOCALE_LABELS.ja);
    // The label is Japanese text on an otherwise Japanese page here, but on
    // an English page the same span carries lang="ja" so assistive tech
    // switches voice for the one word that is in another language.
    expect(within(trigger).getByText(LOCALE_LABELS.ja)).toHaveAttribute('lang', 'ja');
  });

  it('lists one radio option per routing locale, each tagged with its own lang attribute', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', TRIGGER));
    const menu = await screen.findByRole('menu');
    const items = within(menu).getAllByRole('menuitemradio');

    expect(items.map((item) => item.textContent)).toEqual(
      routing.locales.map((locale) => LOCALE_LABELS[locale]),
    );
    expect(items.map((item) => item.getAttribute('lang'))).toEqual([...routing.locales]);
    // Exactly the active language is checked, so the current choice is
    // conveyed without relying on the trigger's visual label.
    expect(items.map((item) => item.getAttribute('aria-checked'))).toEqual(
      routing.locales.map((locale) => String(locale === 'en')),
    );
  });

  it('names the menu with the same label as the trigger', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', TRIGGER));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('common.languageSwitcher.label')).toBeInTheDocument();
  });

  it('never translates language names, and names Chinese variants by script and region', () => {
    expect(LOCALE_LABELS.en).toBe('English');
    expect(LOCALE_LABELS.zh).toBe('简体中文');
    expect(LOCALE_LABELS['zh-TW']).toBe('繁體中文（台灣）');
    expect(LOCALE_LABELS['zh-HK']).toBe('繁體中文（香港）');
    expect(LOCALE_LABELS.uk).toBe('Українська');
    expect(LOCALE_LABELS.ko).toBe('한국어');
    expect(LOCALE_LABELS.ja).toBe('日本語');
  });

  it('replaces the current route (with query and hash) under the chosen locale', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', TRIGGER));
    await user.click(await screen.findByRole('menuitemradio', { name: LOCALE_LABELS.uk }));

    expect(mockReplace).toHaveBeenCalledWith('/gallery?tab=traits#top', { locale: 'uk' });
  });

  it('is a no-op when the current locale is chosen again', async () => {
    mockLocale = 'uk';
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    expect(screen.getByRole('button', TRIGGER)).toHaveTextContent(LOCALE_LABELS.uk);
    await user.click(screen.getByRole('button', TRIGGER));
    await user.click(await screen.findByRole('menuitemradio', { name: LOCALE_LABELS.uk }));

    expect(mockReplace).not.toHaveBeenCalled();
  });

  describe('compact variant', () => {
    it('keeps the accessible label but drops the visible language name', async () => {
      mockLocale = 'ko';
      const user = userEvent.setup();
      render(<LanguageSwitcher variant="compact" />);

      const trigger = screen.getByRole('button', TRIGGER);
      expect(trigger).not.toHaveTextContent(LOCALE_LABELS.ko);

      await user.click(trigger);
      const menu = await screen.findByRole('menu');
      expect(within(menu).getAllByRole('menuitemradio')).toHaveLength(routing.locales.length);
      expect(within(menu).getByRole('menuitemradio', { name: LOCALE_LABELS.ko })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });
  });

  describe('list variant', () => {
    it('lays every language out as a radio group with the current one checked', () => {
      mockLocale = 'zh-TW';
      render(<LanguageSwitcher variant="list" />);

      const group = screen.getByRole('radiogroup', TRIGGER);
      const radios = within(group).getAllByRole('radio');
      expect(radios.map((radio) => radio.textContent)).toEqual(
        routing.locales.map((locale) => LOCALE_LABELS[locale]),
      );
      expect(radios.map((radio) => radio.getAttribute('lang'))).toEqual([...routing.locales]);
      expect(within(group).getByRole('radio', { name: LOCALE_LABELS['zh-TW'] })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(within(group).getByRole('radio', { name: LOCALE_LABELS.en })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('switches locale on a single tap, without opening a menu', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher variant="list" />);

      await user.click(screen.getByRole('radio', { name: LOCALE_LABELS.ja }));

      expect(mockReplace).toHaveBeenCalledWith('/gallery?tab=traits#top', { locale: 'ja' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
