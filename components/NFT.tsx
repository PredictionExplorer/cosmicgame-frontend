import React from "react";
import { Typography, CardActionArea, Link } from "@mui/material";
import { formatId } from "../utils";
import { NFTSkeleton, NFTInfoWrapper, StyledCard } from "./styled";
import NFTImage from "./NFTImage";

const NFT = ({ nft }) => {
  const image = `http://69.10.55.2/images/cosmicsignature/0x${nft.Seed}.png`;

  return (
    <StyledCard>
      <CardActionArea>
        {!nft ? (
          <NFTSkeleton animation="wave" variant="rectangular" />
        ) : (
          <Link href={`/detail/${nft.TokenId}`} sx={{ display: "block" }}>
            <NFTImage src={image} />
          </Link>
        )}
        {nft && (
          <NFTInfoWrapper>
            <Typography variant="caption">{formatId(nft.TokenId)}</Typography>
          </NFTInfoWrapper>
        )}
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
