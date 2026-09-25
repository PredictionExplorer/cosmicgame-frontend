'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { pickByLocale, type LocaleRecord } from '@/i18n/locale';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALE_LABELS, routing, type AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type LanguageSwitcherVariant = 'responsive' | 'drawer';

/**
 * Each language's short name for a narrow trigger, in its own script: a code
 * for the Latin-script languages, the usual short form for the others.
 * Ukrainian is "УКР", in Cyrillic: beside a globe, "UK" reads as the United
 * Kingdom. The two Traditional Chinese editions name their region, so
 * neither reads as the other's.
 */
export const LOCALE_SHORT_LABELS: LocaleRecord<string> = {
  en: 'EN',
  zh: '简中',
  'zh-TW': '繁中（台）',
  'zh-HK': '繁中（港）',
  uk: 'УКР',
  ko: '한국어',
  ja: '日本語',
  vi: 'VI',
};

/**
 * `halt` sets full-width parentheses at half width, so a native name keeps
 * its own characters (繁體中文（台灣）) without wide gaps.
 */
const NAME_CLASS = "[font-feature-settings:'halt']";

const TRIGGER_CLASS =
  'rounded-pill border border-input bg-surface-sunken text-foreground hover:border-foreground/40 hover:bg-muted hover:text-foreground data-[state=open]:border-secondary/40 data-[state=open]:bg-secondary/10 data-[state=open]:text-foreground';

interface LanguageSwitcherProps {
  className?: string;
  /**
   * `responsive` (the headers): the globe alone below 1280px, the short name
   * (EN, 日本語) to 1536px, the full name from there. `drawer`: a full-width
   * row for a drawer's preferences. Both open the same radio menu, where
   * choosing a language is an explicit action (never a change of context on
   * input), and both triggers are named "Language: <current language>" (the
   * responsive one adds the short name it shows: "Language: English (EN)").
   */
  variant: LanguageSwitcherVariant;
}

/**
 * Language selector (docs/i18n/README.md §2.4). Switching replaces the
 * current route under the target locale; next-intl's router persists the
 * choice in the NEXT_LOCALE cookie (attributes from `routing.localeCookie`).
 * Option labels are never translated — each language is listed in itself,
 * tagged with its own `lang` so screen readers switch voices per option.
 */
export function LanguageSwitcher({ className, variant }: LanguageSwitcherProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const label = t('languageSwitcher.label');
  const current = LOCALE_LABELS[locale as AppLocale] ?? locale;
  const short = pickByLocale(LOCALE_SHORT_LABELS, locale);
  // The visible name is the current language's, so the trigger's name
  // carries it too (WCAG 2.5.3), and screen readers hear which language is
  // active. The responsive trigger can show the short form ("UK", "简中"), so
  // its name holds both forms whenever they differ.
  const triggerName = t('languageSwitcher.current', { language: current });
  const responsiveName =
    short === current
      ? triggerName
      : t('languageSwitcher.currentShort', { language: current, short });

  const switchTo = (next: string) => {
    if (next === locale || !routing.locales.includes(next as AppLocale)) return;
    // Read query/hash at click time to avoid a useSearchParams() Suspense
    // boundary in every layout that mounts the switcher.
    const suffix = `${window.location.search}${window.location.hash}`;
    router.replace(`${pathname}${suffix}`, { locale: next as AppLocale });
  };

  const trigger = {
    responsive: (
      <Button
        variant="ghost"
        size="icon"
        aria-label={responsiveName}
        className={cn(
          TRIGGER_CLASS,
          'size-11 shrink-0 gap-1.5 text-xs font-medium sm:size-10 xl:w-auto xl:pl-3 xl:pr-2.5',
          className,
        )}
      >
        <Globe className="shrink-0 text-secondary" aria-hidden />
        <span lang={locale} className={cn('hidden xl:inline 2xl:hidden', NAME_CLASS)}>
          {short}
        </span>
        <span lang={locale} className={cn('hidden max-w-[9rem] truncate 2xl:inline', NAME_CLASS)}>
          {current}
        </span>
        <ChevronDown className="hidden size-3.5 shrink-0 text-subtle xl:inline" aria-hidden />
      </Button>
    ),
    drawer: (
      <Button
        variant="ghost"
        aria-label={triggerName}
        className={cn(
          'h-11 w-full justify-start gap-3 rounded-control border border-input bg-surface-sunken px-3 text-sm font-normal text-foreground hover:border-foreground/40 hover:bg-muted data-[state=open]:border-secondary/40',
          className,
        )}
      >
        <Globe className="size-4 shrink-0 text-subtle" aria-hidden />
        <span lang={locale} className={cn('min-w-0 flex-1 truncate text-left', NAME_CLASS)}>
          {current}
        </span>
        <ChevronDown className="size-4 shrink-0 text-subtle" aria-hidden />
      </Button>
    ),
  }[variant];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === 'drawer' ? 'start' : 'end'}
        side={variant === 'drawer' ? 'top' : 'bottom'}
        className="min-w-[13rem] p-1.5"
      >
        <DropdownMenuLabel className="type-eyebrow flex items-center gap-2 px-2 py-1.5 font-normal text-subtle">
          <Globe className="h-3.5 w-3.5" aria-hidden />
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={locale} onValueChange={switchTo}>
          {routing.locales.map((option) => (
            <DropdownMenuRadioItem
              key={option}
              value={option}
              lang={option}
              className={cn(
                'min-h-11 cursor-pointer rounded-control py-2 pr-3 text-sm text-muted-foreground data-[state=checked]:bg-secondary/10 data-[state=checked]:text-foreground sm:min-h-9',
                NAME_CLASS,
              )}
            >
              {LOCALE_LABELS[option]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
