import React, { useState, useEffect } from "react";
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
import { calculateTimeDiff } from "../utils";
import WinningHistoryTable from "../components/WinningHistoryTable";

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
  const [cstBidPrice, setCSTBidPrice] = useState(0);
  const [curBidList, setCurBidList] = useState([]);
  const [donatedNFTs, setDonatedNFTs] = useState([]);
  const [prizeTime, setPrizeTime] = useState(0);
  const [prizeInfo, setPrizeInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [nftDonateAddress, setNftDonateAddress] = useState("");
  const [nftId, setNftId] = useState(-1);
  const [rwlkId, setRwlkId] = useState(-1);
  const [bidPricePlus, setBidPricePlus] = useState(2);
  const [isBidding, setIsBidding] = useState(false);
  const [notification, setNotification] = useState({
    text: "",
    visible: false,
  });
  const [bannerTokenId, setBannerTokenId] = useState("");
  const [rwlknftIds, setRwlknftIds] = useState([]);
  const [roundStarted, setRoundStarted] = useState("");
  const [curPage, setCurrentPage] = useState(1);
  const [claimHistory, setClaimHistory] = useState(null);
  const perPage = 12;
  // const [blackVideo, setBlackVideo] = useState(null);

  const { library, account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();
  const nftRWLKContract = useRWLKNFTContract();
  const cosmicSignatureContract = useCosmicSignatureContract();
  // const ref = useRef(null);
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
    {
      category: "Next round",
      value:
        100 -
        data?.CharityPercentage -
        data?.RafflePercentage -
        data?.PrizePercentage,
    },
  ];

  const labelContent = (props) => {
    return `${props.dataItem.category}: ${props.dataItem.value}%`;
  };

  const onClaimPrize = async () => {
    try {
      const estimageGas = await cosmicGameContract.estimateGas.claimPrize();
      let gasLimit = estimageGas
        .mul(BigNumber.from(115))
        .div(BigNumber.from(100));
      gasLimit = gasLimit.gt(BigNumber.from(2000000))
        ? gasLimit
        : BigNumber.from(2000000);
      await cosmicGameContract.claimPrize({ gasLimit }).then((tx) => tx.wait());
      const balance = await cosmicSignatureContract.totalSupply();
      const token_id = balance.toNumber() - 1;
      const seed = await cosmicSignatureContract.seeds(token_id);
      await api.create(token_id, seed);
      router.push({
        pathname: "/my-wallet",
        query: {
          message: "success",
        },
      });
    } catch (err) {
      console.log(err);
      setNotification({
        visible: true,
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
          text: "You aren't the owner of the token!",
        });
        return false;
      }
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({
          visible: true,
          text: msg,
        });
      }
      console.log(err);
      return false;
    }
    return true;
  };

  const onBid = async () => {
    let bidPrice, newBidPrice;
    setIsBidding(true);
    try {
      bidPrice = await cosmicGameContract.getBidPrice();
      newBidPrice =
        parseFloat(ethers.utils.formatEther(bidPrice)) *
        (1 + bidPricePlus / 100);
      let receipt;
      if (!nftDonateAddress || nftId === -1) {
        let params = ethers.utils.defaultAbiCoder.encode(
          [bidParamsEncoding],
          [{ msg: message, rwalk: rwlkId }]
        );
        receipt = await cosmicGameContract
          .bid(params, {
            value: ethers.utils.parseEther(newBidPrice.toFixed(10)),
          })
          .then((tx) => tx.wait());
        console.log(receipt);
        setTimeout(() => {
          router.reload();
        }, 3000);
        return;
      }
    } catch (err) {
      if (err?.data?.message) {
        const msg = err?.data?.message;
        setNotification({
          visible: true,
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
        text: "You selected address that doesn't belong to a contract address!",
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
      let receipt;
      if (nftDonateAddress && nftId !== -1) {
        // setApprovalForAll
        const nftDonateContract = new Contract(
          nftDonateAddress,
          NFT_ABI,
          library.getSigner(account)
        );
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
            value: ethers.utils.parseEther(newBidPrice.toFixed(10)),
          })
          .then((tx) => tx.wait());
        console.log(receipt);
        setTimeout(() => {
          router.reload();
        }, 4000);
      }
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({
          visible: true,
          text: msg,
        });
      }
      console.log(err);
      setIsBidding(false);
    }
  };

  const onBidWithCST = async () => {
    setIsBidding(true);
    try {
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
          text: msg,
        });
      }
      console.log(err);
      setIsBidding(false);
    }
  };

  const playAudio = async () => {
    console.log("play sounds");
    try {
      const audioElement = new Audio("/audio/notification.wav");
      await audioElement.play();
    } catch (error) {
      console.error("Error requesting sound permission:", error);
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const bidList = await api.get_bid_list();
        const biddedRWLKIds = bidList.map((bid) => bid.RWalkNFTId);
        if (nftRWLKContract && account) {
          const tokens = await nftRWLKContract.walletOfOwner(account);
          const nftIds = tokens
            .map((t) => t.toNumber())
            .filter((t) => !biddedRWLKIds.includes(t))
            .reverse();
          setRwlknftIds(nftIds);
        }
      } catch (e) {
        console.log(e);
      }
    };
    getData();
  }, [nftRWLKContract, account]);

  // useEffect(() => {
  //   if (blackVideo) {
  //     ref.current.load();
  //   }
  // }, [blackVideo]);

  useEffect(() => {
    const fetchData = async () => {
      const newData = await api.get_dashboard_info();
      const round = newData.CurRoundNum;
      const newBidData = await api.get_bid_list_by_round(round, "desc");
      setCurBidList(newBidData);
      const nftData = await api.get_donations_nft_by_round(round);
      setDonatedNFTs(nftData);
      setData((prevData) => {
        if (
          account !== newData.LastBidderAddr &&
          prevData &&
          prevData.CurNumBids < newData.CurNumBids
        ) {
          playAudio();
        }
        return newData;
      });
      setLoading(false);
    };

    const fetchPrizeTime = async () => {
      const t = await api.get_prize_time();
      setPrizeTime(t * 1000);
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
    const fetchCSTBidPrice = async () => {
      let cstPrice = await api.get_cst_price();
      cstPrice = parseFloat(ethers.utils.formatEther(cstPrice));
      setCSTBidPrice(cstPrice);
    };

    fetchData();
    fetchPrizeInfo();
    fetchPrizeTime();
    fetchClaimHistory();
    if (cosmicGameContract) {
      fetchCSTBidPrice();
    }

    // setBlackVideo(
    //   `https://cosmic-game.s3.us-east-2.amazonaws.com/${fileName}.mp4`
    // );
    // Fetch data every 12 seconds
    const interval = setInterval(() => {
      fetchData();
      fetchPrizeInfo();
      fetchPrizeTime();
      fetchClaimHistory();
      if (cosmicGameContract) {
        fetchCSTBidPrice();
      }
    }, 12000);

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (data && bannerTokenId === "") {
      let bannerId = Math.floor(
        Math.random() * data?.MainStats.NumCSTokenMints
      );
      const fileName = bannerId.toString().padStart(6, "0");
      setBannerTokenId(fileName);
    }
    const interval = setInterval(async () => {
      setRoundStarted(calculateTimeDiff(data?.TsRoundStart));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data]);

  return (
    <>
      {/* {blackVideo && (
        <div
          style={{
            position: "fixed",
            top: 125,
            bottom: 64,
            left: 0,
            right: 0,
            zIndex: -1,
          }}
        >
          <video
            autoPlay
            muted
            playsInline
            style={{
              position: "absolute",
              width: "100%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            ref={ref}
          >
            <source src={blackVideo} type="video/mp4"></source>
          </video>
        </div>
      )} */}
      <MainWrapper>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          autoHideDuration={10000}
          open={notification.visible}
          onClose={() => setNotification({ text: "", visible: false })}
        >
          <Alert severity="error" variant="filled">
            {notification.text}
          </Alert>
        </Snackbar>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={8}>
          <Grid item xs={12} sm={12} md={6} lg={6}>
            <StyledCard>
              <CardActionArea
                onClick={
                  bannerTokenId
                    ? () => router.push(`/detail/${bannerTokenId}`)
                    : null
                }
              >
                <NFTImage
                  src={
                    bannerTokenId === ""
                      ? "/images/qmark.png"
                      : `https://cosmic-game.s3.us-east-2.amazonaws.com/${bannerTokenId}.png`
                  }
                />
              </CardActionArea>
            </StyledCard>
            <Typography color="primary" mt={4}>
              Random sample of your possible NFT
            </Typography>
            <Box mt={4}>
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
              <Typography color="primary" mt={4}>
                Distribution of Prize funds
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={6}>
            {data?.LastBidderAddr !== constants.AddressZero ? (
              <>
                <Typography variant="h4" mr={1} component="span">
                  Current Bid
                </Typography>
                <Typography variant="h5" component="span">
                  (Round #{data?.CurRoundNum + 1})
                </Typography>
                {data?.LastBidderAddr !== constants.AddressZero &&
                  (prizeTime > Date.now() ? (
                    <Countdown key={0} date={prizeTime} renderer={Counter} />
                  ) : (
                    <Countdown key={1} date={Date.now()} renderer={Counter} />
                  ))}
                <Box>
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    component="span"
                  >
                    Bid Price:
                  </Typography>
                  &nbsp;
                  <Typography variant="subtitle1" component="span">
                    {data?.BidPriceEth.toFixed(6)} ETH
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    component="span"
                  >
                    CST Bid Price:
                  </Typography>
                  &nbsp;
                  <Typography variant="subtitle1" component="span">
                    {cstBidPrice.toFixed(6)} CST
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    component="span"
                  >
                    Reward:
                  </Typography>
                  &nbsp;
                  <Typography variant="subtitle1" component="span">
                    {data?.PrizeAmountEth.toFixed(4)} ETH
                  </Typography>
                </Box>
                {roundStarted && (
                  <Box>
                    <Typography color="primary" component="span">
                      Round Started:
                    </Typography>
                    &nbsp;
                    <Typography component="span">{roundStarted} ago</Typography>
                  </Box>
                )}
                <Box sx={{ mt: "24px" }}>
                  <Typography color="primary">Last Bidder Address:</Typography>
                  <Typography>
                    {data?.LastBidderAddr === constants.AddressZero ? (
                      "There is no bidder yet."
                    ) : (
                      <Link
                        href={`/user/${data?.LastBidderAddr}`}
                        color="rgb(255, 255, 255)"
                      >
                        {data?.LastBidderAddr}
                      </Link>
                    )}
                  </Typography>
                </Box>
                {!!(curBidList.length && curBidList[0].Message !== "") && (
                  <Box sx={{ mb: "24px" }}>
                    <Typography color="primary" component="span">
                      Last Bidder Message:
                    </Typography>
                    &nbsp;
                    <Typography component="span">
                      {curBidList[0].Message}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <>
                {data?.PrizeAmountEth > 0 ? (
                  <>
                    <Typography variant="h4" mb={2}>
                      Round #{data?.CurRoundNum} ended
                    </Typography>
                    <Box mb={1}>
                      <Typography color="primary" component="span">
                        Winner:
                      </Typography>
                      &nbsp;
                      <Typography component="span">
                        <Link
                          href={`/user/${prizeInfo?.WinnerAddr}`}
                          color="rgb(255, 255, 255)"
                          fontSize="inherit"
                        >
                          {prizeInfo?.WinnerAddr}
                        </Link>
                      </Typography>
                    </Box>
                    <Box>
                      <Typography color="primary" component="span">
                        Previous Round Reward:
                      </Typography>
                      &nbsp;
                      <Typography component="span">
                        {data?.PrizeAmountEth.toFixed(4)} ETH
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="h5">
                    Start the game with your first bid!
                  </Typography>
                )}

                <Typography mt="40px" mb={1}>
                  Be the first to start a new round, place a bid.
                </Typography>
                <Box>
                  <Typography color="primary" component="span">
                    Bid Price:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {data?.BidPriceEth.toFixed(6)} ETH
                  </Typography>
                </Box>
              </>
            )}
            {account !== null && (
              <>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Advanced Options</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {/* Random Walk NFT list */}
                    <Box mb={4}>
                      <Typography variant="h6">
                        Random Walk NFT Gallery
                      </Typography>
                      <Typography variant="body2">
                        If you own some RandomWalkNFTs, you can use them to bid
                        for free! Each NFT can be used only once!
                      </Typography>
                      <PaginationRWLKGrid
                        loading={false}
                        data={rwlknftIds}
                        selectedToken={rwlkId}
                        setSelectedToken={setRwlkId}
                      />
                    </Box>
                    <Typography variant="body2">
                      If you want to donate one of your NFTs while bidding, you
                      can put the contract address, NFT id, and comment here.
                    </Typography>
                    <TextField
                      placeholder="NFT contract address"
                      size="small"
                      fullWidth
                      sx={{ marginTop: 2 }}
                      onChange={(e) => setNftDonateAddress(e.target.value)}
                    />
                    <TextField
                      placeholder="NFT number"
                      size="small"
                      fullWidth
                      sx={{ marginTop: 2 }}
                      onChange={(e) => setNftId(Number(e.target.value))}
                    />
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
                            <InputAdornment position="end">%</InputAdornment>
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
                        {(data?.BidPriceEth * (1 + bidPricePlus / 100)).toFixed(
                          6
                        )}{" "}
                        ETH
                      </Typography>
                    </Box>
                    <Typography variant="body2" mt={2}>
                      The bid price is increased {bidPricePlus}% to prevent
                      bidding collision.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Box mb={2} position="relative">
                  <Grid container spacing={2} mt="25px">
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForward />}
                        onClick={onBid}
                        fullWidth
                        disabled={isBidding}
                      >
                        Bid {rwlkId !== -1 ? "with RandomWalk" : "Now"}
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                      <Button
                        variant="outlined"
                        size="large"
                        endIcon={<ArrowForward />}
                        onClick={onBidWithCST}
                        fullWidth
                        disabled={isBidding}
                      >
                        Bid with CST
                      </Button>
                    </Grid>
                  </Grid>
                  {!(
                    prizeTime > Date.now() ||
                    data?.LastBidderAddr === constants.AddressZero
                  ) && (
                    <Grid container columnSpacing={2} mt="20px">
                      <Grid item xs={12} sm={12} md={12} lg={12}>
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={onClaimPrize}
                          fullWidth
                          disabled={
                            data?.LastBidderAddr !== account &&
                            prizeTime > Date.now()
                          }
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
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
                            >
                              Please wait until the last bidder claims the
                              prize.
                            </Typography>
                          )}
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </>
            )}
            <Typography variant="body2">
              When you bid, you will get 100 tokens as a reward. These tokens
              allow you to participate in the DAO.
            </Typography>
            <Box mt={2}>
              <Typography variant="body2" color="primary" component="span">
                *
              </Typography>
              <Typography variant="body2" component="span">
                When you bid, you are also buying a raffle ticket.{" "}
                {data?.NumRaffleEthWinners} raffle tickets will be chosen and
                these people will win {data?.RafflePercentage}% of the pot each.
                Also, {data?.NumRaffleNFTWinners} additional winners and{" "}
                {data?.NumHolderNFTWinners} Random Walk NFT holders and{" "}
                {data?.NumHolderNFTWinners} CosmicSignature token holders will
                be chosen which will receive a Cosmic Signature NFT.
              </Typography>
            </Box>
          </Grid>
        </Grid>
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
            {data?.NumRaffleEthWinners +
              data?.NumRaffleNFTWinners +
              data?.NumHolderNFTWinners * 2}
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
                  {data?.NumRaffleEthWinners} will receive
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
                  {data?.NumRaffleNFTWinners + data?.NumHolderNFTWinners * 2}{" "}
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
              No ERC721 tokens were donated on this round
            </Typography>
          )}
        </Box>
        <Box mt="120px">
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
    </>
  );
};

export default NewHome;

/*
ToDo list

1. fix claim button error
2. 


*/
