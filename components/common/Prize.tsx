import { type FC } from 'react';
import { Tr } from 'react-super-responsive-table';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
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

const Prize: FC<PrizeProps> = ({ data }) => {
  return (
    <div className="mt-[50px] md:mt-20">
      <h6 className="text-lg font-medium">LIST OF AVAILABLE PRIZES</h6>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="33%" />
            <col width="33%" />
            <col width="33%" />
          </colgroup>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Prize Type</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Amounts</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of Winners</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <a
                  href="/faq#main-prize"
                  target="_blank"
                  className="[color:inherit] [font-size:inherit]"
                >
                  Main Prize
                </a>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <p>{data?.PrizeAmountEth.toFixed(4)} ETH</p>
                <p>1 Cosmic Signature NFT</p>
                <p>Tokens donated during round, if any</p>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <p>1</p>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <p>Raffle ETH Bidder</p>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <p>
                  {((data?.RaffleAmountEth ?? 0) / (data?.NumRaffleEthWinnersBidding ?? 1)).toFixed(
                    4,
                  )}{' '}
                  ETH
                </p>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <p>{data?.NumRaffleEthWinnersBidding}</p>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <p>Raffle ETH Bidder</p>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <p>1 Cosmic Signature NFT</p>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <p>{data?.NumRaffleNFTWinnersBidding}</p>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <p>Random Walk NFT Staker</p>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <p>1 Cosmic Signature NFT</p>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <p>{data?.NumRaffleNFTWinnersStakingRWalk} or 0</p>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <p>Cosmic Signature NFT Staker</p>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <p>{data?.StakingAmountEth.toFixed(4)} ETH</p>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <p>1</p>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <a
                  href="/faq#chrono-warrior"
                  target="_blank"
                  className="[color:inherit] [font-size:inherit]"
                >
                  Chrono Warrior
                </a>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <p>
                  {(
                    ((data?.CosmicGameBalanceEth ?? 0) * (data?.ChronoWarriorPercentage ?? 0)) /
                    100
                  ).toFixed(4)}{' '}
                  ETH
                </p>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <p>1</p>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <a
                  href="/faq#endurance-champion"
                  target="_blank"
                  className="[color:inherit] [font-size:inherit]"
                >
                  Endurance Champion
                </a>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <p>{(data?.CurNumBids ?? 0) * 10} CST</p>
                <p>1 Cosmic Signature NFT</p>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <p>1</p>
              </TablePrimaryCell>
            </TablePrimaryRow>
            <TablePrimaryRow>
              <TablePrimaryCell>
                <p>Last CST Bidder</p>
              </TablePrimaryCell>
              <TablePrimaryCell>
                <p>{(data?.CurNumBids ?? 0) * 10} CST</p>
                <p>1 Cosmic Signature NFT</p>
              </TablePrimaryCell>
              <TablePrimaryCell align="center">
                <p>1 or 0</p>
              </TablePrimaryCell>
            </TablePrimaryRow>
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
    </div>
  );
};

export default Prize;
