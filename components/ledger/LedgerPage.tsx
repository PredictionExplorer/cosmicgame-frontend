import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { PageShell } from '@/components/ui/page-shell';

export interface LedgerPageProps {
  /**
   * The page's one header: a `PageHeader`, or the server-rendered
   * `PublicDataRouteSeoSummary` that renders into one.
   */
  header: ReactNode;
  /**
   * Navigation between sibling ledgers (`RouteGroupNav` for a site-nav group,
   * `LedgerSwitcher` for address-scoped siblings), set under the header.
   */
  switcher?: ReactNode;
  /**
   * A side column from `lg` (the page's form, its context), four of twelve
   * columns and sticky under the site header; below `lg` it follows the body.
   * It is not a landmark (an `<aside>` inside `<main>` would be a stray
   * complementary region): give what it holds its own heading.
   */
  aside?: ReactNode;
  /**
   * `full` (default): the body spans the content edge, like every data page.
   * `narrow`: one reading column (48rem) for a short ledger or a record, left
   * on the same edge as the header so nothing jumps between sibling pages.
   */
  width?: 'full' | 'narrow';
  /** The ledger body: tables, record sections, states. */
  children: ReactNode;
  className?: string;
}

/**
 * The one template for record and ledger pages (transfers, contributions,
 * Public Goods, outreach, coordination changes). Every sibling page shares
 * the content edge, the header, the sibling switcher, the block rhythm and
 * the side column, so moving from a history to its detail to its cycle never
 * shifts the layout sideways. Server-safe: it renders no client hooks.
 *
 *   <LedgerPage
 *     header={<PageHeader section="records" title={…} figures={…} />}
 *     switcher={<RouteGroupNav group="publicGoods" current="publicGoodsVoluntary" />}
 *     aside={<ContributionForm />}
 *   >
 *     <EthDonationTable list={rows} />
 *   </LedgerPage>
 */
export function LedgerPage({
  header,
  switcher,
  aside,
  width = 'full',
  children,
  className,
}: LedgerPageProps) {
  return (
    <PageShell variant="data" className={cn('max-sm:pb-16', className)}>
      {header}
      {switcher}
      {aside ? (
        <div className="grid gap-x-10 gap-y-[var(--block-gap)] lg:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-[var(--block-gap)] lg:col-span-8">
            {children}
          </div>
          <div className="min-w-0 lg:sticky lg:top-[var(--sticky-offset)] lg:col-span-4 lg:self-start">
            {aside}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'flex min-w-0 flex-col gap-[var(--block-gap)]',
            width === 'narrow' && 'max-w-3xl',
          )}
        >
          {children}
        </div>
      )}
    </PageShell>
  );
}
