import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

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
  align = 'center',
  children,
  eyebrow,
  actions,
  meta,
  gradientTitle = false,
  titleLevel = 1,
}: PageHeaderProps) {
  const hasSidebar = Boolean(actions);
  const TitleTag = titleLevel === 2 ? 'h2' : 'h1';
  const titleGradientVariant =
    gradientTitle === true ? 'signature' : gradientTitle === false ? null : gradientTitle;
  return (
    <div
      className={cn(
        'relative isolate mb-14 overflow-hidden px-4 py-8 print:relative print:z-[2] print:text-foreground sm:px-6 sm:py-10',
        align === 'center' && !hasSidebar && 'text-center',
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-[1.5rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.10),rgb(var(--nebula-violet-rgb)/0.08)_42%,rgb(var(--chrono-rose-rgb)/0.06))] shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm print:hidden"
      />
      <div
        aria-hidden
        className="absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full opacity-45 blur-3xl print:hidden"
        style={{
          background:
            'radial-gradient(circle, rgb(var(--aurora-cyan-rgb) / 0.22), rgb(var(--nebula-violet-rgb) / 0.18) 46%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-4 right-8 -z-10 hidden h-40 w-40 rounded-full opacity-30 sm:block print:hidden"
        style={{
          background:
            'conic-gradient(from 120deg, transparent, rgb(var(--aurora-cyan-rgb) / 0.85), transparent 34%, rgb(var(--nebula-violet-rgb) / 0.65), transparent 68%, rgb(var(--chrono-rose-rgb) / 0.55), transparent)',
          maskImage:
            'radial-gradient(circle, transparent 57%, black 59%, black 62%, transparent 64%)',
        }}
      />
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
                'mb-4 type-eyebrow text-muted-foreground',
                align === 'center' && !hasSidebar && 'flex justify-center',
              )}
            >
              {eyebrow}
            </div>
          ) : null}
          <TitleTag
            className={cn(
              'type-display-md text-foreground print:!text-foreground',
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
                'mt-4 type-body-lg text-muted-foreground print:!text-foreground/85',
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
