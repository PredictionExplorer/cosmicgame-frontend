import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import { LOCALE_SHORT_LABELS, LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { LOCALE_LABELS, routing } from '@/i18n/routing';

import { render, screen, within } from '@/test-utils';

const mockReplace = jest.fn();
let mockLocale = 'en';

// The switcher only reads the active locale and one aria-label; a local mock
// lets each test pick the locale (the global next-intl mock pins 'en').
jest.mock('next-intl', () => ({
  useLocale: () => mockLocale,
  useTranslations: () => (key: string, values?: Record<string, string>) =>
    values ? `common.${key}(${Object.values(values).join(',')})` : `common.${key}`,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/gallery',
}));

/**
 * Every trigger is named "Language: <current language>"; the responsive one
 * adds the short name it shows at mid widths.
 */
const TRIGGER = { name: /^common\.languageSwitcher\.current(Short)?\(/ };

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
    // The visible name is part of the accessible name (WCAG 2.5.3).
    expect(trigger).toHaveAccessibleName(`common.languageSwitcher.current(${LOCALE_LABELS.ja})`);
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

  describe('responsive variant', () => {
    it('names the current language at every width: the short name to 1536px, then in full', () => {
      mockLocale = 'zh-TW';
      render(<LanguageSwitcher variant="responsive" />);
      const trigger = screen.getByRole('button', TRIGGER);
      expect(trigger).toHaveAccessibleName(
        `common.languageSwitcher.currentShort(${LOCALE_LABELS['zh-TW']},${LOCALE_SHORT_LABELS['zh-TW']})`,
      );
      const short = within(trigger).getByText(LOCALE_SHORT_LABELS['zh-TW']);
      expect(short).toHaveClass('hidden', 'xl:inline', '2xl:hidden');
      expect(short).toHaveAttribute('lang', 'zh-TW');
      expect(within(trigger).getByText(LOCALE_LABELS['zh-TW'])).toHaveClass('2xl:inline');
    });

    it.each(routing.locales)(
      'puts both visible forms of the name in the accessible name (%s, WCAG 2.5.3)',
      (locale) => {
        mockLocale = locale;
        render(<LanguageSwitcher variant="responsive" />);
        const trigger = screen.getByRole('button', TRIGGER);
        const name = trigger.getAttribute('aria-label') ?? '';
        // Whichever label the width shows (the short one from 1280px, the full
        // one from 1536px) is part of the name, so voice control can say it.
        for (const span of trigger.querySelectorAll('span[lang]')) {
          expect(name).toContain(span.textContent);
        }
        expect(name).toContain(LOCALE_SHORT_LABELS[locale]);
        expect(name).toContain(LOCALE_LABELS[locale]);
      },
    );

    it('names a language whose short form is its full name once', () => {
      mockLocale = 'ja';
      render(<LanguageSwitcher variant="responsive" />);
      expect(screen.getByRole('button', TRIGGER)).toHaveAccessibleName(
        `common.languageSwitcher.current(${LOCALE_LABELS.ja})`,
      );
    });

    it('gives the two Traditional Chinese editions different short names', () => {
      expect(LOCALE_SHORT_LABELS['zh-TW']).not.toBe(LOCALE_SHORT_LABELS['zh-HK']);
      expect(new Set(Object.values(LOCALE_SHORT_LABELS)).size).toBe(routing.locales.length);
    });
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

  describe('drawer variant', () => {
    it('is a full-width row naming the current language, not a select', () => {
      mockLocale = 'uk';
      render(<LanguageSwitcher variant="drawer" />);
      expect(screen.queryByRole('combobox')).toBeNull();
      const trigger = screen.getByRole('button', TRIGGER);
      expect(trigger).toHaveClass('w-full');
      expect(within(trigger).getByText(LOCALE_LABELS.uk)).toHaveAttribute('lang', 'uk');
    });

    it('changes the language only on an explicit pick, never while arrowing through (WCAG 3.2.2)', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher variant="drawer" />);
      await user.click(screen.getByRole('button', TRIGGER));
      await screen.findByRole('menu');
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
      expect(mockReplace).not.toHaveBeenCalled();
      await user.click(screen.getByRole('menuitemradio', { name: LOCALE_LABELS.ja }));
      expect(mockReplace).toHaveBeenCalledWith('/gallery?tab=traits#top', { locale: 'ja' });
    });
  });
});
