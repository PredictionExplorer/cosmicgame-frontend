import React, { useEffect, useState } from "react";
import { Box, Button, Link, TableBody, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import { ethers } from "ethers";
import { useActiveWeb3React } from "../../../hooks/web3";
import { useApiData } from "../../../contexts/ApiDataContext";
import useRaffleWalletContract from "../../../hooks/useRaffleWalletContract";
import api from "../../../services/api";
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
import { convertTimestampToDateTime } from "../../../utils";
import { CustomPagination } from "../../../components/CustomPagination";
import getErrorMessage from "../../../utils/alert";
import { useNotification } from "../../../contexts/NotificationContext";

const MyWinningsRow = ({ winning }) => {
  if (!winning) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={`https://arbiscan.io/tx/${winning.TxHash}`}
          target="__blank"
        >
          {convertTimestampToDateTime(winning.TimeStamp)}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${winning.RoundNum}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
          }}
          target="_blank"
        >
          {winning.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winning.Amount.toFixed(4)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const MyWinningsTable = ({ list }) => {
  const perPage = 10;
  const [curPage, setCurPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No Raffle ETH yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Date</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                Amount (ETH)
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((curPage - 1) * perPage, curPage * perPage)
              .map((winning) => (
                <MyWinningsRow key={winning.EvtLogId} winning={winning} />
              ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={curPage}
        setPage={setCurPage}
        totalLength={list.length}
        perPage={perPage}
      />
    </>
  );
};

const UserRaffleETH = ({ address }) => {
  const { account } = useActiveWeb3React();
  const { apiData: status, fetchData: fetchStatusData } = useApiData();
  const [raffleETHToClaim, setRaffleETHToClaim] = useState({
    data: [],
    loading: false,
  });
  const [invalidAddress, setInvalidAddress] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const raffleWalletContract = useRaffleWalletContract();
  const { setNotification } = useNotification();

  const fetchRaffleETHDeposits = async (reload = true) => {
    setRaffleETHToClaim((prev) => ({ ...prev, loading: reload }));
    let deposits = await api.get_raffle_deposits_by_user(address);
    deposits = deposits.sort((a, b) => b.TimeStamp - a.TimeStamp);
    setRaffleETHToClaim({ data: deposits, loading: false });
  };

  const handleAllETHClaim = async () => {
    try {
      setIsClaiming(true);
      const res = await raffleWalletContract.withdraw();
      console.log(res);
      setTimeout(() => {
        fetchStatusData();
        fetchRaffleETHDeposits(false);
        setIsClaiming(false);
      }, 2000);
    } catch (err) {
      console.log(err);
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    if (address) {
      if (address !== "Invalid Address") {
        fetchRaffleETHDeposits();
      } else {
        setInvalidAddress(true);
      }
    }
  }, [address]);

  return (
    <MainWrapper>
      {invalidAddress ? (
        <Typography variant="h6">Invalid Address</Typography>
      ) : (
        <>
          <Box mb={4}>
            <Typography variant="h6" color="primary" component="span" mr={2}>
              User
            </Typography>
            <Typography variant="h6" component="span" fontFamily="monospace">
              {address}
            </Typography>
          </Box>
          <Box mt={4}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6" lineHeight={1}>
                Raffle ETH User Won
              </Typography>
              {status?.ETHRaffleToClaim > 0 && account === address && (
                <Box>
                  <Typography component="span" mr={2}>
                    Your claimable winnings are{" "}
                    {`${status?.ETHRaffleToClaim.toFixed(6)} ETH`}
                  </Typography>
                  <Button
                    onClick={handleAllETHClaim}
                    variant="contained"
                    disabled={isClaiming}
                  >
                    Claim All
                  </Button>
                </Box>
              )}
            </Box>
            {raffleETHToClaim.loading ? (
              <Typography variant="h6">Loading...</Typography>
            ) : (
              <MyWinningsTable list={raffleETHToClaim.data} />
            )}
          </Box>
        </>
      )}
    </MainWrapper>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const params = context.params!.address;
  let address = Array.isArray(params) ? params[0] : params;
  if (ethers.utils.isAddress(address.toLowerCase())) {
    address = ethers.utils.getAddress(address.toLowerCase());
  } else {
    address = "Invalid Address";
  }
  const title = `Raffle ETH User(${address}) Won | Cosmic Signature`;
  const description = `Raffle ETH User(${address}) Won`;
  const imageUrl = "http://69.10.55.2/images/cosmicsignature/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return {
    props: { title, description, openGraphData, address },
  };
}

export default UserRaffleETH;
