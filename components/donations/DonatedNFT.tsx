import { useEffect, useState } from 'react';
import axios from 'axios';

import { StyledCard } from '@/components/styled';
import { reportError } from '@/utils/errors';
import NFTImage from '@/components/nft/NFTImage';

interface NFT {
  NFTTokenId?: number | string;
  NFTTokenURI?: string;
  [key: string]: unknown;
}

interface TokenURI {
  image?: string;
  external_url?: string;
}

interface DonatedNFTProps {
  nft: NFT;
}

const DonatedNFT = ({ nft }: DonatedNFTProps) => {
  const [tokenURI, setTokenURI] = useState<TokenURI | null>(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const { data } = await axios.get<TokenURI>(nft.NFTTokenURI!);
        setTokenURI(data);
      } catch (error) {
        reportError(error, 'fetch donated NFT token URI');
      }
    };

    if (nft.NFTTokenURI) {
      fetchTokenData();
    }
  }, [nft.NFTTokenURI]);

  return (
    <StyledCard>
      <button
        type="button"
        className="block w-full cursor-pointer bg-transparent border-0 p-0 text-left"
        onClick={() => {
          if (tokenURI?.external_url) {
            window.open(tokenURI.external_url, '_blank', 'noopener');
          }
        }}
      >
        <NFTImage src={tokenURI?.image} />
      </button>

      <div className="flex absolute inset-4 justify-between pointer-events-none">
        <span
          className="text-xs [text-shadow:0px_0px_8px_var(--background)]"
          data-testid="NFTTokenId"
        >
          #{nft.NFTTokenId}
        </span>
        <span className="text-primary [text-shadow:0px_0px_8px_var(--background)]">Donated</span>
      </div>
    </StyledCard>
  );
};

export default DonatedNFT;
