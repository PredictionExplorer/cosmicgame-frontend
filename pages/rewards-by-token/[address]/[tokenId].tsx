import React, { useEffect, useState } from "react";
import {
  Box,
  Collapse,
  Grid,
  IconButton,
  Link,
  TableBody,
  Typography,
} from "@mui/material";
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../../../components/styled";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { convertTimestampToDateTime } from "../../../utils";
import api from "../../../services/api";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "../../../components/CustomPagination";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const DetailRow = ({ row }) => {
  const [open, setOpen] = useState(false);
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <>
      <TablePrimaryRow>
        <TablePrimaryCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TablePrimaryCell>
        <TablePrimaryCell align="left">
          {convertTimestampToDateTime(row.DepositTimeStamp)}
        </TablePrimaryCell>
        <TablePrimaryCell align="center">
          <Link
            href={`/prize/${row.RoundNum}`}
            style={{ color: "inherit", fontSize: "inherit" }}
          >
            {row.RoundNum}
          </Link>
        </TablePrimaryCell>
        <TablePrimaryCell align="center">{row.DepositId}</TablePrimaryCell>
        <TablePrimaryCell align="center">{row.DepositIndex}</TablePrimaryCell>
        <TablePrimaryCell align="center">
          {row.Claimed ? "Yes" : "No"}
        </TablePrimaryCell>
        <TablePrimaryCell align="right">
          {row.RewardEth.toFixed(6)}
        </TablePrimaryCell>
      </TablePrimaryRow>
      <TablePrimaryRow sx={{ borderBottom: 0 }}>
        <TablePrimaryCell sx={{ py: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Grid container spacing={4}>
              <Grid item sm={12} md={6}>
                <Typography variant="h6">Stake</Typography>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Staked Datetime:
                  </Typography>
                  &nbsp;
                  <Link
                    color="inherit"
                    fontSize="inherit"
                    href={`https://arbiscan.io/tx/${row.Stake.TxHash}`}
                    target="__blank"
                  >
                    <Typography component="span">
                      {convertTimestampToDateTime(row.Stake.TimeStamp)}
                    </Typography>
                  </Link>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Number of Staked NFTs:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {row.Stake.NumStakedNFTs}
                  </Typography>
                </Box>
              </Grid>
              {row.Unstake.EvtLogId !== 0 && (
                <Grid item sm={12} md={6}>
                  <Typography variant="h6">Unstake</Typography>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Unstake Datetime:
                    </Typography>
                    &nbsp;
                    <Link
                      color="inherit"
                      fontSize="inherit"
                      href={`https://arbiscan.io/tx/${row.Unstake.TxHash}`}
                      target="__blank"
                    >
                      <Typography component="span">
                        {convertTimestampToDateTime(row.Unstake.TimeStamp)}
                      </Typography>
                    </Link>
                  </Box>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Number of Staked NFTs:
                    </Typography>
                    &nbsp;
                    <Typography component="span">
                      {row.Unstake.NumStakedNFTs}
                    </Typography>
                  </Box>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Max Unpaid Deposit Index:
                    </Typography>
                    &nbsp;
                    <Typography component="span">
                      {row.Unstake.MaxUnpaidDepositIndex}
                    </Typography>
                  </Box>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Rewards:
                    </Typography>
                    &nbsp;
                    <Typography component="span">
                      {row.Unstake.RewardAmountEth.toFixed(6)} ETH
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Collapse>
        </TablePrimaryCell>
      </TablePrimaryRow>
    </>
  );
};

const DetailTable = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell />
              <TablePrimaryHeadCell align="left">
                Deposit Datetime
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Id</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Deposit Index</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Is Claimed?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Reward (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <DetailRow row={row} key={row.DepositIndex} />
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

const RewardsByTokenDetails = ({ address, tokenId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await api.get_staking_rewards_by_user_by_token_details(
        address,
        tokenId
      );
      setData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <MainWrapper>
      <Typography
        variant="h4"
        color="primary"
        gutterBottom
        textAlign="center"
        mb={4}
      >
        Staking Rewards Details for Token {tokenId}
      </Typography>
      {loading || data === null ? (
        <Typography>Loading...</Typography>
      ) : (
        <DetailTable
          list={Object.keys(data)
            .filter((key) => !isNaN(Number(key)))
            .map((key) => data[key])}
        />
      )}
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const param1 = context.params!.address;
  const address = Array.isArray(param1) ? param1[0] : param1;
  const param2 = context.params!.tokenId;
  const tokenId = Array.isArray(param2) ? param2[0] : param2;
  const title = "Rewards Details By Token | Cosmic Signature";
  const description = "Rewards Details By Token";
  const imageUrl = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData, address, tokenId } };
};

export default RewardsByTokenDetails;
