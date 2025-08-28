import React, { FC } from "react";
import Image from "next/image";
import {
  Box,
  Typography,
  CardActionArea,
  Grid,
  useTheme,
  useMediaQuery,
  TableBody,
} from "@mui/material";
import {
  GradientText,
  StyledCard2,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { useTokenPrice } from "../hooks/useTokenPrice";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

// -----------------------------
// Props Interface
// -----------------------------
interface PrizeProps {
  data: any;
}

// -----------------------------
// Prize Component
// -----------------------------
const Prize: FC<PrizeProps> = ({ data }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md")); // Check if screen size is medium or larger
  const ethPrice = useTokenPrice(); // Get current ETH price in USD

  // Format the ETH prize display based on amount
  const formattedETH =
    data?.PrizeAmountEth < 1
      ? data?.PrizeAmountEth.toFixed(5)
      : data?.PrizeAmountEth.toFixed(1);

  // Calculate the equivalent USD value
  const prizeInUSD = (ethPrice * data?.PrizeAmountEth).toFixed(2);

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

      <TablePrimaryContainer sx={{ mt: 4 }}>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Winner</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Prize</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>Main Prize</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>{data?.PrizeAmountEth.toFixed(4)} ETH</Typography>
                <Typography>1 Cosmic Signature NFT</Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>
                  {data?.NumRaffleEthWinnersBidding} Random Raffle ETH Bidders
                </Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>
                  {(
                    data?.RaffleAmountEth / data?.NumRaffleEthWinnersBidding
                  ).toFixed(4)}{" "}
                  ETH
                </Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>
                  {data?.NumRaffleNFTWinnersBidding} Random Raffle ETH Bidders
                </Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>1 Cosmic Signature NFT</Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>
                  {data?.NumRaffleNFTWinnersStakingRWalk} Random Walk NFT
                  Stakers
                </Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>1 Cosmic Signature NFT</Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>Chrono Warrior</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>
                  {(
                    (data?.CosmicGameBalanceEth *
                      data?.ChronoWarriorPercentage) /
                    100
                  ).toFixed(4)}{" "}
                  ETH
                </Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>Endurance Champion and Last Bidder</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>
                  1 Cosmic Signature NFT and {data?.CurNumBids * 10} CST
                </Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
    </Box>
  );
};

export default Prize;
