import { useState } from 'react';
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
  TablePrimaryHeadCell,
  TablePrimary,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { CSTAnchorDistribution } from '@/services/api';

const RecipientRow = ({ recipient }: { recipient: CSTAnchorDistribution }) => {
  if (!recipient) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', recipient.TxHash ?? '')}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(recipient.TimeStamp ?? 0)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="left">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${recipient.StakerAddr}`} className="text-inherit font-mono">
              {shortenHex(recipient.StakerAddr ?? '', 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{recipient.StakerAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{recipient.StakerNumStakedNFTs}</TablePrimaryCell>
      <TablePrimaryCell align="right">
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
            <Tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.anchorHolder')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.numberOfNfts')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                {t('columns.distributionAmountEth')}
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {displayedRecipients.map((recipient) => (
              <RecipientRow key={recipient.StakerAddr} recipient={recipient} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default AnchoringRecipientTable;
