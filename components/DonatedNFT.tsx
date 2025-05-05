import React, { useEffect, useState } from "react";
import { Typography, CardActionArea, Box } from "@mui/material";
import { StyledCard } from "./styled";
import axios from "axios";
import NFTImage from "./NFTImage";

// Define the expected shape of the `nft` prop
interface NFT {
  NFTTokenId: number | string;
  NFTTokenURI: string;
}

// Define the expected structure of the fetched tokenURI data
interface TokenURI {
  image?: string;
  external_url?: string;
}

interface DonatedNFTProps {
  nft: NFT;
}

const DonatedNFT: React.FC<DonatedNFTProps> = ({ nft }) => {
  const [tokenURI, setTokenURI] = useState<TokenURI | null>(null);

  useEffect(() => {
    // Fetch metadata from the provided NFT token URI
    const fetchTokenData = async () => {
      try {
        const { data } = await axios.get<TokenURI>(nft.NFTTokenURI);
        setTokenURI(data);
      } catch (error) {
        console.error("Failed to fetch token URI data:", error);
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
            window.open(tokenURI.external_url, "_blank", "noopener");
          }
        }}
      >
        {/* Renders the NFT image */}
        <NFTImage src={tokenURI?.image} />
      </CardActionArea>

      {/* Overlay box for token ID and 'Donated' label */}
      <Box
        sx={{
          display: "flex",
          position: "absolute",
          inset: "16px",
          justifyContent: "space-between",
          pointerEvents: "none", // ensures overlay doesn't interfere with clicks
        }}
      >
        <Typography
          variant="caption"
          style={{ textShadow: "0px 0px 8px #080B2A" }}
          data-testid="NFTTokenId"
        >
          #{nft.NFTTokenId}
        </Typography>
        <Typography
          color="primary"
          style={{ textShadow: "0px 0px 8px #080B2A" }}
        >
          Donated
        </Typography>
      </Box>
    </StyledCard>
  );
};

export default DonatedNFT;
