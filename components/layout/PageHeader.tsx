import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { GradientText } from '@/components/ui/gradient-text';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  className?: string;
  align?: 'left' | 'center';
  children?: ReactNode;
  /** Small uppercase chip rendered above the title. */
  eyebrow?: ReactNode;
  /** Right-aligned action cluster (buttons, links). Stacks below the title on mobile. */
  actions?: ReactNode;
  /** Secondary meta row (status chip, last-updated, live indicator). */
  meta?: ReactNode;
  /** Apply the signature gradient to the title text. */
  gradientTitle?: boolean | 'signature' | 'nebula' | 'aurora';
  /** Use h2 when a page already renders a server-visible h1 for crawlers. */
  titleLevel?: 1 | 2;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  className,
  align = 'left',
  children,
  eyebrow,
  actions,
  meta,
  gradientTitle = false,
  titleLevel = 1,
}: PageHeaderProps) {
  const t = useTranslations('common');
  const hasSidebar = Boolean(actions);
  const TitleTag = titleLevel === 2 ? 'h2' : 'h1';
  const titleGradientVariant =
    gradientTitle === true ? 'signature' : gradientTitle === false ? null : gradientTitle;
  return (
    <div
      className={cn(
        'relative mb-10 border-b border-white/10 pb-8 pt-2 print:relative print:z-[2] print:text-foreground sm:mb-12 sm:pb-10',
        titleLevel === 2 && 'mb-8 pb-6 sm:mb-8 sm:pb-6',
        align === 'center' && !hasSidebar && 'text-center',
        className,
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav
          aria-label={t('accessibility.breadcrumb')}
          className={cn(
            'mb-6 flex flex-wrap items-center gap-1 type-body-sm text-muted-foreground print:!text-foreground/80',
            align === 'center' && !hasSidebar && 'justify-center',
          )}
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 ? (
                <ChevronRight aria-hidden className="h-3.5 w-3.5 text-muted-foreground/50" />
              ) : null}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="inline-flex min-h-6 items-center transition-colors hover:text-primary"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
                  className="text-foreground"
                >
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      ) : null}
      <div
        className={cn(
          hasSidebar && 'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        )}
      >
        <div className="min-w-0">
          {eyebrow ? (
            <div
              className={cn(
                'mb-4 type-eyebrow break-words text-secondary',
                align === 'center' && !hasSidebar && 'flex justify-center',
              )}
            >
              {eyebrow}
            </div>
          ) : null}
          <TitleTag
            className={cn(
              'font-medium text-foreground print:!text-foreground',
              titleLevel === 1 ? 'type-display-md' : 'type-display-sm',
              titleGradientVariant && '[&]:text-transparent',
            )}
          >
            {titleGradientVariant ? (
              <GradientText variant={titleGradientVariant}>{title}</GradientText>
            ) : (
              title
            )}
          </TitleTag>
          {subtitle ? (
            <p
              className={cn(
                'mt-4 type-body-lg leading-relaxed text-muted-foreground print:!text-foreground/85',
                align === 'center' && !hasSidebar && 'mx-auto max-w-2xl',
                align === 'left' && 'max-w-2xl',
              )}
            >
              {subtitle}
            </p>
          ) : null}
          {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>
        {actions ? (
          <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
