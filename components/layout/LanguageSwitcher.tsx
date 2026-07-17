'use client';

import { Check, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALE_LABELS, routing, type AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * EN / 中文 selector (docs/i18n/README.md §2.4). Switching replaces the
 * current route under the target locale; the next-intl middleware persists
 * the choice in the NEXT_LOCALE cookie. Option labels are never translated —
 * each language is listed in itself.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: AppLocale) => {
    if (next === locale) return;
    // Read query/hash at click time to avoid a useSearchParams() Suspense
    // boundary in every layout that mounts the switcher.
    const suffix =
      typeof window !== 'undefined' ? `${window.location.search}${window.location.hash}` : '';
    router.replace(`${pathname}${suffix}`, { locale: next });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('languageSwitcher.label')}
          className={cn(
            'h-9 gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-white/75 hover:text-white',
            className,
          )}
        >
          <Globe className="h-4 w-4" aria-hidden />
          {LOCALE_LABELS[locale as AppLocale] ?? locale}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        {routing.locales.map((option) => (
          <DropdownMenuItem
            key={option}
            lang={option}
            onSelect={() => switchTo(option)}
            className="flex items-center justify-between gap-3"
          >
            {LOCALE_LABELS[option]}
            {option === locale && <Check className="h-4 w-4" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
