import React, { FC } from 'react';
import { Box, Typography, useTheme, useMediaQuery, TableBody, Link } from '@mui/material';
import { Tr } from 'react-super-responsive-table';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '../styled';
import { useTokenPrice } from '../../hooks/useTokenPrice';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

interface PrizeData {
  PrizeAmountEth: number;
  RaffleAmountEth: number;
  NumRaffleEthWinnersBidding: number;
  NumRaffleNFTWinnersBidding: number;
  NumRaffleNFTWinnersStakingRWalk: number;
  StakingAmountEth: number;
  CosmicGameBalanceEth: number;
  ChronoWarriorPercentage: number;
  CurNumBids: number;
}

interface PrizeProps {
  data: PrizeData | null;
}

// -----------------------------
// Prize Component
// -----------------------------
const Prize: FC<PrizeProps> = ({ data }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // Check if screen size is medium or larger
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'));
  const ethPrice = useTokenPrice(); // Get current ETH price in USD

  // Format the ETH prize display based on amount
  const prizeAmount = data?.PrizeAmountEth ?? 0;
  const formattedETH = prizeAmount < 1 ? prizeAmount.toFixed(5) : prizeAmount.toFixed(1);

  const prizeInUSD = (ethPrice * prizeAmount).toFixed(2);

  return (
    <Box mt={isDesktop ? '80px' : '50px'}>
      <Typography variant="h6">LIST OF AVAILABLE PRIZES</Typography>
      <TablePrimaryContainer>
        <TablePrimary>
          {!isMobileView && (
            <colgroup>
              <col width="33%" />
              <col width="33%" />
              <col width="33%" />
            </colgroup>
          )}
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Prize Type</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Amounts</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of Winners</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <Link
                  href="/faq#main-prize"
                  sx={{ color: 'inherit', fontSize: 'inherit' }}
                  target="_blank"
                >
                  Main Prize
                </Link>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>{data?.PrizeAmountEth.toFixed(4)} ETH</Typography>
                <Typography>1 Cosmic Signature NFT</Typography>
                <Typography>Tokens donated during round, if any</Typography>
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
                  {((data?.RaffleAmountEth ?? 0) / (data?.NumRaffleEthWinnersBidding ?? 1)).toFixed(
                    4,
                  )}{' '}
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
                <Typography>{data?.NumRaffleNFTWinnersStakingRWalk} or 0</Typography>
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
                  sx={{ color: 'inherit', fontSize: 'inherit' }}
                  target="_blank"
                >
                  Chrono Warrior
                </Link>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>
                  {(
                    ((data?.CosmicGameBalanceEth ?? 0) * (data?.ChronoWarriorPercentage ?? 0)) /
                    100
                  ).toFixed(4)}{' '}
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
                  sx={{ color: 'inherit', fontSize: 'inherit' }}
                  target="_blank"
                >
                  Endurance Champion
                </Link>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <Typography>{(data?.CurNumBids ?? 0) * 10} CST</Typography>
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
                <Typography>{(data?.CurNumBids ?? 0) * 10} CST</Typography>
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
