import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { DonatedERC20Token } from '@/services/api/types';
import { getDonatedErc20RawClaimAmount } from '@/utils/donatedErc20';

export type { DonatedERC20Token };

interface TokenRowProps {
  token: DonatedERC20Token;
  handleClaim: ((roundNum: number, tokenAddr: string, amount: string) => void) | null;
}

const TokenRow = ({ token, handleClaim }: TokenRowProps) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  if (!token) return <TablePrimaryRow />;

  const donatedEth =
    typeof token.AmountDonatedEth === 'number' && Number.isFinite(token.AmountDonatedEth)
      ? token.AmountDonatedEth
      : 0;
  const claimedEth =
    typeof token.AmountClaimedEth === 'number' && Number.isFinite(token.AmountClaimedEth)
      ? token.AmountClaimedEth
      : 0;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit text-[inherit]"
          href={getExplorerUrl('tx', token.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={token.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/allocation/${token.RoundNum}`}
          className="text-inherit text-[inherit]"
          target="_blank"
          rel="noopener noreferrer"
        >
          {token.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={getExplorerUrl('address', token.TokenAddr)}
              className="text-inherit text-[inherit] font-mono"
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortenHex(token.TokenAddr, 6)}
            </a>
          </TooltipTrigger>
          <TooltipContent>{token.TokenAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{donatedEth.toFixed(2)}</TablePrimaryCell>

      <TablePrimaryCell align="center">{claimedEth.toFixed(2)}</TablePrimaryCell>

      <TablePrimaryCell>
        {token.WinnerAddr ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/user/${token.WinnerAddr}`}
                className="text-inherit text-[inherit] font-mono"
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortenHex(token.WinnerAddr, 6)}
              </Link>
            </TooltipTrigger>
            <TooltipContent>{token.WinnerAddr}</TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {token.Claimed ? t('attachedAssets.status.yes') : t('attachedAssets.status.no')}
      </TablePrimaryCell>

      {handleClaim && (
        <TablePrimaryCell>
          {!token.Claimed && (
            <Button
              onClick={() =>
                handleClaim(token.RoundNum, token.TokenAddr, getDonatedErc20RawClaimAmount(token))
              }
              data-testid="Claim Button"
            >
              {t('attachedAssets.actions.claim')}
            </Button>
          )}
        </TablePrimaryCell>
      )}
    </TablePrimaryRow>
  );
};

interface DonatedERC20TableProps {
  list: DonatedERC20Token[];
  handleClaim: ((roundNum: number, tokenAddr: string, amount: string) => void) | null;
}

const DonatedERC20Table = ({ list, handleClaim }: DonatedERC20TableProps) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState<number>(1);

  if (!list || list.length === 0) {
    return <p>{t('attachedAssets.erc20.empty')}</p>;
  }

  const pageSlice = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="print:hidden">
        <TablePrimaryContainer>
          <TablePrimary>
            <TablePrimaryHead>
              <Tr>
                <TablePrimaryHeadCell align="left">
                  {t('attachedAssets.erc20.columns.datetime')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('attachedAssets.erc20.columns.cycle')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell align="left">
                  {t('attachedAssets.erc20.columns.tokenAddress')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('attachedAssets.erc20.columns.attachedAmount')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('attachedAssets.erc20.columns.retrievedAmount')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('attachedAssets.erc20.columns.recipient')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('attachedAssets.erc20.columns.retrieved')}
                </TablePrimaryHeadCell>
                {handleClaim && (
                  <TablePrimaryHeadCell>
                    <span className="sr-only">{t('attachedAssets.aria.actions')}</span>
                  </TablePrimaryHeadCell>
                )}
              </Tr>
            </TablePrimaryHead>
            <tbody>
              {pageSlice.map((token, i) => (
                <TokenRow key={page * perPage + i} token={token} handleClaim={handleClaim} />
              ))}
            </tbody>
          </TablePrimary>
        </TablePrimaryContainer>

        <CustomPagination
          page={page}
          setPage={setPage}
          totalLength={list.length}
          perPage={perPage}
        />
      </div>
      <AttachedERC20PrintFallback list={list} />
    </>
  );
};

/** Plain table for Save as PDF (Skia often drops responsive-table output). */
function AttachedERC20PrintFallback({ list }: { list: DonatedERC20Token[] }) {
  const t = useTranslations('tables');
  const locale = useLocale();

  return (
    <div
      aria-hidden="true"
      className="hidden rounded-md border-2 border-foreground/40 bg-background p-4 text-sm text-foreground shadow-none [print-color-adjust:exact] print:block"
      data-attached-erc20-print
    >
      <table className="w-full border-collapse border border-foreground/25 text-xs">
        <thead>
          <tr>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              {t('attachedAssets.erc20.columns.datetime')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('attachedAssets.erc20.columns.cycle')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              {t('attachedAssets.erc20.columns.tokenAddress')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('attachedAssets.erc20.columns.attachedAmount')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('attachedAssets.erc20.columns.retrievedAmount')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              {t('attachedAssets.erc20.columns.recipient')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('attachedAssets.erc20.columns.retrieved')}
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((token) => {
            const donatedEth =
              typeof token.AmountDonatedEth === 'number' && Number.isFinite(token.AmountDonatedEth)
                ? token.AmountDonatedEth
                : 0;
            const claimedEth =
              typeof token.AmountClaimedEth === 'number' && Number.isFinite(token.AmountClaimedEth)
                ? token.AmountClaimedEth
                : 0;
            return (
              <tr key={`${token.EvtLogId}-${token.TxHash}-${token.TokenAddr}`}>
                <td className="border border-foreground/15 p-2">
                  <HydrationSafeDateTime timestamp={token.TimeStamp} locale={locale} />
                </td>
                <td className="border border-foreground/15 p-2 text-center">{token.RoundNum}</td>
                <td className="border border-foreground/15 p-2 font-mono break-all">
                  {token.TokenAddr}
                </td>
                <td className="border border-foreground/15 p-2 text-center">
                  {donatedEth.toFixed(2)}
                </td>
                <td className="border border-foreground/15 p-2 text-center">
                  {claimedEth.toFixed(2)}
                </td>
                <td className="border border-foreground/15 p-2 font-mono break-all">
                  {token.WinnerAddr || '—'}
                </td>
                <td className="border border-foreground/15 p-2 text-center">
                  {token.Claimed ? t('attachedAssets.status.yes') : t('attachedAssets.status.no')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DonatedERC20Table;
