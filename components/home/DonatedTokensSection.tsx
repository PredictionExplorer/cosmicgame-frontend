import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DonatedNFT from '@/components/donations/DonatedNFT';
import DonatedERC20Table from '@/components/donations/DonatedERC20Table';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { DonatedNFT as DonatedNFTType } from '@/services/api/types';
import type { DonatedERC20Token } from '@/components/donations/DonatedERC20Table';

interface DonatedTokensSectionProps {
  donatedNFTs: DonatedNFTType[];
  donatedERC20Tokens: DonatedERC20Token[];
  donatedTokensTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  curPage: number;
  setCurPage: (page: number) => void;
  perPage: number;
}

/** Tabbed display of donated NFTs (grid) and ERC-20 tokens (table) for the current round, with pagination. */
export function DonatedTokensSection({
  donatedNFTs,
  donatedERC20Tokens,
  donatedTokensTab,
  onTabChange,
  curPage,
  setCurPage,
  perPage,
}: DonatedTokensSectionProps) {
  const gridLayout =
    donatedNFTs.length > 16
      ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6'
      : donatedNFTs.length > 9
        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <div className="mt-20">
      <h6 className="text-lg font-medium text-foreground">DONATED TOKENS FOR CURRENT ROUND</h6>
      <Tabs
        value={String(donatedTokensTab)}
        onValueChange={(v) => onTabChange({} as React.SyntheticEvent, Number(v))}
      >
        <div className="border-b border-border">
          <TabsList className="w-full">
            <TabsTrigger value="0" className="flex-1">
              ERC721 Tokens
            </TabsTrigger>
            <TabsTrigger value="1" className="flex-1">
              ERC20 Tokens
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="0" className="p-6">
          {donatedNFTs.length > 0 ? (
            <>
              <div className={cn('grid gap-4 mt-4', gridLayout)}>
                {donatedNFTs.map((nft) => (
                  <div key={nft.RecordId}>
                    <DonatedNFT nft={nft} />
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
            <p className="text-foreground">No ERC721 tokens were donated on this round.</p>
          )}
        </TabsContent>
        <TabsContent value="1" className="p-6">
          <DonatedERC20Table list={donatedERC20Tokens} handleClaim={null} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
