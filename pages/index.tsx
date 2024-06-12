import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Button,
  Box,
  Typography,
  TextField,
  CardActionArea,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Grid,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  InputAdornment,
  Pagination,
  Link,
  Backdrop,
  CircularProgress,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import {
  CustomTextField,
  GradientBorder,
  GradientText,
  MainWrapper,
  StyledCard,
  StyledInput,
} from "../components/styled";
import BiddingHistory from "../components/BiddingHistoryTable";
import api from "../services/api";
import useCosmicGameContract from "../hooks/useCosmicGameContract";
import { BigNumber, Contract, constants, ethers } from "ethers";
import useRWLKNFTContract from "../hooks/useRWLKNFTContract";
import { useActiveWeb3React } from "../hooks/web3";
import { COSMICGAME_ADDRESS } from "../config/app";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FAQ from "../components/FAQ";
import { ArrowForward } from "@mui/icons-material";
import NFT_ABI from "../contracts/RandomWalkNFT.json";
import PaginationRWLKGrid from "../components/PaginationRWLKGrid";
import useCosmicSignatureContract from "../hooks/useCosmicSignatureContract";
import Prize from "../components/Prize";
import LatestNFTs from "../components/LatestNFTs";
import router from "next/router";
import Countdown from "react-countdown";
import Counter from "../components/Counter";
import DonatedNFT from "../components/DonatedNFT";
import {
  Chart,
  ChartArea,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
} from "@progress/kendo-react-charts";
import "@progress/kendo-theme-default/dist/all.css";
import getErrorMessage from "../utils/alert";
import NFTImage from "../components/NFTImage";
import { calculateTimeDiff, formatSeconds } from "../utils";
import WinningHistoryTable from "../components/WinningHistoryTable";
import AlertDialog from "../components/AlertDialog";
import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";

const bidParamsEncoding: ethers.utils.ParamType = {
  type: "tuple(string,int256)",
  name: "bidparams",
  components: [
    { name: "msg", type: "string" },
    { name: "rwalk", type: "int256" },
  ] as Array<ethers.utils.ParamType>,
  baseType: "",
  indexed: false,
  arrayLength: 0,
  arrayChildren: null,
  _isParamType: false,
  format: function(format?: string): string {
    throw new Error("Function not implemented.");
  },
};

