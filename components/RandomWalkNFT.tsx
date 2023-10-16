import React from "react";
import { Typography, CardActionArea, Card } from "@mui/material";

import { useRWLKNFT } from "../hooks/useRWLKNFT";
import { formatId } from "../utils";
import { NFTSkeleton, NFTInfoWrapper } from "./styled";
import NFTImage from "./NFTImage";

const RandomWalkNFT = ({ tokenId, selected = false, selectable = true }) => {
  const nft = useRWLKNFT(tokenId);
  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: selected ? "#FFFFFF" : "#181F64",
      }}
    >
      <CardActionArea
        href={
          selectable ? "" : `https://www.randomwalknft.com/detail/${tokenId}`
        }
      >
        {!nft ? (
          <NFTSkeleton animation="wave" variant="rectangular" />
        ) : (
          <NFTImage src={nft.black_image_thumb} />
        )}
        {nft && (
          <NFTInfoWrapper>
            <Typography fontSize={11}>{formatId(nft.id)}</Typography>
          </NFTInfoWrapper>
        )}
      </CardActionArea>
    </Card>
  );
};

export default RandomWalkNFT;
