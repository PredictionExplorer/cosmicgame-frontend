import React from "react";
import { Typography, CardActionArea, Link } from "@mui/material";
import { formatId, getAssetsUrl } from "../utils";
import { NFTSkeleton, NFTInfoWrapper, StyledCard } from "./styled";
import NFTImage from "./NFTImage";

// NFT component that displays an individual NFT with its image, ID, and name
const NFT = ({
  nft,
}: {
  nft: { TokenId: string; Seed: string; TokenName: string };
}) => {
  // Generate the URL for the NFT's image based on the 'Seed' field
  const image = getAssetsUrl(`cosmicsignature/0x${nft.Seed}.png`);

  return (
    <StyledCard>
      <CardActionArea>
        {/* Show a skeleton loader if the 'nft' data is not yet available */}
        {!nft ? (
          <NFTSkeleton animation="wave" variant="rectangular" />
        ) : (
          // Display the NFT image as a clickable link, leading to the NFT detail page
          <Link href={`/detail/${nft.TokenId}`} sx={{ display: "block" }}>
            <NFTImage src={image} />
          </Link>
        )}

        {/* Display the NFT Token ID if available */}
        {nft && (
          <NFTInfoWrapper>
            <Typography variant="caption">{formatId(nft.TokenId)}</Typography>
          </NFTInfoWrapper>
        )}

        {/* Display the NFT Token Name if it's not an empty string */}
        {nft.TokenName !== "" && (
          <NFTInfoWrapper sx={{ width: "calc(100% - 40px)" }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#FFFFFF", textAlign: "center" }}
            >
              {nft.TokenName}
            </Typography>
          </NFTInfoWrapper>
        )}
      </CardActionArea>
    </StyledCard>
  );
};

export default NFT;
