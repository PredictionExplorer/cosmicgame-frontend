import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl, shortenHex } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { Link } from '@/i18n/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimaryContainer,
  TablePrimaryBody,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimary,
  TablePrimaryHeadCell,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import useStellarSelectionWalletContract from '@/hooks/useStellarSelectionWalletContract';
import type { StellarSelectionETHDeposit, StellarSelectionNFTRecipient } from '@/services/api';

type StellarSelectionRecipientEntry = (
  | StellarSelectionETHDeposit
  | StellarSelectionNFTRecipient
) & {
  IsStaker?: boolean;
  IsRwalk?: boolean;
  Amount?: number;
  TokenId?: number | null;
  Tx?: { EvtLogId: number };
};

const RecipientRow = ({ recipient }: { recipient: StellarSelectionRecipientEntry }) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const {
    TxHash = '',
    TimeStamp = 0,
    WinnerAddr = '',
    RoundNum = 0,
    Amount = 0,
    IsStaker = false,
    IsRwalk = false,
    TokenId = null,
  } = recipient;
  const [cycleTimeoutTimesToRetrieveAllocations, setRoundTimeoutTimesToWithdrawPrizes] =
    useState(0);
  const stellarSelectionWalletContract = useStellarSelectionWalletContract();

  useEffect(() => {
    const contract = stellarSelectionWalletContract;
    if (!contract) return;

    let cancelled = false;

    const fetchCycleTimeoutTimesToRetrieveAllocations = async () => {
      const cycleTimeoutTimesToRetrieveAllocations =
        await (contract.read.roundTimeoutTimesToWithdrawPrizes?.([BigInt(RoundNum)]) ??
          Promise.resolve(0n));
      if (cancelled) return;
      setRoundTimeoutTimesToWithdrawPrizes(Number(cycleTimeoutTimesToRetrieveAllocations ?? 0));
    };

    void fetchCycleTimeoutTimesToRetrieveAllocations();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stellarSelectionWalletContract]);

  if (!recipient) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('columns.datetime')}>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.recipient')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${WinnerAddr}`} className="text-inherit font-mono break-all">
              {shortenHex(WinnerAddr, 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{WinnerAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.cycleHash')} align="center">
        <Link href={`/allocation/${RoundNum}`} className="text-inherit">
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.type')}>
        {Amount
          ? t('stellarSelection.ethDeposit')
          : IsStaker && IsRwalk
            ? t('stellarSelection.anchoredNft')
            : IsStaker && !IsRwalk
              ? t('stellarSelection.signatureNftSelection')
              : t('stellarSelection.signatureNft')}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.expirationDate')} align="center">
        <HydrationSafeDateTime timestamp={cycleTimeoutTimesToRetrieveAllocations} locale={locale} />
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.amount')} align="right">
        {Amount ? `${Amount.toFixed(4)} ETH` : ' '}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.tokenId')} align="center">
        {TokenId ? (
          <Link href={`/detail/${TokenId}`} className="text-inherit">
            {TokenId}
          </Link>
        ) : (
          ' '
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const StellarSelectionRecipientTable = ({
  RaffleETHDeposits,
  RaffleNFTWinners,
}: {
  RaffleETHDeposits: StellarSelectionRecipientEntry[];
  RaffleNFTWinners: StellarSelectionRecipientEntry[];
}) => {
  const t = useTranslations('tables');
  const depositsExcludingLast = RaffleETHDeposits.slice(0, -1);
  const list = [...depositsExcludingLast, ...RaffleNFTWinners];

  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>{t('empty.recipients')}</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.recipient')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">{t('columns.cycleHash')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.type')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                {t('columns.expirationDate')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">{t('columns.amount')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">{t('columns.tokenId')}</TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {list.slice((page - 1) * perPage, page * perPage).map((recipient) => (
              <RecipientRow
                key={recipient.Tx?.EvtLogId ?? recipient.EvtLogId}
                recipient={recipient}
              />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default StellarSelectionRecipientTable;
