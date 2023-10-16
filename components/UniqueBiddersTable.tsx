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

const UniqueBiddersRow = ({ bidder }) => {
  if (!bidder) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          href={`/user/${bidder.BidderAddr}`}
          style={{ color: "rgba(255, 255, 255, 0.68)", fontSize: 14 }}
        >
          {bidder.BidderAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>{bidder.NumBids}</TablePrimaryCell>
      <TablePrimaryCell>{bidder.MaxBidAmountEth.toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueBiddersTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No bidders yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="60%" />
            <col width="20%" />
            <col width="20%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Bidder Address</TableCell>
              <TableCell>Num Bids</TableCell>
              <TableCell>Max Bid (ETH)</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((bidder) => (
              <UniqueBiddersRow bidder={bidder} key={bidder.BidderAid} />
            ))}
          </TableBody>
        </Table>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={page}
          onChange={(e, page) => setPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};
