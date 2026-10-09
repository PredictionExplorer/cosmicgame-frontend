import type { ReactNode } from 'react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

import {
  isSourcifyVerified,
  SOURCIFY_CHECKED,
  sourcifyContractUrl,
} from '@/content/legal/officialAddresses';

import { SiteLink } from '@/components/layout/SiteLink';
import { EXPLORER_NAME } from '@/lib/chainGuard';
import { cn } from '@/lib/utils';
import { toIntlLocale } from '@/utils/format';
import { getExplorerUrl } from '@/utils/urls';

export interface ContractEvidenceLabels {
  /** The block explorer's name ("Arbiscan"). */
  explorer: string;
  sourcify: string;
}

/**
 * The two sources by their own names: the network's explorer ("Arbiscan" on
 * Arbitrum One, the configured one elsewhere) and Sourcify. Neither is
 * translated, so no catalog carries them.
 */
const DEFAULT_LABELS: ContractEvidenceLabels = { explorer: EXPLORER_NAME, sourcify: 'Sourcify' };

const SOURCE_LINK_CLASS =
  'link-quiet inline-flex min-h-6 items-center gap-1 text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground';

/**
 * Where to check a contract without trusting this site: the address on the
 * block explorer and, for an address verified on Sourcify, its source there.
 * An address outside the verified set (a new deployment the API reports)
 * gets the explorer link only. The list says once what the Sourcify link
 * means (`SourcifyCheckedNote`), so no row repeats a status badge.
 */
export function ContractEvidence({
  address,
  labels = DEFAULT_LABELS,
  className,
}: {
  address: string;
  labels?: ContractEvidenceLabels;
  className?: string;
}) {
  return (
    <span className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 type-label', className)}>
      <SiteLink
        href={getExplorerUrl('address', address)}
        kind="external"
        externalIcon={false}
        className={SOURCE_LINK_CLASS}
      >
        {labels.explorer}
        <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
      </SiteLink>
      {isSourcifyVerified(address) ? (
        <SiteLink
          href={sourcifyContractUrl(address)}
          kind="external"
          externalIcon={false}
          className={SOURCE_LINK_CLASS}
        >
          {labels.sourcify}
          <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
        </SiteLink>
      ) : null}
    </span>
  );
}

/** `SOURCIFY_CHECKED` as the locale's long calendar date ("September 24, 2026"), in UTC. */
export function formatSourcifyChecked(locale: string): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${SOURCIFY_CHECKED}T00:00:00Z`));
}

/**
 * The one statement an address list makes about Sourcify ("Every address
 * with a Sourcify link is an exact match there, checked September 24,
 * 2026"), under the list's heading instead of a badge on every row. `text`
 * may be rich (a link to the contracts page).
 */
export function SourcifyCheckedNote({ text, className }: { text: ReactNode; className?: string }) {
  return (
    <p
      data-sourcify-note
      className={cn('flex items-start gap-2 type-body-sm text-muted-foreground', className)}
    >
      <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-subtle" />
      <span>{text}</span>
    </p>
  );
}
