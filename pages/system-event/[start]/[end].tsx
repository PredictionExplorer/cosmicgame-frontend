import React, { useEffect, useState } from "react";
import { Link, TableBody, Tooltip, Typography } from "@mui/material";
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../../../components/styled";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import api from "../../../services/api";
import { convertTimestampToDateTime } from "../../../utils";
import { GetServerSidePropsContext } from "next";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { ADMIN_EVENTS } from "../../../config/misc";
import { CustomPagination } from "../../../components/CustomPagination";

const AdminEventsRow = ({ row }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow
      sx={row.TransferType > 0 && { background: "rgba(255, 255, 255, 0.06)" }}
    >
      <TablePrimaryCell>
        {ADMIN_EVENTS[row.RecordType].name}
        <Tooltip
          title={
            <Typography>{ADMIN_EVENTS[row.RecordType].description}</Typography>
          }
          sx={{ ml: 1 }}
        >
          <ErrorOutlineIcon fontSize="inherit" />
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${row.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(row.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.RecordType === 0 ? (
          "Undefined"
        ) : row.RecordType < 8 || row.RecordType > 15 ? (
          row.IntegerValue
        ) : (
          <Typography fontFamily="monospace">{row.AddressValue}</Typography>
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const AdminEventsTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  if (list.length === 0) {
    return <Typography variant="h6">No events yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Event</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>New Value</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <AdminEventsRow row={row} key={row.EvtLogId} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

const AdminEvent = ({ start, end }) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const sys_events = await api.get_system_events(start, end);
        setEvents(sys_events);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchTransfers();
  }, []);

  return (
    <>
      <MainWrapper>
        <Typography variant="h4" color="primary" textAlign="center" mb={4}>
          Admin Events
        </Typography>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <AdminEventsTable list={events} />
        )}
      </MainWrapper>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let start = context.params!.start;
  let end = context.params!.end;
  start = Array.isArray(start) ? start[0] : start;
  end = Array.isArray(end) ? end[0] : end;
  const title = `Admin Events | Cosmic Signature`;
  const description = `Admin Events`;
  const imageUrl = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return {
    props: {
      title,
      description,
      openGraphData,
      start,
      end,
    },
  };
}

export default AdminEvent;
