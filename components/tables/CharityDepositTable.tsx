import { useState } from 'react';
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

export interface CharityDepositDonation {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  DonorAddr: string;
  AmountEth: number;
}

interface DonationRowProps {
  donation: CharityDepositDonation;
}

interface CharityDepositTableProps {
  list: CharityDepositDonation[];
}

const DonationRow = ({ donation }: DonationRowProps) => {
  if (!donation) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', donation.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(donation.TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {donation.RoundNum < 0 ? (
          ' '
        ) : (
          <a
            className="text-inherit"
            href={`/prize/${donation.RoundNum}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {donation.RoundNum}
          </a>
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink address={donation.DonorAddr} url={`/user/${donation.DonorAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{donation.AmountEth.toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CharityDepositTable = ({ list }: CharityDepositTableProps) => {
  const perPage = 10;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>No contributions yet.</p>;
  }

  const currentData = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Cycle Num</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Contributor Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Contribution amount (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {currentData.map((donation) => (
              <DonationRow donation={donation} key={donation.EvtLogId} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
