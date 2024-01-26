import React, { useEffect, useState } from "react";
import { Typography, CardActionArea, Box } from "@mui/material";
import { StyledCard } from "./styled";
import axios from "axios";
import NFTImage from "./NFTImage";

const DonatedNFT = ({ nft }) => {
  const [tokenURI, setTokenURI] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(nft.NFTTokenURI);
      setTokenURI(data);
    };
    if (nft.NFTTokenURI) {
      fetchData();
    }
  }, []);

  return (
    <StyledCard>
      <CardActionArea
        onClick={() =>
          window.open(tokenURI?.external_url, "_blank", "noopener")
        }
      >
        <NFTImage src={tokenURI?.image} />
      </CardActionArea>
      <Box
        sx={{
          display: "flex",
          position: "absolute",
          inset: "16px",
          justifyContent: "space-between",
          pointerEvents: "none",
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
