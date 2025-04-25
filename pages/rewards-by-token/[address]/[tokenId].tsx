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
import { GetServerSideProps, GetServerSidePropsContext } from "next";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import api from "../../../services/api";
import { convertTimestampToDateTime, logoImgUrl } from "../../../utils";
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "../../../components/styled";
import { Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { CustomPagination } from "../../../components/CustomPagination";

/* ------------------------------------------------------------------
  Types
------------------------------------------------------------------ */
interface StakeInfo {
  TxHash: string;
  TimeStamp: number;
  NumStakedNFTs: number;
}

interface UnstakeInfo {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  NumStakedNFTs: number;
  MaxUnpaidDepositIndex: number;
  RewardAmountEth: number;
}

interface RewardsRowData {
  DepositTimeStamp: number;
  RoundNum: number;
  DepositId: number;
  DepositIndex: number;
  Claimed: boolean;
  RewardEth: number;
  Stake: StakeInfo;
  Unstake: UnstakeInfo;
}

/* ------------------------------------------------------------------
  Custom Hook: useRewardsByTokenDetails
  Fetches staking rewards data for a specific user & token.
------------------------------------------------------------------ */
function useRewardsByTokenDetails(address: string, tokenId: number) {
  const [rewardsData, setRewardsData] = useState<RewardsRowData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get_staking_rewards_by_user_by_token_details(
        address,
        tokenId
      );

      // The API returns a map. Convert it to an array
      // and sort if you need to. Example: sort by DepositIndex.
      const arrayData = Object.keys(response)
        .filter((key) => !isNaN(Number(key)))
        .map((key) => response[key]) as RewardsRowData[];

      setRewardsData(arrayData);
    } catch (err) {
      console.error("Error fetching token details:", err);
      setRewardsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, tokenId]);

  return { rewardsData, loading };
}

/* ------------------------------------------------------------------
  Sub-Component: RewardsDetailRow
  Renders a single row (with a collapsible section) in the table.
------------------------------------------------------------------ */
function RewardsDetailRow({ row }: { row: RewardsRowData }) {
  const [open, setOpen] = useState<boolean>(false);

  if (!row) return <TablePrimaryRow />;

  const {
    DepositTimeStamp,
    RoundNum,
    DepositId,
    DepositIndex,
    Claimed,
    RewardEth,
    Stake,
    Unstake,
  } = row;

  return (
    <>
      {/* Main Row */}
      <TablePrimaryRow sx={{ borderBottom: 0 }}>
        <TablePrimaryCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TablePrimaryCell>

        <TablePrimaryCell align="left">
          {convertTimestampToDateTime(DepositTimeStamp)}
        </TablePrimaryCell>

        <TablePrimaryCell align="center">
          <Link
            href={`/prize/${RoundNum}`}
            style={{ color: "inherit", fontSize: "inherit" }}
          >
            {RoundNum}
          </Link>
        </TablePrimaryCell>

        <TablePrimaryCell align="center">{DepositId}</TablePrimaryCell>
        <TablePrimaryCell align="center">
          {Claimed ? "Yes" : "No"}
        </TablePrimaryCell>
        <TablePrimaryCell align="right">
          {RewardEth.toFixed(6)}
        </TablePrimaryCell>
      </TablePrimaryRow>

      {/* Collapsible Row */}
      <TablePrimaryRow sx={{ borderTop: 0 }}>
        <TablePrimaryCell sx={{ py: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Grid container spacing={4}>
              {/* Stake Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Stake</Typography>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Staked Datetime:
                  </Typography>
                  &nbsp;
                  <Link
                    color="inherit"
                    fontSize="inherit"
                    href={`https://arbiscan.io/tx/${Stake.TxHash}`}
                    target="_blank"
                  >
                    <Typography component="span">
                      {convertTimestampToDateTime(Stake.TimeStamp)}
                    </Typography>
                  </Link>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Number of Staked NFTs:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {Stake.NumStakedNFTs}
                  </Typography>
                </Box>
              </Grid>

              {/* Unstake Section (only if EvtLogId != 0) */}
              {Unstake.EvtLogId !== 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Unstake</Typography>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Unstake Datetime:
                    </Typography>
                    &nbsp;
                    <Link
                      color="inherit"
                      fontSize="inherit"
                      href={`https://arbiscan.io/tx/${Unstake.TxHash}`}
                      target="_blank"
                    >
                      <Typography component="span">
                        {convertTimestampToDateTime(Unstake.TimeStamp)}
                      </Typography>
                    </Link>
                  </Box>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Number of Staked NFTs:
                    </Typography>
                    &nbsp;
                    <Typography component="span">
                      {Unstake.NumStakedNFTs}
                    </Typography>
                  </Box>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Max Unpaid Deposit Index:
                    </Typography>
                    &nbsp;
                    <Typography component="span">
                      {Unstake.MaxUnpaidDepositIndex}
                    </Typography>
                  </Box>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Rewards:
                    </Typography>
                    &nbsp;
                    <Typography component="span">
                      {Unstake.RewardAmountEth.toFixed(6)} ETH
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
}

/* ------------------------------------------------------------------
  Sub-Component: RewardsDetailTable
  Renders the table of all reward items, with pagination.
------------------------------------------------------------------ */
function RewardsDetailTable({ list }: { list: RewardsRowData[] }) {
  const PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const paginatedData = list.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

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
              <TablePrimaryHeadCell>Is Claimed?</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Reward (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {paginatedData.map((row) => (
              <RewardsDetailRow key={row.DepositId} row={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
}

/* ------------------------------------------------------------------
  Main Component: RewardsByTokenDetails
------------------------------------------------------------------ */
function RewardsByTokenDetails({
  address,
  tokenId,
}: {
  address: string;
  tokenId: number;
}) {
  const { rewardsData, loading } = useRewardsByTokenDetails(address, tokenId);

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

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <RewardsDetailTable list={rewardsData} />
      )}
    </MainWrapper>
  );
}

/* ------------------------------------------------------------------
  getServerSideProps
------------------------------------------------------------------ */
export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const paramAddress = context.params!.address;
  const paramTokenId = context.params!.tokenId;
  let address = Array.isArray(paramAddress) ? paramAddress[0] : paramAddress;
  let tokenId = Array.isArray(paramTokenId) ? paramTokenId[0] : paramTokenId;

  // (Optional) Validate address or tokenId if needed
  // e.g., if using ethers/utils to check address

  const title = "Rewards Details By Token | Cosmic Signature";
  const description = "Rewards Details By Token";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return {
    props: { title, description, openGraphData, address, tokenId },
  };
};

export default RewardsByTokenDetails;
