import { ArrowUpRight, ShieldCheck } from 'lucide-react';

import { isSourcifyVerified, sourcifyContractUrl } from '@/content/legal/officialAddresses';

import { SiteLink } from '@/components/layout/SiteLink';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ContractEvidenceLabels {
  /** The block explorer's name ("Arbiscan"). */
  explorer: string;
  sourcify: string;
  /** The Sourcify badge ("Exact match"). */
  exactMatch: string;
}

const SOURCE_LINK_CLASS =
  'link-quiet inline-flex min-h-6 items-center gap-1 text-muted-foreground transition-colors duration-fast hover:text-foreground';

/**
 * Where to check a contract without trusting this site: the address on the
 * block explorer and, for an address verified on Sourcify, its source there
 * with an "Exact match" badge. An address outside the verified set (a new
 * deployment the API reports) gets the explorer link only, never the badge.
 */
export function ContractEvidence({
  address,
  explorerUrl,
  labels,
  className,
}: {
  address: string;
  explorerUrl: string;
  labels: ContractEvidenceLabels;
  className?: string;
}) {
  const verified = isSourcifyVerified(address);
  return (
    <span className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 type-label', className)}>
      <SiteLink
        href={`${explorerUrl}/address/${address}`}
        kind="external"
        externalIcon={false}
        className={SOURCE_LINK_CLASS}
      >
        {labels.explorer}
        <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
      </SiteLink>
      {verified ? (
        <>
          <SiteLink
            href={sourcifyContractUrl(address)}
            kind="external"
            externalIcon={false}
            className={SOURCE_LINK_CLASS}
          >
            {labels.sourcify}
            <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
          </SiteLink>
          <Badge tone="positive" size="sm" icon={<ShieldCheck />}>
            {labels.exactMatch}
          </Badge>
        </>
      ) : null}
    </span>
  );
}
