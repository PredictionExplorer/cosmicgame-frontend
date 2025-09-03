import React, { FC } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  TableBody,
  Link,
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
      <Typography variant="h6">LIST OF AVAILABLE PRIZES</Typography>
      <TablePrimaryContainer>
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
              <TablePrimaryHeadCell align="left">
                Prize Type
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Amounts</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of Winners</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Link
                  href="/faq#main-prize"
                  sx={{ color: "inherit", fontSize: "inherit" }}
                  target="_blank"
                >
                  Main Prize
                </Link>
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
                <Link
                  href="/faq#chrono-warrior"
                  sx={{ color: "inherit", fontSize: "inherit" }}
                  target="_blank"
                >
                  Chrono Warrior
                </Link>
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
                <Link
                  href="/faq#endurance-champion"
                  sx={{ color: "inherit", fontSize: "inherit" }}
                  target="_blank"
                >
                  Endurance Champion
                </Link>
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
