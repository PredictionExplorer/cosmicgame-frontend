import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the current page. */
  href?: string;
}

/** One trail item for `breadcrumbJsonLd` (utils/jsonLd). */
export interface BreadcrumbSegment {
  name: string;
  path: string;
}

/**
 * The same trail as structured data: every linked ancestor plus the current
 * page, so the visible breadcrumb and `breadcrumbJsonLd` cannot drift.
 *
 *   const trail = [{ label: t('home'), href: '/' }, { label: t('statistics'), href: '/statistics' }];
 *   <PageHeader breadcrumbs={trail} … />
 *   breadcrumbJsonLd(toBreadcrumbSegments(trail, { name: title, path: '/statistics/tokens' }), base)
 */
export function toBreadcrumbSegments(
  trail: readonly BreadcrumbItem[],
  current: BreadcrumbSegment,
): BreadcrumbSegment[] {
  const ancestors = trail.flatMap((item) =>
    item.href && item.href !== current.path ? [{ name: item.label, path: item.href }] : [],
  );
  return [...ancestors, current];
}

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  className?: string;
}

/**
 * The breadcrumb trail: ancestors as quiet links separated by chevrons, in an
 * ordered list inside a labelled `nav`. A trailing item without `href` is the
 * current page and carries `aria-current="page"`. Renders no client hooks, so
 * it works in server and client components.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const t = useTranslations('common');
  if (items.length === 0) return null;

  return (
    <nav aria-label={t('accessibility.breadcrumb')} className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 type-label text-muted-foreground print:text-foreground">
        {items.map((item, index) => {
          const isCurrent = !item.href && index === items.length - 1;
          return (
            <li key={`${index}-${item.label}`} className="inline-flex min-w-0 items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight aria-hidden className="size-3.5 shrink-0 text-subtle" />
              ) : null}
              {item.href ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-6 items-center transition-colors duration-fast hover:text-foreground hover:underline hover:underline-offset-4"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn('min-w-0 break-words', isCurrent && 'text-foreground')}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
