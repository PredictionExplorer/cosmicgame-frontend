import { useState } from 'react';
import Link from 'next/link';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime, shortenHex } from '@/utils';

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
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return (
      <p>
        There were no anchored tokens at the time the cycle ended. The deposit amount was forwarded
        to the Public Goods address.
      </p>
    );
  }

  const displayedRecipients = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Anchor-holder</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of NFTs</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Distribution Amount (ETH)</TablePrimaryHeadCell>
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
