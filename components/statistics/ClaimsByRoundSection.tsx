'use client';

import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { formatSeconds, formatEthValue, getExplorerUrl, shortenHex } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { AddressLink } from '@/components/common/AddressLink';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { useNow } from '@/hooks/useNow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useClaimsByRound, useClaimDetailByRound } from '@/hooks/useApiQuery';
import type {
  ClaimUnclaimedItem,
  RoundClaimSummary,
  ClaimTxn,
  AttachedToken,
} from '@/services/api/types';

const PER_PAGE = 10;

/** Delegates to the shared address shortener so truncation is consistent app-wide. */
const shortAddr = (a: string) => shortenHex(a);

/** Small labelled count badge; renders nothing when the count is zero. */
const CountBadge = ({ n, label }: { n: number; label: string }) => {
  if (n <= 0) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {n} {label}
    </span>
  );
};

const ItemDetail = ({ item }: { item: ClaimUnclaimedItem }) => {
  const locale = useLocale();
  if (item.AssetType === 'ETH') {
    return <span>{formatEthValue(item.AmountEth)}</span>;
  }
  if (item.AssetType === 'ERC721') {
    return (
      <span className="text-muted-foreground">
        <span className="font-mono">{shortAddr(item.TokenAddr)}</span> #{item.TokenId}
      </span>
    );
  }
  return (
    <span className="text-muted-foreground">
      {item.AmountEth.toLocaleString(locale)} ·{' '}
      <span className="font-mono">{shortAddr(item.TokenAddr)}</span>
    </span>
  );
};

