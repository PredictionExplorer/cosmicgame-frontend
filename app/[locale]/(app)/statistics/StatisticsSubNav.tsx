'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { ALL_STATISTICS_SECTIONS, STATISTICS_HUB } from './statistics-sections';

/**
 * Sticky secondary navigation between the statistics section pages.
 * Mirrors the FAQ category nav: pill links, horizontal scroll on mobile,
 * frosted background while stuck under the app header.
 */
export function StatisticsSubNav() {
  const pathname = usePathname();
  const t = useTranslations('statistics');

  return (
    <div className="sticky top-[72px] z-30 -mx-4 mb-8 px-4">
      <nav
        aria-label={t('navigation.ariaLabel')}
        className="border-b border-white/[0.06] bg-background/85 py-3 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {ALL_STATISTICS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive =
              section.href === STATISTICS_HUB.href
                ? pathname === STATISTICS_HUB.href
                : pathname === section.href || pathname.startsWith(`${section.href}/`);
            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium no-underline transition-all duration-200',
                  isActive
                    ? 'bg-primary/15 text-primary shadow-sm shadow-primary/10'
                    : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {t(`navigation.${section.messageKey}.label`)}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
