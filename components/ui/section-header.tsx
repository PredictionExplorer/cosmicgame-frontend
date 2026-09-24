import type { HTMLAttributes, ReactNode } from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';

const titleVariants = cva('min-w-0 text-foreground', {
  variants: {
    size: {
      /** A section of a page: Clash, 24 → 28px (`type-section`). */
      page: 'type-section',
      /** A group inside a panel or card: Inter 600, 18 → 20px (`type-heading-3`). */
      panel: 'type-heading-3',
    },
  },
  defaultVariants: { size: 'page' },
});

export interface SectionHeaderInfo {
  /** The explanation, shown on hover or tap. */
  content: string;
  /** Names the button "More information about {label}"; defaults to the title when it is a string. */
  label?: string;
}

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  /**
   * The heading element, so the tier fits the outline it sits in: `h2` under
   * the page's `h1` (the default), `h3` inside an `h2` section, and so on.
   */
  as?: 'h2' | 'h3' | 'h4';
  /** `page` for a section of the page, `panel` for a group inside a card. */
  size?: 'page' | 'panel';
  /** A short kicker above the title, once per section. */
  eyebrow?: ReactNode;
  /** One sentence under the title (capped at the lede measure). */
  description?: ReactNode;
  /** One explanation for the whole section, beside its title. */
  info?: string | SectionHeaderInfo;
  /** Right-aligned links or controls, such as "View all". They wrap below the title on phones. */
  actions?: ReactNode;
  align?: 'start' | 'center';
  /** The heading's id, for `aria-labelledby` on the section it names. */
  headingId?: string;
}

/**
 * SectionHeader — the section-heading tier.
 *
 * One recipe for every section title, so long data pages scan the same way
 * everywhere: an optional eyebrow, the title at the page or panel size with
 * at most one explanation beside it, an optional one-line description and a
 * slot for actions on the right. Server-safe.
 *
 *   <section aria-labelledby="standings">
 *     <SectionHeader headingId="standings" title={t('title')} actions={<Link …/>} />
 */
export function SectionHeader({
  title,
  as: Heading = 'h2',
  size = 'page',
  eyebrow,
  description,
  info,
  actions,
  align = 'start',
  headingId,
  className,
  ...props
}: SectionHeaderProps) {
  const infoContent = typeof info === 'string' ? info : info?.content;
  const infoLabel =
    (typeof info === 'object' ? info.label : undefined) ??
    (typeof title === 'string' ? title : undefined);
  const centered = align === 'center';

  return (
    <header
      className={cn(
        'flex flex-col gap-x-6 gap-y-3',
        size === 'page' ? 'mb-6 sm:mb-8' : 'mb-4',
        centered
          ? 'items-center text-center'
          : actions && 'sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
      {...props}
    >
      <div className={cn('min-w-0', centered && 'flex flex-col items-center')}>
        {eyebrow ? <p className="mb-2 type-eyebrow text-subtle">{eyebrow}</p> : null}
        <div className={cn('flex items-center gap-2', centered && 'justify-center')}>
          <Heading id={headingId} className={titleVariants({ size })}>
            {title}
          </Heading>
          {infoContent ? <InfoTooltip content={infoContent} label={infoLabel} /> : null}
        </div>
        {description ? (
          <p
            className={cn(
              'mt-2 max-w-[var(--measure-lede)] text-muted-foreground',
              size === 'page' ? 'type-body-md' : 'type-body-sm',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
