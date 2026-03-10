import { useEffect, useState } from 'react';
import { Typography, CardActionArea, Box } from '@mui/material';
import axios from 'axios';

import { StyledCard } from '@/components/styled';
import { reportError } from '@/utils/errors';
import NFTImage from '@/components/nft/NFTImage';

// Define the expected shape of the `nft` prop
interface NFT {
  NFTTokenId?: number | string;
  NFTTokenURI?: string;
  [key: string]: unknown;
}

// Define the expected structure of the fetched tokenURI data
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
    // Fetch metadata from the provided NFT token URI
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
  }, [nft.NFTTokenURI]); // dependency ensures it refetches if the URI changes

  return (
    <StyledCard>
      {/* Clickable area that opens the NFT's external URL in a new tab */}
      <CardActionArea
        onClick={() => {
          if (tokenURI?.external_url) {
            window.open(tokenURI.external_url, '_blank', 'noopener');
          }
        }}
      >
        {/* Renders the NFT image */}
        <NFTImage src={tokenURI?.image} />
      </CardActionArea>

      {/* Overlay box for token ID and 'Donated' label */}
      <Box
        sx={{
          display: 'flex',
          position: 'absolute',
          inset: '16px',
          justifyContent: 'space-between',
          pointerEvents: 'none', // ensures overlay doesn't interfere with clicks
        }}
      >
        <Typography
          variant="caption"
          sx={(theme) => ({ textShadow: `0px 0px 8px ${theme.palette.background.default}` })}
          data-testid="NFTTokenId"
        >
          #{nft.NFTTokenId}
        </Typography>
        <Typography
          color="primary"
          sx={(theme) => ({ textShadow: `0px 0px 8px ${theme.palette.background.default}` })}
        >
          Donated
        </Typography>
      </Box>
    </StyledCard>
  );
};

export default DonatedNFT;
