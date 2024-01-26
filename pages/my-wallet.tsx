import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import Head from "next/head";
import {
  MainWrapper,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryRow,
} from "../components/styled";
import { convertTimestampToDateTime } from "../utils";
import { useActiveWeb3React } from "../hooks/web3";
import useRaffleWalletContract from "../hooks/useRaffleWalletContract";
import { useRouter } from "next/router";
import { useApiData } from "../contexts/ApiDataContext";
import useCosmicGameContract from "../hooks/useCosmicGameContract";
import DonatedNFTTable from "../components/DonatedNFTTable";
import Fireworks, { FireworksHandlers } from "@fireworks-js/react";
import api from "../services/api";

const MyWinningsRow = ({ winning }) => {
  if (!winning) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(winning.TimeStamp)}
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
          {winning.RoundNum + 1}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {winning.Amount.toFixed(4)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const MyWinningsTable = ({ list }) => {
  const perPage = 5;
  const [curPage, setCurPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No Raffle ETH yet.</Typography>;
  }
  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="20%" />
            <col width="60%" />
            <col width="20%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="center">Round</TableCell>
              <TableCell align="right">Amount (ETH)</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((curPage - 1) * perPage, curPage * perPage)
              .map((winning) => (
                <MyWinningsRow key={winning.EvtLogId} winning={winning} />
              ))}
          </TableBody>
        </Table>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={curPage}
          onChange={(_e, page) => setCurPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};

const CSTRow = ({ nft }) => {
  if (!nft) {
    return <TablePrimaryRow></TablePrimaryRow>;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(nft.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/user/${nft.WinnerAddr}`}
          style={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {nft.WinnerAddr}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${nft.TokenId}`}
          style={{ color: "inherit", fontSize: "inherit" }}
        >
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {nft.RecordType === 3 ? (
          <Link
            href={`/prize/${nft.RoundNum}`}
            style={{ color: "inherit", fontSize: "inherit" }}
          >
            Prize Winner (#{nft.RoundNum + 1})
          </Link>
        ) : nft.RecordType === 4 ? (
          "Staking Deposit / Reward"
        ) : (
          "Raffle Winner"
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const CSTTable = ({ list }) => {
  const perPage = 5;
  const [curPage, setCurPage] = useState(1);
  if (list.length === 0) {
    return <Typography>No winnings yet.</Typography>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <Table>
          <colgroup>
            <col width="15%" />
            <col width="55%" />
            <col width="10%" />
            <col width="30%" />
          </colgroup>
          <TablePrimaryHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="center">Winner Address</TableCell>
              <TableCell align="center">Token ID</TableCell>
              <TableCell align="right">Prize Type</TableCell>
            </TableRow>
          </TablePrimaryHead>
          <TableBody>
            {list
              .slice((curPage - 1) * perPage, curPage * perPage)
              .map((nft) => (
                <CSTRow key={nft.EvtLogId} nft={nft} />
              ))}
          </TableBody>
        </Table>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={curPage}
          onChange={(_e, page) => setCurPage(page)}
          count={Math.ceil(list.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
    </>
  );
};

const MyWallet = () => {
  const router = useRouter();
  const ref = useRef<FireworksHandlers>(null);
  const { account } = useActiveWeb3React();
  const { apiData: status } = useApiData();
  const [raffleETHToClaim, setRaffleETHToClaim] = useState({
    data: [],
    loading: false,
  });
  const [CSTList, setCSTList] = useState({
    data: [],
    loading: false,
  });
  const [claimedDonatedNFTs, setClaimedDonatedNFTs] = useState({
    data: [],
    loading: false,
  });
  const [unclaimedDonatedNFTs, setUnclaimedDonatedNFTs] = useState({
    data: [],
    loading: false,
  });
  const [isClaiming, setIsClaiming] = useState({
    donatedNFT: false,
    raffleETH: false,
  });
  const [finishFireworks, setFinishFireworks] = useState(false);

  const cosmicGameContract = useCosmicGameContract();
  const raffleWalletContract = useRaffleWalletContract();

  const handleAllETHClaim = async () => {
    try {
      setIsClaiming({
        ...isClaiming,
        raffleETH: true,
      });
      const res = await raffleWalletContract.withdraw();
      console.log(res);
      setTimeout(() => {
        router.reload();
      }, 4000);
    } catch (err) {
      console.log(err);
      setIsClaiming({
        ...isClaiming,
        raffleETH: false,
      });
    }
  };

  const handleDonatedNFTsClaim = async (e, tokenID) => {
    try {
      e.target.disabled = true;
      e.target.classList.add("Mui-disabled");
      const res = await cosmicGameContract.claimDonatedNFT(tokenID);
      console.log(res);
      setTimeout(() => {
        router.reload();
      }, 4000);
    } catch (err) {
      console.log(err);
      e.target.disabled = false;
      e.target.classList.remove("Mui-disabled");
    }
  };

  const handleAllDonatedNFTsClaim = async () => {
    try {
      setIsClaiming({
        ...isClaiming,
        donatedNFT: true,
      });
      const indexList = unclaimedDonatedNFTs.data.map((item) => item.Index);
      const res = await cosmicGameContract.claimManyDonatedNFTs(indexList);
      console.log(res);
      setTimeout(() => {
        router.reload();
      }, 4000);
    } catch (err) {
      console.log(err);
      setIsClaiming({
        ...isClaiming,
        donatedNFT: false,
      });
    }
  };

  const handleFireworksClick = () => {
    ref.current.stop();
    setFinishFireworks(true);
  };

  const fetchRaffleETHDeposits = async (updateStatus) => {
    setRaffleETHToClaim((prev) => ({ ...prev, loading: updateStatus && true }));
    let deposits = await api.get_raffle_deposits_by_user(account);
    deposits = deposits.sort((a, b) => b.TimeStamp - a.TimeStamp);
    setRaffleETHToClaim({ data: deposits, loading: false });
  };
  const fetchCSTList = async (updateStatus) => {
    setCSTList((prev) => ({ ...prev, loading: updateStatus && true }));
    let cstList = await api.get_cst_list_by_user(account);
    setCSTList({ data: cstList, loading: false });
  };
  const fetchDonatedNFTs = async (updateStatus) => {
    setClaimedDonatedNFTs((prev) => ({
      ...prev,
      loading: updateStatus && true,
    }));
    const claimed = await api.get_claimed_donated_nft_by_user(account);
    setClaimedDonatedNFTs({ data: claimed, loading: false });
    setUnclaimedDonatedNFTs((prev) => ({
      ...prev,
      loading: updateStatus && true,
    }));
    const unclaimed = await api.get_unclaimed_donated_nft_by_user(account);
    setUnclaimedDonatedNFTs({ data: unclaimed, loading: false });
  };
  useEffect(() => {
    fetchRaffleETHDeposits(false);
    fetchCSTList(false);
    fetchDonatedNFTs(false);
  }, [status]);
  useEffect(() => {
    fetchRaffleETHDeposits(true);
    fetchCSTList(true);
    fetchDonatedNFTs(true);
  }, []);

  return (
    <>
      <Head>
        <title>My Wallet | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        {router.query && router.query.message && (
          <>
            <Box px={8} mb={8} sx={{ zIndex: 10002, position: "relative" }}>
              <Alert
                variant="filled"
                severity="success"
                sx={{ boxShadow: "3px 3px 4px 1px #ffffff7f" }}
              >
                {router.query.message === "success"
                  ? "Congratulations! You claimed the prize successfully."
                  : ""}
              </Alert>
            </Box>
            {!finishFireworks && (
              <Fireworks
                ref={ref}
                options={{ opacity: 0.5 }}
                style={{
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  position: "fixed",
                  zIndex: 10000,
                }}
                onClick={handleFireworksClick}
              />
            )}
          </>
        )}
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
        >
          My Wallet
        </Typography>
        <Box mt={6}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5">Raffle ETH I Won</Typography>
            {status?.ETHRaffleToClaim > 0 && (
              <Box>
                <Typography component="span" mr={2}>
                  Your claimable winnings are{" "}
                  {`${status?.ETHRaffleToClaim.toFixed(6)} ETH`}
                </Typography>
                <Button
                  onClick={handleAllETHClaim}
                  variant="contained"
                  disabled={isClaiming.raffleETH}
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
        <Box mt={6}>
          <Typography variant="h5" mb={2}>
            Cosmic Signature Tokens I Won
          </Typography>
          {CSTList.loading ? (
            <Typography variant="h6">Loading...</Typography>
          ) : (
            <CSTTable list={CSTList.data} />
          )}
        </Box>
        <Box mt={6}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5">Donated NFTs I Won</Typography>
            {status?.NumDonatedNFTToClaim > 0 && (
              <Button
                onClick={handleAllDonatedNFTsClaim}
                variant="contained"
                disabled={isClaiming.donatedNFT}
              >
                Claim All
              </Button>
            )}
          </Box>
          {unclaimedDonatedNFTs.loading || claimedDonatedNFTs.loading ? (
            <Typography variant="h6">Loading...</Typography>
          ) : (
            <DonatedNFTTable
              list={[...unclaimedDonatedNFTs.data, ...claimedDonatedNFTs.data]}
              handleClaim={handleDonatedNFTsClaim}
            />
          )}
        </Box>
      </MainWrapper>
    </>
  );
};

export default MyWallet;
