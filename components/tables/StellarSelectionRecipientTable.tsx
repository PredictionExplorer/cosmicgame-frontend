import { useEffect, useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useTranslations } from 'next-intl';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimaryContainer,
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

    const fetchCycleTimeoutTimesToRetrieveAllocations = async () => {
      const cycleTimeoutTimesToRetrieveAllocations =
        await (contract.read.roundTimeoutTimesToWithdrawPrizes?.([BigInt(RoundNum)]) ??
          Promise.resolve(0n));
      setRoundTimeoutTimesToWithdrawPrizes(Number(cycleTimeoutTimesToRetrieveAllocations ?? 0));
    };

    void fetchCycleTimeoutTimesToRetrieveAllocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stellarSelectionWalletContract]);

  if (!recipient) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${WinnerAddr}`} className="text-inherit font-mono">
              {shortenHex(WinnerAddr, 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{WinnerAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link href={`/allocation/${RoundNum}`} className="text-inherit">
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        {Amount
          ? t('stellarSelection.ethDeposit')
          : IsStaker && IsRwalk
            ? t('stellarSelection.anchoredNft')
            : IsStaker && !IsRwalk
              ? t('stellarSelection.signatureNftSelection')
              : t('stellarSelection.signatureNft')}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(cycleTimeoutTimesToRetrieveAllocations)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{Amount ? `${Amount.toFixed(4)} ETH` : ' '}</TablePrimaryCell>
      <TablePrimaryCell align="center">
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
          <colgroup>
            <col width="12%" />
            <col width="15%" />
            <col width="9%" />
            <col width="16%" />
            <col width="15%" />
            <col width="13%" />
            <col width="10%" />
          </colgroup>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.recipient')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">{t('columns.cycleHash')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.type')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                {t('columns.expirationDate')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">{t('columns.amount')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">{t('columns.tokenId')}</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((recipient) => (
              <RecipientRow
                key={recipient.Tx?.EvtLogId ?? recipient.EvtLogId}
                recipient={recipient}
              />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default StellarSelectionRecipientTable;
