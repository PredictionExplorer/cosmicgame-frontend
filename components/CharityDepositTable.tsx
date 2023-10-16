import React, { useState } from "react";
import {
  Box,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import {
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryRow,
} from "./styled";
import { convertTimestampToDateTime } from "../utils";

const DonationRow = ({ donation }) => {
  if (!donation) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(donation.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          color="inherit"
          fontSize="inherit"
          href={`/user/${donation.DonorAddr}`}
        >
          {donation.DonorAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {donation.AmountEth.toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CharityDepositTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No deposits yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="25%" />
            <col width="50%" />
            <col width="25%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Datetime</TableCell>
              <TableCell align="center">Donor Address</TableCell>
              <TableCell align="right">Donation amount (ETH)</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((donation) => (
                <DonationRow donation={donation} key={donation.EvtLogId} />
              ))}
          </TableBody>
        </Table>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={page}
          onChange={(_e, page) => setPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};