const UnclaimedDialog = ({
  cycle,
  nowSec,
  onClose,
}: {
  cycle: RoundClaimSummary | null;
  nowSec: number;
  onClose: () => void;
}) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const assetLabel: Record<ClaimUnclaimedItem['AssetType'], string> = {
    ETH: t('performance.claims.assets.eth'),
    ERC721: t('performance.claims.assets.nft'),
    ERC20: t('performance.claims.assets.erc20'),
  };

  return (
    <Dialog open={!!cycle} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        {cycle && (
          <>
            <DialogHeader>
              <DialogTitle>
                {t('performance.claims.dialog.unclaimedTitle', { cycle: cycle.RoundNum })}
              </DialogTitle>
              <DialogDescription>
                {cycle.Expired
                  ? t('performance.claims.dialog.expired')
                  : t('performance.claims.dialog.closesIn', {
                      duration: formatSeconds(
                        Math.max(0, cycle.ClaimWindowTimeout - nowSec),
                        locale,
                      ),
                    })}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-auto">
              <TablePrimaryContainer>
                <TablePrimary>
                  <TablePrimaryHead>
                    <Tr>
                      <TablePrimaryHeadCell align="left">
                        {t('performance.claims.dialog.asset')}
                      </TablePrimaryHeadCell>
                      <TablePrimaryHeadCell align="left">
                        {t('performance.claims.dialog.recipient')}
                      </TablePrimaryHeadCell>
                      <TablePrimaryHeadCell align="right">
                        {t('performance.claims.dialog.detail')}
                      </TablePrimaryHeadCell>
                    </Tr>
                  </TablePrimaryHead>
                  <tbody>
                    {cycle.UnclaimedItems.map((item, idx) => (
                      <TablePrimaryRow
                        key={`${item.AssetType}-${item.TokenAddr ?? ''}-${item.TokenId ?? ''}-${item.RecipientAddr ?? idx}`}
                      >
                        <TablePrimaryCell>{assetLabel[item.AssetType]}</TablePrimaryCell>
                        <TablePrimaryCell>
                          {item.RecipientAddr ? (
                            <AddressLink
                              address={item.RecipientAddr}
                              url={`/user/${item.RecipientAddr}`}
                            />
                          ) : (
                            '—'
                          )}
                        </TablePrimaryCell>
                        <TablePrimaryCell align="right">
                          <ItemDetail item={item} />
                        </TablePrimaryCell>
                      </TablePrimaryRow>
                    ))}
                  </tbody>
                </TablePrimary>
              </TablePrimaryContainer>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const TxLink = ({ hash }: { hash: string }) =>
  hash ? (
    <a
      href={getExplorerUrl('tx', hash)}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-primary hover:underline"
    >
      {shortenHex(hash)}
    </a>
  ) : (
    <span className="text-muted-foreground">—</span>
  );

const TxnAssetDetail = ({ txn }: { txn: ClaimTxn }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  if (txn.AssetType === 'ETH') return <span>{formatEthValue(txn.AmountEth)}</span>;
  if (txn.AssetType === 'ERC721')
    return (
      <span>
        {t('performance.claims.assets.nft')}{' '}
        <a
          href={getExplorerUrl('address', txn.TokenAddr)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-primary hover:underline"
        >
          {shortAddr(txn.TokenAddr)}
        </a>{' '}
        #{txn.TokenId}
      </span>
    );
  return (
    <span>
      {txn.AmountEth.toLocaleString(locale)}{' '}
      <a
        href={getExplorerUrl('address', txn.TokenAddr)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-primary hover:underline"
      >
        {shortAddr(txn.TokenAddr)}
      </a>
    </span>
  );
};

/** Explore dialog: the claim transactions (with latency) + tokens attached this cycle. */
const ClaimDetailDialog = ({ round, onClose }: { round: number | null; onClose: () => void }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const { data, isLoading } = useClaimDetailByRound(round);
  const claims: ClaimTxn[] = data?.ClaimTransactions ?? [];
  const attached: AttachedToken[] = data?.AttachedTokens ?? [];

  return (
    <Dialog open={round != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[883px]">
        <DialogHeader>
          <DialogTitle>
            {t('performance.claims.dialog.exploreTitle', { cycle: round ?? 0 })}
          </DialogTitle>
          <DialogDescription>{t('performance.claims.dialog.exploreDescription')}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="max-h-[65vh] space-y-6 overflow-auto">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-white">
                {t('performance.claims.dialog.claimTransactions')}
              </h4>
              {claims.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('performance.claims.dialog.noClaims')}
                </p>
              ) : (
                <TablePrimaryContainer>
                  <TablePrimary>
                    <TablePrimaryHead>
                      <Tr>
                        <TablePrimaryHeadCell align="left">
                          {t('performance.claims.dialog.asset')}
                        </TablePrimaryHeadCell>
                        <TablePrimaryHeadCell align="left">
                          {t('performance.claims.dialog.recipient')}
                        </TablePrimaryHeadCell>
                        <TablePrimaryHeadCell align="right">
                          {t('performance.claims.dialog.claimedAfter')}
                        </TablePrimaryHeadCell>
                        <TablePrimaryHeadCell align="left">
                          {t('performance.claims.dialog.when')}
                        </TablePrimaryHeadCell>
                        <TablePrimaryHeadCell align="right">
                          {t('performance.claims.dialog.transaction')}
                        </TablePrimaryHeadCell>
                      </Tr>
                    </TablePrimaryHead>
                    <tbody>
                      {claims.map((txn, idx) => (
                        <TablePrimaryRow key={txn.TxHash ? `${txn.TxHash}-${idx}` : idx}>
                          <TablePrimaryCell>
                            <TxnAssetDetail txn={txn} />
                          </TablePrimaryCell>
                          <TablePrimaryCell>
                            <AddressLink
                              address={txn.RecipientAddr}
                              url={`/user/${txn.RecipientAddr}`}
                            />
                            {txn.BeneficiaryAddr &&
                              txn.BeneficiaryAddr.toLowerCase() !==
                                txn.RecipientAddr.toLowerCase() && (
                                <span className="block text-xs text-red-400">
                                  {t('performance.claims.dialog.sweptBy', {
                                    address: shortAddr(txn.BeneficiaryAddr),
                                  })}
                                </span>
                              )}
                          </TablePrimaryCell>
                          <TablePrimaryCell align="right">
                            {formatSeconds(Math.max(0, txn.ClaimedAfterSecs), locale)}
                          </TablePrimaryCell>
                          <TablePrimaryCell>
                            <HydrationSafeDateTime timestamp={txn.ClaimTs} locale={locale} />
                          </TablePrimaryCell>
                          <TablePrimaryCell align="right">
                            <TxLink hash={txn.TxHash} />
                          </TablePrimaryCell>
                        </TablePrimaryRow>
                      ))}
                    </tbody>
                  </TablePrimary>
                </TablePrimaryContainer>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-white">
                {t('performance.claims.dialog.attachedTokens')}
              </h4>
              {attached.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('performance.claims.dialog.noAttached')}
                </p>
              ) : (
                <TablePrimaryContainer>
                  <TablePrimary>
                    <TablePrimaryHead>
                      <Tr>
                        <TablePrimaryHeadCell align="left">
                          {t('performance.claims.dialog.asset')}
                        </TablePrimaryHeadCell>
                        <TablePrimaryHeadCell align="left">
                          {t('performance.claims.dialog.token')}
                        </TablePrimaryHeadCell>
                        <TablePrimaryHeadCell align="right">
                          {t('performance.claims.dialog.detail')}
                        </TablePrimaryHeadCell>
                        <TablePrimaryHeadCell align="left">
                          {t('performance.claims.dialog.attachedBy')}
                        </TablePrimaryHeadCell>
                        <TablePrimaryHeadCell align="right">
                          {t('performance.claims.dialog.transaction')}
                        </TablePrimaryHeadCell>
                      </Tr>
                    </TablePrimaryHead>
                    <tbody>
                      {attached.map((tok, idx) => (
                        <TablePrimaryRow key={tok.TxHash ? `${tok.TxHash}-${idx}` : idx}>
                          <TablePrimaryCell>
                            {tok.AssetType === 'ERC721'
                              ? t('performance.claims.assets.nft')
                              : t('performance.claims.assets.erc20')}
                          </TablePrimaryCell>
                          <TablePrimaryCell>
                            <a
                              href={getExplorerUrl('address', tok.TokenAddr)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-primary hover:underline"
                            >
                              {shortAddr(tok.TokenAddr)}
                            </a>
                          </TablePrimaryCell>
                          <TablePrimaryCell align="right">
                            {tok.AssetType === 'ERC721'
                              ? `#${tok.TokenId}`
                              : tok.AmountEth.toLocaleString(locale)}
                          </TablePrimaryCell>
                          <TablePrimaryCell>
                            <AddressLink
                              address={tok.ContributorAddr}
                              url={`/user/${tok.ContributorAddr}`}
                            />
                          </TablePrimaryCell>
                          <TablePrimaryCell align="right">
                            <TxLink hash={tok.TxHash} />
                          </TablePrimaryCell>
                        </TablePrimaryRow>
                      ))}
                    </tbody>
                  </TablePrimary>
                </TablePrimaryContainer>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/** One asset type's claimed percentage; "—" when nothing of that type was awarded. */
const PctRow = ({
  label,
  awarded,
  unclaimed,
}: {
  label: string;
  awarded: number;
  unclaimed: number;
}) => {
  if (awarded <= 0) {
    return (
      <span className="text-muted-foreground">
        {label} <span className="tabular-nums">—</span>
      </span>
    );
  }
  const pct = Math.round(((awarded - unclaimed) / awarded) * 100);
  const tone = pct >= 100 ? 'text-emerald-400' : pct <= 0 ? 'text-red-400' : 'text-white';
  return (
    <span>
      <span className="text-muted-foreground">{label}</span>{' '}
      <span className={`tabular-nums font-medium ${tone}`}>{pct}%</span>
    </span>
  );
};

const ClaimedPctCell = ({ cycle }: { cycle: RoundClaimSummary }) => (
  <span className="inline-flex flex-col items-end gap-0.5 text-xs leading-tight">
    <PctRow label="ETH" awarded={cycle.EthAwarded} unclaimed={cycle.EthUnclaimed} />
    <PctRow label="NFT" awarded={cycle.NftAwarded} unclaimed={cycle.NftUnclaimed} />
    <PctRow label="ERC-20" awarded={cycle.Erc20Awarded} unclaimed={cycle.Erc20Unclaimed} />
  </span>
);

const Row = ({
  cycle,
  onOpen,
  onExplore,
}: {
  cycle?: RoundClaimSummary;
  onOpen: (c: RoundClaimSummary) => void;
  onExplore: (round: number) => void;
}) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  if (!cycle) return <TablePrimaryRow />;

  const hasUnclaimed = cycle.TotalUnclaimed > 0;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell align="center">{cycle.RoundNum}</TablePrimaryCell>
      <TablePrimaryCell>
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <CountBadge n={cycle.EthAwarded} label="ETH" />
          <CountBadge n={cycle.NftAwarded} label="NFT" />
          <CountBadge n={cycle.Erc20Awarded} label="ERC-20" />
        </span>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {hasUnclaimed ? (
          <button
            type="button"
            onClick={() => onOpen(cycle)}
            className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/15"
            title={t('performance.claims.viewUnclaimed')}
          >
            {t('performance.claims.unclaimedCount', {
              count: cycle.TotalUnclaimed.toLocaleString(locale),
            })}
            {cycle.EthUnclaimedEth > 0 && (
              <span className="text-muted-foreground">
                · {formatEthValue(cycle.EthUnclaimedEth)}
              </span>
            )}
          </button>
        ) : (
          <span className="text-muted-foreground">{t('performance.claims.allClaimed')}</span>
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        <ClaimedPctCell cycle={cycle} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {cycle.AvgClaimPeriodSecs > 0 ? (
          formatSeconds(cycle.AvgClaimPeriodSecs, locale)
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        <button
          type="button"
          onClick={() => onExplore(cycle.RoundNum)}
          className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.08]"
        >
          {t('performance.claims.explore')}
        </button>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const ClaimsByRoundSection = () => {
  const t = useTranslations('statistics');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<RoundClaimSummary | null>(null);
  const [exploreRound, setExploreRound] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useClaimsByRound();
  const list = data ?? [];
  // Ticks every 30s so the "claim window closes in …" countdown never goes
  // stale during long sessions (a mount-time snapshot previously froze it).
  const nowSec = Math.floor(useNow(30_000) / 1000);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        {t('performance.claims.description')}
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : isError ? (
        <ErrorState
          title={t('performance.claims.loadErrorTitle')}
          message={t('performance.claims.loadErrorMessage')}
          onRetry={() => refetch()}
          className="py-10"
        />
      ) : list.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">{t('performance.claims.empty')}</p>
      ) : (
        <>
          <TablePrimaryContainer>
            <TablePrimary>
              <TablePrimaryHead>
                <Tr>
                  <TablePrimaryHeadCell align="center">
                    {t('performance.claims.columns.cycle')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="left">
                    {t('performance.claims.columns.awarded')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="right">
                    {t('performance.claims.columns.unclaimed')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="right">
                    {t('performance.claims.columns.claimedPercent')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="right">
                    {t('performance.claims.columns.averageTime')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="right">
                    {t('performance.claims.columns.details')}
                  </TablePrimaryHeadCell>
                </Tr>
              </TablePrimaryHead>
              <tbody>
                {list.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((cycle) => (
                  <Row
                    key={cycle.RoundNum}
                    cycle={cycle}
                    onOpen={setSelected}
                    onExplore={setExploreRound}
                  />
                ))}
              </tbody>
            </TablePrimary>
          </TablePrimaryContainer>
          <CustomPagination
            page={page}
            setPage={setPage}
            totalLength={list.length}
            perPage={PER_PAGE}
          />
        </>
      )}

      <UnclaimedDialog cycle={selected} nowSec={nowSec} onClose={() => setSelected(null)} />
      <ClaimDetailDialog round={exploreRound} onClose={() => setExploreRound(null)} />
    </div>
  );
};

export default ClaimsByRoundSection;
