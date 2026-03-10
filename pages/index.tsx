import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Box,
  Typography,
  TextField,
  CardActionArea,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
} from '@mui/material';
import { usePublicClient, useWalletClient } from 'wagmi';
import { formatEther, isAddress, maxUint256, parseEther, parseUnits, zeroAddress } from 'viem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Countdown from 'react-countdown';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import axios from 'axios';

import { CustomTextField, MainWrapper, StyledCard, StyledInput } from '../components/styled';
import BiddingHistory from '../components/tables/BiddingHistoryTable';
import api, { cosmicGameBaseUrl } from '../services/api';
import useCosmicGameContract from '../hooks/useCosmicGameContract';
import useRWLKNFTContract from '../hooks/useRWLKNFTContract';
import { useActiveWeb3React } from '../hooks/web3';
import { ART_BLOCKS_ADDRESS, RAFFLE_WALLET_ADDRESS } from '../config/networks';
import { randomWalkNftAbi as NFT_ABI, cosmicTokenAbi as ERC20_ABI } from '../contracts/abis';
import PaginationRWLKGrid from '../components/nft/PaginationRWLKGrid';
import useCosmicSignatureContract from '../hooks/useCosmicSignatureContract';
import Prize from '../components/common/Prize';
import LatestNFTs from '../components/nft/LatestNFTs';
import getErrorMessage from '../utils/alert';
import NFTImage from '../components/nft/NFTImage';
import { formatSeconds, getAssetsUrl, getEnduranceChampions, EnduranceChampion } from '../utils';
import { createOpenGraphProps } from '../utils/seo';
import type {
  DashboardInfo,
  BidInfo,
  DonatedNFT as DonatedNFTType,
  UsedRWLKNFT,
  TxInfo,
} from '../services/api/types';
import { isUserRejection, isEthProviderError, reportError } from '../utils/errors';
import { useNotification } from '../contexts/NotificationContext';
import RaffleHolderTable from '../components/tables/RaffleHolderTable';
import ETHSpentTable from '../components/tables/ETHSpentTable';
import EnduranceChampionsTable from '../components/tables/EnduranceChampionsTable';
import EthDonationTable from '../components/tables/EthDonationTable';
import ChartOrPie from '../components/tokens/ChartOrPie';
import { SpecialPrizeWinners } from '../components/tables/SpecialPrizeWinners';
import { BiddingStatus } from '../components/common/BiddingStatus';
import { DonatedTokensSection } from '../components/home/DonatedTokensSection';
import { WinningHistorySection } from '../components/home/WinningHistorySection';

const HomePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardInfo | null>(null);
  const [bidType, setBidType] = useState('ETH');
  const [donationType, setDonationType] = useState('NFT');
  const [cstBidData, setCSTBidData] = useState({
    AuctionDuration: 0,
    CSTPrice: 0,
    SecondsElapsed: 0,
  });
  const [curBidList, setCurBidList] = useState<BidInfo[]>([]);
  const [ethBidInfo, setEthBidInfo] = useState<{
    AuctionDuration: number;
    ETHPrice: number;
    SecondsElapsed: number;
  } | null>(null);
  const [donatedNFTs, setDonatedNFTs] = useState<DonatedNFTType[]>([]);
  const [ethDonations, setEthDonations] = useState<
    import('../components/tables/EthDonationTable').EthDonation[]
  >([]);
  const [championList, setChampionList] = useState<EnduranceChampion[] | null>(null);
  const [prizeTime, setPrizeTime] = useState(0);
  const [timeoutClaimPrize, setTimeoutClaimPrize] = useState(0);
  const [message, setMessage] = useState('');
  const [nftDonateAddress, setNftDonateAddress] = useState('');
  const [nftId, setNftId] = useState('');
  const [tokenDonateAddress, setTokenDonateAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [rwlkId, setRwlkId] = useState(-1);
  const [bidPricePlus, setBidPricePlus] = useState(2);
  const [isBidding, setIsBidding] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [bannerToken, setBannerToken] = useState({ seed: '', id: -1 });
  const [rwlknftIds, setRwlknftIds] = useState<number[]>([]);
  const [offset, setOffset] = useState(0);
  const [curPage, setCurrentPage] = useState(1);
  const [claimHistory, setClaimHistory] = useState<
    import('../components/tables/WinningHistoryTable').WinningHistoryEntry[] | null
  >(null);
  const [imageOpen, setImageOpen] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [twitterPopupOpen, setTwitterPopupOpen] = useState(false);
  const [twitterHandle, setTwitterHandle] = useState('');
  const [activationTime, setActivationTime] = useState(0);
  const [donatedTokensTab, setDonatedTokensTab] = useState(0);
  const [donatedERC20Tokens, setDonatedERC20Tokens] = useState<
    import('../components/donations/DonatedERC20Table').DonatedERC20Token[]
  >([]);
  const perPage = 12;

  const { account } = useActiveWeb3React();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const cosmicGameContract = useCosmicGameContract();
  const nftRWLKContract = useRWLKNFTContract();
  const cosmicSignatureContract = useCosmicSignatureContract();
  const { setNotification } = useNotification();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  const GAS_FLOOR = BigInt(2_000_000);
  const GAS_BUFFER_BPS = BigInt(12000); // 120% (20% buffer)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setDonatedTokensTab(newValue);
  };

  const notify = (type: 'error' | 'warning' | 'success' | 'info', text: string) =>
    setNotification({ visible: true, type, text });

  const notifyErrorFromEthers = (err: unknown) => {
    if (isEthProviderError(err) && err.data?.message) {
      notify('error', getErrorMessage(err.data.message));
    } else if (err instanceof Error) {
      notify('error', err.message);
    } else {
      reportError(err, 'ethers provider error');
      notify('error', 'Unexpected error. Please try again.');
    }
  };

  const withPostTxRefresh = async (afterMs = 1500, alsoFetchActivationMs = 3000) => {
    // Allow a brief delay if your UI relies on indexers/subgraphs.
    setTimeout(() => {
      fetchDataCollection();
      setMessage('');
    }, afterMs);

    setTimeout(async () => {
      try {
        await fetchActivationTime();
      } catch (e) {
        reportError(e, 'fetchActivationTime');
      }
    }, alsoFetchActivationMs);
  };

  const handleTx = async (hashPromise: Promise<`0x${string}`>) => {
    const hash = await hashPromise;
    await publicClient!.waitForTransactionReceipt({ hash });
  };

  const isContractAddress = async (address: string) => {
    if (!isAddress(address)) return false;
    try {
      const byteCode = await publicClient!.getCode({ address: address as `0x${string}` });
      return !!byteCode && byteCode !== '0x';
    } catch {
      return false;
    }
  };

  const isERC721 = async (nftAddress: string) => {
    try {
      return await publicClient!.readContract({
        address: nftAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'supportsInterface',
        args: ['0x80ac58cd'],
      });
    } catch {
      return false;
    }
  };

  const ensureNftOwnership = async (nftAddress: string, tokenId: number) => {
    try {
      const owner = (await publicClient!.readContract({
        address: nftAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      })) as string;
      if (owner?.toLowerCase() !== account?.toLowerCase()) {
        notify('error', "You aren't the owner of the token!");
        return false;
      }
      return true;
    } catch (err) {
      notifyErrorFromEthers(err);
      return false;
    }
  };

  const ensureNftApprovalForAll = async (nftAddress: string) => {
    const approved = await publicClient!.readContract({
      address: nftAddress as `0x${string}`,
      abi: NFT_ABI,
      functionName: 'isApprovedForAll',
      args: [account as `0x${string}`, RAFFLE_WALLET_ADDRESS as `0x${string}`],
    });
    if (!approved) {
      const hash = await walletClient!.writeContract({
        address: nftAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'setApprovalForAll',
        args: [RAFFLE_WALLET_ADDRESS as `0x${string}`, true],
      });
      await publicClient!.waitForTransactionReceipt({ hash });
    }
  };

  const ensureErc20Allowance = async (tokenAddress: string, required: bigint) => {
    let approved = false;
    const allowance = (await publicClient!.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [account as `0x${string}`, RAFFLE_WALLET_ADDRESS as `0x${string}`],
    })) as bigint;

    if (allowance < maxUint256) {
      const hash = await walletClient!.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [RAFFLE_WALLET_ADDRESS as `0x${string}`, maxUint256],
      });
      const receipt = await publicClient!.waitForTransactionReceipt({ hash });
      approved = receipt.status === 'success';
    }
    if (!approved && allowance < required) {
      const hash = await walletClient!.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [RAFFLE_WALLET_ADDRESS as `0x${string}`, required],
      });
      await publicClient!.waitForTransactionReceipt({ hash });
    }
  };

  const getErc20Decimals = async (tokenAddress: string) => {
    try {
      return (await publicClient!.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      })) as number;
    } catch {
      console.warn('decimals() not found, assuming 18.');
      notify('warning', "Token doesn't implement decimals(); assuming 18 decimal places.");
      return 18;
    }
  };

  const hasEthBalance = async (amount: bigint) => {
    try {
      const bal = await publicClient!.getBalance({ address: account as `0x${string}` });
      return bal >= amount;
    } catch (e) {
      reportError(e, 'check ETH balance');
      return false;
    }
  };

  const hasCstBalance = async (amountWei: bigint) => {
    try {
      const bal = await api.get_user_balance(account!);
      if (!bal) return false;
      const wallet = BigInt(bal.CosmicTokenBalance);
      return wallet >= amountWei;
    } catch (e) {
      reportError(e, 'check CST balance');
      return false;
    }
  };

  const minGasWithBuffer = (estimate: bigint) => {
    const buffered = (estimate * GAS_BUFFER_BPS) / BigInt(10_000);
    return buffered > GAS_FLOOR ? buffered : GAS_FLOOR;
  };

  const getNextEthBidPriceWithModifiers = async () => {
    const base = (await cosmicGameContract!.read.getNextEthBidPrice?.()) as bigint;
    let price = (base * parseEther((100 + bidPricePlus).toString())) / parseEther('100');
    if (bidType === 'RandomWalk') {
      price = (price * parseEther('50')) / parseEther('100');
    }
    return price;
  };

  // -----------------------------
  // Prize claim
  // -----------------------------

  const onClaimPrize = async () => {
    setIsClaiming(true);
    try {
      if (!cosmicGameContract) {
        notify('error', 'Please connect your wallet and ensure you are on the correct network.');
        return;
      }

      const estimate = await cosmicGameContract.estimateGas.claimMainPrize?.({});
      const gasLimit = estimate ? minGasWithBuffer(estimate) : GAS_FLOOR;

      await handleTx(
        (
          cosmicGameContract.write.claimMainPrize as unknown as (
            ...a: unknown[]
          ) => Promise<`0x${string}`>
        )({ gas: gasLimit }),
      );

      if (!cosmicSignatureContract) {
        notify('error', 'Unable to complete post-claim actions. Please refresh the page.');
        return;
      }
      const totalSupply = await cosmicSignatureContract.read.totalSupply?.();
      const tokenId = Number(totalSupply ?? 0) - 1;

      let count = (data?.NumRaffleNFTWinnersBidding ?? 0) + 3;
      if ((data?.MainStats?.StakeStatisticsRWalk?.TotalTokensStaked ?? 0) > 0) {
        count += data?.NumRaffleNFTWinnersStakingRWalk ?? 0;
      }

      await api.create(tokenId, count);
      router.push({
        pathname: '/prize-claimed',
        query: { round: data?.CurRoundNum, message: 'success' },
      });

      await withPostTxRefresh(1000, 3000);
    } catch (err: unknown) {
      if (isUserRejection(err)) {
        return;
      }
      notifyErrorFromEthers(err);
    } finally {
      setIsClaiming(false);
    }
  };

  // -----------------------------
  // Donation helpers
  // -----------------------------

  const withNftDonation = async (nftAddress: string, tokenId: number) => {
    if (!nftAddress || nftAddress.trim() === '' || Number.isNaN(tokenId)) {
      throw new Error('Missing NFT donation address or tokenId.');
    }
    if (!(await isContractAddress(nftAddress))) {
      notify('error', 'The address provided is not a valid contract address!');
      return false;
    }
    if (!(await isERC721(nftAddress))) {
      notify('error', 'The donate NFT contract is not an ERC721 token contract.');
      return false;
    }
    if (!(await ensureNftOwnership(nftAddress, tokenId))) return false;
    await ensureNftApprovalForAll(nftAddress);
    return true;
  };

  const withTokenDonation = async (tokenAddress: string, amountStr: string) => {
    if (!tokenAddress || !amountStr) {
      throw new Error('Missing token donation address or amount.');
    }
    if (!(await isContractAddress(tokenAddress))) {
      notify('error', 'The address provided is not a valid contract address!');
      return { ok: false as const };
    }

    try {
      const ts = await publicClient!.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      });
      if (!ts) throw new Error('Not an ERC20');
    } catch (err) {
      notify('error', 'The donate token contract is not an ERC20 token contract.');
      return { ok: false as const };
    }

    const decimals = await getErc20Decimals(tokenAddress);
    const amountWei = parseUnits(amountStr, decimals);
    const bal = (await publicClient!.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account as `0x${string}`],
    })) as bigint;

    if (bal < amountWei) {
      notify('error', 'Insufficient token balance for donation.');
      return { ok: false as const };
    }
    await ensureErc20Allowance(tokenAddress, amountWei);
    return { ok: true as const, amountWei, decimals };
  };

  // -----------------------------
  // Bids
  // -----------------------------

  const onBid = async () => {
    setIsBidding(true);
    try {
      // Check if contract is initialized
      if (!cosmicGameContract) {
        notify('error', 'Please connect your wallet and ensure you are on the correct network.');
        setIsBidding(false);
        return;
      }

      const ethBidPrice = await getNextEthBidPriceWithModifiers();

      // Ensure ETH balance if paying in ETH
      const enoughEth = await hasEthBalance(ethBidPrice);
      if (!enoughEth) {
        notify('error', "Insufficient ETH balance! There isn't enough ETH in your wallet.");
        setIsBidding(false);
        return;
      }

      // No donation path
      const noDonation =
        (donationType === 'NFT' && (!nftDonateAddress || !nftId)) ||
        (donationType === 'Token' && (!tokenDonateAddress || !tokenAmount));

      if (noDonation || !donationType) {
        await handleTx(
          (
            cosmicGameContract.write.bidWithEth as unknown as (
              ...a: unknown[]
            ) => Promise<`0x${string}`>
          )([rwlkId, message], { value: ethBidPrice, gas: BigInt(30_000_000) }),
        );
        await withPostTxRefresh();
        setIsBidding(false);
        return;
      }

      if (donationType === 'NFT') {
        const nftIdNum = Number(nftId);
        const ok = await withNftDonation(nftDonateAddress!, nftIdNum);
        if (!ok) {
          setIsBidding(false);
          return;
        }
        await handleTx(
          (
            cosmicGameContract.write.bidWithEthAndDonateNft as unknown as (
              ...a: unknown[]
            ) => Promise<`0x${string}`>
          )([rwlkId, message, nftDonateAddress, nftIdNum], { value: ethBidPrice }),
        );
        setNftId('');
        setNftDonateAddress('');
      } else {
        const res = await withTokenDonation(tokenDonateAddress!, tokenAmount!);
        if (!res.ok) {
          setIsBidding(false);
          return;
        }
        await handleTx(
          (
            cosmicGameContract.write.bidWithEthAndDonateToken as unknown as (
              ...a: unknown[]
            ) => Promise<`0x${string}`>
          )([rwlkId, message, tokenDonateAddress, res.amountWei], { value: ethBidPrice }),
        );
        setTokenAmount('');
        setTokenDonateAddress('');
      }

      await withPostTxRefresh();
    } catch (err: unknown) {
      if (!isUserRejection(err)) {
        notifyErrorFromEthers(err);
      }
    } finally {
      setIsBidding(false);
    }
  };

  const onBidWithCST = async () => {
    setIsBidding(true);
    try {
      // Check if contract is initialized
      if (!cosmicGameContract) {
        notify('error', 'Please connect your wallet and ensure you are on the correct network.');
        setIsBidding(false);
        return;
      }

      // CST balance check (if price provided)
      if (cstBidData?.CSTPrice > 0) {
        const cstWei = parseEther(cstBidData.CSTPrice.toString());
        const enoughCst = await hasCstBalance(cstWei);
        if (!enoughCst) {
          notify(
            'error',
            "Insufficient CST balance! There isn't enough Cosmic Token in your wallet.",
          );
          setIsBidding(false);
          return;
        }
      }

      const priceMaxLimit = await cosmicGameContract.read.getNextCstBidPrice?.();

      const noDonation =
        (donationType === 'NFT' && (!nftDonateAddress || !nftId)) ||
        (donationType === 'Token' && (!tokenDonateAddress || !tokenAmount));

      if (noDonation || !donationType) {
        await handleTx(cosmicGameContract.write.bidWithCst!([priceMaxLimit, message]));
        await withPostTxRefresh();
        setIsBidding(false);
        return;
      }

      if (donationType === 'NFT') {
        const nftIdNum = Number(nftId);
        const ok = await withNftDonation(nftDonateAddress!, nftIdNum);
        if (!ok) {
          setIsBidding(false);
          return;
        }
        await handleTx(
          cosmicGameContract.write.bidWithCstAndDonateNft!([
            priceMaxLimit,
            message,
            nftDonateAddress,
            nftIdNum,
          ]),
        );
        setNftId('');
        setNftDonateAddress('');
      } else {
        const res = await withTokenDonation(tokenDonateAddress!, tokenAmount!);
        if (!res.ok) {
          setIsBidding(false);
          return;
        }
        await handleTx(
          cosmicGameContract.write.bidWithCstAndDonateToken!([
            priceMaxLimit,
            message,
            tokenDonateAddress,
            res.amountWei,
          ]),
        );
        setTokenAmount('');
        setTokenDonateAddress('');
      }

      await withPostTxRefresh();
    } catch (err: unknown) {
      if (!isUserRejection(err)) {
        if (isEthProviderError(err) && err.data?.message) {
          notify('error', err.data.message);
        } else {
          notifyErrorFromEthers(err);
        }
      }
    } finally {
      setIsBidding(false);
    }
  };

  const playAudio = useCallback(async () => {
    try {
      const audioElement = new Audio('/audio/notification.wav');
      await audioElement.play();
    } catch (error) {
      reportError(error, 'play notification sound');
    }
  }, []);

  const getRwlkNFTIds = useCallback(async () => {
    try {
      if (nftRWLKContract && account) {
        const used_rwalk = await api.get_used_rwlk_nfts();
        const biddedRWLKIds = used_rwalk.map((x: UsedRWLKNFT) => x.RWalkTokenId);
        const tokens = (await nftRWLKContract.read.walletOfOwner?.([account])) as readonly bigint[];
        const nftIds = tokens
          .map((t) => Number(t))
          .filter((t: number) => !biddedRWLKIds.includes(t))
          .reverse();
        setRwlknftIds(nftIds);
      }
    } catch (e) {
      reportError(e, 'getRwlkNFTIds');
    }
  }, [nftRWLKContract, account]);

  const fetchData = useCallback(async () => {
    try {
      const newData = await api.get_dashboard_info();
      if (newData) {
        const round = newData.CurRoundNum;
        const [newBidData, nftData, championsData, ethDonations, donatedERC20Tokens] =
          await Promise.all([
            api.get_bid_list_by_round(round, 'desc'),
            api.get_donations_nft_by_round(round),
            (async () => {
              const bids = await api.get_bid_list_by_round(round, 'desc');
              const champions = getEnduranceChampions(bids);
              const sortedChampions = [...champions].sort(
                (a, b) => b.chronoWarrior - a.chronoWarrior,
              );
              return sortedChampions;
            })(),
            api.get_donations_cg_with_info_by_round(round),
            api.get_donations_erc20_by_round(round),
          ]);
        setCurBidList(newBidData);
        setDonatedNFTs(nftData as DonatedNFTType[]);
        setChampionList(championsData);
        setEthDonations(
          ethDonations as import('../components/tables/EthDonationTable').EthDonation[],
        );
        setDonatedERC20Tokens(
          donatedERC20Tokens as import('../components/donations/DonatedERC20Table').DonatedERC20Token[],
        );
      }
      setData((prevData: DashboardInfo | null) => {
        if (
          account !== newData?.LastBidderAddr &&
          prevData &&
          prevData.CurNumBids < (newData?.CurNumBids ?? 0)
        ) {
          playAudio();
        }
        return newData;
      });
      setLoading(false);
    } catch (err) {
      reportError(err, 'fetch home page data');
    }
  }, [account, playAudio]);

  const fetchPrizeTime = async () => {
    try {
      const t = await api.get_prize_time();
      const current = await api.get_current_time();
      const diff = current * 1000 - Date.now();
      setPrizeTime(t * 1000 - diff);
    } catch (err) {
      reportError(err, 'fetch prize time');
    }
  };

  const fetchClaimHistory = useCallback(async () => {
    try {
      const history = await api.get_claim_history();
      setClaimHistory(
        history as unknown as import('../components/tables/WinningHistoryTable').WinningHistoryEntry[],
      );
    } catch (err) {
      reportError(err, 'fetch claim history');
    }
  }, []);

  const fetchCSTBidData = useCallback(async () => {
    try {
      let ctData = await api.get_ct_price();
      if (ctData) {
        setCSTBidData({
          AuctionDuration: parseInt(ctData.AuctionDuration),
          CSTPrice: parseFloat(formatEther(BigInt(ctData.CSTPrice))),
          SecondsElapsed: parseInt(ctData.SecondsElapsed),
        });
      }
    } catch (err) {
      reportError(err, 'fetch CST bid data');
    }
  }, []);

  const fetchEthBidInfo = useCallback(async () => {
    try {
      const ethBidInfo = await api.get_bid_eth_price();
      if (ethBidInfo) {
        setEthBidInfo({
          AuctionDuration: parseInt(ethBidInfo.AuctionDuration),
          ETHPrice: parseFloat(formatEther(BigInt(ethBidInfo.ETHPrice))),
          SecondsElapsed: parseInt(ethBidInfo.SecondsElapsed),
        });
      }
    } catch (err) {
      reportError(err, 'fetch ETH bid info');
    }
  }, []);

  const fetchDataCollection = useCallback(async () => {
    await Promise.all([
      getRwlkNFTIds(),
      fetchData(),
      fetchClaimHistory(),
      fetchCSTBidData(),
      fetchEthBidInfo(),
    ]);
  }, [getRwlkNFTIds, fetchData, fetchClaimHistory, fetchCSTBidData, fetchEthBidInfo]);

  const requestNotificationPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
        }
      });
    }
  }, []);

  const sendNotification = (title: string, options: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  const fetchActivationTime = async () => {
    if (!cosmicGameContract) return;
    const activationTime = await cosmicGameContract.read.roundActivationTime?.();
    setActivationTime(Number(activationTime ?? 0) - offset / 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (prizeTime && now >= prizeTime - 5 * 60 * 1000 && now <= prizeTime) {
        sendNotification('Bid Now or Miss Out!', {
          body: 'Time is running out! You have 5 minutes to place your bids and win amazing prizes.',
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
        setBidType('RandomWalk');
      }
      if (router.query.donation) {
        setNftDonateAddress(ART_BLOCKS_ADDRESS);
        const tokenId = Array.isArray(router.query.tokenId)
          ? router.query.tokenId[0]
          : router.query.tokenId;
        setNftId(tokenId ?? '');
        setBidType('ETH');
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
  }, [
    router.isReady,
    router.query,
    requestNotificationPermission,
    fetchDataCollection,
    fetchEthBidInfo,
  ]);

  useEffect(() => {
    if (twitterHandle) {
      setMessage(`@${twitterHandle} referred by @${router.query.referred_by}.`);
    }
  }, [twitterHandle]);

  useEffect(() => {
    const fetchCSTInfo = async (bannerId: number) => {
      const res = await api.get_cst_info(bannerId);
      const fileName = `0x${res!.Seed}`;
      setBannerToken({ seed: fileName, id: bannerId });
    };
    if (data && bannerToken.seed === '') {
      if (data?.MainStats.NumCSTokenMints > 0) {
        let bannerId = Math.floor(Math.random() * data?.MainStats.NumCSTokenMints);
        fetchCSTInfo(bannerId);
      } else if (data?.MainStats.NumCSTokenMints === 0) {
        setBannerToken({ seed: 'sample', id: -1 });
      }
    }

    const interval = setInterval(async () => {
      await fetchPrizeTime();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data, offset, curBidList, bannerToken.seed]);

  useEffect(() => {
    const fetchTimeoutClaimPrize = async () => {
      if (!cosmicGameContract) return;
      const timeout = await cosmicGameContract.read.timeoutDurationToClaimMainPrize?.();
      setTimeoutClaimPrize(Number(timeout ?? 0));
    };

    if (cosmicGameContract) {
      fetchTimeoutClaimPrize();
      fetchActivationTime();
    }
  }, [cosmicGameContract, offset]);

  return (
    <>
      <MainWrapper>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={{ lg: 16, md: 8, sm: 8, xs: 4 }} mb={4}>
          <Grid size={{ sm: 12, md: 6 }}>
            <BiddingStatus
              data={data}
              loading={loading}
              activationTime={activationTime}
              curBidList={curBidList}
              ethBidInfo={ethBidInfo}
              prizeTime={prizeTime}
            />
            {!loading && activationTime < Date.now() / 1000 && account !== null && (
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
                  <FormControlLabel value="ETH" control={<Radio size="small" />} label="ETH" />
                  {data?.LastBidderAddr !== zeroAddress && (
                    <FormControlLabel
                      value="RandomWalk"
                      control={<Radio size="small" />}
                      label="RandomWalk"
                    />
                  )}
                  {data?.LastBidderAddr !== zeroAddress && (
                    <FormControlLabel
                      value="CST"
                      control={<Radio size="small" />}
                      label="CST(Cosmic Token)"
                    />
                  )}
                </RadioGroup>
                {bidType === 'ETH' && data?.LastBidderAddr === zeroAddress && (
                  <Box ml={2}>
                    {(ethBidInfo?.SecondsElapsed ?? 0) > (ethBidInfo?.AuctionDuration ?? 0) ? (
                      <Typography variant="subtitle1">Auction ended.</Typography>
                    ) : (
                      <Grid container spacing={2} mb={2} alignItems="center">
                        <Grid size={{ sm: 12, md: 5 }}>
                          <Typography variant="subtitle1">Elapsed Time:</Typography>
                        </Grid>
                        <Grid size={{ sm: 12, md: 7 }}>
                          <Typography>{formatSeconds(ethBidInfo?.SecondsElapsed ?? 0)}</Typography>
                        </Grid>
                      </Grid>
                    )}
                    <Grid container spacing={2} mb={2} alignItems="center">
                      <Grid size={{ sm: 12, md: 5 }}>
                        <Typography variant="subtitle1">Auction Duration:</Typography>
                      </Grid>
                      <Grid size={{ sm: 12, md: 7 }}>
                        <Typography>{formatSeconds(ethBidInfo?.AuctionDuration ?? 0)}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                {bidType === 'RandomWalk' && (
                  <Box mb={4} mx={2}>
                    <Typography variant="h6">Random Walk NFT Gallery</Typography>
                    <Typography variant="body2">
                      If you own some RandomWalkNFTs and one of them is used when bidding, you can
                      get a 50% discount!
                    </Typography>
                    <PaginationRWLKGrid
                      loading={false}
                      data={rwlknftIds}
                      selectedToken={rwlkId}
                      setSelectedToken={setRwlkId}
                    />
                  </Box>
                )}
                {bidType === 'CST' && (
                  <Box ml={2}>
                    {cstBidData?.SecondsElapsed > cstBidData?.AuctionDuration ? (
                      <Typography variant="subtitle1">
                        Auction ended, you can bid for free.
                      </Typography>
                    ) : (
                      <Grid container spacing={2} mb={2} alignItems="center">
                        <Grid size={{ sm: 12, md: 5 }}>
                          <Typography variant="subtitle1">Elapsed Time:</Typography>
                        </Grid>
                        <Grid size={{ sm: 12, md: 7 }}>
                          <Typography>{formatSeconds(cstBidData?.SecondsElapsed)}</Typography>
                        </Grid>
                      </Grid>
                    )}
                    <Grid container spacing={2} mb={2} alignItems="center">
                      <Grid size={{ sm: 12, md: 5 }}>
                        <Typography variant="subtitle1">Auction Duration:</Typography>
                      </Grid>
                      <Grid size={{ sm: 12, md: 7 }}>
                        <Typography>{formatSeconds(cstBidData?.AuctionDuration)}</Typography>
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
                  onChange={(_event, isExpanded) => setAdvancedExpanded(isExpanded)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Advanced Options</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      If you want to donate tokens or one of your NFTs while bidding, you can put
                      the contract address, NFT id, and comment here.
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
                      <FormControlLabel value="NFT" control={<Radio size="small" />} label="NFT" />
                      <FormControlLabel
                        value="Token"
                        control={<Radio size="small" />}
                        label="Token"
                      />
                    </RadioGroup>
                    {donationType === 'Token' && (
                      <>
                        <TextField
                          placeholder="Token Contract Address"
                          size="small"
                          value={tokenDonateAddress}
                          fullWidth
                          sx={{ marginTop: 1 }}
                          onChange={(e) => setTokenDonateAddress(e.target.value)}
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
                    {donationType === 'NFT' && (
                      <>
                        <TextField
                          placeholder="NFT contract address"
                          size="small"
                          value={nftDonateAddress}
                          fullWidth
                          sx={{ marginTop: 1 }}
                          onChange={(e) => setNftDonateAddress(e.target.value)}
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
                    {bidType !== 'CST' && (
                      <Box
                        sx={{
                          border: '1px solid #444',
                          borderRadius: 1,
                          p: 2,
                          mt: 2,
                        }}
                      >
                        <Typography variant="subtitle2">Bid price collision prevention</Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            marginTop: 2,
                            alignItems: 'center',
                          }}
                        >
                          <Typography whiteSpace="nowrap" color="rgba(255, 255, 255, 0.68)" mr={2}>
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
                              endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              inputProps: { min: 0, max: 50 },
                            }}
                            onChange={(e) => {
                              let value = Number(e.target.value);
                              if (value <= 50) {
                                setBidPricePlus(value);
                              }
                            }}
                          />
                          <Typography whiteSpace="nowrap" color="rgba(255, 255, 255, 0.68)" ml={2}>
                            {(
                              (ethBidInfo?.ETHPrice ?? 0) *
                              (1 + bidPricePlus / 100) *
                              (bidType === 'RandomWalk' ? 0.5 : 1)
                            ).toFixed(6)}{' '}
                            ETH
                          </Typography>
                        </Box>
                        <Typography variant="body2" mt={2}>
                          The bid price is bumped {bidPricePlus}% to prevent bidding collision.
                        </Typography>
                        <Typography variant="body2">
                          This percentage won&apos;t rise the bid price arbitrarily after your bid,
                          it is only meant for allowing both bid transactions to pass through in
                          case two simultaneous bids occur within the same block.
                        </Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </>
            )}
          </Grid>
          <Grid size={{ sm: 12, md: 6 }}>
            {(data?.CurRoundNum ?? 0) > 1 && (
              <Link href={`/prize/${(data?.CurRoundNum ?? 0) - 1}`} color="inherit">
                Round {(data?.CurRoundNum ?? 0) - 1} ended, check results here
              </Link>
            )}
            {matches && (
              <StyledCard sx={{ mt: 1 }}>
                <CardActionArea>
                  <Link
                    href={bannerToken.id >= 0 ? `/detail/${bannerToken.id}` : '/detail/sample'}
                    sx={{ display: 'block' }}
                  >
                    <NFTImage
                      src={
                        bannerToken.seed === ''
                          ? '/images/qmark.png'
                          : getAssetsUrl(`cosmicsignature/${bannerToken.seed}.png`)
                      }
                    />
                  </Link>
                </CardActionArea>
              </StyledCard>
            )}
            {data?.TsRoundStart !== 0 && <SpecialPrizeWinners />}
            {account !== null && activationTime < Date.now() / 1000 && (
              <>
                {(prizeTime > Date.now() || data?.LastBidderAddr !== account) && !loading && (
                  <Button
                    variant="outlined"
                    size="large"
                    endIcon={isBidding ? undefined : <ArrowForward />}
                    onClick={bidType === 'CST' ? onBidWithCST : onBid}
                    fullWidth
                    disabled={
                      isBidding || (bidType === 'RandomWalk' && rwlkId === -1) || bidType === ''
                    }
                    sx={{ mt: 3 }}
                  >
                    {isBidding ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={18} color="inherit" />
                        Processing...
                      </Box>
                    ) : (
                      `Bid now with ${bidType} ${
                        bidType === 'ETH'
                          ? `(${
                              (ethBidInfo?.ETHPrice ?? 0) * (1 + bidPricePlus / 100) > 0.1
                                ? ((ethBidInfo?.ETHPrice ?? 0) * (1 + bidPricePlus / 100)).toFixed(
                                    2,
                                  )
                                : ((ethBidInfo?.ETHPrice ?? 0) * (1 + bidPricePlus / 100)).toFixed(
                                    5,
                                  )
                            } ETH)`
                          : bidType === 'RandomWalk' && rwlkId !== -1
                            ? ` token ${rwlkId} (${
                                (ethBidInfo?.ETHPrice ?? 0) * (1 + bidPricePlus / 100) > 0.2
                                  ? (
                                      (ethBidInfo?.ETHPrice ?? 0) *
                                      (1 + bidPricePlus / 100) *
                                      0.5
                                    ).toFixed(2)
                                  : (
                                      (ethBidInfo?.ETHPrice ?? 0) *
                                      (1 + bidPricePlus / 100) *
                                      0.5
                                    ).toFixed(5)
                              } ETH)`
                            : bidType === 'CST'
                              ? cstBidData?.SecondsElapsed > cstBidData?.AuctionDuration
                                ? '(FREE BID)'
                                : `(${cstBidData?.CSTPrice.toFixed(2)} CST)`
                              : ''
                      }`
                    )}
                  </Button>
                )}
                {!(prizeTime > Date.now() || data?.LastBidderAddr === zeroAddress || loading) && (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={onClaimPrize}
                      fullWidth
                      disabled={
                        isClaiming ||
                        (data?.LastBidderAddr !== account &&
                          prizeTime + timeoutClaimPrize * 1000 > Date.now())
                      }
                      sx={{ mt: 3 }}
                    >
                      {isClaiming ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={18} color="inherit" />
                          Processing...
                        </Box>
                      ) : (
                        <>
                          Claim Prize
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {prizeTime + timeoutClaimPrize * 1000 > Date.now() &&
                              data?.LastBidderAddr !== account && (
                                <>
                                  &nbsp;available in &nbsp;
                                  <Countdown date={prizeTime + timeoutClaimPrize * 1000} />
                                </>
                              )}
                            &nbsp;
                            <ArrowForward sx={{ width: 22, height: 22 }} />
                          </Box>
                        </>
                      )}
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
            When you bid, you will get 100 Cosmic Tokens as a reward. These tokens allow you to
            participate in the DAO.
          </Typography>
          <Box mt={2}>
            <Typography variant="body2" color="primary" component="span">
              *
            </Typography>
            <Typography variant="body2" component="span">
              When you bid, you are also buying a raffle ticket. {data?.NumRaffleEthWinnersBidding}{' '}
              raffle tickets will be chosen and these people will win {data?.RafflePercentage}% of
              the pot. Also, {data?.NumRaffleNFTWinnersBidding} additional winners and{' '}
              {data?.NumRaffleNFTWinnersStakingRWalk} Random Walk NFT stakers will be chosen which
              will receive a Cosmic Signature NFT.
            </Typography>
          </Box>
          <Typography variant="body2" mt={2}>
            When this round ends, Ethereum Protocol Guild (
            <Link
              href="https://protocol-guild.readthedocs.io"
              target="_blank"
              sx={{ color: 'inherit' }}
            >
              https://protocol-guild.readthedocs.io
            </Link>
            ) will receive {data?.CharityPercentage ?? 0}% of the prize pool (at least{' '}
            {(
              (Number(data?.CosmicGameBalanceEth) || 0) *
              ((data?.CharityPercentage ?? 0) / 100)
            ).toFixed(4)}{' '}
            ETH).
          </Typography>
        </Box>
        <Box mt={6}>
          <Typography variant="subtitle1" color="primary" textAlign="center">
            Distribution of funds on each round
          </Typography>
          <ChartOrPie data={data ?? undefined} />
        </Box>

        {data && <Prize data={data as unknown as React.ComponentProps<typeof Prize>['data']} />}

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
          <ETHSpentTable list={curBidList as React.ComponentProps<typeof ETHSpentTable>['list']} />
        </Box>
        <Box mt={10}>
          <Typography variant="h6">ENDURANCE CHAMPIONS FOR CURRENT ROUND</Typography>
          <EnduranceChampionsTable championList={championList} />
        </Box>
        {ethDonations.length > 0 && (
          <Box mt={10}>
            <Typography variant="h6">ETH DONATIONS FOR CURRENT ROUND</Typography>
            <EthDonationTable list={ethDonations} showType={false} />
          </Box>
        )}
        <DonatedTokensSection
          donatedNFTs={donatedNFTs}
          donatedERC20Tokens={donatedERC20Tokens}
          donatedTokensTab={donatedTokensTab}
          onTabChange={handleTabChange}
          curPage={curPage}
          setCurPage={setCurrentPage}
          perPage={perPage}
        />
        <Box mt={10}>
          <Box>
            <Typography variant="h6" component="span">
              CURRENT ROUND BID HISTORY
            </Typography>
            <Typography variant="h6" component="span" color="primary" sx={{ ml: 1 }}>
              (ROUND {data?.CurRoundNum})
            </Typography>
          </Box>
          <BiddingHistory biddingHistory={curBidList} showRound={false} />
        </Box>
      </MainWrapper>

      <LatestNFTs />

      <WinningHistorySection
        claimHistory={claimHistory}
        imageOpen={imageOpen}
        setImageOpen={setImageOpen}
        bannerTokenSeed={bannerToken.seed}
        twitterPopupOpen={twitterPopupOpen}
        setTwitterPopupOpen={setTwitterPopupOpen}
        setTwitterHandle={setTwitterHandle}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  let prizeAmountStr = '';
  try {
    const { data } = await axios.get(cosmicGameBaseUrl + 'statistics/dashboard');
    const prize = data?.PrizeAmountEth ?? 0;
    prizeAmountStr = `${prize.toFixed(4)}ETH `;
  } catch {
    // Non-critical: fallback to empty string if API is unavailable
  }
  const description = `Cosmic Signature is a strategy bidding game. In an exhilarating contest, players will bid against other players and against time to win exciting ${prizeAmountStr}prizes and Cosmic Signature NFTs.`;
  return { props: createOpenGraphProps('Cosmic Signature', description) };
};

export default HomePage;
