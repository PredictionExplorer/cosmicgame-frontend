import React, { FC } from "react";
import Image from "next/image";
import {
  Box,
  Typography,
  CardActionArea,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { GradientText, StyledCard2 } from "./styled";
import { useTokenPrice } from "../hooks/useTokenPrice";

// -----------------------------
// Props Interface
// -----------------------------
interface PrizeProps {
  prizeAmount: number; // ETH prize amount
}

// -----------------------------
// Prize Component
// -----------------------------
const Prize: FC<PrizeProps> = ({ prizeAmount }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md")); // Check if screen size is medium or larger
  const ethPrice = useTokenPrice(); // Get current ETH price in USD

  // Format the ETH prize display based on amount
  const formattedETH =
    prizeAmount < 1 ? prizeAmount.toFixed(5) : prizeAmount.toFixed(1);

  // Calculate the equivalent USD value
  const prizeInUSD = (ethPrice * prizeAmount).toFixed(2);

  return (
    <Box mt={isDesktop ? "80px" : "50px"}>
      {/* Title/Header */}
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

      {/* Decorative Divider */}
      <Box textAlign="center" mb={6}>
        <Image src="/images/divider.svg" width={93} height={3} alt="divider" />
      </Box>

      {/* Prize Cards Grid */}
      <Grid container spacing={4}>
        {/* NFT Card */}
        <Grid item xs={12} md={6}>
          <StyledCard2>
            <CardActionArea
              sx={{ display: "flex", justifyContent: "start", p: 2 }}
            >
              <Image
                src="/images/CosmicSignatureNFT.png"
                width={88}
                height={88}
                alt="cosmic signature nft"
              />
              <GradientText variant="h5" marginLeft="16px">
                1 Cosmic
                {isDesktop ? " " : <br />}
                Signature NFT
              </GradientText>
            </CardActionArea>
          </StyledCard2>
        </Grid>

        {/* ETH Card */}
        <Grid item xs={12} md={6}>
          <StyledCard2>
            <CardActionArea
              sx={{ display: "flex", justifyContent: "start", p: 2 }}
            >
              <Image
                src="/images/Ethereum.png"
                width={88}
                height={88}
                alt="ethereum logo"
              />
              <GradientText variant="h5" marginLeft="16px">
                {formattedETH} ETH
              </GradientText>
              <Typography color="primary" ml={1}>
                (${prizeInUSD} USD)
              </Typography>
            </CardActionArea>
          </StyledCard2>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Prize;
