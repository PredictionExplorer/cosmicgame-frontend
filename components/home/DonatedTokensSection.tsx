import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AttachedNFT from '@/components/attachments/AttachedNFT';
import AttachedERC20Table from '@/components/attachments/AttachedERC20Table';
import { TablePagination } from '@/components/ui/pagination';
import { SectionHeader } from '@/components/ui/section-header';
import type { AttachedNFT as DonatedNFTType } from '@/services/api/types';
import type { DonatedERC20Token } from '@/components/attachments/AttachedERC20Table';

interface DonatedTokensSectionProps {
  donatedNFTs: DonatedNFTType[];
  donatedERC20Tokens: DonatedERC20Token[];
  donatedTokensTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  curPage: number;
  setCurPage: (page: number) => void;
  perPage: number;
}

/**
 * The cycle's attached tokens: NFTs as a paged grid and ERC-20 tokens as a
 * ledger, behind underline tabs on one frame.
 */
export function DonatedTokensSection({
  donatedNFTs,
  donatedERC20Tokens,
  donatedTokensTab,
  onTabChange,
  curPage,
  setCurPage,
  perPage,
}: DonatedTokensSectionProps) {
  const t = useTranslations('currentCycle');
  const gridLayout =
    donatedNFTs.length > 16
      ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6'
      : donatedNFTs.length > 9
        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <section aria-labelledby="cycle-attached-tokens">
      <SectionHeader
        headingId="cycle-attached-tokens"
        title={t('attachedTokens.title')}
        info={t('attachedTokens.tooltip')}
      />
      <div className="overflow-hidden rounded-surface border border-rule-faint bg-surface/60">
        <Tabs
          value={String(donatedTokensTab)}
          onValueChange={(v) => onTabChange({} as React.SyntheticEvent, Number(v))}
        >
          <TabsList variant="underline" className="w-full px-3 sm:px-4">
            <TabsTrigger value="0">{t('attachedTokens.erc721Tab')}</TabsTrigger>
            <TabsTrigger value="1">{t('attachedTokens.erc20Tab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="0" className="p-5 sm:p-6">
            {donatedNFTs.length > 0 ? (
              <>
                <div className={cn('grid gap-4', gridLayout)}>
                  {donatedNFTs.map((nft) => (
                    <div key={nft.RecordId}>
                      <AttachedNFT nft={nft} />
                    </div>
                  ))}
                </div>
                <TablePagination
                  page={curPage}
                  pageSize={perPage}
                  total={donatedNFTs.length}
                  onPageChange={setCurPage}
                  className="mt-4"
                />
              </>
            ) : (
              <p className="type-body-sm text-muted-foreground">
                {t('attachedTokens.erc721Empty')}
              </p>
            )}
          </TabsContent>
          <TabsContent value="1" className="p-5 sm:p-6">
            <AttachedERC20Table list={donatedERC20Tokens} handleClaim={null} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
