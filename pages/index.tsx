import { useState, useEffect, useReducer } from "react";
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
  Tabs,
  Tab,
} from "@mui/material";
import {
  CustomTextField,
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
import { ART_BLOCKS_ADDRESS, RAFFLE_WALLET_ADDRESS } from "../config/app";
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
import DonatedERC20Table from "../components/DonatedERC20Table";
import ChartOrPie from "../components/ChartOrPie";

/* ===========================
   Helpers & constants (hoisted)
   =========================== */

const GAS_FLOOR = BigNumber.from(2_000_000);
const GAS_BUFFER_BPS = 12000; // 120% (20% buffer)

function minGasWithBuffer(estimate: BigNumber) {
  const buffered = estimate.mul(GAS_BUFFER_BPS).div(10_000);
  return buffered.gt(GAS_FLOOR) ? buffered : GAS_FLOOR;
}

function TabPanel({
  children,
  value,
  index,
  ...other
}: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// simple interval hook (no useRef / useCallback)
function useInterval(fn: () => void, ms: number) {
  useEffect(() => {
    const id = setInterval(fn, ms);
    return () => clearInterval(id);
  }, [ms, fn]);
}

/* ===========================
   Reducer state
   =========================== */

type BidType = "ETH" | "RandomWalk" | "CST" | "";

type HomeState = {
  loading: boolean;
  data: any | null;

  bidType: BidType;
  donationType: "NFT" | "Token";

  cstBidData: {
    AuctionDuration: number;
    CSTPrice: number;
    SecondsElapsed: number;
  };
  ethBidInfo: {
    AuctionDuration: number;
    ETHPrice: number;
    SecondsElapsed: number;
  } | null;

  curBidList: any[];
  specialWinners: any | null;
  donatedNFTs: any[];
  donatedERC20Tokens: any[];
  ethDonations: any[];
  championList: any[] | null;

  prizeTime: number; // ms since epoch (server-adjusted)
  timeoutClaimPrize: number;

  message: string;
  nftDonateAddress: string;
  nftId: string;
  tokenDonateAddress: string;
  tokenAmount: string;
  rwlkId: number;
  bidPricePlus: number;
  isBidding: boolean;

  bannerToken: { seed: string; id: number };
  rwlknftIds: number[];
  offset: number; // ms
  curPage: number;

  claimHistory: any[] | null;
  imageOpen: boolean;
  advancedExpanded: boolean;
  twitterPopupOpen: boolean;
  twitterHandle: string;

  activationTime: number; // seconds since epoch (chain), server adjusted
  donatedTokensTab: number;

  sentFiveMin: boolean;
  prevCurNumBids: number;
};

const initialHomeState: HomeState = {
  loading: true,
  data: null,

  bidType: "ETH",
  donationType: "NFT",

  cstBidData: { AuctionDuration: 0, CSTPrice: 0, SecondsElapsed: 0 },
  ethBidInfo: null,

  curBidList: [],
  specialWinners: null,
  donatedNFTs: [],
  donatedERC20Tokens: [],
  ethDonations: [],
  championList: null,

  prizeTime: 0,
  timeoutClaimPrize: 0,

  message: "",
  nftDonateAddress: "",
  nftId: "",
  tokenDonateAddress: "",
  tokenAmount: "",
  rwlkId: -1,
  bidPricePlus: 2,
  isBidding: false,

  bannerToken: { seed: "", id: -1 },
  rwlknftIds: [],
  offset: 0,
  curPage: 1,

  claimHistory: null,
  imageOpen: false,
  advancedExpanded: false,
  twitterPopupOpen: false,
  twitterHandle: "",

  activationTime: 0,
  donatedTokensTab: 0,

  sentFiveMin: false,
  prevCurNumBids: 0,
};

type Action =
  | { type: "PATCH"; payload: Partial<HomeState> }
  | { type: "LOADING"; payload: boolean };

function homeReducer(state: HomeState, action: Action): HomeState {
  switch (action.type) {
    case "PATCH":
      return { ...state, ...action.payload };
    case "LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

/* ===========================
   Component
   =========================== */

const NewHome = () => {
  const router = useRouter();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));

  const { library, account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();
  const nftRWLKContract = useRWLKNFTContract();
  const cosmicSignatureContract = useCosmicSignatureContract();
  const { setNotification } = useNotification();

  const [state, dispatch] = useReducer(homeReducer, initialHomeState);
  const {
    loading,
    data,
    bidType,
    donationType,
    cstBidData,
    ethBidInfo,
    curBidList,
    specialWinners,
    donatedNFTs,
    donatedERC20Tokens,
    ethDonations,
    championList,
    timeoutClaimPrize,
    message,
    nftDonateAddress,
    nftId,
    tokenDonateAddress,
    tokenAmount,
    rwlkId,
    bidPricePlus,
    isBidding,
    bannerToken,
    rwlknftIds,
    offset,
    curPage,
    claimHistory,
    imageOpen,
    advancedExpanded,
    twitterPopupOpen,
    twitterHandle,
    activationTime,
    donatedTokensTab,
    prizeTime,
    sentFiveMin,
    prevCurNumBids,
  } = state;

  // single ticking "now" for countdown displays
  const [now, setNow] = useState(() => Date.now());
  useInterval(() => setNow(Date.now()), 1000);

  const notify = (
    type: "error" | "warning" | "success" | "info",
    text: string
  ) => setNotification({ visible: true, type, text });

  const notifyErrorFromEthers = (err: any) => {
    if (err?.data?.message) {
      notify("error", getErrorMessage(err.data.message));
    } else if (err?.message) {
      notify("error", err.message);
    } else {
      console.error(err);
      notify("error", "Unexpected error. Please try again.");
    }
  };

  const getSigner = () => library.getSigner(account);
  const getNft = (address: string) =>
    new Contract(address, NFT_ABI, getSigner());
  const getErc20 = (address: string) =>
    new Contract(address, ERC20_ABI, getSigner());

  const isContractAddress = async (address: string) => {
    if (!ethers.utils.isAddress(address)) return false;
    try {
      const byteCode = await library.getCode(address);
      return byteCode && byteCode !== "0x";
    } catch {
      return false;
    }
  };

  const isERC721 = async (nft: Contract) => {
    try {
      return await nft.supportsInterface("0x80ac58cd");
    } catch {
      return false;
    }
  };

  const ensureNftOwnership = async (nft: Contract, tokenId: number) => {
    try {
      const owner = await nft.ownerOf(tokenId);
      if (owner?.toLowerCase() !== account?.toLowerCase()) {
        notify("error", "You aren't the owner of the token!");
        return false;
      }
      return true;
    } catch (err) {
      notifyErrorFromEthers(err);
      return false;
    }
  };

  const ensureNftApprovalForAll = async (nft: Contract) => {
    const approved = await nft.isApprovedForAll(account, RAFFLE_WALLET_ADDRESS);
    if (!approved) {
      const tx = await nft.setApprovalForAll(RAFFLE_WALLET_ADDRESS, true);
      await tx.wait();
    }
  };

  const ensureErc20Allowance = async (token: Contract, required: BigNumber) => {
    let receipt: any;
    const allowance: BigNumber = await token.allowance(
      account,
      RAFFLE_WALLET_ADDRESS
    );

    if (allowance.lt(ethers.constants.MaxUint256)) {
      receipt = await token
        .approve(RAFFLE_WALLET_ADDRESS, ethers.constants.MaxUint256)
        .then((tx: any) => tx.wait());
    }
    if (!receipt?.status && allowance.lt(required)) {
      const tx = await token.approve(RAFFLE_WALLET_ADDRESS, required);
      await tx.wait();
    }
  };

  const getErc20Decimals = async (token: Contract) => {
    try {
      return await token.decimals();
    } catch {
      console.warn("decimals() not found, assuming 18.");
      notify(
        "warning",
        "Token doesn't implement decimals(); assuming 18 decimal places."
      );
      return 18;
    }
  };

  const hasEthBalance = async (amount: BigNumber) => {
    try {
      const bal = await library.getBalance(account);
      return bal.gte(amount);
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const hasCstBalance = async (amountWei: BigNumber) => {
    try {
      const bal = await api.get_user_balance(account);
      if (!bal) return false;
      const wallet = BigNumber.from(bal.CosmicTokenBalance);
      return wallet.gte(amountWei);
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleTx = async (txPromise: Promise<any>) => {
    const tx = await txPromise;
    await tx.wait();
  };

  const withPostTxRefresh = async (
    afterMs = 1500,
    alsoFetchActivationMs = 3000
  ) => {
    setTimeout(() => {
      fetchBundle();
      dispatch({ type: "PATCH", payload: { message: "" } });
    }, afterMs);

    setTimeout(async () => {
      try {
        await fetchActivationTime();
      } catch (e) {
        console.warn("fetchActivationTime failed:", e);
      }
    }, alsoFetchActivationMs);
  };

  const getNextEthBidPriceWithModifiers = async () => {
    const base = await cosmicGameContract.getNextEthBidPrice();
    let price = base
      .mul(ethers.utils.parseEther((100 + bidPricePlus).toString()))
      .div(ethers.utils.parseEther("100"));
    if (bidType === "RandomWalk") {
      price = price
        .mul(ethers.utils.parseEther("50"))
        .div(ethers.utils.parseEther("100"));
    }
    return price;
  };

  // donation helpers
  const withNftDonation = async (nftAddress: string, tokenId: number) => {
    if (!nftAddress || nftAddress.trim() === "" || Number.isNaN(tokenId)) {
      throw new Error("Missing NFT donation address or tokenId.");
    }
    if (!(await isContractAddress(nftAddress))) {
      notify("error", "The address provided is not a valid contract address!");
      return false;
    }
    const nft = getNft(nftAddress);
    if (!(await isERC721(nft))) {
      notify(
        "error",
        "The donate NFT contract is not an ERC721 token contract."
      );
      return false;
    }
    if (!(await ensureNftOwnership(nft, tokenId))) return false;
    await ensureNftApprovalForAll(nft);
    return true;
  };

  const withTokenDonation = async (tokenAddress: string, amountStr: string) => {
    if (!tokenAddress || !amountStr) {
      throw new Error("Missing token donation address or amount.");
    }
    if (!(await isContractAddress(tokenAddress))) {
      notify("error", "The address provided is not a valid contract address!");
      return { ok: false as const };
    }
    const erc20 = getErc20(tokenAddress);

    try {
      const ts = await erc20.totalSupply();
      if (!ts) throw new Error("Not an ERC20");
    } catch (err) {
      console.log(err);
      notify(
        "error",
        "The donate token contract is not an ERC20 token contract."
      );
      return { ok: false as const };
    }

    const decimals = await getErc20Decimals(erc20);
    const amountWei = parseUnits(amountStr, decimals);
    const bal: BigNumber = await erc20.balanceOf(account);

    if (bal.lt(amountWei)) {
      notify("error", "Insufficient token balance for donation.");
      return { ok: false as const };
    }
    await ensureErc20Allowance(erc20, amountWei);
    return { ok: true as const, token: erc20, amountWei, decimals };
  };

  /* ===========================
     Bidding actions
     =========================== */

  const onBid = async () => {
    if (isBidding) return;
    dispatch({ type: "PATCH", payload: { isBidding: true } });
    try {
      const ethBidPrice = await getNextEthBidPriceWithModifiers();

      const enoughEth = await hasEthBalance(ethBidPrice);
      if (!enoughEth) {
        notify(
          "error",
          "Insufficient ETH balance! There isn't enough ETH in your wallet."
        );
        dispatch({ type: "PATCH", payload: { isBidding: false } });
        return;
      }

      const noDonation =
        (donationType === "NFT" && (!nftDonateAddress || !nftId)) ||
        (donationType === "Token" && (!tokenDonateAddress || !tokenAmount)) ||
        !donationType;

      if (noDonation) {
        await handleTx(
          cosmicGameContract.bidWithEth(rwlkId, message, {
            value: ethBidPrice,
            gasLimit: 30_000_000,
          })
        );
        await withPostTxRefresh();
        dispatch({ type: "PATCH", payload: { isBidding: false } });
        return;
      }

      if (donationType === "NFT") {
        const nftIdNum = Number(nftId);
        const ok = await withNftDonation(nftDonateAddress!, nftIdNum);
        if (!ok) {
          dispatch({ type: "PATCH", payload: { isBidding: false } });
          return;
        }
        await handleTx(
          cosmicGameContract.bidWithEthAndDonateNft(
            rwlkId,
            message,
            nftDonateAddress,
            nftIdNum,
            {
              value: ethBidPrice,
            }
          )
        );
        dispatch({
          type: "PATCH",
          payload: { nftId: "", nftDonateAddress: "" },
        });
      } else {
        const res = await withTokenDonation(tokenDonateAddress!, tokenAmount!);
        if (!res.ok) {
          dispatch({ type: "PATCH", payload: { isBidding: false } });
          return;
        }
        await handleTx(
          cosmicGameContract.bidWithEthAndDonateToken(
            rwlkId,
            message,
            tokenDonateAddress,
            res.amountWei,
            { value: ethBidPrice }
          )
        );
        dispatch({
          type: "PATCH",
          payload: { tokenAmount: "", tokenDonateAddress: "" },
        });
      }

      await withPostTxRefresh();
    } catch (err) {
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
      } else {
        notifyErrorFromEthers(err);
      }
    } finally {
      dispatch({ type: "PATCH", payload: { isBidding: false } });
    }
  };

  const onBidWithCST = async () => {
    if (isBidding) return;
    dispatch({ type: "PATCH", payload: { isBidding: true } });
    try {
      if (cstBidData?.CSTPrice > 0) {
        const cstWei = ethers.utils.parseEther(cstBidData.CSTPrice.toString());
        const enoughCst = await hasCstBalance(cstWei);
        if (!enoughCst) {
          notify(
            "error",
            "Insufficient CST balance! There isn't enough Cosmic Signature Token in your wallet."
          );
          dispatch({ type: "PATCH", payload: { isBidding: false } });
          return;
        }
      }

      const priceMaxLimit: BigNumber = await cosmicGameContract.getNextCstBidPrice();

      const noDonation =
        (donationType === "NFT" && (!nftDonateAddress || !nftId)) ||
        (donationType === "Token" && (!tokenDonateAddress || !tokenAmount)) ||
        !donationType;

      if (noDonation) {
        await handleTx(cosmicGameContract.bidWithCst(priceMaxLimit, message));
        await withPostTxRefresh();
        dispatch({ type: "PATCH", payload: { isBidding: false } });
        return;
      }

      if (donationType === "NFT") {
        const nftIdNum = Number(nftId);
        const ok = await withNftDonation(nftDonateAddress!, nftIdNum);
        if (!ok) {
          dispatch({ type: "PATCH", payload: { isBidding: false } });
          return;
        }
        await handleTx(
          cosmicGameContract.bidWithCstAndDonateNft(
            priceMaxLimit,
            message,
            nftDonateAddress,
            nftIdNum
          )
        );
        dispatch({
          type: "PATCH",
          payload: { nftId: "", nftDonateAddress: "" },
        });
      } else {
        const res = await withTokenDonation(tokenDonateAddress!, tokenAmount!);
        if (!res.ok) {
          dispatch({ type: "PATCH", payload: { isBidding: false } });
          return;
        }
        await handleTx(
          cosmicGameContract.bidWithCstAndDonateToken(
            priceMaxLimit,
            message,
            tokenDonateAddress,
            res.amountWei
          )
        );
        dispatch({
          type: "PATCH",
          payload: { tokenAmount: "", tokenDonateAddress: "" },
        });
      }

      await withPostTxRefresh();
    } catch (err) {
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
      } else {
        if (err?.data?.message) {
          notify("error", err.data.message);
        } else {
          notifyErrorFromEthers(err);
        }
      }
    } finally {
      dispatch({ type: "PATCH", payload: { isBidding: false } });
    }
  };

  const onClaimPrize = async () => {
    try {
      const estimate = await cosmicGameContract.estimateGas.claimMainPrize();
      const gasLimit = minGasWithBuffer(estimate);

      await handleTx(cosmicGameContract.claimMainPrize({ gasLimit }));

      const totalSupply = await cosmicSignatureContract.totalSupply();
      const tokenId = totalSupply.toNumber() - 1;

      let count = (data?.NumRaffleNFTWinnersBidding ?? 0) + 3;
      if (data?.MainStats?.StakeStatisticsRWalk?.TotalTokensStaked > 0) {
        count += data?.NumRaffleNFTWinnersStakingRWalk ?? 0;
      }

      await api.create(tokenId, count);
      router.push({
        pathname: "/prize-claimed",
        query: { round: data?.CurRoundNum, message: "success" },
      });

      await withPostTxRefresh(1000, 3000);
    } catch (err) {
      if (err?.code === 4001) {
        console.log("User denied transaction signature.");
        return;
      }
      notifyErrorFromEthers(err);
    }
  };

  /* ===========================
     Data fetching (bundled)
     =========================== */

  const fetchActivationTime = async () => {
    if (!cosmicGameContract) return;
    const activation = await cosmicGameContract.roundActivationTime();
    dispatch({
      type: "PATCH",
      payload: { activationTime: Number(activation) - offset / 1000 },
    });
  };

  const fetchPrizeTime = async () => {
    try {
      const t = await api.get_prize_time();
      const current = await api.get_current_time();
      const diff = current * 1000 - Date.now();
      dispatch({ type: "PATCH", payload: { prizeTime: t * 1000 - diff } });
    } catch (e) {
      console.error("Error fetching prize time:", e);
    }
  };

  const fetchBundle = async (round?: number) => {
    try {
      const dashboard = await api.get_dashboard_info();
      const r = round ?? dashboard?.CurRoundNum;

      const [
        newBidData,
        nftData,
        championsData,
        specials,
        ethDonationsRes,
        donatedERC20TokensRes,
        cstInfo,
        ethInfo,
        claimHistoryRes,
      ] = await Promise.all([
        api.get_bid_list_by_round(r, "desc"),
        api.get_donations_nft_by_round(r),
        (async () => {
          const bids = await api.get_bid_list_by_round(r, "desc");
          const champs = getEnduranceChampions(bids).sort(
            (a, b) => b.chronoWarrior - a.chronoWarrior
          );
          return champs;
        })(),
        api.get_current_special_winners(),
        api.get_donations_cg_with_info_by_round(r),
        api.get_donations_erc20_by_round(r),
        api.get_ct_price(),
        api.get_bid_eth_price(),
        api.get_claim_history(),
      ]);

      dispatch({
        type: "PATCH",
        payload: {
          data: dashboard,
          curBidList: newBidData,
          donatedNFTs: nftData,
          championList: championsData,
          specialWinners: specials,
          ethDonations: ethDonationsRes,
          donatedERC20Tokens: donatedERC20TokensRes,
          cstBidData: cstInfo
            ? {
                AuctionDuration: parseInt(cstInfo.AuctionDuration),
                CSTPrice: parseFloat(
                  ethers.utils.formatEther(cstInfo.CSTPrice)
                ),
                SecondsElapsed: parseInt(cstInfo.SecondsElapsed),
              }
            : { AuctionDuration: 0, CSTPrice: 0, SecondsElapsed: 0 },
          ethBidInfo: ethInfo
            ? {
                AuctionDuration: parseInt(ethInfo.AuctionDuration),
                ETHPrice: parseFloat(
                  ethers.utils.formatEther(ethInfo.ETHPrice)
                ),
                SecondsElapsed: parseInt(ethInfo.SecondsElapsed),
              }
            : null,
          claimHistory: claimHistoryRes,
          loading: false,
        },
      });
    } catch (err) {
      console.error("Error fetching bundle:", err);
    }
  };

  /* ===========================
     Initial bootstrap
     =========================== */

  useEffect(() => {
    (async () => {
      try {
        // Router query prefill
        if (router.query) {
          const payload: Partial<HomeState> = {};
          if (router.query.randomwalk) {
            payload.rwlkId = Number(router.query.tokenId);
            payload.bidType = "RandomWalk";
          }
          if (router.query.donation) {
            payload.nftDonateAddress = ART_BLOCKS_ADDRESS;
            const tokenId = Array.isArray(router.query.tokenId)
              ? router.query.tokenId[0]
              : (router.query.tokenId as string);
            payload.nftId = tokenId;
            payload.bidType = "ETH";
            payload.advancedExpanded = true;
          }
          if (router.query.referred_by) payload.twitterPopupOpen = true;
          if (Object.keys(payload).length) dispatch({ type: "PATCH", payload });
        }

        // server offset
        const current = await api.get_current_time();
        const newOffset = current * 1000 - Date.now();
        dispatch({ type: "PATCH", payload: { offset: newOffset } });

        // initial fetches
        await fetchBundle();
        await fetchPrizeTime();

        // wallet NFTs
        if (nftRWLKContract && account) {
          const used_rwalk = await api.get_used_rwlk_nfts();
          const banned = new Set(used_rwalk.map((x: any) => x.RWalkTokenId));
          const tokens = await nftRWLKContract.walletOfOwner(account);
          const ids = tokens
            .map((t: BigNumber) => t.toNumber())
            .filter((t: number) => !banned.has(t))
            .reverse();
          dispatch({ type: "PATCH", payload: { rwlknftIds: ids } });
        }

        // chain timeouts/activation
        if (cosmicGameContract) {
          const timeout = await cosmicGameContract.timeoutDurationToClaimMainPrize();
          const activation = await cosmicGameContract.roundActivationTime();
          dispatch({
            type: "PATCH",
            payload: {
              timeoutClaimPrize: Number(timeout),
              activationTime: Number(activation) - newOffset / 1000,
            },
          });
        }

        // request notification permission once
        if ("Notification" in window && Notification.permission !== "granted") {
          Notification.requestPermission().catch(() => {});
        }
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 12s polling
  useInterval(() => {
    fetchBundle();
    fetchPrizeTime();
  }, 12000);

  // Banner token lazy compute (once per data load)
  useEffect(() => {
    if (!data || bannerToken.seed) return;
    (async () => {
      if (data?.MainStats?.NumCSTokenMints > 0) {
        const bannerId = Math.floor(
          Math.random() * data.MainStats.NumCSTokenMints
        );
        const res = await api.get_cst_info(bannerId);
        dispatch({
          type: "PATCH",
          payload: { bannerToken: { seed: `0x${res.Seed}`, id: bannerId } },
        });
      } else {
        dispatch({
          type: "PATCH",
          payload: { bannerToken: { seed: "sample", id: -1 } },
        });
      }
    })();
  }, [data, bannerToken.seed]);

  // Single notification trigger (5 minutes before prizeTime)
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (!prizeTime || sentFiveMin) return;
    const remaining = prizeTime - now;
    if (
      remaining <= 5 * 60 * 1000 &&
      remaining > 0 &&
      Notification.permission === "granted"
    ) {
      new Notification("Bid Now or Miss Out!", {
        body:
          "Time is running out! You have 5 minutes to place your bids and win amazing prizes.",
      });
      dispatch({ type: "PATCH", payload: { sentFiveMin: true } });
    }
  }, [now, prizeTime, sentFiveMin]);

  // Play audio *once* when bids increase and you are not last bidder
  useEffect(() => {
    if (!data) return;
    const cur = data?.CurNumBids ?? 0;
    if (account !== data?.LastBidderAddr && cur > prevCurNumBids) {
      const audio = new Audio("/audio/notification.wav");
      audio.play().catch(() => {});
    }
    dispatch({ type: "PATCH", payload: { prevCurNumBids: cur } });
  }, [data?.CurNumBids, data?.LastBidderAddr, account, prevCurNumBids]);

  // Message prefill when twitterHandle set
  useEffect(() => {
    if (!twitterHandle) return;
    const referredBy = router.query.referred_by;
    const suffix = referredBy ? ` referred by @${referredBy}.` : ".";
    dispatch({
      type: "PATCH",
      payload: { message: `@${twitterHandle}${suffix}` },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twitterHandle]);

  /* ===========================
     Derived values for render
     =========================== */

  const adjustedNow = now + offset; // server-adjusted "now"
  const roundStartedText = data?.TsRoundStart
    ? calculateTimeDiff(data?.TsRoundStart - offset / 1000)
    : "";
  const lastBidderElapsedText = curBidList?.length
    ? calculateTimeDiff(curBidList[0].TimeStamp - offset / 1000)
    : "";

  const gridLayout = (() => {
    const n = donatedNFTs.length;
    if (n > 16) return { xs: 6, sm: 3, md: 2, lg: 2 } as const;
    if (n > 9) return { xs: 6, sm: 4, md: 3, lg: 3 } as const;
    return { xs: 12, sm: 6, md: 4, lg: 4 } as const;
  })();

  const safeEthPrice = ethBidInfo?.ETHPrice ?? 0;
  const safeCstPrice = cstBidData?.CSTPrice ?? 0;
  const plusFactor = 1 + bidPricePlus / 100;
  const effectiveEth =
    safeEthPrice * plusFactor * (bidType === "RandomWalk" ? 0.5 : 1);
  const ethLabel =
    effectiveEth > 0.1 ? effectiveEth.toFixed(2) : effectiveEth.toFixed(5);
  const cstLabel =
    cstBidData.SecondsElapsed > cstBidData.AuctionDuration
      ? "FREE BID"
      : `${safeCstPrice.toFixed(2)} CST`;

  const userBidsThisRound = (() => {
    if (!account || !curBidList?.length) return 0;
    return curBidList.filter((b: any) => b.BidderAddr === account).length;
  })();

  const winProbability = (() => {
    if (!data || !curBidList.length || !userBidsThisRound) return null;
    const prob = (total: number, chosen: number, yours: number) =>
      1 - Math.pow((total - yours) / total, chosen);
    return {
      raffle:
        prob(
          curBidList.length,
          data?.NumRaffleEthWinnersBidding,
          userBidsThisRound
        ) * 100,
      nft:
        prob(
          curBidList.length,
          data?.NumRaffleNFTWinnersBidding,
          userBidsThisRound
        ) * 100,
    };
  })();

  /* ===========================
     Render
     =========================== */

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
                      {roundStartedText !== "" && (
                        <Typography sx={{ mt: 1 }}>
                          (Round was started {roundStartedText} ago.)
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
                        <Typography>{safeEthPrice.toFixed(5)} ETH</Typography>
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
                          {(safeEthPrice / 2).toFixed(5)} ETH
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
                          <Typography>{safeCstPrice.toFixed(5)} CST</Typography>
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
                              {lastBidderElapsedText !== "" && (
                                <>( {lastBidderElapsedText} Elapsed )</>
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
                            dispatch({
                              type: "PATCH",
                              payload: {
                                rwlkId: -1,
                                bidType: value as BidType,
                              },
                            });
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
                              label="CST(Cosmic Signature Token)"
                            />
                          )}
                        </RadioGroup>

                        {bidType === "ETH" &&
                          data?.LastBidderAddr === constants.AddressZero && (
                            <Box ml={2}>
                              {ethBidInfo &&
                              ethBidInfo.SecondsElapsed >
                                ethBidInfo.AuctionDuration ? (
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
                                      {ethBidInfo
                                        ? formatSeconds(
                                            ethBidInfo.SecondsElapsed
                                          )
                                        : "-"}
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
                                    {ethBidInfo
                                      ? formatSeconds(
                                          ethBidInfo.AuctionDuration
                                        )
                                      : "-"}
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
                              setSelectedToken={(v: number) =>
                                dispatch({
                                  type: "PATCH",
                                  payload: { rwlkId: v },
                                })
                              }
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
                          onChange={(e) =>
                            dispatch({
                              type: "PATCH",
                              payload: { message: e.target.value },
                            })
                          }
                        />

                        <Accordion
                          expanded={advancedExpanded}
                          onChange={(_event, isExpanded) =>
                            dispatch({
                              type: "PATCH",
                              payload: { advancedExpanded: isExpanded },
                            })
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
                              onChange={(_e, value) =>
                                dispatch({
                                  type: "PATCH",
                                  payload: {
                                    rwlkId: -1,
                                    donationType: value as "NFT" | "Token",
                                  },
                                })
                              }
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
                                    dispatch({
                                      type: "PATCH",
                                      payload: {
                                        tokenDonateAddress: e.target.value,
                                      },
                                    })
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
                                    dispatch({
                                      type: "PATCH",
                                      payload: { tokenAmount: e.target.value },
                                    })
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
                                    dispatch({
                                      type: "PATCH",
                                      payload: {
                                        nftDonateAddress: e.target.value,
                                      },
                                    })
                                  }
                                />
                                <TextField
                                  placeholder="NFT number"
                                  type="number"
                                  value={nftId}
                                  size="small"
                                  fullWidth
                                  sx={{ marginTop: 2 }}
                                  onChange={(e) =>
                                    dispatch({
                                      type: "PATCH",
                                      payload: { nftId: e.target.value },
                                    })
                                  }
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
                                      const v = Number(e.target.value);
                                      if (v <= 50)
                                        dispatch({
                                          type: "PATCH",
                                          payload: { bidPricePlus: v },
                                        });
                                    }}
                                  />
                                  <Typography
                                    whiteSpace="nowrap"
                                    color="rgba(255, 255, 255, 0.68)"
                                    ml={2}
                                  >
                                    {ethLabel} ETH
                                  </Typography>
                                </Box>
                                <Typography variant="body2" mt={2}>
                                  The bid price is bumped {bidPricePlus}% to
                                  prevent bidding collision.
                                </Typography>
                                <Typography variant="body2">
                                  This percentage won't rise the bid price
                                  arbitrarily after your bid, it is only meant
                                  for allowing both bid transactions to pass
                                  through in case two simultaneous bids occur
                                  within the same block.
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
                          {" "}
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
                            {" "}
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
                          ? `(${ethLabel} ETH)`
                          : bidType === "RandomWalk" && rwlkId !== -1
                          ? `token ${rwlkId} (${ethLabel} ETH)`
                          : bidType === "CST"
                          ? `(${cstLabel})`
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
                onClick={() =>
                  dispatch({ type: "PATCH", payload: { imageOpen: true } })
                }
              >
                Show Random Sample NFT
              </Button>
            )}
          </Grid>
        </Grid>

        <Box>
          <Typography variant="body2" mt={4}>
            When you bid, you will get 100 Cosmic Signature Tokens as a reward.
            These tokens allow you to participate in the DAO.
          </Typography>
          <Box mt={2}>
            <Typography variant="body2" color="primary" component="span">
              *
            </Typography>
            <Typography variant="body2" component="span">
              {" "}
              When you bid, you are also buying a raffle ticket.{" "}
              {data?.NumRaffleEthWinnersBidding} raffle tickets will be chosen
              and these people will win {data?.RafflePercentage}% of the pot.
              Also, {data?.NumRaffleNFTWinnersBidding} additional winners and{" "}
              {data?.NumRaffleNFTWinnersStakingRWalk} Random Walk NFT stakers
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
            {(data?.CosmicGameBalanceEth / 10).toFixed(4)} ETH).
          </Typography>
        </Box>

        <Box mt={6}>
          <Typography variant="subtitle1" color="primary" textAlign="center">
            Distribution of funds on each round
          </Typography>
          <ChartOrPie data={data} />
        </Box>

        {data && <Prize data={data} />}

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
          <Typography variant="h6">DONATED TOKENS FOR CURRENT ROUND</Typography>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              variant="fullWidth"
              value={donatedTokensTab}
              onChange={(_e, v) =>
                dispatch({ type: "PATCH", payload: { donatedTokensTab: v } })
              }
            >
              <Tab label="ERC721 Tokens" />
              <Tab label="ERC20 Tokens" />
            </Tabs>
          </Box>

          <TabPanel value={donatedTokensTab} index={0}>
            {donatedNFTs.length > 0 ? (
              <>
                <Grid container spacing={2} mt={2}>
                  {donatedNFTs.map((nft: any) => (
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
                  setPage={(p: number) =>
                    dispatch({ type: "PATCH", payload: { curPage: p } })
                  }
                  totalLength={donatedNFTs.length}
                  perPage={12}
                />
              </>
            ) : (
              <Typography>
                No ERC721 tokens were donated on this round.
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={donatedTokensTab} index={1}>
            <DonatedERC20Table list={donatedERC20Tokens} handleClaim={null} />
          </TabPanel>
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
          onClose={() =>
            dispatch({ type: "PATCH", payload: { imageOpen: false } })
          }
        />
      )}

      <TwitterPopup
        open={twitterPopupOpen}
        setOpen={(v: boolean) =>
          dispatch({ type: "PATCH", payload: { twitterPopupOpen: v } })
        }
        setTwitterHandle={(h: string) =>
          dispatch({ type: "PATCH", payload: { twitterHandle: h } })
        }
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
