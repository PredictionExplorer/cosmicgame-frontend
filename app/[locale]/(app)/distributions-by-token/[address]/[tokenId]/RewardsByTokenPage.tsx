'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils';

import { Link } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import {
  DefinitionList,
  DetailRow,
  detailLinkClass,
  detailPanelClass,
} from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
import { useAnchorDistributionsByUserByTokenDetails } from '@/hooks/useApiQuery';
import {
  TablePrimary,
  TablePrimaryBody,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { cn } from '@/lib/utils';

interface AnchorInfo {
  TxHash: string;
  TimeStamp: number;
  NumStakedNFTs: number;
}

interface ReleaseInfo {
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
  Stake: AnchorInfo;
  Unstake: ReleaseInfo;
}

function RewardsDetailRow({ row }: { row: RewardsRowData }) {
  const t = useTranslations('anchoring');
  const locale = useLocale();
  const [open, setOpen] = useState<boolean>(false);

  if (!row) return <TablePrimaryRow />;

  const { DepositTimeStamp, RoundNum, DepositId, Claimed, RewardEth, Stake, Unstake } = row;

  return (
    <>
      <TablePrimaryRow className="border-b-0">
        <TablePrimaryCell label={t('distributionsByToken.columns.details')}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={t('common.aria.expandRow')}
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </TablePrimaryCell>

        <TablePrimaryCell label={t('distributionsByToken.columns.depositDatetime')} align="left">
          <HydrationSafeDateTime timestamp={DepositTimeStamp} locale={locale} />
        </TablePrimaryCell>

        <TablePrimaryCell label={t('distributionsByToken.columns.cycle')} align="center">
          <Link href={`/allocation/${RoundNum}`} className="text-inherit text-[inherit]">
            {RoundNum}
          </Link>
        </TablePrimaryCell>

        <TablePrimaryCell label={t('distributionsByToken.columns.depositId')} align="center">
          {DepositId}
        </TablePrimaryCell>
        <TablePrimaryCell label={t('distributionsByToken.columns.retrieved')} align="center">
          {Claimed ? t('common.yes') : t('common.no')}
        </TablePrimaryCell>
        <TablePrimaryCell label={t('distributionsByToken.columns.distributionEth')} align="right">
          {RewardEth.toFixed(6)}
        </TablePrimaryCell>
      </TablePrimaryRow>

      {open && (
        <TablePrimaryRow className="border-t-0">
          <TablePrimaryCell
            className="!py-0"
            colSpan={6}
            label={t('distributionsByToken.columns.details')}
          >
            <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2">
              <div className={cn(detailPanelClass, 'mb-0')}>
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    {t('distributionsByToken.details.anchorTitle')}
                  </h3>
                </div>
                <DefinitionList>
                  <DetailRow label={t('distributionsByToken.details.anchoredDatetime')}>
                    <a
                      className={detailLinkClass}
                      href={getExplorerUrl('tx', Stake.TxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <HydrationSafeDateTime timestamp={Stake.TimeStamp} locale={locale} />
                    </a>
                  </DetailRow>
                  <DetailRow label={t('distributionsByToken.details.anchoredNfts')}>
                    <span className="font-mono tabular-nums">{Stake.NumStakedNFTs}</span>
                  </DetailRow>
                </DefinitionList>
              </div>

              {Unstake.EvtLogId !== 0 ? (
                <div className={cn(detailPanelClass, 'mb-0')}>
                  <div className="border-b border-white/[0.06] px-4 py-3">
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      {t('distributionsByToken.details.releaseTitle')}
                    </h3>
                  </div>
                  <DefinitionList>
                    <DetailRow label={t('distributionsByToken.details.releasedDatetime')}>
                      <a
                        className={detailLinkClass}
                        href={getExplorerUrl('tx', Unstake.TxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <HydrationSafeDateTime timestamp={Unstake.TimeStamp} locale={locale} />
                      </a>
                    </DetailRow>
                    <DetailRow label={t('distributionsByToken.details.anchoredNfts')}>
                      <span className="font-mono tabular-nums">{Unstake.NumStakedNFTs}</span>
                    </DetailRow>
                    <DetailRow label={t('distributionsByToken.details.distribution')}>
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
  const t = useTranslations('anchoring');
  const PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const paginatedData = list.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <>
      <SectionCardTableShell>
        <TablePrimaryContainer>
          <TablePrimary>
            <TablePrimaryHead>
              <tr>
                <TablePrimaryHeadCell>
                  <span className="sr-only">{t('distributionsByToken.columns.details')}</span>
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell align="left">
                  {t('distributionsByToken.columns.depositDatetime')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('distributionsByToken.columns.cycle')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('distributionsByToken.columns.depositId')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('distributionsByToken.columns.retrieved')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell align="right">
                  {t('distributionsByToken.columns.distributionEth')}
                </TablePrimaryHeadCell>
              </tr>
            </TablePrimaryHead>
            <TablePrimaryBody>
              {paginatedData.map((row) => (
                <RewardsDetailRow key={row.DepositId} row={row} />
              ))}
            </TablePrimaryBody>
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
  return <div className={cn(detailPanelClass, 'mb-8')}>{children}</div>;
}

function RewardsByTokenPage({ address, tokenId }: { address: string; tokenId: number }) {
  const t = useTranslations('anchoring');
  const { data: rawResponse, isLoading: loading } = useAnchorDistributionsByUserByTokenDetails(
    address,
    tokenId,
  );
  const rewardsData = useMemo(() => {
    if (!rawResponse) return [];
    return Object.keys(rawResponse)
      .filter((key) => !isNaN(Number(key)))
      .map((key) => (rawResponse as Record<string, unknown>)[key]) as RewardsRowData[];
  }, [rawResponse]);

  const pageTitle = t('distributionsByToken.title', { tokenId });

  return (
    <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title={pageTitle}
          subtitle={t('distributionsByToken.subtitle', { address })}
          breadcrumbs={[
            { label: t('distributionsByToken.breadcrumbs.home'), href: '/' },
            { label: t('distributionsByToken.breadcrumbs.user'), href: `/user/${address}` },
            { label: t('distributionsByToken.breadcrumbs.token', { tokenId }) },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : (
          <RewardsDetailTable list={rewardsData} />
        )}
      </div>
    </PageShell>
  );
}

export default RewardsByTokenPage;
