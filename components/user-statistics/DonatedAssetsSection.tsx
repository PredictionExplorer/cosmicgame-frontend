'use client';

import { useId, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { AttachedAssetsIcon } from '@/lib/conceptIcons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonTable } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import AttachedNFTTable from '@/components/attachments/AttachedNFTTable';
import AttachedERC20Table from '@/components/attachments/AttachedERC20Table';
import type { NFTRecord } from '@/components/attachments/AttachedNFTTable';
import type { DonatedERC20Token } from '@/components/attachments/AttachedERC20Table';

/** Props for the donated assets section. */
export interface DonatedAssetsSectionProps {
  unclaimedNFTs: NFTRecord[];
  claimedNFTs: NFTRecord[];
  donatedERC20: DonatedERC20Token[];
  loadingNFTs: boolean;
  loadingERC20: boolean;
  canClaim: boolean;
  isClaiming: boolean;
  claimingDonatedNFTs: number[];
  onClaimNFT?: (tokenID: number) => void;
  onClaimAllNFTs: () => void;
  onClaimERC20?: ((roundNum: number, tokenAddr: string, amount: string) => void) | null | undefined;
  onClaimAllERC20: () => void;
}

/** One kind of attached asset: an H3 with its explanation, a count to retrieve, the action, the ledger. */
function AssetLedger({
  title,
  info,
  pending,
  action,
  children,
}: {
  title: string;
  info: string;
  pending: string | null;
  action: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id={id} className="type-heading-3 text-foreground">
            {title}
          </h3>
          <InfoTooltip content={info} label={title} />
          {pending ? (
            <Badge tone="attention" size="sm" dot>
              {pending}
            </Badge>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * Attached NFTs and ERC-20 tokens allocated to the address, each with the
 * number still to retrieve and, on your own profile, the action that
 * retrieves them all.
 */
export function DonatedAssetsSection({
  unclaimedNFTs,
  claimedNFTs,
  donatedERC20,
  loadingNFTs,
  loadingERC20,
  canClaim,
  isClaiming,
  claimingDonatedNFTs,
  onClaimNFT,
  onClaimAllNFTs,
  onClaimERC20,
  onClaimAllERC20,
}: DonatedAssetsSectionProps) {
  const t = useTranslations('myPages');
  const allNFTs = [...unclaimedNFTs, ...claimedNFTs];
  const unclaimedERC20Count = donatedERC20.filter((x) => !x.Claimed).length;

  return (
    <div className="space-y-12">
      <AssetLedger
        title={t('statistics.donatedAssets.nfts.title')}
        info={t('statistics.donatedAssets.nfts.tooltip')}
        pending={
          unclaimedNFTs.length > 0
            ? t('statistics.donatedAssets.nfts.unclaimed', { count: unclaimedNFTs.length })
            : null
        }
        action={
          unclaimedNFTs.length > 0 && canClaim ? (
            <Button onClick={onClaimAllNFTs} loading={isClaiming} size="sm">
              {t('statistics.donatedAssets.nfts.claimAll')}
            </Button>
          ) : null
        }
      >
        {loadingNFTs ? (
          <SkeletonTable rows={3} columns={4} />
        ) : allNFTs.length === 0 ? (
          <EmptyState
            headingLevel={4}
            variant="inline"
            icon={<AttachedAssetsIcon className="size-5" />}
            title={t('statistics.donatedAssets.nfts.emptyTitle')}
            description={t('statistics.donatedAssets.nfts.emptyDescription')}
          />
        ) : (
          <AttachedNFTTable
            list={allNFTs}
            handleClaim={canClaim ? onClaimNFT : undefined}
            claimingTokens={claimingDonatedNFTs}
          />
        )}
      </AssetLedger>

      <AssetLedger
        title={t('statistics.donatedAssets.erc20.title')}
        info={t('statistics.donatedAssets.erc20.tooltip')}
        pending={
          unclaimedERC20Count > 0
            ? t('statistics.donatedAssets.erc20.unclaimed', { count: unclaimedERC20Count })
            : null
        }
        action={
          unclaimedERC20Count > 0 && canClaim ? (
            <Button onClick={onClaimAllERC20} size="sm">
              {t('statistics.donatedAssets.erc20.claimAll')}
            </Button>
          ) : null
        }
      >
        {loadingERC20 ? (
          <SkeletonTable rows={3} columns={4} />
        ) : donatedERC20.length === 0 ? (
          <EmptyState
            headingLevel={4}
            variant="inline"
            icon={<AttachedAssetsIcon className="size-5" />}
            title={t('statistics.donatedAssets.erc20.emptyTitle')}
            description={t('statistics.donatedAssets.erc20.emptyDescription')}
          />
        ) : (
          <AttachedERC20Table
            list={donatedERC20}
            handleClaim={canClaim ? (onClaimERC20 ?? null) : null}
          />
        )}
      </AssetLedger>
    </div>
  );
}
