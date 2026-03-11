import { useState } from 'react';

import DonatedNFT from '@/components/donations/DonatedNFT';
import { CustomPagination } from '@/components/common/CustomPagination';

const ITEMS_PER_PAGE = 12;

/** Props for the donated NFTs paginated grid. */
export interface DonatedNFTsGridProps {
  nftDonations: { RecordId?: string | number; [key: string]: unknown }[];
}

/** Paginated grid of donated NFTs. */
export function DonatedNFTsGrid({ nftDonations }: DonatedNFTsGridProps) {
  const [currentNFTPage, setNFTPage] = useState(1);

  return (
    <div className="mt-8">
      <h4 className="mb-4 text-lg font-semibold">Donated NFTs</h4>
      {nftDonations.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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
        </>
      ) : (
        <p className="mt-4">No ERC721 tokens were donated on this round.</p>
      )}
    </div>
  );
}
