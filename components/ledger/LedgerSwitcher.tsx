import type { ComponentType } from 'react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface LedgerSwitcherItem {
  href: string;
  label: string;
  /** A 16px glyph beside the label (a lucide icon or a concept icon). */
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  /** The page being viewed: marked `aria-current="page"`. */
  current?: boolean;
}

export interface LedgerSwitcherProps {
  /** Accessible name of the nav ("Public Goods", "Transfers for this address"). */
  label: string;
  items: readonly LedgerSwitcherItem[];
  className?: string;
}

/**
 * A segmented row of links between sibling ledgers — the three Public Goods
 * ledgers, an address's CST and NFT transfers — so a group reads as one
 * place rather than unrelated tables. Plain links, so every sibling stays
 * crawlable; the current one sits raised on the sunken track. The row
 * scrolls sideways on phones instead of wrapping. Server-safe.
 */
export function LedgerSwitcher({ label, items, className }: LedgerSwitcherProps) {
  return (
    <nav aria-label={label} className={cn('mb-8 max-w-full', className)}>
      <ul className="scrollbar-none inline-flex max-w-full gap-1 overflow-x-auto rounded-pill border border-rule bg-surface-sunken p-1">
        {items.map(({ href, label: itemLabel, icon: Icon, current = false }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-pill px-4 text-sm font-medium no-underline transition-colors duration-fast sm:min-h-10',
                current
                  ? 'bg-surface-raised text-foreground ring-1 ring-inset ring-rule'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {Icon ? (
                <Icon
                  aria-hidden
                  className={cn('size-4 shrink-0', current ? 'text-primary' : 'text-subtle')}
                />
              ) : null}
              {itemLabel}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
