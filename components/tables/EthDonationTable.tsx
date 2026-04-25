import { useState, type FC } from 'react';
import { useRouter } from 'next/navigation';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';

export interface EthDonation {
  EvtLogId: string | number;
  TxHash: string;
  TimeStamp: number;
  RecordType: number;
  CGRecordId: string | number;
  RoundNum: string | number;
  DonorAddr: string;
  AmountEth: number;
}

interface EthDonationRowProps {
  row: EthDonation;
  showType: boolean;
}

const EthDonationRow: FC<EthDonationRowProps> = ({ row, showType }) => {
  const router = useRouter();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const clickable = row.RecordType > 0 || !showType;

  const handleRowClick = () => {
    if (clickable) {
      router.push(`/eth-contribution/detail/${row.CGRecordId}`);
    }
  };

  return (
    <TablePrimaryRow
      className={clickable ? 'cursor-pointer' : undefined}
      onClick={clickable ? handleRowClick : undefined}
    >
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(row.TimeStamp)}
        </a>
      </TablePrimaryCell>
      {showType && (
        <TablePrimaryCell align="center">
          {row.RecordType ? 'Contribution with info' : 'Simple contribution'}
        </TablePrimaryCell>
      )}
      <TablePrimaryCell align="center">
        <a
          className="text-inherit"
          href={`/allocation/${row.RoundNum}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.RoundNum}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink address={row.DonorAddr} url={`/user/${row.DonorAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{row.AmountEth.toFixed(2)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface EthDonationTableProps {
  list: EthDonation[];
  showType?: boolean;
}

const EthDonationTable: FC<EthDonationTableProps> = ({ list, showType = true }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>No contributions yet.</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const visibleRows = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="20%" />
            {showType && <col width="20%" />}
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
          </colgroup>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              {showType && <TablePrimaryHeadCell>Type</TablePrimaryHeadCell>}
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Contributor</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Amount (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {visibleRows.map((row) => (
              <EthDonationRow key={row.EvtLogId} row={row} showType={showType} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default EthDonationTable;
