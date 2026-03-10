'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Tr, Tbody } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { reportError } from '@/utils/errors';
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '@/components/common/CustomPagination';

/* ------------------------------------------------------------------
  Types
------------------------------------------------------------------ */
interface StakeInfo {
  TxHash: string;
  TimeStamp: number;
  NumStakedNFTs: number;
}

interface UnstakeInfo {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  NumStakedNFTs: number;
  MaxUnpaidDepositIndex: number;
  RewardAmountEth: number;
}

interface RewardsRowData {
  DepositTimeStamp: number;
  RoundNum: number;
  DepositId: number;
  DepositIndex: number;
  Claimed: boolean;
  RewardEth: number;
  Stake: StakeInfo;
  Unstake: UnstakeInfo;
}

/* ------------------------------------------------------------------
  Custom Hook: useRewardsByTokenDetails
------------------------------------------------------------------ */
function useRewardsByTokenDetails(address: string, tokenId: number) {
  const [rewardsData, setRewardsData] = useState<RewardsRowData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get_staking_rewards_by_user_by_token_details(address, tokenId);

      const arrayData = Object.keys(response)
        .filter((key) => !isNaN(Number(key)))
        .map((key) => response[key]) as RewardsRowData[];

      setRewardsData(arrayData);
    } catch (err) {
      reportError(err, 'fetch staking rewards by token');
      setRewardsData([]);
    } finally {
      setLoading(false);
    }
  }, [address, tokenId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rewardsData, loading };
}

/* ------------------------------------------------------------------
  Sub-Component: RewardsDetailRow
------------------------------------------------------------------ */
function RewardsDetailRow({ row }: { row: RewardsRowData }) {
  const [open, setOpen] = useState<boolean>(false);

  if (!row) return <TablePrimaryRow />;

  const { DepositTimeStamp, RoundNum, DepositId, Claimed, RewardEth, Stake, Unstake } = row;

  return (
    <>
      <TablePrimaryRow className="border-b-0">
        <TablePrimaryCell>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="expand row"
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </TablePrimaryCell>

        <TablePrimaryCell align="left">
          {convertTimestampToDateTime(DepositTimeStamp)}
        </TablePrimaryCell>

        <TablePrimaryCell align="center">
          <Link href={`/prize/${RoundNum}`} className="text-inherit text-[inherit]">
            {RoundNum}
          </Link>
        </TablePrimaryCell>

        <TablePrimaryCell align="center">{DepositId}</TablePrimaryCell>
        <TablePrimaryCell align="center">{Claimed ? 'Yes' : 'No'}</TablePrimaryCell>
        <TablePrimaryCell align="right">{RewardEth.toFixed(6)}</TablePrimaryCell>
      </TablePrimaryRow>

      {open && (
        <TablePrimaryRow className="border-t-0">
          <TablePrimaryCell className="!py-0" colSpan={6}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              {/* Stake Section */}
              <div>
                <h6 className="text-lg font-semibold">Stake</h6>
                <div className="mb-2">
                  <span className="text-primary">Staked Datetime:</span>
                  &nbsp;
                  <a
                    className="text-inherit text-[inherit]"
                    href={getExplorerUrl('tx', Stake.TxHash)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{convertTimestampToDateTime(Stake.TimeStamp)}</span>
                  </a>
                </div>
                <div className="mb-2">
                  <span className="text-primary">Number of Staked NFTs:</span>
                  &nbsp;
                  <span>{Stake.NumStakedNFTs}</span>
                </div>
              </div>

              {/* Unstake Section */}
              {Unstake.EvtLogId !== 0 && (
                <div>
                  <h6 className="text-lg font-semibold">Unstake</h6>
                  <div className="mb-2">
                    <span className="text-primary">Unstake Datetime:</span>
                    &nbsp;
                    <a
                      className="text-inherit text-[inherit]"
                      href={getExplorerUrl('tx', Unstake.TxHash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>{convertTimestampToDateTime(Unstake.TimeStamp)}</span>
                    </a>
                  </div>
                  <div className="mb-2">
                    <span className="text-primary">Number of Staked NFTs:</span>
                    &nbsp;
                    <span>{Unstake.NumStakedNFTs}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-primary">Rewards:</span>
                    &nbsp;
                    <span>{Unstake.RewardAmountEth.toFixed(6)} ETH</span>
                  </div>
                </div>
              )}
            </div>
          </TablePrimaryCell>
        </TablePrimaryRow>
      )}
    </>
  );
}

/* ------------------------------------------------------------------
  Sub-Component: RewardsDetailTable
------------------------------------------------------------------ */
function RewardsDetailTable({ list }: { list: RewardsRowData[] }) {
  const PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const paginatedData = list.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell />
              <TablePrimaryHeadCell align="left">Deposit Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Id</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Is Claimed?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Reward (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <Tbody>
            {paginatedData.map((row) => (
              <RewardsDetailRow key={row.DepositId} row={row} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
}

/* ------------------------------------------------------------------
  Main Component: RewardsByTokenPage
------------------------------------------------------------------ */
function RewardsByTokenPage({ address, tokenId }: { address: string; tokenId: number }) {
  const { rewardsData, loading } = useRewardsByTokenDetails(address, tokenId);

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary text-center mb-8">
        Staking Rewards Details for Token {tokenId}
      </h4>

      {loading ? <p>Loading...</p> : <RewardsDetailTable list={rewardsData} />}
    </MainWrapper>
  );
}

export default RewardsByTokenPage;
