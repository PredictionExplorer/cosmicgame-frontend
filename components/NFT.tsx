import React from "react";
import { Typography, CardActionArea } from "@mui/material";
import { formatId } from "../utils";
import { NFTSkeleton, NFTInfoWrapper, StyledCard } from "./styled";
import router from "next/router";
import NFTImage from "./NFTImage";

const NFT = ({ nft }) => {
  const fileName = nft.TokenId.toString().padStart(6, "0");
  const image = `https://cosmic-game.s3.us-east-2.amazonaws.com/${fileName}.png`;

  return (
    <StyledCard>
      <CardActionArea onClick={() => router.push(`/detail/${nft.TokenId}`)}>
        {!nft ? (
          <NFTSkeleton animation="wave" variant="rectangular" />
        ) : (
          <NFTImage src={image} />
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
