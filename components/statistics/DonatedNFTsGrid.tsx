import { useState } from 'react';
import { ImageOff } from 'lucide-react';

import DonatedNFT from '@/components/donations/DonatedNFT';
import { CustomPagination } from '@/components/common/CustomPagination';
import { SectionDivider } from '@/components/ui/section-divider';

const ITEMS_PER_PAGE = 12;

/** Props for the donated NFTs paginated grid. */
export interface DonatedNFTsGridProps {
  nftDonations: { RecordId?: string | number; [key: string]: unknown }[];
}

/** Paginated grid of donated NFTs. */
export function DonatedNFTsGrid({ nftDonations }: DonatedNFTsGridProps) {
  const [currentNFTPage, setNFTPage] = useState(1);

  return (
    <div>
      <SectionDivider title="Donated NFTs" className="mb-6" />
      {nftDonations.length > 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {nftDonations
              .slice((currentNFTPage - 1) * ITEMS_PER_PAGE, currentNFTPage * ITEMS_PER_PAGE)
              .map((nft) => (
                <DonatedNFT key={nft.RecordId} nft={nft} />
              ))}
          </div>
          <CustomPagination
            page={currentNFTPage}
            setPage={setNFTPage}
            totalLength={nftDonations.length}
            perPage={ITEMS_PER_PAGE}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] py-12">
          <ImageOff className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No NFTs have been donated yet.</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Donated NFTs from all rounds will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
