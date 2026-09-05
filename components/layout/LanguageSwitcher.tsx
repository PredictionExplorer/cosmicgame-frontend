'use client';

import { Check, ChevronDown, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

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

export type LanguageSwitcherVariant = 'pill' | 'compact' | 'list';

interface LanguageSwitcherProps {
  className?: string;
  /**
   * `pill` (default) — globe, the current language in its own name, and a
   * chevron, opening a radio menu of every language. `compact` — the same
   * menu behind an icon-only trigger for narrow headers. `list` — every
   * language laid out as a radio group, for the mobile drawer, where a nested
   * menu would hide the choice behind a second tap.
   */
  variant?: LanguageSwitcherVariant;
}

/**
 * Language selector (docs/i18n/README.md §2.4). Switching replaces the
 * current route under the target locale; next-intl's router persists the
 * choice in the NEXT_LOCALE cookie (attributes from `routing.localeCookie`).
 * Option labels are never translated — each language is listed in itself,
 * tagged with its own `lang` so screen readers switch voices per option.
 */
export function LanguageSwitcher({ className, variant = 'pill' }: LanguageSwitcherProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const label = t('languageSwitcher.label');
  const current = LOCALE_LABELS[locale as AppLocale] ?? locale;

  const switchTo = (next: string) => {
    if (next === locale || !routing.locales.includes(next as AppLocale)) return;
    // Read query/hash at click time to avoid a useSearchParams() Suspense
    // boundary in every layout that mounts the switcher.
    const suffix = `${window.location.search}${window.location.hash}`;
    router.replace(`${pathname}${suffix}`, { locale: next as AppLocale });
  };

  if (variant === 'list') {
    return (
      <div className={cn('space-y-2', className)}>
        <p className="flex items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
          <Globe className="h-3.5 w-3.5" aria-hidden />
          {label}
        </p>
        <div role="radiogroup" aria-label={label} className="grid gap-1.5">
          {routing.locales.map((option) => {
            const selected = option === locale;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                lang={option}
                aria-checked={selected}
                onClick={() => switchTo(option)}
                className={cn(
                  'flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-left text-sm transition-colors',
                  selected
                    ? 'border-secondary/40 bg-secondary/10 text-white'
                    : 'border-white/[0.08] bg-white/[0.03] text-white/75 hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white',
                )}
              >
                <span>{LOCALE_LABELS[option]}</span>
                {selected && <Check className="h-4 w-4 shrink-0 text-secondary" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const compact = variant === 'compact';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? 'icon' : 'sm'}
          aria-label={label}
          className={cn(
            'rounded-full border border-white/[0.12] bg-white/[0.05] text-white/85 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] hover:border-white/[0.22] hover:bg-white/[0.09] hover:text-white data-[state=open]:border-secondary/40 data-[state=open]:bg-secondary/10 data-[state=open]:text-white',
            compact
              ? 'h-11 w-11 shrink-0 sm:h-10 sm:w-10'
              : 'h-11 gap-2 pl-3 pr-2.5 text-xs font-medium sm:h-9',
            className,
          )}
        >
          <Globe className="shrink-0 text-secondary/90" aria-hidden />
          {!compact && (
            <>
              <span lang={locale} className="max-w-[9rem] truncate">
                {current}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/55" aria-hidden />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[13rem] p-1.5">
        <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 font-mono text-[10px] font-normal uppercase tracking-[0.3em] text-white/45">
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
              className="min-h-10 cursor-pointer rounded-lg py-2 pr-3 text-sm text-white/80 data-[state=checked]:bg-secondary/10 data-[state=checked]:text-white sm:min-h-9"
            >
              {LOCALE_LABELS[option]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
