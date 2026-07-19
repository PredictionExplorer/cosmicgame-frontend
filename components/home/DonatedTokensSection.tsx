import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AttachedNFT from '@/components/attachments/AttachedNFT';
import AttachedERC20Table from '@/components/attachments/AttachedERC20Table';
import { CustomPagination } from '@/components/common/CustomPagination';
import { SectionDivider } from '@/components/ui/section-divider';
import { InfoTooltip } from '@/components/ui/info-tooltip';
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

/** Tabbed display of attached NFTs (grid) and ERC-20 tokens (table) for the current cycle, with pagination. */
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
    <div>
      <div className="flex items-center gap-2 mb-6">
        <SectionDivider title={t('attachedTokens.title')} className="flex-1" />
        <InfoTooltip content={t('attachedTokens.tooltip')} />
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden border-l-2 border-l-[hsl(271,98%,60%)]/40">
        <Tabs
          value={String(donatedTokensTab)}
          onValueChange={(v) => onTabChange({} as React.SyntheticEvent, Number(v))}
        >
          <div className="border-b border-white/[0.06]">
            <TabsList className="w-full">
              <TabsTrigger value="0" className="flex-1">
                {t('attachedTokens.erc721Tab')}
              </TabsTrigger>
              <TabsTrigger value="1" className="flex-1">
                {t('attachedTokens.erc20Tab')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="0" className="p-6">
            {donatedNFTs.length > 0 ? (
              <>
                <div className={cn('grid gap-4', gridLayout)}>
                  {donatedNFTs.map((nft) => (
                    <div key={nft.RecordId}>
                      <AttachedNFT nft={nft} />
                    </div>
                  ))}
                </div>
                <CustomPagination
                  page={curPage}
                  setPage={setCurPage}
                  totalLength={donatedNFTs.length}
                  perPage={perPage}
                />
              </>
            ) : (
              <p className="text-muted-foreground text-sm">{t('attachedTokens.erc721Empty')}</p>
            )}
          </TabsContent>
          <TabsContent value="1" className="p-6">
            <AttachedERC20Table list={donatedERC20Tokens} handleClaim={null} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
