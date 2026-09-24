import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the current page. */
  href?: string;
  /** An identifier (an address): set in mono, as every other address is. */
  mono?: boolean;
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
                  className={cn(
                    'inline-flex min-h-6 items-center transition-colors duration-fast hover:text-foreground hover:underline hover:underline-offset-4',
                    item.mono && 'font-mono',
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(
                    'min-w-0 break-words',
                    isCurrent && 'text-foreground',
                    item.mono && 'font-mono',
                  )}
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
