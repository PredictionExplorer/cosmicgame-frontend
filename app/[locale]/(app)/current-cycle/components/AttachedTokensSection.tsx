'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/ui/section-header';
import { TablePagination } from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttachedERC20Table, {
  type DonatedERC20Token,
} from '@/components/attachments/AttachedERC20Table';
import type { AttachedNFT as AttachedNFTRecord } from '@/services/api/types';

import { AttachedNftPlate } from './AttachedNftPlate';

/** Attached NFTs shown per page. */
export const ATTACHED_NFTS_PER_PAGE = 12;

export interface AttachedTokensSectionProps {
  nfts: AttachedNFTRecord[];
  erc20Tokens: DonatedERC20Token[];
  headingId: string;
}

/**
 * The full list of assets attached to this cycle's gestures, which travel
 * with the Signature Allocation: ERC-721 tokens as a paged grid, ERC-20
 * deposits as a ledger. A kind with nothing attached gets no tab, and the
 * section is left out when nothing at all was attached (the cycle figures
 * already say "0").
 */
export function AttachedTokensSection({
  nfts,
  erc20Tokens,
  headingId,
}: AttachedTokensSectionProps) {
  const t = useTranslations('currentCycle');
  const [page, setPage] = useState(1);
  const hasNfts = nfts.length > 0;
  const hasErc20 = erc20Tokens.length > 0;
  if (!hasNfts && !hasErc20) return null;

  const visibleNfts = nfts.slice(
    (page - 1) * ATTACHED_NFTS_PER_PAGE,
    page * ATTACHED_NFTS_PER_PAGE,
  );
  const gridLayout =
    nfts.length > 9
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      : 'grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3';

  const nftPanel = (
    <>
      <ul className={cn('grid gap-x-6 gap-y-10', gridLayout)}>
        {visibleNfts.map((nft, index) => (
          <li key={String(nft.RecordId ?? `${nft.TokenAddr}-${index}`)}>
            <AttachedNftPlate nft={nft} />
          </li>
        ))}
      </ul>
      <TablePagination
        page={page}
        pageSize={ATTACHED_NFTS_PER_PAGE}
        total={nfts.length}
        onPageChange={setPage}
      />
    </>
  );
  const erc20Panel = <AttachedERC20Table list={erc20Tokens} handleClaim={null} />;

  return (
    <section aria-labelledby={headingId} id="attached-assets" className="scroll-mt-24">
      <SectionHeader
        headingId={headingId}
        title={t('attachedTokens.title')}
        description={t('attachedTokens.tooltip')}
      />
      {hasNfts && hasErc20 ? (
        <Tabs defaultValue="erc721">
          <TabsList variant="underline" aria-labelledby={headingId}>
            <TabsTrigger value="erc721">{t('attachedTokens.erc721Tab')}</TabsTrigger>
            <TabsTrigger value="erc20">{t('attachedTokens.erc20Tab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="erc721" className="mt-6">
            {nftPanel}
          </TabsContent>
          <TabsContent value="erc20" className="mt-6">
            {erc20Panel}
          </TabsContent>
        </Tabs>
      ) : hasNfts ? (
        nftPanel
      ) : (
        erc20Panel
      )}
    </section>
  );
}
