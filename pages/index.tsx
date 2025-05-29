import { useState, useEffect } from "react";
import Image from "next/image";
import { isMobile } from "react-device-detect";
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
  InputAdornment,
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
import api, { cosmicGameBaseUrl } from "../services/api";
import useCosmicGameContract from "../hooks/useCosmicGameContract";
import { BigNumber, Contract, constants, ethers } from "ethers";
import useRWLKNFTContract from "../hooks/useRWLKNFTContract";
import { useActiveWeb3React } from "../hooks/web3";
import {
  ART_BLOCKS_ADDRESS,
  COSMICGAME_ADDRESS,
  RAFFLE_WALLET_ADDRESS,
} from "../config/app";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ArrowForward } from "@mui/icons-material";
import NFT_ABI from "../contracts/RandomWalkNFT.json";
import ERC20_ABI from "../contracts/CosmicToken.json";
import PaginationRWLKGrid from "../components/PaginationRWLKGrid";
import useCosmicSignatureContract from "../hooks/useCosmicSignatureContract";
import Prize from "../components/Prize";
import LatestNFTs from "../components/LatestNFTs";
import Countdown from "react-countdown";
import Counter from "../components/Counter";
import DonatedNFT from "../components/DonatedNFT";
import {
  Chart,
  ChartArea,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";
import "@progress/kendo-theme-default/dist/all.css";
import getErrorMessage from "../utils/alert";
import NFTImage from "../components/NFTImage";
import {
  calculateTimeDiff,
  convertTimestampToDateTime,
  formatSeconds,
  getAssetsUrl,
  getEnduranceChampions,
  logoImgUrl,
} from "../utils";
import WinningHistoryTable from "../components/WinningHistoryTable";
import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";
import { useRouter } from "next/router";
import { CustomPagination } from "../components/CustomPagination";
import { useNotification } from "../contexts/NotificationContext";
import RaffleHolderTable from "../components/RaffleHolderTable";
import { GetServerSideProps } from "next";
import TwitterPopup from "../components/TwitterPopup";
import TwitterShareButton from "../components/TwitterShareButton";
import ETHSpentTable from "../components/ETHSpentTable";
import EnduranceChampionsTable from "../components/EnduranceChampionsTable";
import EthDonationTable from "../components/EthDonationTable";
import axios from "axios";
import { parseUnits } from "ethers/lib/utils";

const NewHome = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [bidType, setBidType] = useState("ETH");
  const [donationType, setDonationType] = useState("NFT");
  const [cstBidData, setCSTBidData] = useState({
    AuctionDuration: 0,
    CSTPrice: 0,
    SecondsElapsed: 0,
  });
  const [curBidList, setCurBidList] = useState([]);
  const [specialWinners, setSpecialWinners] = useState<any>(null);
  const [winProbability, setWinProbability] = useState<any>(null);
  const [ethBidInfo, setEthBidInfo] = useState<any>(null);
  const [donatedNFTs, setDonatedNFTs] = useState([]);
  const [ethDonations, setEthDonations] = useState([]);
  const [championList, setChampionList] = useState<any>(null);
  const [prizeTime, setPrizeTime] = useState(0);
  const [timeoutClaimPrize, setTimeoutClaimPrize] = useState(0);
  const [message, setMessage] = useState("");
  const [nftDonateAddress, setNftDonateAddress] = useState("");
  const [nftId, setNftId] = useState("");
  const [tokenDonateAddress, setTokenDonateAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [rwlkId, setRwlkId] = useState(-1);
  const [bidPricePlus, setBidPricePlus] = useState(2);
  const [isBidding, setIsBidding] = useState(false);
  const [bannerToken, setBannerToken] = useState({ seed: "", id: -1 });
  const [rwlknftIds, setRwlknftIds] = useState<number[]>([]);
  const [offset, setOffset] = useState(0);
  const [roundStarted, setRoundStarted] = useState("");
  const [lastBidderElapsed, setLastBidderElapsed] = useState("");
  const [curPage, setCurrentPage] = useState(1);
  const [claimHistory, setClaimHistory] = useState(null);
  const [imageOpen, setImageOpen] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [twitterPopupOpen, setTwitterPopupOpen] = useState(false);
  const [twitterHandle, setTwitterHandle] = useState("");
  const [activationTime, setActivationTime] = useState(0);
  const perPage = 12;

  const { library, account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();
  const nftRWLKContract = useRWLKNFTContract();
  const cosmicSignatureContract = useCosmicSignatureContract();
  const { setNotification } = useNotification();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));

  const gridLayout =
    donatedNFTs.length > 16
      ? { xs: 6, sm: 3, md: 2, lg: 2 }
      : donatedNFTs.length > 9
      ? { xs: 6, sm: 4, md: 3, lg: 3 }
      : { xs: 12, sm: 6, md: 4, lg: 4 };

  const series = data
    ? [
        { category: "Prize", value: data.PrizePercentage },
        { category: "Raffle", value: data.RafflePercentage },
        { category: "Charity", value: data.CharityPercentage },
        { category: "Staking", value: data.StakignPercentage },
        { category: "Chrono Warrior", value: data.ChronoWarriorPercentage },
        {
          category: "Next round",
          value:
            100 -
            data.CharityPercentage -
            data.RafflePercentage -
            data.StakignPercentage -
            data.ChronoWarriorPercentage -
            data.PrizePercentage,
        },
      ]
    : [];

  const labelContent = (props: any) => {
    return data
      ? `${props.dataItem.category}: ${props.dataItem.value}% (${(
          (props.dataItem.value * data.CosmicGameBalanceEth) /
          100
        ).toFixed(4)} ETH)`
      : "";
  };

  const onClaimPrize = async () => {
    try {
      const estimateGas = await cosmicGameContract.estimateGas.claimMainPrize();
      let gasLimit = estimateGas.mul(BigNumber.from(2));
      gasLimit = gasLimit.gt(BigNumber.from(2000000))
        ? gasLimit
        : BigNumber.from(2000000);
      await cosmicGameContract
        .claimMainPrize({ gasLimit })
        .then((tx: any) => tx.wait());
      const balance = await cosmicSignatureContract.totalSupply();
      let token_id = balance.toNumber() - 1;
      let count = data?.NumRaffleNFTWinnersBidding + 3;
      if (data && data.MainStats.StakeStatisticsRWalk.TotalTokensStaked > 0)
        count += data.NumRaffleNFTWinnersStakingRWalk;
      setTimeout(async () => {
        await api.create(token_id, count);
        router.push({
          pathname: "/prize-claimed",
          query: {
            round: data?.CurRoundNum,
            message: "success",
          },
        });
      }, 1000);
      setTimeout(async () => {
        await fetchActivationTime();
      }, 3000);
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({
          visible: true,
          type: "error",
          text: msg,
        });
      }
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
        // Handle the case where the user denies the transaction signature
      } else {
        console.error(err);
        // Handle other errors
      }
    }
  };

  const checkIfContractExist = async (address: string) => {
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

  const checkTokenOwnership = async (address: string, tokenId: number) => {
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

  const checkBalance = async (type: string, amount: BigNumber) => {
    try {
      if (type === "ETH") {
        const ethBalance = await library.getBalance(account);
        return ethBalance.gte(amount);
      }
      const balance = await api.get_user_balance(account);
      if (balance) {
        return (
          Number(ethers.utils.formatEther(balance.CosmicTokenBalance)) >=
          Number(ethers.utils.formatEther(amount))
        );
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  };

  const onBid = async () => {
    setIsBidding(true);
    try {
      const bidPrice = await cosmicGameContract.getNextEthBidPrice(0);
      let newBidPrice = bidPrice
        .mul(ethers.utils.parseEther((100 + bidPricePlus).toString()))
        .div(ethers.utils.parseEther("100"));
      if (bidType === "RandomWalk") {
        newBidPrice = newBidPrice
          .mul(ethers.utils.parseEther("50"))
          .div(ethers.utils.parseEther("100"));
      }
      const enoughBalance = await checkBalance("ETH", newBidPrice);
      if (!enoughBalance) {
        setNotification({
          visible: true,
          type: "error",
          text:
            "Insufficient ETH balance! There isn't enough ETH in your wallet.",
        });
        setIsBidding(false);
        return;
      }
      if (
        (donationType === "NFT" && (!nftDonateAddress || !nftId)) ||
        (donationType === "Token" && (!tokenDonateAddress || !tokenAmount))
      ) {
        await cosmicGameContract
          .bidWithEth(rwlkId, message, {
            value: newBidPrice,
            gasLimit: 30000000,
          })
          .then((tx: any) => tx.wait());
        setTimeout(() => {
          fetchDataCollection();
          setMessage("");
          setIsBidding(false);
        }, 3000);
        return;
      }
      if (donationType === "NFT") {
        // Proceed with NFT donation
        // Check if the contract exists
        const isExist = await checkIfContractExist(nftDonateAddress);
        if (!isExist) {
          setNotification({
            visible: true,
            type: "error",
            text: "The address provided is not a valid contract address!",
          });
          setIsBidding(false);
          return;
        }
        const nftIdNum = Number(nftId);
        const nftDonateContract = new Contract(
          nftDonateAddress,
          NFT_ABI,
          library.getSigner(account)
        );
        // Check if the contract is ERC721
        try {
          const supportsInterface = await nftDonateContract.supportsInterface(
            "0x80ac58cd"
          );
          if (!supportsInterface) {
            throw new Error("Not an ERC721 contract");
          }
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
        // Check token ownership
        const isOwner = await checkTokenOwnership(nftDonateAddress, nftIdNum);
        if (!isOwner) {
          setIsBidding(false);
          return;
        }
        // Approve NFT transfer
        try {
          const approvedBy = await nftDonateContract.getApproved(nftIdNum);
          const isApprovedForAll = await nftDonateContract.isApprovedForAll(
            account,
            COSMICGAME_ADDRESS
          );
          if (!isApprovedForAll && approvedBy !== COSMICGAME_ADDRESS) {
            await nftDonateContract
              .setApprovalForAll(COSMICGAME_ADDRESS, true)
              .then((tx: any) => tx.wait());
          }
          await cosmicGameContract
            .bidWithEthAndDonateNft(
              rwlkId,
              message,
              nftDonateAddress,
              nftIdNum,
              {
                value: newBidPrice,
                gasLimit: 30000000,
              }
            )
            .then((tx: any) => tx.wait());
          setTimeout(() => {
            fetchDataCollection();
            setMessage("");
            setNftId("");
            setNftDonateAddress("");
            setIsBidding(false);
          }, 3000);
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
      } else {
        // Proceed with Token donation
        const isExist = await checkIfContractExist(tokenDonateAddress);
        if (!isExist) {
          setNotification({
            visible: true,
            type: "error",
            text: "The address provided is not a valid contract address!",
          });
          setIsBidding(false);
          return;
        }

        const tokenDonateContract = new Contract(
          tokenDonateAddress,
          ERC20_ABI,
          library.getSigner(account)
        );

        // Check if the contract is ERC20
        try {
          const totalSupply = await tokenDonateContract.totalSupply();
          if (!totalSupply) {
            throw new Error("Not an ERC20 contract");
          }
        } catch (err) {
          console.log(err);
          setNotification({
            visible: true,
            type: "error",
            text: "The donate token contract is not an ERC20 token contract.",
          });
          setIsBidding(false);
          return;
        }
        // Check wallet balance
        const walletBalance = await tokenDonateContract.balanceOf(account);
        let decimals = 18;
        try {
          decimals = await tokenDonateContract.decimals();
        } catch (err) {
          console.warn("decimals() not found, assuming 18.");
          setNotification({
            visible: true,
            type: "warning",
            text:
              "The token with this address doesn't implement decimals() function, we assume 18 decimal places for the amount entered.",
          });
        }
        const tokenAmountInWei = parseUnits(tokenAmount, decimals);

        if (walletBalance.lt(tokenAmountInWei)) {
          setNotification({
            visible: true,
            type: "error",
            text: "Insufficient token balance for donation.",
          });
          setIsBidding(false);
          return;
        }
        // Approve token transfer
        try {
          let allowance = await tokenDonateContract.allowance(
            account,
            COSMICGAME_ADDRESS
          );
          if (allowance.lt(tokenAmountInWei)) {
            await tokenDonateContract
              .approve(COSMICGAME_ADDRESS, tokenAmountInWei)
              .then((tx: any) => tx.wait());
          }
          allowance = await tokenDonateContract.allowance(
            account,
            RAFFLE_WALLET_ADDRESS
          );
          if (allowance.lt(tokenAmountInWei)) {
            await tokenDonateContract
              .approve(RAFFLE_WALLET_ADDRESS, tokenAmountInWei)
              .then((tx: any) => tx.wait());
          }
          await cosmicGameContract
            .bidWithEthAndDonateToken(
              rwlkId,
              message,
              tokenDonateAddress,
              tokenAmountInWei,
              {
                value: newBidPrice,
                gasLimit: 30000000,
              }
            )
            .then((tx: any) => tx.wait());
          setTimeout(() => {
            fetchDataCollection();
            setMessage("");
            setTokenAmount("");
            setTokenDonateAddress("");
            setIsBidding(false);
          }, 3000);
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
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({
          visible: true,
          type: "error",
          text: msg,
        });
      }
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
        // Handle the case where the user denies the transaction signature
      } else {
        console.error(err);
        // Handle other errors
      }
      setIsBidding(false);
    }
  };

  const onBidWithCST = async () => {
    setIsBidding(true);
    try {
      if (cstBidData?.CSTPrice > 0) {
        const enoughBalance = await checkBalance(
          "CST",
          ethers.utils.parseEther(cstBidData.CSTPrice.toString())
        );
        if (!enoughBalance) {
          setNotification({
            visible: true,
            type: "error",
            text:
              "Insufficient CST balance! There isn't enough Cosmic Token in your wallet.",
          });
          setIsBidding(false);
          return;
        }
      }
      const priceMaxLimit = await cosmicGameContract.getNextCstBidPrice(0);
      if (
        (donationType === "NFT" && (!nftDonateAddress || !nftId)) ||
        (donationType === "Token" && (!tokenDonateAddress || !tokenAmount))
      ) {
        await cosmicGameContract
          .bidWithCst(priceMaxLimit, message)
          .then((tx: any) => tx.wait());
        setTimeout(() => {
          fetchDataCollection();
          setMessage("");
          setIsBidding(false);
        }, 3000);
        return;
      }
      if (donationType === "NFT") {
        // Proceed with NFT donation
        // Check if the contract exists
        const isExist = await checkIfContractExist(nftDonateAddress);
        if (!isExist) {
          setNotification({
            visible: true,
            type: "error",
            text: "The address provided is not a valid contract address!",
          });
          setIsBidding(false);
          return;
        }
        const nftIdNum = Number(nftId);
        const nftDonateContract = new Contract(
          nftDonateAddress,
          NFT_ABI,
          library.getSigner(account)
        );
        // Check if the contract is ERC721
        try {
          const supportsInterface = await nftDonateContract.supportsInterface(
            "0x80ac58cd"
          );
          if (!supportsInterface) {
            throw new Error("Not an ERC721 contract");
          }
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
        // Check token ownership
        const isOwner = await checkTokenOwnership(nftDonateAddress, nftIdNum);
        if (!isOwner) {
          setIsBidding(false);
          return;
        }
        // Approve NFT transfer
        try {
          const approvedBy = await nftDonateContract.getApproved(nftIdNum);
          const isApprovedForAll = await nftDonateContract.isApprovedForAll(
            account,
            COSMICGAME_ADDRESS
          );
          if (!isApprovedForAll && approvedBy !== COSMICGAME_ADDRESS) {
            await nftDonateContract
              .setApprovalForAll(COSMICGAME_ADDRESS, true)
              .then((tx: any) => tx.wait());
          }
          await cosmicGameContract
            .bidWithCstAndDonateNft(
              priceMaxLimit,
              message,
              nftDonateAddress,
              nftIdNum
            )
            .then((tx: any) => tx.wait());
          setTimeout(() => {
            fetchDataCollection();
            setMessage("");
            setNftId("");
            setNftDonateAddress("");
            setIsBidding(false);
          }, 3000);
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
      } else {
        // Proceed with Token donation
        const isExist = await checkIfContractExist(tokenDonateAddress);
        if (!isExist) {
          setNotification({
            visible: true,
            type: "error",
            text: "The address provided is not a valid contract address!",
          });
          setIsBidding(false);
          return;
        }

        const tokenDonateContract = new Contract(
          tokenDonateAddress,
          ERC20_ABI,
          library.getSigner(account)
        );

        // Check if the contract is ERC20
        try {
          const totalSupply = await tokenDonateContract.totalSupply();
          if (!totalSupply) {
            throw new Error("Not an ERC20 contract");
          }
        } catch (err) {
          console.log(err);
          setNotification({
            visible: true,
            type: "error",
            text: "The donate token contract is not an ERC20 token contract.",
          });
          setIsBidding(false);
          return;
        }
        // Check wallet balance
        const walletBalance = await tokenDonateContract.balanceOf(account);
        let decimals = 18;
        try {
          decimals = await tokenDonateContract.decimals();
        } catch (err) {
          console.warn("decimals() not found, assuming 18.");
          setNotification({
            visible: true,
            type: "warning",
            text:
              "The token with this address doesn't implement decimals() function, we assume 18 decimal places for the amount entered.",
          });
        }
        const tokenAmountInWei = parseUnits(tokenAmount, decimals);
        if (walletBalance.lt(tokenAmountInWei)) {
          setNotification({
            visible: true,
            type: "error",
            text: "Insufficient token balance for donation.",
          });
          setIsBidding(false);
          return;
        }
        // Approve token transfer
        try {
          let allowance = await tokenDonateContract.allowance(
            account,
            COSMICGAME_ADDRESS
          );
          if (allowance.lt(tokenAmountInWei)) {
            await tokenDonateContract
              .approve(COSMICGAME_ADDRESS, tokenAmountInWei)
              .then((tx: any) => tx.wait());
          }
          allowance = await tokenDonateContract.allowance(
            account,
            RAFFLE_WALLET_ADDRESS
          );
          if (allowance.lt(tokenAmountInWei)) {
            await tokenDonateContract
              .approve(RAFFLE_WALLET_ADDRESS, tokenAmountInWei)
              .then((tx: any) => tx.wait());
          }
          await cosmicGameContract
            .bidWithCstAndDonateToken(
              priceMaxLimit,
              message,
              tokenDonateAddress,
              tokenAmountInWei
            )
            .then((tx: any) => tx.wait());
          setTimeout(() => {
            fetchDataCollection();
            setMessage("");
            setTokenAmount("");
            setTokenDonateAddress("");
            setIsBidding(false);
          }, 3000);
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
    } catch (err) {
      if (err?.data?.message) {
        const msg = err?.data?.message;
        setNotification({
          visible: true,
          type: "error",
          text: msg,
        });
      }
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
        // Handle the case where the user denies the transaction signature
      } else {
        console.error(err);
        // Handle other errors
      }
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

  const getRwlkNFTIds = async () => {
    try {
      if (nftRWLKContract && account) {
        const used_rwalk = await api.get_used_rwlk_nfts();
        const biddedRWLKIds = used_rwalk.map((x: any) => x.RWalkTokenId);
        const tokens = await nftRWLKContract.walletOfOwner(account);
        const nftIds = tokens
          .map((t: BigNumber) => t.toNumber())
          .filter((t: number) => !biddedRWLKIds.includes(t))
          .reverse();
        setRwlknftIds(nftIds);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchData = async () => {
    try {
      const newData = await api.get_dashboard_info();
      if (newData) {
        const round = newData.CurRoundNum;
        const [
          newBidData,
          nftData,
          championsData,
          specials,
          ethDonations,
        ] = await Promise.all([
          api.get_bid_list_by_round(round, "desc"),
          api.get_donations_nft_by_round(round),
          (async () => {
            const bids = await api.get_bid_list_by_round(round, "desc");
            const champions = getEnduranceChampions(bids);
            const sortedChampions = [...champions].sort(
              (a, b) => b.chronoWarrior - a.chronoWarrior
            );
            return sortedChampions;
          })(),
          api.get_current_special_winners(),
          api.get_donations_cg_with_info_by_round(round),
        ]);
        setCurBidList(newBidData);
        setDonatedNFTs(nftData);
        setChampionList(championsData);
        setSpecialWinners(specials);
        setEthDonations(ethDonations);
      }
      setData((prevData: any) => {
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
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchPrizeTime = async () => {
    try {
      const t = await api.get_prize_time();
      const current = await api.get_current_time();
      const diff = current * 1000 - Date.now();
      setPrizeTime(t * 1000 - diff);
    } catch (err) {
      console.error("Error fetching prize time:", err);
    }
  };

  const fetchClaimHistory = async () => {
    try {
      const history = await api.get_claim_history();
      setClaimHistory(history);
    } catch (err) {
      console.error("Error fetching claim history:", err);
    }
  };

  const fetchCSTBidData = async () => {
    try {
      let ctData = await api.get_ct_price();
      if (ctData) {
        setCSTBidData({
          AuctionDuration: parseInt(ctData.AuctionDuration),
          CSTPrice: parseFloat(ethers.utils.formatEther(ctData.CSTPrice)),
          SecondsElapsed: parseInt(ctData.SecondsElapsed),
        });
      }
    } catch (err) {
      console.error("Error fetching CST bid data:", err);
    }
  };

  const fetchEthBidInfo = async () => {
    const ethBidInfo = await api.get_bid_eth_price();
    setEthBidInfo({
      AuctionDuration: parseInt(ethBidInfo.AuctionDuration),
      ETHPrice: parseFloat(ethers.utils.formatEther(ethBidInfo.ETHPrice)),
      SecondsElapsed: parseInt(ethBidInfo.SecondsElapsed),
    });
  };

  const fetchDataCollection = async () => {
    await Promise.all([
      getRwlkNFTIds(),
      fetchData(),
      // fetchPrizeTime(),
      fetchClaimHistory(),
      fetchCSTBidData(),
      fetchEthBidInfo(),
    ]);
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      });
    }
  };

  const sendNotification = (title: string, options: any) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (prizeTime && now >= prizeTime - 5 * 60 * 1000 && now <= prizeTime) {
        sendNotification("Bid Now or Miss Out!", {
          body:
            "Time is running out! You have 5 minutes to place your bids and win amazing prizes.",
        });
        clearInterval(interval); // Stop the interval once the notification is sent
      }
      if (now > prizeTime) {
        clearInterval(interval);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [prizeTime]);

  useEffect(() => {
    if (nftRWLKContract && account) {
      getRwlkNFTIds();
    }
  }, [nftRWLKContract, account]);

  useEffect(() => {
    requestNotificationPermission();
    if (router.query) {
      if (router.query.randomwalk) {
        setRwlkId(Number(router.query.tokenId));
        setBidType("RandomWalk");
      }
      if (router.query.donation) {
        setNftDonateAddress(ART_BLOCKS_ADDRESS);
        const tokenId = Array.isArray(router.query.tokenId)
          ? router.query.tokenId[0]
          : router.query.tokenId;
        setNftId(tokenId);
        setBidType("ETH");
        setAdvancedExpanded(true);
      }
      if (router.query.referred_by) {
        setTwitterPopupOpen(true);
      }
    }

    const calculateTimeOffset = async () => {
      const current = await api.get_current_time();
      const offset = current * 1000 - Date.now();
      setOffset(offset);
    };

    calculateTimeOffset();
    fetchDataCollection();
    fetchEthBidInfo();

    // Fetch data every 12 seconds
    const interval = setInterval(fetchDataCollection, 12000);

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (twitterHandle) {
      setMessage(`@${twitterHandle} referred by @${router.query.referred_by}.`);
    }
  }, [twitterHandle]);

  useEffect(() => {
    const probabilityOfSelection = (
      totalBids: number,
      chosenBids: number,
      yourBids: number
    ) => {
      const probability =
        1 - Math.pow((totalBids - yourBids) / totalBids, chosenBids);
      return probability;
    };

    const calculateProbability = async () => {
      const userInfo = await api.get_user_info(account);
      const Bids = userInfo?.Bids || [];
      if (Bids.length) {
        const curRoundBids = Bids.filter(
          (bid: any) => bid.RoundNum === data.CurRoundNum
        );
        const raffle =
          probabilityOfSelection(
            curBidList.length,
            data?.NumRaffleEthWinnersBidding,
            curRoundBids.length
          ) * 100;
        const nft =
          probabilityOfSelection(
            curBidList.length,
            data?.NumRaffleNFTWinnersBidding,
            curRoundBids.length
          ) * 100;
        setWinProbability({
          raffle: raffle,
          nft: nft,
        });
      }
    };
    if (data && account && curBidList.length) {
      calculateProbability();
    }
  }, [data, account, curBidList]);

  useEffect(() => {
    const fetchCSTInfo = async (bannerId: number) => {
      const res = await api.get_cst_info(bannerId);
      const fileName = `0x${res.Seed}`;
      setBannerToken({ seed: fileName, id: bannerId });
    };
    if (data && bannerToken.seed === "") {
      if (data?.MainStats.NumCSTokenMints > 0) {
        let bannerId = Math.floor(
          Math.random() * data?.MainStats.NumCSTokenMints
        );
        fetchCSTInfo(bannerId);
      } else if (data?.MainStats.NumCSTokenMints === 0) {
        setBannerToken({ seed: "sample", id: -1 });
      }
    }

    const interval = setInterval(async () => {
      await fetchPrizeTime();
      setRoundStarted(calculateTimeDiff(data?.TsRoundStart - offset / 1000));
      if (curBidList.length) {
        const lastBidTime = curBidList[0].TimeStamp;
        setLastBidderElapsed(calculateTimeDiff(lastBidTime - offset / 1000));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data, offset, curBidList, bannerToken.seed]);

  const fetchActivationTime = async () => {
    const activationTime = await cosmicGameContract.roundActivationTime();
    setActivationTime(Number(activationTime - offset / 1000));
  };

  useEffect(() => {
    const fetchTimeoutClaimPrize = async () => {
      const timeout = await cosmicGameContract.timeoutDurationToClaimMainPrize();
      setTimeoutClaimPrize(Number(timeout));
    };

    if (cosmicGameContract) {
      fetchTimeoutClaimPrize();
      fetchActivationTime();
    }
  }, [cosmicGameContract, offset]);

  return (
    <>
      <MainWrapper>
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
                {activationTime > Date.now() / 1000 ? (
                  <Box mb={4}>
                    <Typography
                      variant="subtitle1"
                      textAlign="center"
                      fontWeight={400}
                    >
                      Round {data?.CurRoundNum} becomes active at{" "}
                      {convertTimestampToDateTime(activationTime, true)}
                    </Typography>
                    <Countdown
                      key={3}
                      date={activationTime * 1000}
                      renderer={Counter}
                    />
                  </Box>
                ) : data?.TsRoundStart !== 0 ? (
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
                          (Round was started {roundStarted} ago.)
                        </Typography>
                      )}
                      <Link href="/changed-parameters" color="inherit">
                        Changed Parameters
                      </Link>
                    </Grid>
                  </Grid>
                ) : (
                  <>
                    {data?.CurRoundNum > 0 ? (
                      <Typography variant="h4" mb={2}>
                        Round {data?.CurRoundNum} started
                      </Typography>
                    ) : (
                      <Typography variant="subtitle1">
                        Start the game with your first bid!
                      </Typography>
                    )}
                    <Typography variant="subtitle1" mt={2} mb={2}>
                      Dutch auction for the first bid in ETH has started. Make
                      your bid.
                    </Typography>
                  </>
                )}
                {data?.LastBidderAddr !== constants.AddressZero && (
                  <Grid container spacing={2} mb={2} alignItems="center">
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
                          {ethBidInfo.ETHPrice.toFixed(5)} ETH
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
                          {(ethBidInfo.ETHPrice / 2).toFixed(5)} ETH
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
                            {cstBidData?.CSTPrice.toFixed(5)} CST
                          </Typography>
                        ) : (
                          <Typography color="#ff0">FREE</Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}
                {activationTime < Date.now() / 1000 && (
                  <>
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
                            <>
                              <Link
                                href={`/user/${data?.LastBidderAddr}`}
                                color="rgb(255, 255, 255)"
                                fontSize="inherit"
                                sx={{ wordBreak: "break-all" }}
                              >
                                {data?.LastBidderAddr}
                              </Link>{" "}
                              {lastBidderElapsed !== "" && (
                                <>({lastBidderElapsed} Elapsed)</>
                              )}
                            </>
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
                          <Typography
                            sx={{ wordWrap: "break-word", color: "#ff0" }}
                          >
                            {curBidList[0].Message}
                          </Typography>
                        </Grid>
                      </Grid>
                    )}
                    {curBidList.length > 0 && winProbability && (
                      <>
                        <Typography mt={4}>
                          {data?.LastBidderAddr === account
                            ? `You have 100.00% chance of winning the main prize (${data?.PrizeAmountEth.toFixed(
                                4
                              )}ETH).`
                            : "You're not the last bidder, so you can win the main prize in 24 hours if the last bidder doesn't take it."}
                        </Typography>
                        <Typography>
                          You have {winProbability.raffle.toFixed(2)}% chance of
                          winning the raffle{" "}
                          {(
                            data?.RaffleAmountEth /
                            data?.NumRaffleEthWinnersBidding
                          ).toFixed(4)}{" "}
                          ETH, and {winProbability.nft.toFixed(2)}% chance of
                          winning a Cosmic Signature Token for now.
                        </Typography>
                      </>
                    )}
                    {account !== null && (
                      <>
                        <Typography mb={1} mt={4}>
                          Make your bid with:
                        </Typography>
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
                          {data?.LastBidderAddr !== constants.AddressZero && (
                            <FormControlLabel
                              value="RandomWalk"
                              control={<Radio size="small" />}
                              label="RandomWalk"
                            />
                          )}
                          {data?.LastBidderAddr !== constants.AddressZero && (
                            <FormControlLabel
                              value="CST"
                              control={<Radio size="small" />}
                              label="CST(Cosmic Token)"
                            />
                          )}
                        </RadioGroup>
                        {bidType === "ETH" &&
                          data?.LastBidderAddr === constants.AddressZero && (
                            <Box ml={2}>
                              {ethBidInfo?.SecondsElapsed >
                              ethBidInfo?.AuctionDuration ? (
                                <Typography variant="subtitle1">
                                  Auction ended.
                                </Typography>
                              ) : (
                                <Grid
                                  container
                                  spacing={2}
                                  mb={2}
                                  alignItems="center"
                                >
                                  <Grid item sm={12} md={5}>
                                    <Typography variant="subtitle1">
                                      Elapsed Time:
                                    </Typography>
                                  </Grid>
                                  <Grid item sm={12} md={7}>
                                    <Typography>
                                      {formatSeconds(
                                        ethBidInfo?.SecondsElapsed
                                      )}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              )}
                              <Grid
                                container
                                spacing={2}
                                mb={2}
                                alignItems="center"
                              >
                                <Grid item sm={12} md={5}>
                                  <Typography variant="subtitle1">
                                    Auction Duration:
                                  </Typography>
                                </Grid>
                                <Grid item sm={12} md={7}>
                                  <Typography>
                                    {formatSeconds(ethBidInfo?.AuctionDuration)}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          )}
                        {bidType === "RandomWalk" && (
                          <Box mb={4} mx={2}>
                            <Typography variant="h6">
                              Random Walk NFT Gallery
                            </Typography>
                            <Typography variant="body2">
                              If you own some RandomWalkNFTs and one of them is
                              used when bidding, you can get a 50% discount!
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
                              <Grid
                                container
                                spacing={2}
                                mb={2}
                                alignItems="center"
                              >
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
                            <Grid
                              container
                              spacing={2}
                              mb={2}
                              alignItems="center"
                            >
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
                        <TextField
                          placeholder="Message (280 characters, optional)"
                          value={message}
                          size="small"
                          multiline
                          fullWidth
                          rows={4}
                          inputProps={{ maxLength: 280 }}
                          sx={{ marginBottom: 2 }}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <Accordion
                          expanded={advancedExpanded}
                          onChange={(_event, isExpanded) =>
                            setAdvancedExpanded(isExpanded)
                          }
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Advanced Options</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2">
                              If you want to donate tokens or one of your NFTs
                              while bidding, you can put the contract address,
                              NFT id, and comment here.
                            </Typography>
                            <RadioGroup
                              row
                              value={donationType}
                              onChange={(_e, value) => {
                                setRwlkId(-1);
                                setDonationType(value);
                              }}
                              sx={{ mt: 2 }}
                            >
                              <FormControlLabel
                                value="NFT"
                                control={<Radio size="small" />}
                                label="NFT"
                              />
                              <FormControlLabel
                                value="Token"
                                control={<Radio size="small" />}
                                label="Token"
                              />
                            </RadioGroup>
                            {donationType === "Token" && (
                              <>
                                <TextField
                                  placeholder="Token Contract Address"
                                  size="small"
                                  value={tokenDonateAddress}
                                  fullWidth
                                  sx={{ marginTop: 1 }}
                                  onChange={(e) =>
                                    setTokenDonateAddress(e.target.value)
                                  }
                                />
                                <TextField
                                  placeholder="Token Amount"
                                  type="number"
                                  value={tokenAmount}
                                  size="small"
                                  fullWidth
                                  sx={{ marginTop: 2 }}
                                  onChange={(e) =>
                                    setTokenAmount(e.target.value)
                                  }
                                />
                              </>
                            )}
                            {donationType === "NFT" && (
                              <>
                                <TextField
                                  placeholder="NFT contract address"
                                  size="small"
                                  value={nftDonateAddress}
                                  fullWidth
                                  sx={{ marginTop: 1 }}
                                  onChange={(e) =>
                                    setNftDonateAddress(e.target.value)
                                  }
                                />
                                <TextField
                                  placeholder="NFT number"
                                  type="number"
                                  value={nftId}
                                  size="small"
                                  fullWidth
                                  sx={{ marginTop: 2 }}
                                  onChange={(e) => setNftId(e.target.value)}
                                />
                              </>
                            )}
                            {bidType !== "CST" && (
                              <Box
                                sx={{
                                  border: "1px solid #444",
                                  borderRadius: 1,
                                  p: 2,
                                  mt: 2,
                                }}
                              >
                                <Typography variant="subtitle2">
                                  Bid price collision prevention
                                </Typography>
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
                                      ethBidInfo.ETHPrice *
                                      (1 + bidPricePlus / 100) *
                                      (bidType === "RandomWalk" ? 0.5 : 1)
                                    ).toFixed(6)}{" "}
                                    ETH
                                  </Typography>
                                </Box>
                                <Typography variant="body2" mt={2}>
                                  The bid price is bumped {bidPricePlus}% to
                                  prevent bidding collision.
                                </Typography>
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </Grid>
          <Grid item sm={12} md={6}>
            {data?.CurRoundNum > 1 && (
              <Link href={`/prize/${data?.CurRoundNum - 1}`} color="inherit">
                Round {data?.CurRoundNum - 1} ended, check results here
              </Link>
            )}
            {matches && (
              <StyledCard sx={{ mt: 1 }}>
                <CardActionArea>
                  <Link
                    href={
                      bannerToken.id >= 0
                        ? `/detail/${bannerToken.id}`
                        : "/detail/sample"
                    }
                    sx={{ display: "block" }}
                  >
                    <NFTImage
                      src={
                        bannerToken.seed === ""
                          ? "/images/qmark.png"
                          : getAssetsUrl(
                              `cosmicsignature/${bannerToken.seed}.png`
                            )
                      }
                    />
                  </Link>
                </CardActionArea>
              </StyledCard>
            )}
            {data?.TsRoundStart !== 0 && (
              <>
                <Typography variant="subtitle1" color="primary" mt={4} mb={2}>
                  Potential winners of Special Prizes
                </Typography>
                <Grid container spacing={2} mb={2} alignItems="center">
                  <Grid item xs={12} sm={4} md={4}>
                    <Typography>Endurance Champion</Typography>
                  </Grid>
                  <Grid item xs={12} sm={8} md={8}>
                    <Typography>
                      <Link
                        href={`/user/${specialWinners?.EnduranceChampionAddress}`}
                        color="rgb(255, 255, 255)"
                        fontSize="inherit"
                        sx={{ wordBreak: "break-all" }}
                      >
                        {specialWinners?.EnduranceChampionAddress}
                      </Link>
                      {specialWinners?.EnduranceChampionDuration > 0 && (
                        <>
                          {` (Lasted ${formatSeconds(
                            specialWinners?.EnduranceChampionDuration
                          )})`}
                        </>
                      )}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2} mb={2} alignItems="center">
                  <Grid item xs={12} sm={4} md={4}>
                    <Typography>Chrono Warrior</Typography>
                  </Grid>
                  {specialWinners?.EnduranceChampionAddress && (
                    <Grid item xs={12} sm={8} md={8}>
                      <Typography>
                        <Link
                          href={`/user/${specialWinners?.EnduranceChampionAddress}`}
                          color="rgb(255, 255, 255)"
                          fontSize="inherit"
                          sx={{ wordBreak: "break-all" }}
                        >
                          {specialWinners?.EnduranceChampionAddress}
                        </Link>
                        {specialWinners?.EnduranceChampionDuration > 0 && (
                          <>
                            {` (Lasted ${formatSeconds(
                              specialWinners?.EnduranceChampionDuration
                            )})`}
                          </>
                        )}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                <Grid container spacing={2} mb={2} alignItems="center">
                  <Grid item xs={12} sm={4} md={4}>
                    <Typography>Last Cst Bidder</Typography>
                  </Grid>
                  <Grid item xs={12} sm={8} md={8}>
                    <Typography>
                      <Link
                        href={`/user/${specialWinners?.LastCstBidderAddress}`}
                        color="rgb(255, 255, 255)"
                        fontSize="inherit"
                        sx={{ wordBreak: "break-all" }}
                      >
                        {specialWinners?.LastCstBidderAddress}
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}
            {account !== null && activationTime < Date.now() / 1000 && (
              <>
                {(prizeTime > Date.now() || data?.LastBidderAddr !== account) &&
                  !loading && (
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
                              ethBidInfo.ETHPrice * (1 + bidPricePlus / 100) >
                              0.1
                                ? (
                                    ethBidInfo.ETHPrice *
                                    (1 + bidPricePlus / 100)
                                  ).toFixed(2)
                                : (
                                    ethBidInfo.ETHPrice *
                                    (1 + bidPricePlus / 100)
                                  ).toFixed(5)
                            } ETH)`
                          : bidType === "RandomWalk" && rwlkId !== -1
                          ? ` token ${rwlkId} (${
                              ethBidInfo.ETHPrice * (1 + bidPricePlus / 100) >
                              0.2
                                ? (
                                    ethBidInfo.ETHPrice *
                                    (1 + bidPricePlus / 100) *
                                    0.5
                                  ).toFixed(2)
                                : (
                                    ethBidInfo.ETHPrice *
                                    (1 + bidPricePlus / 100) *
                                    0.5
                                  ).toFixed(5)
                            } ETH)`
                          : bidType === "CST"
                          ? cstBidData?.SecondsElapsed >
                            cstBidData?.AuctionDuration
                            ? "(FREE BID)"
                            : `(${cstBidData?.CSTPrice.toFixed(2)} CST)`
                          : ""
                      }`}
                    </Button>
                  )}
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
                        prizeTime + timeoutClaimPrize * 1000 > Date.now()
                      }
                      sx={{ mt: 3 }}
                    >
                      Claim Prize
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {prizeTime + timeoutClaimPrize * 1000 > Date.now() &&
                          data?.LastBidderAddr !== account && (
                            <>
                              &nbsp;available in &nbsp;
                              <Countdown
                                date={prizeTime + timeoutClaimPrize * 1000}
                              />
                            </>
                          )}
                        &nbsp;
                        <ArrowForward sx={{ width: 22, height: 22 }} />
                      </Box>
                    </Button>
                    {data?.LastBidderAddr !== account &&
                      prizeTime + timeoutClaimPrize * 1000 > Date.now() && (
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
        <Box>
          <Typography variant="body2" mt={4}>
            When you bid, you will get 100 Cosmic Tokens as a reward. These
            tokens allow you to participate in the DAO.
          </Typography>
          <Box mt={2}>
            <Typography variant="body2" color="primary" component="span">
              *
            </Typography>
            <Typography variant="body2" component="span">
              When you bid, you are also buying a raffle ticket.{" "}
              {data?.NumRaffleEthWinnersBidding} raffle tickets will be chosen
              and these people will win {data?.RafflePercentage}% of the pot.
              Also, {data?.NumRaffleNFTWinnersBidding} additional winners and{" "}
              {data?.NumRaffleNFTWinnersStakingRWalk} Random Walk NFT stakers{" "}
              will be chosen which will receive a Cosmic Signature NFT.
            </Typography>
          </Box>
          <Typography variant="body2" mt={2}>
            When this round ends, Ethereum Protocol Guild (
            <Link
              href="https://protocol-guild.readthedocs.io"
              target="_blank"
              sx={{ color: "inherit" }}
            >
              https://protocol-guild.readthedocs.io
            </Link>
            ) will receive 10% of the prize pool (at least{" "}
            {(data?.CosmicGameBalanceEth / 10).toFixed(4)} ETH)
          </Typography>
        </Box>
        <Box mt={6}>
          <Typography variant="subtitle1" color="primary" textAlign="center">
            Distribution of funds on each round
          </Typography>
          {isMobile ? (
            <Chart
              transitions={false}
              style={{ width: "100%", height: "100%" }}
            >
              <ChartLegend visible={false} />
              <ChartArea background="transparent" />
              <ChartCategoryAxis>
                <ChartCategoryAxisItem color="white" />
              </ChartCategoryAxis>
              <ChartValueAxis>
                <ChartValueAxisItem visible={false} max={80} />
              </ChartValueAxis>
              <ChartSeries>
                <ChartSeriesItem
                  type="bar"
                  data={series}
                  field="value"
                  categoryField="category"
                  labels={{
                    visible: true,
                    color: "white",
                    background: "none",
                    content: (props) =>
                      `${props.value}% (${(
                        (props.dataItem.value * data?.CosmicGameBalanceEth) /
                        100
                      ).toFixed(4)} ETH)`,
                  }}
                />
              </ChartSeries>
            </Chart>
          ) : (
            <Chart
              transitions={false}
              style={{ width: "100%", height: matches ? 300 : 200 }}
            >
              <ChartLegend visible={false} />
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
          )}
        </Box>
        <Box mt={10}>
          <Typography variant="h6">TOP RAFFLE TICKETS HOLDERS</Typography>
          <RaffleHolderTable
            list={curBidList}
            numRaffleEthWinner={data?.NumRaffleEthWinnersBidding}
            numRaffleNFTWinner={data?.NumRaffleNFTWinnersBidding}
          />
        </Box>
        <Box mt={10}>
          <Typography variant="h6">TOP ETH SPENDERS FOR BID</Typography>
          <ETHSpentTable list={curBidList} />
        </Box>
        <Box mt={10}>
          <Typography variant="h6">
            ENDURANCE CHAMPIONS FOR CURRENT ROUND
          </Typography>
          <EnduranceChampionsTable championList={championList} />
        </Box>
        {ethDonations.length > 0 && (
          <Box mt={10}>
            <Typography variant="h6">
              ETH DONATIONS FOR CURRENT ROUND
            </Typography>
            <EthDonationTable list={ethDonations} showType={false} />
          </Box>
        )}
        <Box marginTop={10}>
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
              <CustomPagination
                page={curPage}
                setPage={setCurrentPage}
                totalLength={donatedNFTs.length}
                perPage={perPage}
              />
            </>
          ) : (
            <Typography mt={2}>
              No ERC721 tokens were donated on this round.
            </Typography>
          )}
        </Box>
        <Box mt={10}>
          <Box>
            <Typography variant="h6" component="span">
              CURRENT ROUND BID HISTORY
            </Typography>
            <Typography
              variant="h6"
              component="span"
              color="primary"
              sx={{ ml: 1 }}
            >
              (ROUND {data?.CurRoundNum})
            </Typography>
          </Box>
          <BiddingHistory biddingHistory={curBidList} showRound={false} />
        </Box>
      </MainWrapper>

      <LatestNFTs />

      <Container>
        <Prize prizeAmount={data?.PrizeAmountEth || 0} />
        <Box margin="50px 0">
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
              data?.NumRaffleNFTWinnersBidding +
              data?.NumRaffleNFTWinnersStakingRWalk}
            &nbsp;raffle winners:
          </Typography>
          <Box textAlign="center" mb={6}>
            <Image
              src={"/images/divider.svg"}
              width={93}
              height={3}
              alt="divider"
            />
          </Box>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <GradientBorder sx={{ p: 2 }}>
                <Typography variant="subtitle1" textAlign="center">
                  {data?.NumRaffleEthWinnersBidding} random bidders will receive
                </Typography>
                <GradientText variant="h4" textAlign="center">
                  {(
                    data?.RaffleAmountEth / data?.NumRaffleEthWinnersBidding
                  ).toFixed(4)}{" "}
                  ETH
                </GradientText>
                <Typography
                  variant="subtitle1"
                  color="rgba(255, 255, 255, 0.68)"
                  textAlign="center"
                >
                  from the pot each
                </Typography>
              </GradientBorder>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <GradientBorder sx={{ p: 2 }}>
                <Typography variant="subtitle1" textAlign="center">
                  {data?.NumRaffleNFTWinnersBidding +
                    (data?.MainStats.StakeStatisticsRWalk.TotalTokensStaked > 0
                      ? data?.NumRaffleNFTWinnersStakingRWalk + 3
                      : 3)}{" "}
                  random bidders will receive
                </Typography>
                <GradientText variant="h4" textAlign="center">
                  1 Cosmic NFT
                </GradientText>
                <Typography
                  variant="subtitle1"
                  color="rgba(255, 255, 255, 0.68)"
                  textAlign="center"
                >
                  each
                </Typography>
              </GradientBorder>
            </Grid>
          </Grid>
        </Box>
        <Box margin="50px 0">
          <Typography variant="h4" textAlign="center">
            Special Prizes
          </Typography>
          <Typography
            fontSize={matches ? 22 : 18}
            color="rgba(255, 255, 255, 0.68)"
            textAlign="center"
          >
            Each winner of special prize (except ChronoWarrior) will receive{" "}
            {curBidList.length * 10} Cosmic Signature ERC20 tokens and 1 Cosmic
            Signature NFT.
          </Typography>
          <Typography
            fontSize={matches ? 22 : 18}
            color="rgba(255, 255, 255, 0.68)"
            textAlign="center"
          >
            Chrono Warrior will win {data?.ChronoWarriorPercentage}% of the pot.
          </Typography>
          <Box textAlign="center" mb={6}>
            <Image
              src={"/images/divider.svg"}
              width={93}
              height={3}
              alt="divider"
            />
          </Box>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <GradientBorder sx={{ p: 2 }}>
                <Typography variant="subtitle1" textAlign="center">
                  Chrono warrior will receive
                </Typography>
                <GradientText variant="h4" textAlign="center" lineHeight="60px">
                  {(
                    (data?.CosmicGameBalanceEth *
                      data?.ChronoWarriorPercentage) /
                    100
                  ).toFixed(4)}{" "}
                  ETH
                </GradientText>
                <Typography
                  variant="subtitle1"
                  color="rgba(255, 255, 255, 0.68)"
                  textAlign="center"
                >
                  from the pot each
                </Typography>
              </GradientBorder>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <GradientBorder sx={{ p: 2 }}>
                <Typography variant="subtitle1" textAlign="center">
                  Endurance champion & last bidder will receive
                </Typography>
                <GradientText variant="h5" textAlign="center" lineHeight="60px">
                  1 Cosmic NFT & {curBidList.length * 10} CST
                </GradientText>
                <Typography
                  variant="subtitle1"
                  color="rgba(255, 255, 255, 0.68)"
                  textAlign="center"
                >
                  each
                </Typography>
              </GradientBorder>
            </Grid>
          </Grid>
        </Box>
        <Box margin="100px 0">
          <Typography variant="h4" textAlign="center" mb={6}>
            History of Winnings
          </Typography>
          {claimHistory === null ? (
            <Typography variant="h6">Loading...</Typography>
          ) : (
            <WinningHistoryTable winningHistory={claimHistory} />
          )}
        </Box>
        <Box margin="100px 0">
          <Typography variant="h4" textAlign="center" mb={6}>
            Create a Twitter Post and Refer People
          </Typography>
          <TwitterShareButton />
        </Box>
      </Container>
      {imageOpen && (
        <Lightbox
          image={
            bannerToken.seed === ""
              ? "/images/qmark.png"
              : getAssetsUrl(`cosmicsignature/${bannerToken.seed}.png`)
          }
          title="This is a possible image of the NFT you are going to receive."
          onClose={() => setImageOpen(false)}
        />
      )}
      <TwitterPopup
        open={twitterPopupOpen}
        setOpen={setTwitterPopupOpen}
        setTwitterHandle={setTwitterHandle}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Cosmic Signature";
  const { data } = await axios.get(cosmicGameBaseUrl + "statistics/dashboard");
  const description = `Cosmic Signature is a strategy bidding game. In an exhilarating contest, players will bid against other players and against time to win exciting ${data?.PrizeAmountEth.toFixed(
    4
  )}ETH prizes and Cosmic Signature NFTs.`;

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default NewHome;

// Todo:

// hide contract option from header: refactor header
// add donate button, donor list, add eth-donate list to user detail
// update site-map and show link
// add link to user-detail for marketing reward for user

// optimize statistics loading speed
// system mode changes on statistics page
// update statistics page with new data
// get_bid_list_by_round: implement pagination
// get_user_info: remove bid field
// complete admin page
// update FAQ page: endurance champion
// update donations page

// fix eth-donation page
// add eth donate feature, simple donation, donation with info
// add link to top 5 donations
