'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Tr, Tbody } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import {
  DefinitionList,
  DetailRow,
  detailLinkClass,
  detailPanelClass,
} from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useStakingRewardsByUserByTokenDetails } from '@/hooks/useApiQuery';
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
import { cn } from '@/lib/utils';

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
          <Link href={`/allocation/${RoundNum}`} className="text-inherit text-[inherit]">
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
            <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2">
              <div className={cn(detailPanelClass, 'mb-0')}>
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <h3 className="font-display text-sm font-semibold text-foreground">Anchor</h3>
                </div>
                <DefinitionList>
                  <DetailRow label="Anchored datetime">
                    <a
                      className={detailLinkClass}
                      href={getExplorerUrl('tx', Stake.TxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {convertTimestampToDateTime(Stake.TimeStamp)}
                    </a>
                  </DetailRow>
                  <DetailRow label="Number of anchored NFTs">
                    <span className="font-mono tabular-nums">{Stake.NumStakedNFTs}</span>
                  </DetailRow>
                </DefinitionList>
              </div>

              {Unstake.EvtLogId !== 0 ? (
                <div className={cn(detailPanelClass, 'mb-0')}>
                  <div className="border-b border-white/[0.06] px-4 py-3">
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      Release Anchor
                    </h3>
                  </div>
                  <DefinitionList>
                    <DetailRow label="Released datetime">
                      <a
                        className={detailLinkClass}
                        href={getExplorerUrl('tx', Unstake.TxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {convertTimestampToDateTime(Unstake.TimeStamp)}
                      </a>
                    </DetailRow>
                    <DetailRow label="Number of anchored NFTs">
                      <span className="font-mono tabular-nums">{Unstake.NumStakedNFTs}</span>
                    </DetailRow>
                    <DetailRow label="Distribution">
                      <span className="font-mono tabular-nums">
                        {Unstake.RewardAmountEth.toFixed(6)} ETH
                      </span>
                    </DetailRow>
                  </DefinitionList>
                </div>
              ) : (
                <div />
              )}
            </div>
          </TablePrimaryCell>
        </TablePrimaryRow>
      )}
    </>
  );
}

function RewardsDetailTable({ list }: { list: RewardsRowData[] }) {
  const PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const paginatedData = list.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <>
      <SectionCardTableShell>
        <TablePrimaryContainer>
          <TablePrimary>
            <TablePrimaryHead>
              <Tr>
                <TablePrimaryHeadCell>
                  <span className="sr-only">Details</span>
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell align="left">Deposit Datetime</TablePrimaryHeadCell>
                <TablePrimaryHeadCell>Cycle</TablePrimaryHeadCell>
                <TablePrimaryHeadCell>Deposit Id</TablePrimaryHeadCell>
                <TablePrimaryHeadCell>Is Retrieved?</TablePrimaryHeadCell>
                <TablePrimaryHeadCell align="right">Distribution (ETH)</TablePrimaryHeadCell>
              </Tr>
            </TablePrimaryHead>
            <Tbody>
              {paginatedData.map((row) => (
                <RewardsDetailRow key={row.DepositId} row={row} />
              ))}
            </Tbody>
          </TablePrimary>
        </TablePrimaryContainer>
      </SectionCardTableShell>

      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
}

function SectionCardTableShell({ children }: { children: React.ReactNode }) {
  return <div className={cn(detailPanelClass, 'mb-8 overflow-x-auto')}>{children}</div>;
}

function RewardsByTokenPage({ address, tokenId }: { address: string; tokenId: number }) {
  const { data: rawResponse, isLoading: loading } = useStakingRewardsByUserByTokenDetails(
    address,
    tokenId,
  );
  const rewardsData = useMemo(() => {
    if (!rawResponse) return [];
    return Object.keys(rawResponse)
      .filter((key) => !isNaN(Number(key)))
      .map((key) => (rawResponse as Record<string, unknown>)[key]) as RewardsRowData[];
  }, [rawResponse]);

  const pageTitle = `Anchor Distribution Details for Token ${tokenId}`;

  return (
    <MainWrapper className="max-sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title={pageTitle}
          subtitle={`Distributions for ${address}`}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'User', href: `/user/${address}` },
            { label: `Token #${tokenId}` },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <RewardsDetailTable list={rewardsData} />
        )}
      </div>
    </MainWrapper>
  );
}

export default RewardsByTokenPage;
