import React, { FC } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  TableBody,
} from "@mui/material";
import {
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
import { isMobile } from "react-device-detect";

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

      <TablePrimaryContainer sx={{ mt: 4 }}>
        <TablePrimary>
          {!isMobile && (
            <colgroup>
              <col width="33%" />
              <col width="33%" />
              <col width="33%" />
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Winner</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Prize</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of Winners</TablePrimaryHeadCell>
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
              <TablePrimaryCell align="center">
                <Typography>1</Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>Raffle ETH Bidder</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>
                  {(
                    data?.RaffleAmountEth / data?.NumRaffleEthWinnersBidding
                  ).toFixed(4)}{" "}
                  ETH
                </Typography>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <Typography>{data?.NumRaffleEthWinnersBidding}</Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>Raffle ETH Bidder</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>1 Cosmic Signature NFT</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <Typography>{data?.NumRaffleNFTWinnersBidding}</Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>Random Walk NFT Staker</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>1 Cosmic Signature NFT</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <Typography>
                  {data?.NumRaffleNFTWinnersStakingRWalk} or 0
                </Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>Cosmic Signature NFT Staker</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>{data?.StakingAmountEth.toFixed(4)} ETH</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <Typography>1</Typography>
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
              <TablePrimaryCell align="center">
                <Typography>1</Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>Endurance Champion</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>{data?.CurNumBids * 10} CST</Typography>
                <Typography>1 Cosmic Signature NFT</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <Typography>1</Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Typography>Last CST Bidder</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>{data?.CurNumBids * 10} CST</Typography>
                <Typography>1 Cosmic Signature NFT</Typography>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <Typography>1 or 0</Typography>
              </TablePrimaryCell>
            </TablePrimaryRow>
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
    </Box>
  );
};

export default Prize;
