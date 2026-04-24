import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

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
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  className,
  align = 'center',
  children,
  eyebrow,
  actions,
  meta,
  gradientTitle = false,
}: PageHeaderProps) {
  const hasSidebar = Boolean(actions);
  const titleGradientVariant =
    gradientTitle === true ? 'signature' : gradientTitle === false ? null : gradientTitle;
  return (
    <div
      className={cn(
        'mb-12 print:relative print:z-[2] print:text-foreground',
        align === 'center' && !hasSidebar && 'text-center',
        className,
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav
          aria-label="Breadcrumb"
          className={cn(
            'mb-4 flex items-center gap-1 type-body-sm text-muted-foreground print:!text-foreground/80',
            align === 'center' && !hasSidebar && 'justify-center',
          )}
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" /> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-primary">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
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
        <div>
          {eyebrow ? (
            <div
              className={cn(
                'mb-3 type-eyebrow text-muted-foreground',
                align === 'center' && !hasSidebar && 'flex justify-center',
              )}
            >
              {eyebrow}
            </div>
          ) : null}
          <h1
            className={cn(
              'type-display-sm text-foreground print:!text-foreground',
              titleGradientVariant && '[&]:text-transparent',
            )}
          >
            {titleGradientVariant ? (
              <GradientText variant={titleGradientVariant}>{title}</GradientText>
            ) : (
              title
            )}
          </h1>
          {subtitle ? (
            <p
              className={cn(
                'mt-3 type-body-md text-muted-foreground print:!text-foreground/85',
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
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
