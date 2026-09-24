import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface NavRowContentProps {
  icon?: LucideIcon;
  label: ReactNode;
  description?: ReactNode;
  /** Right-aligned caption, e.g. the other host's name on a cross-host row. */
  aside?: ReactNode;
  /** The row is the current page, or the page belongs to it. */
  current?: boolean;
  /** `tile`: a 32px icon tile (menus, site map). `inline`: a bare 16px icon (drawer). */
  iconStyle?: 'tile' | 'inline';
  /** Classes for the icon (tile or bare glyph), e.g. to drop it on phones. */
  iconClassName?: string;
  /** Classes for the description line. */
  descriptionClassName?: string;
}

/**
 * A hairline with the other host's name ("cosmicsignature.com"), heading the
 * rows that live there, so a list says once where its links lead instead of
 * repeating it on every row.
 */
export function HostDivider({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn('type-caption flex items-center gap-2 text-subtle', className)}>
      <span aria-hidden className="h-px flex-1 bg-rule-faint" />
      {label}
      <span aria-hidden className="h-px flex-1 bg-rule-faint" />
    </span>
  );
}

/**
 * The inside of one navigation row: icon, canonical name, one-line
 * description. Menus, the drawer, the site map and the 404 page wrap it in
 * their own link so every surface shows a destination the same way. The
 * wrapping element carries `group/row`, so hover and menu highlight states
 * reach the icon.
 */
export function NavRowContent({
  icon: Icon,
  label,
  description,
  aside,
  current = false,
  iconStyle = 'tile',
  iconClassName,
  descriptionClassName,
}: NavRowContentProps) {
  return (
    <>
      {Icon ? (
        iconStyle === 'tile' ? (
          <span
            aria-hidden
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-control border transition-colors duration-150',
              current
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-rule-faint bg-surface-sunken text-subtle group-hover/row:text-foreground group-data-[highlighted]/row:text-foreground',
              iconClassName,
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : (
          <Icon
            aria-hidden
            className={cn(
              'size-4 shrink-0 transition-colors duration-150',
              current ? 'text-primary' : 'text-subtle group-hover/row:text-foreground',
              iconClassName,
            )}
          />
        )
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            'text-sm font-medium leading-snug',
            current ? 'text-primary' : 'text-foreground',
          )}
        >
          {label}
        </span>
        {description ? (
          <span className={cn('type-caption mt-0.5 text-muted-foreground', descriptionClassName)}>
            {description}
          </span>
        ) : null}
      </span>
      {aside ? <span className="type-caption ml-2 shrink-0 text-subtle">{aside}</span> : null}
    </>
  );
}
