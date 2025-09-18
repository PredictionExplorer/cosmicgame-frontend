import { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Link,
  Backdrop,
  CircularProgress,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
  useMediaQuery,
  CardActionArea,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ArrowForward } from "@mui/icons-material";
import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";
import Countdown from "react-countdown";
import { BigNumber, Contract, constants, ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { useRouter } from "next/router";

import api from "../services/api";
import useCosmicGameContract from "../hooks/useCosmicGameContract";
import useRWLKNFTContract from "../hooks/useRWLKNFTContract";
import useCosmicSignatureContract from "../hooks/useCosmicSignatureContract";
import { useActiveWeb3React } from "../hooks/web3";
import { useNotification } from "../contexts/NotificationContext";

import {
  ART_BLOCKS_ADDRESS,
  COSMICGAME_ADDRESS,
  RAFFLE_WALLET_ADDRESS,
} from "../config/app";
import NFT_ABI from "../contracts/RandomWalkNFT.json";
import ERC20_ABI from "../contracts/CosmicToken.json";

import {
  CustomTextField,
  GradientText,
  StyledCard,
  StyledInput,
} from "../components/styled";
import PaginationRWLKGrid from "../components/PaginationRWLKGrid";
import Prize from "../components/Prize";
import LatestNFTs from "../components/LatestNFTs";
import TwitterPopup from "../components/TwitterPopup";
import TwitterShareButton from "../components/TwitterShareButton";
import NFTImage from "../components/NFTImage";
import Counter from "../components/Counter";
import {
  calculateTimeDiff,
  convertTimestampToDateTime,
  formatSeconds,
  getAssetsUrl,
} from "../utils";
import getErrorMessage from "../utils/alert";

/** Props kept intentionally small; the component owns most of its own logic. */
type BiddingSectionProps = {
  data: any; // dashboard info
  loading: boolean;
  onRefresh: () => Promise<void>; // parent refresh hook after mutations
};

const BiddingSection = ({ data, loading, onRefresh }: BiddingSectionProps) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const router = useRouter();

  const { library, account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();
  const nftRWLKContract = useRWLKNFTContract();
  const cosmicSignatureContract = useCosmicSignatureContract();
  const { setNotification } = useNotification();

  // local UI state for bidding section
  const [bidType, setBidType] = useState("ETH");
  const [donationType, setDonationType] = useState("NFT");
  const [message, setMessage] = useState("");
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [isBidding, setIsBidding] = useState(false);

  const [nftDonateAddress, setNftDonateAddress] = useState("");
  const [nftId, setNftId] = useState("");
  const [tokenDonateAddress, setTokenDonateAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");

  const [rwlknftIds, setRwlknftIds] = useState<number[]>([]);
  const [rwlkId, setRwlkId] = useState(-1);

  const [ethBidInfo, setEthBidInfo] = useState<any>(null);
  const [cstBidData, setCSTBidData] = useState({
    AuctionDuration: 0,
    CSTPrice: 0,
    SecondsElapsed: 0,
  });

  const [activationTime, setActivationTime] = useState(0);
  const [timeoutClaimPrize, setTimeoutClaimPrize] = useState(0);
  const [prizeTime, setPrizeTime] = useState(0);

  const [curBidList, setCurBidList] = useState<any[]>([]);
  const [winProbability, setWinProbability] = useState<any>(null);
  const [lastBidderElapsed, setLastBidderElapsed] = useState("");
  const [roundStarted, setRoundStarted] = useState("");

  const [bannerToken, setBannerToken] = useState({ seed: "", id: -1 });
  const [imageOpen, setImageOpen] = useState(false);
  const [twitterPopupOpen, setTwitterPopupOpen] = useState(false);
  const [twitterHandle, setTwitterHandle] = useState("");
  const [offset, setOffset] = useState(0);

  const bidPricePlusDefault = 2;
  const [bidPricePlus, setBidPricePlus] = useState(bidPricePlusDefault);

  // --- helpers (moved from page) ------------------------------------------------

  const playAudio = async () => {
    try {
      const audioElement = new Audio("/audio/notification.wav");
      await audioElement.play();
    } catch (error) {
      console.error("Error requesting sound permission:", error);
    }
  };

  const checkIfContractExist = async (address: string) => {
    try {
      const byteCode = await library.getCode(address);
      if (byteCode === "0x") return false;
      return true;
    } catch {
      return false;
    }
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
      return true;
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ visible: true, type: "error", text: msg });
      }
      console.log(err);
      return false;
    }
  };

  const checkBalance = async (type: "ETH" | "CST", amount: BigNumber) => {
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

  // --- bid actions (moved from page) -------------------------------------------

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
      if (data && data.MainStats.StakeStatisticsRWalk.TotalTokensStaked > 0) {
        count += data.NumRaffleNFTWinnersStakingRWalk;
      }

      setTimeout(async () => {
        await api.create(token_id, count);
        router.push({
          pathname: "/prize-claimed",
          query: { round: data?.CurRoundNum, message: "success" },
        });
      }, 1000);

      setTimeout(async () => {
        await fetchActivationTime();
      }, 3000);
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ visible: true, type: "error", text: msg });
      }
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
      } else {
        console.error(err);
      }
    }
  };

  const onBid = async () => {
    setIsBidding(true);
    try {
      const bidPrice = await cosmicGameContract.getNextEthBidPrice();
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

      // no donation path
      const noDonation =
        (donationType === "NFT" && (!nftDonateAddress || !nftId)) ||
        (donationType === "Token" && (!tokenDonateAddress || !tokenAmount));

      if (noDonation) {
        await cosmicGameContract
          .bidWithEth(rwlkId, message, {
            value: newBidPrice,
            gasLimit: 30000000,
          })
          .then((tx: any) => tx.wait());
        setTimeout(async () => {
          await onRefresh();
          setMessage("");
          setIsBidding(false);
        }, 3000);
        return;
      }

      if (donationType === "NFT") {
        // NFT donation flow
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

        try {
          const supportsInterface = await nftDonateContract.supportsInterface(
            "0x80ac58cd"
          );
          if (!supportsInterface) throw new Error("Not an ERC721 contract");
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

        const isOwner = await checkTokenOwnership(nftDonateAddress, nftIdNum);
        if (!isOwner) {
          setIsBidding(false);
          return;
        }

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
          const isApproved = await nftDonateContract.isApprovedForAll(
            account,
            RAFFLE_WALLET_ADDRESS
          );
          if (!isApproved) {
            await nftDonateContract
              .setApprovalForAll(RAFFLE_WALLET_ADDRESS, true)
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
              }
            )
            .then((tx: any) => tx.wait());

          setTimeout(async () => {
            await onRefresh();
            setMessage("");
            setNftId("");
            setNftDonateAddress("");
            setIsBidding(false);
          }, 3000);
        } catch (err) {
          if (err?.data?.message) {
            const msg = getErrorMessage(err?.data?.message);
            setNotification({ visible: true, type: "error", text: msg });
          }
          console.log(err);
          setIsBidding(false);
        }
      } else {
        // ERC20 donation flow
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

        try {
          const totalSupply = await tokenDonateContract.totalSupply();
          if (!totalSupply) throw new Error("Not an ERC20 contract");
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

        const walletBalance = await tokenDonateContract.balanceOf(account);

        let decimals = 18;
        try {
          decimals = await tokenDonateContract.decimals();
        } catch {
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

        try {
          let allowance = await tokenDonateContract.allowance(
            account,
            COSMICGAME_ADDRESS
          );
          let receipt;
          if (allowance.lt(ethers.constants.MaxUint256)) {
            receipt = await tokenDonateContract
              .approve(COSMICGAME_ADDRESS, ethers.constants.MaxUint256)
              .then((tx: any) => tx.wait());
          }
          if (!receipt?.status && allowance.lt(tokenAmountInWei)) {
            await tokenDonateContract
              .approve(COSMICGAME_ADDRESS, tokenAmountInWei)
              .then((tx: any) => tx.wait());
          }

          allowance = await tokenDonateContract.allowance(
            account,
            RAFFLE_WALLET_ADDRESS
          );
          if (allowance.lt(ethers.constants.MaxUint256)) {
            receipt = await tokenDonateContract
              .approve(RAFFLE_WALLET_ADDRESS, ethers.constants.MaxUint256)
              .then((tx: any) => tx.wait());
          }
          if (!receipt?.status && allowance.lt(tokenAmountInWei)) {
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
              }
            )
            .then((tx: any) => tx.wait());

          setTimeout(async () => {
            await onRefresh();
            setMessage("");
            setTokenAmount("");
            setTokenDonateAddress("");
            setIsBidding(false);
          }, 3000);
        } catch (err) {
          if (err?.data?.message) {
            const msg = getErrorMessage(err?.data?.message);
            setNotification({ visible: true, type: "error", text: msg });
          }
          console.log(err);
          setIsBidding(false);
        }
      }
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ visible: true, type: "error", text: msg });
      }
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
      } else {
        console.error(err);
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

      const priceMaxLimit = await cosmicGameContract.getNextCstBidPrice();

      const noDonation =
        (donationType === "NFT" && (!nftDonateAddress || !nftId)) ||
        (donationType === "Token" && (!tokenDonateAddress || !tokenAmount));

      if (noDonation) {
        await cosmicGameContract
          .bidWithCst(priceMaxLimit, message)
          .then((tx: any) => tx.wait());
        setTimeout(async () => {
          await onRefresh();
          setMessage("");
          setIsBidding(false);
        }, 3000);
        return;
      }

      if (donationType === "NFT") {
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

        try {
          const supportsInterface = await nftDonateContract.supportsInterface(
            "0x80ac58cd"
          );
          if (!supportsInterface) throw new Error("Not an ERC721 contract");
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

        const isOwner = await checkTokenOwnership(nftDonateAddress, nftIdNum);
        if (!isOwner) {
          setIsBidding(false);
          return;
        }

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
          const isApproved = await nftDonateContract.isApprovedForAll(
            account,
            RAFFLE_WALLET_ADDRESS
          );
          if (!isApproved) {
            await nftDonateContract
              .setApprovalForAll(RAFFLE_WALLET_ADDRESS, true)
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

          setTimeout(async () => {
            await onRefresh();
            setMessage("");
            setNftId("");
            setNftDonateAddress("");
            setIsBidding(false);
          }, 3000);
        } catch (err) {
          if (err?.data?.message) {
            const msg = getErrorMessage(err?.data?.message);
            setNotification({ visible: true, type: "error", text: msg });
          }
          console.log(err);
          setIsBidding(false);
        }
      } else {
        // Token donation with CST bid
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

        try {
          const totalSupply = await tokenDonateContract.totalSupply();
          if (!totalSupply) throw new Error("Not an ERC20 contract");
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

        const walletBalance = await tokenDonateContract.balanceOf(account);

        let decimals = 18;
        try {
          decimals = await tokenDonateContract.decimals();
        } catch {
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

        try {
          let allowance = await tokenDonateContract.allowance(
            account,
            COSMICGAME_ADDRESS
          );
          let receipt;
          if (allowance.lt(ethers.constants.MaxUint256)) {
            receipt = await tokenDonateContract
              .approve(COSMICGAME_ADDRESS, ethers.constants.MaxUint256)
              .then((tx: any) => tx.wait());
          }
          if (!receipt?.status && allowance.lt(tokenAmountInWei)) {
            await tokenDonateContract
              .approve(COSMICGAME_ADDRESS, tokenAmountInWei)
              .then((tx: any) => tx.wait());
          }

          allowance = await tokenDonateContract.allowance(
            account,
            RAFFLE_WALLET_ADDRESS
          );
          if (allowance.lt(ethers.constants.MaxUint256)) {
            receipt = await tokenDonateContract
              .approve(RAFFLE_WALLET_ADDRESS, ethers.constants.MaxUint256)
              .then((tx: any) => tx.wait());
          }
          if (!receipt?.status && allowance.lt(tokenAmountInWei)) {
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

          setTimeout(async () => {
            await onRefresh();
            setMessage("");
            setTokenAmount("");
            setTokenDonateAddress("");
            setIsBidding(false);
          }, 3000);
        } catch (err) {
          if (err?.data?.message) {
            const msg = getErrorMessage(err?.data?.message);
            setNotification({ visible: true, type: "error", text: msg });
          }
          console.log(err);
          setIsBidding(false);
        }
      }
    } catch (err) {
      if (err?.data?.message) {
        const msg = err?.data?.message;
        setNotification({ visible: true, type: "error", text: msg });
      }
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
      } else {
        console.error(err);
      }
      setIsBidding(false);
    }
  };

  // --- fetchers used only in this section --------------------------------------

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

  const fetchEthBidInfo = async () => {
    const info = await api.get_bid_eth_price();
    setEthBidInfo({
      AuctionDuration: parseInt(info.AuctionDuration),
      ETHPrice: parseFloat(ethers.utils.formatEther(info.ETHPrice)),
      SecondsElapsed: parseInt(info.SecondsElapsed),
    });
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

  const fetchActivationTime = async () => {
    const at = await cosmicGameContract.roundActivationTime();
    setActivationTime(Number(at - offset / 1000));
  };

  // --- effects -----------------------------------------------------------------

  useEffect(() => {
    const requestNotificationPermission = () => {
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted.");
          }
        });
      }
    };
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    // hydrate from query string (randomwalk/donation/referral)
    if (!router.isReady) return;

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
  }, [router.isReady, router.query]);

  useEffect(() => {
    const calcOffset = async () => {
      const current = await api.get_current_time();
      const off = current * 1000 - Date.now();
      setOffset(off);
    };
    calcOffset();

    // initial loads
    (async () => {
      await Promise.all([
        getRwlkNFTIds(),
        fetchEthBidInfo(),
        fetchCSTBidData(),
        fetchPrizeTime(),
      ]);
    })();

    // periodic refresh limited to the section’s needs
    const interval = setInterval(async () => {
      await Promise.all([
        fetchEthBidInfo(),
        fetchCSTBidData(),
        fetchPrizeTime(),
      ]);
    }, 12000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftRWLKContract, account]);

  useEffect(() => {
    const run = async () => {
      const at = await cosmicGameContract.timeoutDurationToClaimMainPrize();
      setTimeoutClaimPrize(Number(at));
      await fetchActivationTime();
    };
    if (cosmicGameContract) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cosmicGameContract, offset]);

  useEffect(() => {
    if (!data) return;

    const probabilityOfSelection = (
      totalBids: number,
      chosenBids: number,
      yourBids: number
    ) => {
      const probability =
        1 - Math.pow((totalBids - yourBids) / totalBids, chosenBids);
      return probability;
    };

    const compute = async () => {
      const userInfo = await api.get_user_info(account);
      const Bids = userInfo?.Bids || [];
      if (Bids.length) {
        const curRoundBids = Bids.filter(
          (bid: any) => bid.RoundNum === data.CurRoundNum
        );
        const bidsList = await api.get_bid_list_by_round(
          data.CurRoundNum,
          "desc"
        );
        setCurBidList(bidsList);

        const raffle =
          probabilityOfSelection(
            bidsList.length,
            data?.NumRaffleEthWinnersBidding,
            curRoundBids.length
          ) * 100;

        const nft =
          probabilityOfSelection(
            bidsList.length,
            data?.NumRaffleNFTWinnersBidding,
            curRoundBids.length
          ) * 100;

        setWinProbability({ raffle, nft });

        // sound on new bids
        if (
          account !== data?.LastBidderAddr &&
          curBidList.length < bidsList.length
        ) {
          playAudio();
        }
      }
    };

    compute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, account]);

  useEffect(() => {
    // banner image + elapsed timers
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

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, offset, curBidList, bannerToken.seed]);

  useEffect(() => {
    if (twitterHandle) {
      setMessage(`@${twitterHandle} referred by @${router.query.referred_by}.`);
    }
  }, [twitterHandle, router.query.referred_by]);

  const canShowBidButton = useMemo(() => {
    return account !== null && activationTime < Date.now() / 1000;
  }, [account, activationTime]);

  // --- render ------------------------------------------------------------------

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (th) => th.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Bidding Section begin */}
      <Grid container spacing={{ lg: 16, md: 8, sm: 8, xs: 4 }} mb={4}>
        {/* Left column */}
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

              {data?.LastBidderAddr !== constants.AddressZero && ethBidInfo && (
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
                              <>( {lastBidderElapsed} Elapsed )</>
                            )}
                          </>
                        )}
                      </Typography>
                    </Grid>
                  </Grid>

                  {!!(curBidList.length && curBidList[0]?.Message) && (
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
                          setBidType(value as any);
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
                        data?.LastBidderAddr === constants.AddressZero &&
                        ethBidInfo && (
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
                                    {formatSeconds(ethBidInfo?.SecondsElapsed)}
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
                            while bidding, you can put the contract address, NFT
                            id, and comment here.
                          </Typography>
                          <RadioGroup
                            row
                            value={donationType}
                            onChange={(_e, value) => {
                              setRwlkId(-1);
                              setDonationType(value as any);
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
                                onChange={(e) => setTokenAmount(e.target.value)}
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

                          {bidType !== "CST" && ethBidInfo && (
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
                                    if (value <= 50) setBidPricePlus(value);
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

        {/* Right column */}
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

              {/* Endurance Champion */}
              <Grid container spacing={2} mb={2} alignItems="center">
                <Grid item xs={12} sm={4} md={4}>
                  <Typography>Endurance Champion</Typography>
                </Grid>
                <Grid item xs={12} sm={8} md={8}>
                  <Typography>
                    <Link
                      href={`/user/${data?.SpecialWinners?.EnduranceChampionAddress}`}
                      color="rgb(255, 255, 255)"
                      fontSize="inherit"
                      sx={{ wordBreak: "break-all" }}
                    >
                      {data?.SpecialWinners?.EnduranceChampionAddress}
                    </Link>
                    {data?.SpecialWinners?.EnduranceChampionDuration > 0 && (
                      <>
                        {" "}
                        {` (Lasted ${formatSeconds(
                          data?.SpecialWinners?.EnduranceChampionDuration
                        )})`}{" "}
                      </>
                    )}
                  </Typography>
                </Grid>
              </Grid>

              {/* Chrono Warrior */}
              <Grid container spacing={2} mb={2} alignItems="center">
                <Grid item xs={12} sm={4} md={4}>
                  <Typography>Chrono Warrior</Typography>
                </Grid>
                {data?.SpecialWinners?.EnduranceChampionAddress && (
                  <Grid item xs={12} sm={8} md={8}>
                    <Typography>
                      <Link
                        href={`/user/${data?.SpecialWinners?.EnduranceChampionAddress}`}
                        color="rgb(255, 255, 255)"
                        fontSize="inherit"
                        sx={{ wordBreak: "break-all" }}
                      >
                        {data?.SpecialWinners?.EnduranceChampionAddress}
                      </Link>
                      {data?.SpecialWinners?.EnduranceChampionDuration > 0 && (
                        <>
                          {" "}
                          {` (Lasted ${formatSeconds(
                            data?.SpecialWinners?.EnduranceChampionDuration
                          )})`}{" "}
                        </>
                      )}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Last CST Bidder */}
              <Grid container spacing={2} mb={2} alignItems="center">
                <Grid item xs={12} sm={4} md={4}>
                  <Typography>Last Cst Bidder</Typography>
                </Grid>
                <Grid item xs={12} sm={8} md={8}>
                  <Typography>
                    <Link
                      href={`/user/${data?.SpecialWinners?.LastCstBidderAddress}`}
                      color="rgb(255, 255, 255)"
                      fontSize="inherit"
                      sx={{ wordBreak: "break-all" }}
                    >
                      {data?.SpecialWinners?.LastCstBidderAddress}
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}

          {canShowBidButton && (
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
                        ? `${ethBidInfo &&
                            (ethBidInfo.ETHPrice * (1 + bidPricePlus / 100) >
                            0.1
                              ? `(${(
                                  ethBidInfo.ETHPrice *
                                  (1 + bidPricePlus / 100)
                                ).toFixed(2)} ETH)`
                              : `(${(
                                  ethBidInfo.ETHPrice *
                                  (1 + bidPricePlus / 100)
                                ).toFixed(5)} ETH)`)}`
                        : bidType === "RandomWalk" && rwlkId !== -1
                        ? ethBidInfo &&
                          ` token ${rwlkId} (${
                            ethBidInfo.ETHPrice * (1 + bidPricePlus / 100) > 0.2
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
      {/* Bidding Section end */}

      {/* The same promo / supporting bits originally near the section */}
      <Prize data={data} />
      <LatestNFTs />

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
      {/* Optional: keep a share CTA nearby */}
      <Box mt={6}>
        <TwitterShareButton />
      </Box>
    </>
  );
};

export default BiddingSection;
