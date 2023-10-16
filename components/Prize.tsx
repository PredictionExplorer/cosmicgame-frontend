import React from "react";
import Image from "next/image";
import { Box, Typography, CardActionArea, Grid, useTheme, useMediaQuery } from "@mui/material";
import { GradientText, StyledCard2 } from "./styled";

const Prize = ({ prizeAmount }) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  return (
    <Box mt="130px">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
      >
        <Typography variant="h4" component="span">
          The
        </Typography>
        <Typography
          variant="h4"
          component="span"
          color="primary"
          sx={{ ml: 1.5 }}
        >
          Winner
        </Typography>
        <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
          will Receive
        </Typography>
      </Box>
      <Box textAlign="center" marginBottom="56px">
        <Image
          src={"/images/divider.svg"}
          width={93}
          height={3}
          alt="divider"
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <StyledCard2>
            <CardActionArea
              sx={{ display: "flex", justifyContent: "start", p: "16px" }}
            >
              <Image
                src={"/images/CosmicSignatureNFT.png"}
                width={88}
                height={88}
                alt="cosmic signature nft"
              />
              <GradientText variant="h5" marginLeft="16px">
                1 Cosmic
                {matches ? " " : <br />}
                Signature NFT
              </GradientText>
            </CardActionArea>
          </StyledCard2>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <StyledCard2>
            <CardActionArea
              sx={{ display: "flex", justifyContent: "start", p: "16px" }}
            >
              <Image
                src={"/images/Ethereum.png"}
                width={88}
                height={88}
                alt="cosmic signture nft"
              />
              <GradientText variant="h5" marginLeft="16px">
                {prizeAmount.toFixed(1)} ETH
              </GradientText>
            </CardActionArea>
          </StyledCard2>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Prize;
