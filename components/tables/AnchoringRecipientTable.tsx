import { useState } from 'react';
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
  TablePrimaryHeadCell,
  TablePrimary,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { CSTAnchorDistribution } from '@/services/api';

const RecipientRow = ({ recipient }: { recipient: CSTAnchorDistribution }) => {
  const t = useTranslations('tables');
  const locale = useLocale();

  if (!recipient) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('columns.datetime')}>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', recipient.TxHash ?? '')}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={recipient.TimeStamp ?? 0} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.anchorHolder')} align="left">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${recipient.StakerAddr}`} className="text-inherit font-mono">
              {shortenHex(recipient.StakerAddr ?? '', 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{recipient.StakerAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.numberOfNfts')} align="center">
        {recipient.StakerNumStakedNFTs}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.distributionAmountEth')} align="right">
        {(recipient.StakerAmountEth ?? 0).toFixed(4)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const AnchoringRecipientTable = ({ list }: { list: CSTAnchorDistribution[] }) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>{t('anchoringRecipient.empty')}</p>;
  }

  const displayedRecipients = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.anchorHolder')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.numberOfNfts')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                {t('columns.distributionAmountEth')}
              </TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {displayedRecipients.map((recipient) => (
              <RecipientRow key={recipient.StakerAddr} recipient={recipient} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default AnchoringRecipientTable;
