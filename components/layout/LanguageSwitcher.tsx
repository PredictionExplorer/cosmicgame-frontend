'use client';

import { ChevronDown, Globe } from 'lucide-react';
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

export type LanguageSwitcherVariant = 'pill' | 'compact' | 'select';

interface LanguageSwitcherProps {
  className?: string;
  /**
   * `pill` (default) — globe, the current language in its own name, and a
   * chevron, opening a radio menu of every language. `compact` — the same
   * menu behind an icon-only trigger for narrow headers. `select` — a native
   * select, the smallest control for a drawer's preferences row (the phone
   * opens its own picker).
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

  if (variant === 'select') {
    return (
      <label className={cn('relative inline-flex min-w-0 items-center', className)}>
        <span className="sr-only">{label}</span>
        <Globe aria-hidden className="pointer-events-none absolute left-3 size-4 text-subtle" />
        <select
          value={locale}
          onChange={(event) => switchTo(event.target.value)}
          className="h-11 w-full min-w-0 cursor-pointer appearance-none truncate rounded-control border border-input bg-surface-sunken pl-9 pr-8 text-sm text-foreground transition-colors duration-150 hover:border-foreground/40"
        >
          {routing.locales.map((option) => (
            <option key={option} value={option} lang={option}>
              {LOCALE_LABELS[option]}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-2.5 size-4 text-subtle"
        />
      </label>
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
            'rounded-pill border border-input bg-surface-sunken text-foreground hover:border-foreground/40 hover:bg-muted hover:text-foreground data-[state=open]:border-secondary/40 data-[state=open]:bg-secondary/10 data-[state=open]:text-foreground',
            compact
              ? 'size-11 shrink-0 sm:size-10'
              : 'h-11 gap-2 pl-3 pr-2.5 text-xs font-medium sm:h-9',
            className,
          )}
        >
          <Globe className="shrink-0 text-secondary" aria-hidden />
          {!compact && (
            <>
              <span lang={locale} className="max-w-[9rem] truncate">
                {current}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[13rem] p-1.5">
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
              className="min-h-10 cursor-pointer rounded-control py-2 pr-3 text-sm text-muted-foreground data-[state=checked]:bg-secondary/10 data-[state=checked]:text-foreground sm:min-h-9"
            >
              {LOCALE_LABELS[option]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