const NewHome = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [bidType, setBidType] = useState("");
  const [cstBidData, setCSTBidData] = useState({
    AuctionDuration: 0,
    CSTPrice: 0,
    SecondsElapsed: 0,
  });
  const [curBidList, setCurBidList] = useState([]);
  const [winProbability, setWinProbability] = useState(null);
  const [donatedNFTs, setDonatedNFTs] = useState([]);
  const [prizeTime, setPrizeTime] = useState(0);
  const [prizeInfo, setPrizeInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [nftDonateAddress, setNftDonateAddress] = useState("");
  const [nftId, setNftId] = useState(-1);
  const [rwlkId, setRwlkId] = useState(-1);
  const [bidPricePlus, setBidPricePlus] = useState(2);
  const [isBidding, setIsBidding] = useState(false);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "info" | "warning" | "error";
    visible: boolean;
  }>({
    text: "",
    type: "error",
    visible: false,
  });
  const [bannerTokenId, setBannerTokenId] = useState("");
  const [rwlknftIds, setRwlknftIds] = useState([]);
  const [offset, setOffset] = useState(0);
  const [roundStarted, setRoundStarted] = useState("");
  const [curPage, setCurrentPage] = useState(1);
  const [claimHistory, setClaimHistory] = useState(null);
  const [imageOpen, setImageOpen] = useState(false);
  const [alertDlg, setAlertDlg] = useState({
    title: "",
    content: "",
    open: false,
  });
  const perPage = 12;

  const { library, account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();
  const nftRWLKContract = useRWLKNFTContract();
  const cosmicSignatureContract = useCosmicSignatureContract();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));

  const gridLayout =
    donatedNFTs.length > 16
      ? { xs: 6, sm: 3, md: 2, lg: 2 }
      : donatedNFTs.length > 9
      ? { xs: 6, sm: 4, md: 3, lg: 3 }
      : { xs: 12, sm: 6, md: 4, lg: 4 };

  const series = [
    { category: "Prize", value: data?.PrizePercentage },
    { category: "Raffle", value: data?.RafflePercentage },
    { category: "Charity", value: data?.CharityPercentage },
    { category: "Staking", value: data?.StakignPercentage },
    {
      category: "Next round",
      value:
        100 -
        data?.CharityPercentage -
        data?.RafflePercentage -
        data?.StakignPercentage -
        data?.PrizePercentage,
    },
  ];

  const labelContent = (props) => {
    return `${props.dataItem.category}: ${props.dataItem.value}%`;
  };

  const setAlertOpen = (status) => {
    setAlertDlg((prev) => ({ ...prev, open: status }));
  };

  const onClaimPrize = async () => {
    try {
      const estimageGas = await cosmicGameContract.estimateGas.claimPrize();
      let gasLimit = estimageGas.mul(BigNumber.from(2));
      gasLimit = gasLimit.gt(BigNumber.from(2000000))
        ? gasLimit
        : BigNumber.from(2000000);
      await cosmicGameContract.claimPrize({ gasLimit }).then((tx) => tx.wait());
      const balance = await cosmicSignatureContract.totalSupply();
      let token_id = balance.toNumber() - 1;
      const count =
        data?.NumRaffleNFTWinnersBidding +
        data?.NumRaffleNFTWinnersBidding +
        data?.NumRaffleNFTWinnersStakingRWalk +
        1;
      await Promise.all(
        Array(count)
          .fill(1)
          .map(async (_value, index) => {
            try {
              const seed = await cosmicSignatureContract.seeds(
                token_id - index
              );
              await api.create(token_id - index, seed);
            } catch (error) {
              console.log(error);
            }
          })
      );
      setTimeout(() => {
        router.push({
          pathname: "/prize-claimed",
          query: {
            round: data?.CurRoundNum,
            message: "success",
          },
        });
      }, 1000);
    } catch (err) {
      console.log(err);
      setNotification({
        visible: true,
        type: "error",
        text: err.message,
      });
    }
  };

  const checkIfContractExist = async (address) => {
    try {
      const byteCode = await library.getCode(address);
      if (byteCode === "0x") {
        return false;
      }
    } catch (err) {
      return false;
    }
    return true;
  };

  const checkTokenOwnership = async (address, tokenId) => {
    try {
      const nftDonateContract = new Contract(
        address,
        NFT_ABI,
        library.getSigner(account)
      );
      const addr = await nftDonateContract.ownerOf(tokenId);
      if (addr !== account) {
        setNotification({
          visible: true,
          type: "error",
          text: "You aren't the owner of the token!",
        });
        return false;
      }
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({
          visible: true,
          type: "error",
          text: msg,
        });
      }
      console.log(err);
      return false;
    }
    return true;
  };

  const checkBalance = async (type, amount) => {
    try {
      if (type === "ETH") {
        const ethBalance = await library.getBalance(account);
        return ethBalance.gte(amount);
      }
      const balance = await api.get_user_balance(account);
      if (balance) {
        return (
          Number(ethers.utils.formatEther(balance.CosmicTokenBalance)) >= amount
        );
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  };

  const onBid = async () => {
    let bidPrice, newBidPrice;
    setIsBidding(true);
    try {
      bidPrice = await cosmicGameContract.getBidPrice();
      newBidPrice = bidPrice
        .mul(ethers.utils.parseEther((100 + bidPricePlus).toString()))
        .div(ethers.utils.parseEther("100"));
      if (bidType === "RandomWalk") {
        newBidPrice = newBidPrice
          .mul(ethers.utils.parseEther("50"))
          .div(ethers.utils.parseEther("100"));
      }
      const enoughBalance = await checkBalance("ETH", newBidPrice);
      if (!enoughBalance) {
        setAlertDlg({
          title: "Insufficient ETH balance",
          content: "There isn't enough ETH in you wallet.",
          open: true,
        });
        setIsBidding(false);
        return;
      }
      let receipt;
      if (!nftDonateAddress || nftId === -1) {
        let params = ethers.utils.defaultAbiCoder.encode(
          [bidParamsEncoding],
          [{ msg: message, rwalk: rwlkId }]
        );
        receipt = await cosmicGameContract
          .bid(params, { value: newBidPrice })
          .then((tx) => tx.wait());
        console.log(receipt);
        setTimeout(() => {
          router.reload();
        }, 3000);
        return;
      }
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({
          visible: true,
          type: "error",
          text: msg,
        });
      }
      console.log(err);
      setIsBidding(false);
      return;
    }

    // check if the contract exists
    const isExist = await checkIfContractExist(nftDonateAddress);
    if (!isExist) {
      setNotification({
        visible: true,
        type: "error",
        text: "You selected address that doesn't belong to a contract address!",
      });
      setIsBidding(false);
      return;
    }

    let receipt;
    if (nftDonateAddress && nftId !== -1) {
      const nftDonateContract = new Contract(
        nftDonateAddress,
        NFT_ABI,
        library.getSigner(account)
      );

      try {
        await nftDonateContract.supportsInterface("0x80ac58cd");
      } catch (err) {
        console.log(err);
        setNotification({
          visible: true,
          type: "error",
          text: "The donate NFT contract is not an ERC721 token contract.",
        });
        setIsBidding(false);
        return;
      }

      // owner of
      const isOwner = await checkTokenOwnership(nftDonateAddress, nftId);
      if (!isOwner) {
        setIsBidding(false);
        return;
      }

      try {
        // setApprovalForAll
        const approvedBy = await nftDonateContract.getApproved(nftId);
        const isApprovedForAll = await nftDonateContract.isApprovedForAll(
          account,
          COSMICGAME_ADDRESS
        );
        if (!isApprovedForAll && approvedBy !== COSMICGAME_ADDRESS) {
          await nftDonateContract
            .setApprovalForAll(COSMICGAME_ADDRESS, true)
            .then((tx) => tx.wait());
        }
        let params = ethers.utils.defaultAbiCoder.encode(
          [bidParamsEncoding],
          [{ msg: message, rwalk: rwlkId }]
        );
        receipt = await cosmicGameContract
          .bidAndDonateNFT(params, nftDonateAddress, nftId, {
            value: newBidPrice,
          })
          .then((tx) => tx.wait());
        console.log(receipt);
        setTimeout(() => {
          router.reload();
        }, 4000);
      } catch (err) {
        if (err?.data?.message) {
          const msg = getErrorMessage(err?.data?.message);
          setNotification({
            visible: true,
            type: "error",
            text: msg,
          });
        }
        console.log(err);
        setIsBidding(false);
      }
    }
  };

  const onBidWithCST = async () => {
    setIsBidding(true);
    try {
      if (cstBidData?.CSTPrice > 0) {
        const enoughBalance = await checkBalance("CST", cstBidData?.CSTPrice);
        if (!enoughBalance) {
          setAlertDlg({
            title: "Insufficient CST balance",
            content: "There isn't enough Cosmic Token in you wallet.",
            open: true,
          });
          setIsBidding(false);
          return;
        }
      }
      let receipt = await cosmicGameContract
        .bidWithCST(message)
        .then((tx) => tx.wait());
      console.log(receipt);
      setTimeout(() => {
        router.reload();
      }, 3000);
    } catch (err) {
      if (err?.data?.message) {
        const msg = err?.data?.message;
        setNotification({
          visible: true,
          type: "error",
          text: msg,
        });
      }
      console.log(err);
      setIsBidding(false);
    }
  };

  const playAudio = async () => {
    try {
      const audioElement = new Audio("/audio/notification.wav");
      await audioElement.play();
    } catch (error) {
      console.error("Error requesting sound permission:", error);
    }
  };
  const handleNotificationClose = () => {
    setNotification({ ...notification, visible: false });
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const bidList = await api.get_bid_list();
        const biddedRWLKIds = bidList.map((bid) => bid.RWalkNFTId);
        const tokens = await nftRWLKContract.walletOfOwner(account);
        const nftIds = tokens
          .map((t) => t.toNumber())
          .filter((t) => !biddedRWLKIds.includes(t))
          .reverse();
        setRwlknftIds(nftIds);
      } catch (e) {
        console.log(e);
      }
    };

    if (nftRWLKContract && account) {
      getData();
    }
  }, [nftRWLKContract, account]);

  useEffect(() => {
    const calculateTimeOffset = async () => {
      const current = await api.get_current_time();
      const offset = current * 1000 - Date.now();
      setOffset(offset);
    };

    const fetchData = async () => {
      const newData = await api.get_dashboard_info();
      const round = newData?.CurRoundNum;
      const newBidData = await api.get_bid_list_by_round(round, "desc");
      setCurBidList(newBidData);
      const nftData = await api.get_donations_nft_by_round(round);
      setDonatedNFTs(nftData);
      setData((prevData) => {
        if (
          account !== newData?.LastBidderAddr &&
          prevData &&
          prevData.CurNumBids < newData?.CurNumBids
        ) {
          playAudio();
        }
        return newData;
      });
      setLoading(false);
    };

    const fetchPrizeTime = async () => {
      const t = await api.get_prize_time();
      const current = await api.get_current_time();
      const diff = current * 1000 - Date.now();
      setPrizeTime(t * 1000 - diff);
    };

    const fetchPrizeInfo = async () => {
      const prizeList = await api.get_prize_list();
      let prizeInfo;
      if (prizeList.length) {
        prizeInfo = await api.get_prize_info(prizeList.length - 1);
      } else {
        prizeInfo = null;
      }
      setPrizeInfo(prizeInfo);
    };

    const fetchClaimHistory = async () => {
      const history = await api.get_claim_history();
      setClaimHistory(history);
    };

    const fetchCSTBidData = async () => {
      let ctData = await api.get_ct_price();
      if (ctData) {
        setCSTBidData({
          AuctionDuration: parseInt(ctData.AuctionDuration),
          CSTPrice: parseFloat(ethers.utils.formatEther(ctData.CSTPrice)),
          SecondsElapsed: parseInt(ctData.SecondsElapsed),
        });
      }
    };

    calculateTimeOffset();
    fetchData();
    fetchPrizeInfo();
    fetchPrizeTime();
    fetchClaimHistory();
    fetchCSTBidData();

    // Fetch data every 12 seconds
    const interval = setInterval(() => {
      fetchData();
      fetchPrizeInfo();
      fetchPrizeTime();
      fetchClaimHistory();
      fetchCSTBidData();
    }, 12000);

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const calculateProbability = async () => {
      const { Bids } = await api.get_user_info(account);
      if (Bids) {
        const curRoundBids = Bids.filter(
          (bid) => bid.RoundNum === data.CurRoundNum
        );
        const raffle =
          (curRoundBids.length / curBidList.length) *
          data?.NumRaffleEthWinnersBidding *
          100;
        const nft =
          (curRoundBids.length / curBidList.length) *
          data?.NumRaffleNFTWinnersBidding *
          100;
        setWinProbability({
          raffle: raffle > 100 ? 100 : raffle,
          nft: nft > 100 ? 100 : nft,
        });
      }
    };
    if (data && account && curBidList.length) {
      calculateProbability();
    }
  }, [data, account, curBidList]);

  useEffect(() => {
    if (data) {
      if (data?.MainStats.NumCSTokenMints > 0 && bannerTokenId === "") {
        let bannerId = Math.floor(
          Math.random() * data?.MainStats.NumCSTokenMints
        );
        const fileName = bannerId.toString().padStart(6, "0");
        setBannerTokenId(fileName);
      }
    }
    const interval = setInterval(async () => {
      setRoundStarted(calculateTimeDiff(data?.TsRoundStart - offset / 1000));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data]);

  return (
    <>
      <MainWrapper>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          autoHideDuration={10000}
          open={notification.visible}
          onClose={handleNotificationClose}
        >
          <Alert
            severity={notification.type}
            variant="filled"
            onClose={handleNotificationClose}
          >
            {notification.text}
          </Alert>
        </Snackbar>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={{ lg: 16, md: 8, sm: 8, xs: 4 }} mb={4}>
          <Grid item sm={12} md={6}>
            {!loading && (
              <>
                {data?.TsRoundStart !== 0 ? (
                  <>
                    <Grid container spacing={2} alignItems="center" mb={4}>
                      <Grid item xs={12} sm={4} md={4}>
                        <Typography variant="h5">
                          Round #{data?.CurRoundNum}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={8} md={8} sx={{ width: "100%" }}>
                        {data?.LastBidderAddr !== constants.AddressZero &&
                          (prizeTime > Date.now() ? (
                            <>
                              <Typography
                                variant="subtitle1"
                                textAlign="center"
                                fontWeight={400}
                              >
                                Finishes In
                              </Typography>
                              <Countdown
                                key={0}
                                date={prizeTime}
                                renderer={Counter}
                              />
                            </>
                          ) : (
                            <>
                              <Typography variant="h5" color="primary">
                                Bids exhausted!
                              </Typography>
                              <Typography variant="subtitle2" color="primary">
                                Waiting for the winner to claim the prize.
                              </Typography>
                            </>
                          ))}
                        {roundStarted !== "" && (
                          <Typography sx={{ mt: 1 }}>
                            (Round started {roundStarted} ago)
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <>
                    {data?.CurRoundNum > 0 && data?.TsRoundStart === 0 ? (
                      <>
                        <Typography variant="h4" mb={2}>
                          Round {data?.CurRoundNum - 1} ended
                        </Typography>
                        <Grid container spacing={2} mb={2} alignItems="center">
                          <Grid item sm={12} md={4}>
                            <Typography variant="subtitle1">Winner</Typography>
                          </Grid>
                          <Grid item sm={12} md={8}>
                            <Typography textAlign="center">
                              <Link
                                href={`/user/${prizeInfo?.WinnerAddr}`}
                                color="rgb(255, 255, 255)"
                                fontSize="inherit"
                              >
                                {prizeInfo?.WinnerAddr}
                              </Link>
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2} mb={2} alignItems="center">
                          <Grid item sm={12} md={4}>
                            <Typography variant="subtitle1">
                              Previous Reward
                            </Typography>
                          </Grid>
                          <Grid item sm={12} md={8}>
                            <Typography>
                              {prizeInfo?.AmountEth.toFixed(4)} ETH
                            </Typography>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <Typography variant="subtitle1">
                        Start the game with your first bid!
                      </Typography>
                    )}
                    <Typography variant="subtitle1" mt={2} mb={2}>
                      Be the first to start a new round, place a bid.
                    </Typography>
                  </>
                )}
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} sm={3} md={4}>
                    <Typography variant="subtitle1">Bid Price</Typography>
                  </Grid>
                  <Grid item xs={8} sm={5} md={8}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography>Using Ether</Typography>
                      <Typography>
                        {data?.BidPriceEth.toFixed(6)} ETH
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography>Using RandomWalk</Typography>
                      <Typography>
                        {(data?.BidPriceEth / 2).toFixed(6)} ETH
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography>Using CST</Typography>
                      {cstBidData?.CSTPrice > 0 ? (
                        <Typography>
                          {cstBidData?.CSTPrice.toFixed(6)} CST
                        </Typography>
                      ) : (
                        <Typography color="#ff0">FREE</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
                <Grid container spacing={2} mb={2} alignItems="center">
                  <Grid item xs={12} sm={4} md={4}>
                    <Typography variant="subtitle1">
                      Main Prize Reward
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8} md={8}>
                    <GradientText variant="h6" sx={{ display: "inline" }}>
                      {data?.PrizeAmountEth.toFixed(4)} ETH
                    </GradientText>
                  </Grid>
                </Grid>
                <Grid container spacing={2} mb={2} alignItems="center">
                  <Grid item xs={12} sm={4} md={4}>
                    <Typography variant="subtitle1">
                      Last Bidder Address
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8} md={8}>
                    <Typography>
                      {data?.LastBidderAddr === constants.AddressZero ? (
                        "There is no bidder yet."
                      ) : (
                        <Link
                          href={`/user/${data?.LastBidderAddr}`}
                          color="rgb(255, 255, 255)"
                          fontSize="inherit"
                          sx={{ wordBreak: "break-all" }}
                        >
                          {data?.LastBidderAddr}
                        </Link>
                      )}
                    </Typography>
                  </Grid>
                </Grid>
                {!!(curBidList.length && curBidList[0].Message !== "") && (
                  <Grid container spacing={2} mb={2} alignItems="center">
                    <Grid item xs={12} sm={4} md={4}>
                      <Typography variant="subtitle1">
                        Last Bidder Message
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={8} md={8}>
                      <Typography>{curBidList[0].Message}</Typography>
                    </Grid>
                  </Grid>
                )}
                {curBidList.length > 0 && winProbability && (
                  <Typography mt={4}>
                    {winProbability.raffle.toFixed(2)}% chance you will win{" "}
                    {data?.RaffleAmountEth.toFixed(2)} ETH and{" "}
                    {winProbability.nft.toFixed(2)}% chance you will win a
                    Cosmic Signature NFT for now.
                  </Typography>
                )}
              </>
            )}
          </Grid>
          {matches && (
            <Grid item sm={12} md={6}>
              <StyledCard>
                <CardActionArea>
                  <Link
                    href={bannerTokenId ? `/detail/${bannerTokenId}` : ""}
                    sx={{ display: "block" }}
                  >
                    <NFTImage
                      src={
                        bannerTokenId === ""
                          ? "/images/qmark.png"
                          : `https://cosmic-game2.s3.us-east-2.amazonaws.com/${bannerTokenId}.png`
                      }
                    />
                  </Link>
                </CardActionArea>
              </StyledCard>
              <Typography color="primary" mt={4}>
                Random sample of your possible NFT
              </Typography>
            </Grid>
          )}
        </Grid>
        {account !== null && (
          <>
            <Grid container spacing={matches ? 8 : 0}>
              <Grid item xs={12} sm={8} md={6}>
                <Typography mb={1}>Make your bid with:</Typography>
                <RadioGroup
                  row
                  value={bidType}
                  onChange={(_e, value) => {
                    setRwlkId(-1);
                    setBidType(value);
                  }}
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel
                    value="ETH"
                    control={<Radio size="small" />}
                    label="ETH"
                  />
                  <FormControlLabel
                    value="RandomWalk"
                    control={<Radio size="small" />}
                    label="RandomWalk"
                  />
                  <FormControlLabel
                    value="CST"
                    control={<Radio size="small" />}
                    label="CST(Cosmic Token)"
                  />
                </RadioGroup>
                {bidType === "RandomWalk" && (
                  <Box mb={4} mx={2}>
                    <Typography variant="h6">
                      Random Walk NFT Gallery
                    </Typography>
                    <Typography variant="body2">
                      If you own some RandomWalkNFTs and one of them is used
                      when bidding, you can get a 50% discount!
                    </Typography>
                    <PaginationRWLKGrid
                      loading={false}
                      data={rwlknftIds}
                      selectedToken={rwlkId}
                      setSelectedToken={setRwlkId}
                    />
                  </Box>
                )}
                {bidType === "CST" && (
                  <Box ml={2}>
                    {cstBidData?.SecondsElapsed >
                    cstBidData?.AuctionDuration ? (
                      <Typography variant="subtitle1">
                        Auction ended, you can bid for free.
                      </Typography>
                    ) : (
                      <Grid container spacing={2} mb={2} alignItems="center">
                        <Grid item sm={12} md={5}>
                          <Typography variant="subtitle1">
                            Elapsed Time:
                          </Typography>
                        </Grid>
                        <Grid item sm={12} md={7}>
                          <Typography>
                            {formatSeconds(cstBidData?.SecondsElapsed)}
                          </Typography>
                        </Grid>
                      </Grid>
                    )}
                    <Grid container spacing={2} mb={2} alignItems="center">
                      <Grid item sm={12} md={5}>
                        <Typography variant="subtitle1">
                          Auction Duration:
                        </Typography>
                      </Grid>
                      <Grid item sm={12} md={7}>
                        <Typography>
                          {formatSeconds(cstBidData?.AuctionDuration)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                {bidType !== "" && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Advanced Options</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {bidType !== "CST" && (
                        <>
                          <Typography variant="body2">
                            If you want to donate one of your NFTs while
                            bidding, you can put the contract address, NFT id,
                            and comment here.
                          </Typography>
                          <TextField
                            placeholder="NFT contract address"
                            size="small"
                            fullWidth
                            sx={{ marginTop: 2 }}
                            onChange={(e) =>
                              setNftDonateAddress(e.target.value)
                            }
                          />
                          <TextField
                            placeholder="NFT number"
                            size="small"
                            fullWidth
                            sx={{ marginTop: 2 }}
                            onChange={(e) => setNftId(Number(e.target.value))}
                          />
                        </>
                      )}
                      <TextField
                        placeholder="Message (280 characters)"
                        size="small"
                        multiline
                        fullWidth
                        rows={4}
                        inputProps={{ maxLength: 280 }}
                        sx={{ marginTop: 2 }}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      {bidType !== "CST" && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              marginTop: 2,
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              whiteSpace="nowrap"
                              color="rgba(255, 255, 255, 0.68)"
                              mr={2}
                            >
                              Rise bid price by
                            </Typography>
                            <CustomTextField
                              type="number"
                              placeholder="Bid Price Plus"
                              value={bidPricePlus}
                              size="small"
                              fullWidth
                              InputProps={{
                                inputComponent: StyledInput,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    %
                                  </InputAdornment>
                                ),
                                inputProps: { min: 0, max: 50 },
                              }}
                              onChange={(e) => {
                                let value = Number(e.target.value);
                                if (value <= 50) {
                                  setBidPricePlus(value);
                                }
                              }}
                            />
                            <Typography
                              whiteSpace="nowrap"
                              color="rgba(255, 255, 255, 0.68)"
                              ml={2}
                            >
                              {(
                                data?.BidPriceEth *
                                (1 + bidPricePlus / 100) *
                                (bidType === "RandomWalk" ? 0.5 : 1)
                              ).toFixed(6)}{" "}
                              ETH
                            </Typography>
                          </Box>
                          <Typography variant="body2" mt={2}>
                            The bid price is increased {bidPricePlus}% to
                            prevent bidding collision.
                          </Typography>
                        </>
                      )}
                    </AccordionDetails>
                  </Accordion>
                )}
              </Grid>
              <Grid item xs={12} sm={4} md={6}>
                <Button
                  variant="outlined"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={bidType === "CST" ? onBidWithCST : onBid}
                  fullWidth
                  disabled={
                    isBidding ||
                    (bidType === "RandomWalk" && rwlkId === -1) ||
                    bidType === ""
                  }
                  sx={{ mt: 3 }}
                >
                  {`Bid now with ${bidType} ${
                    bidType === "ETH"
                      ? `(${
                          data?.BidPriceEth * (1 + bidPricePlus / 100) > 0.1
                            ? (
                                data?.BidPriceEth *
                                (1 + bidPricePlus / 100)
                              ).toFixed(2)
                            : (
                                data?.BidPriceEth *
                                (1 + bidPricePlus / 100)
                              ).toFixed(5)
                        } ETH)`
                      : bidType === "RandomWalk"
                      ? ` token ${rwlkId} (${
                          data?.BidPriceEth * (1 + bidPricePlus / 100) > 0.2
                            ? (
                                data?.BidPriceEth *
                                (1 + bidPricePlus / 100) *
                                0.5
                              ).toFixed(2)
                            : (
                                data?.BidPriceEth *
                                (1 + bidPricePlus / 100) *
                                0.5
                              ).toFixed(5)
                        } ETH)`
                      : bidType === "CST"
                      ? cstBidData?.SecondsElapsed > cstBidData?.AuctionDuration
                        ? "(FREE BID)"
                        : `(${cstBidData?.CSTPrice.toFixed(2)} CST)`
                      : ""
                  }`}
                </Button>
                {!(
                  prizeTime > Date.now() ||
                  data?.LastBidderAddr === constants.AddressZero ||
                  loading
                ) && (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={onClaimPrize}
                      fullWidth
                      disabled={
                        data?.LastBidderAddr !== account &&
                        prizeTime > Date.now()
                      }
                      sx={{ mt: 3 }}
                    >
                      Claim Prize
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {prizeTime > Date.now() &&
                          data?.LastBidderAddr !== account && (
                            <>
                              available in &nbsp;
                              <Countdown date={prizeTime} />
                            </>
                          )}
                        &nbsp;
                        <ArrowForward sx={{ width: 22, height: 22 }} />
                      </Box>
                    </Button>
                    {data?.LastBidderAddr !== account &&
                      prizeTime > Date.now() && (
                        <Typography
                          variant="body2"
                          fontStyle="italic"
                          textAlign="right"
                          color="primary"
                          mt={2}
                        >
                          Please wait until the last bidder claims the prize.
                        </Typography>
                      )}
                  </>
                )}
                {!matches && (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={() => setImageOpen(true)}
                  >
                    Show Random Sample NFT
                  </Button>
                )}
              </Grid>
            </Grid>
            <Typography variant="body2" mt={4}>
              When you bid, you will get 100 tokens as a reward. These tokens
              allow you to participate in the DAO.
            </Typography>
            <Box mt={2}>
              <Typography variant="body2" color="primary" component="span">
                *
              </Typography>
              <Typography variant="body2" component="span">
                When you bid, you are also buying a raffle ticket.{" "}
                {data?.NumRaffleETHWinnersBidding} raffle tickets will be chosen
                and these people will win {data?.RafflePercentage}% of the pot
                each. Also, {data?.NumRaffleNFTWinnersBidding} additional
                winners and {data?.NumRaffleNFTWinnersStakingRWalk} Random Walk
                NFT stakers and {data?.NumRaffleNFTWinnersStakingCST} Cosmic
                Token stakers will be chosen which will receive a Cosmic
                Signature NFT.
              </Typography>
            </Box>
          </>
        )}
        <Box mt={6}>
          <Typography variant="subtitle1" color="primary" textAlign="center">
            Distribution of funds on each round
          </Typography>
          <Chart
            transitions={false}
            style={{ width: "100%", height: matches ? 300 : 200 }}
          >
            <ChartLegend position="bottom" labels={{ color: "white" }} />
            <ChartArea background="transparent" />
            <ChartSeries>
              <ChartSeriesItem
                type="pie"
                data={series}
                field="value"
                categoryField="category"
                labels={{
                  visible: true,
                  content: labelContent,
                  color: "white",
                  background: "none",
                }}
              />
            </ChartSeries>
          </Chart>
        </Box>
        <Prize prizeAmount={data?.PrizeAmountEth || 0} />

        <Box margin="100px 0">
          <Typography variant="h4" textAlign="center">
            Every time you bid
          </Typography>
          <Typography
            fontSize={matches ? 22 : 18}
            color="rgba(255, 255, 255, 0.68)"
            textAlign="center"
          >
            you are also buying a raffle ticket. When the round ends, there
            are&nbsp;
            {data?.NumRaffleEthWinnersBidding +
              data?.NumRaffleNFTWinnersBidding}
            &nbsp;raffle winners:
          </Typography>
          <Box textAlign="center" marginBottom="56px">
            <Image
              src={"/images/divider.svg"}
              width={93}
              height={3}
              alt="divider"
            />
          </Box>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <GradientBorder sx={{ padding: "50px" }}>
                <Typography
                  sx={{ fontSize: "26px !important" }}
                  textAlign="center"
                >
                  {data?.NumRaffleEthWinnersBidding} will receive
                </Typography>
                <GradientText variant="h3" textAlign="center">
                  {data?.RaffleAmountEth.toFixed(2)} ETH
                </GradientText>
                <Typography
                  sx={{ fontSize: "22px !important" }}
                  color="rgba(255, 255, 255, 0.68)"
                  textAlign="center"
                >
                  in the pot each
                </Typography>
              </GradientBorder>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <GradientBorder sx={{ padding: "50px" }}>
                <Typography
                  sx={{ fontSize: "26px !important" }}
                  textAlign="center"
                >
                  {data?.NumRaffleNFTWinnersBidding +
                    data?.NumRaffleNFTWinnersStakingCST +
                    data?.NumRaffleNFTWinnersStakingRWalk}{" "}
                  will receive
                </Typography>
                <GradientText variant="h3" textAlign="center">
                  1 Cosmic NFT
                </GradientText>
                <Typography
                  sx={{ fontSize: "22px !important" }}
                  color="rgba(255, 255, 255, 0.68)"
                  textAlign="center"
                >
                  each
                </Typography>
              </GradientBorder>
            </Grid>
          </Grid>
        </Box>
        <Box marginTop="80px">
          <Box>
            <Typography variant="h6" component="span">
              DONATED
            </Typography>
            <Typography variant="h6" color="primary" component="span" mx={1}>
              ERC721 TOKENS
            </Typography>
            <Typography variant="h6" component="span">
              FOR CURRENT ROUND
            </Typography>
          </Box>
          {donatedNFTs.length > 0 ? (
            <>
              <Grid container spacing={2} mt={2}>
                {donatedNFTs.map((nft) => (
                  <Grid
                    item
                    key={nft.RecordId}
                    xs={gridLayout.xs}
                    sm={gridLayout.sm}
                    md={gridLayout.md}
                    lg={gridLayout.lg}
                  >
                    <DonatedNFT nft={nft} />
                  </Grid>
                ))}
              </Grid>
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  color="primary"
                  page={curPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  count={Math.ceil(donatedNFTs.length / perPage)}
                  hideNextButton
                  hidePrevButton
                  shape="rounded"
                />
              </Box>
            </>
          ) : (
            <Typography mt={2}>
              No ERC721 tokens were donated on this round.
            </Typography>
          )}
        </Box>
        <Box mt={matches ? "120px" : "80px"}>
          <Box>
            <Typography variant="h6" component="span">
              CURRENT ROUND
            </Typography>
            <Typography
              variant="h6"
              component="span"
              color="primary"
              sx={{ ml: 1.5 }}
            >
              BID HISTORY
            </Typography>
          </Box>
          <BiddingHistory biddingHistory={curBidList} />
        </Box>
      </MainWrapper>

      <LatestNFTs />

      <Container>
        <Box mt="60px">
          <Typography variant="h4" textAlign="center" mb={6}>
            History of Winnings
          </Typography>
          {claimHistory === null ? (
            <Typography variant="h6">Loading...</Typography>
          ) : (
            <WinningHistoryTable winningHistory={claimHistory} />
          )}
        </Box>

        <Box sx={{ padding: "90px 0 80px" }}>
          <Typography variant="h4" textAlign="center">
            FAQ&#39;S
          </Typography>
          <Box textAlign="center" marginBottom="56px">
            <Image
              src={"/images/divider.svg"}
              width={93}
              height={3}
              alt="divider"
            />
          </Box>
          <FAQ />
        </Box>
      </Container>
      <AlertDialog
        title={alertDlg.title}
        content={alertDlg.content}
        open={alertDlg.open}
        setOpen={setAlertOpen}
      />
      {imageOpen && (
        <Lightbox
          image={
            bannerTokenId === ""
              ? "/images/qmark.png"
              : `https://cosmic-game2.s3.us-east-2.amazonaws.com/${bannerTokenId}.png`
          }
          title="This is a possible image of the NFT you are going to receive."
          onClose={() => setImageOpen(false)}
        />
      )}
    </>
  );
};

export default NewHome;
