import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePublicClient } from 'wagmi';
import { formatEther, isAddress, parseEther, type TransactionReceipt } from 'viem';

import { randomWalkNftAbi as NFT_ABI, cosmicTokenAbi as ERC20_ABI } from '@/contracts/abis';
import { cosmicGameAbi } from '@/contracts/abis';

import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { useActiveWeb3React } from '@/hooks/web3';
import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { ERC721_INTERFACE_ID } from '@/config/constants';
import { parseTokenAmount } from '@/components/tokens/transfer/amount';
import { classifyTxError } from '@/lib/txErrors';
import { isTransientNetworkError, reportError, reportErrorThrottled } from '@/utils/errors';
import { getContractErrorDescriptor } from '@/utils/contractErrors';
import { formatAmount } from '@/utils/format/numbers';
import {
  type CosmicGameGestureFunctionName,
  pickGestureWriteAbi,
  readCosmicGameWithFallback,
  withGestureArgsV1ThenV2,
} from '@/utils/cosmicGameContractCompat';
import { useNotify } from '@/hooks/useNotify';
import {
  useTxFlow,
  type TxApprovalStep,
  type TxContext,
  type TxWriteRequest,
} from '@/hooks/useTxFlow';
import { useCTPrice, useGestureEthCost, useUsedRWLKNFTs } from '@/hooks/useApiQuery';
import { mapCTPriceInfo, type CstAuctionDurations, type CstGestureData } from '@/utils/cstGesture';
import { REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';
import { sumImprintedTo } from '@/lib/receiptTransfers';
import { clampCollisionBufferPercent } from '@/utils/gestureQuote';
import { sameAddress } from '@/utils/format/addresses';
import { useUxScenarioSnapshot } from '@/lib/uxCycleScenarios';
import {
  GESTURE_MESSAGE_MAX_BYTES,
  fitGestureMessage,
  gestureMessageBytes,
  isUsableRandomWalkToken,
} from '@/components/home/gestureInput';

export type { CstGestureData } from '@/utils/cstGesture';
export type CSTGestureData = CstGestureData;

/** An asset that passed validation and will ride along with the gesture. */
type PreparedAttachment =
  | { kind: 'nft'; address: string; tokenId: bigint }
  | { kind: 'token'; address: string; amountWei: bigint };

/**
 * A typed NFT token id as an exact uint256: digits only, kept as a bigint so
 * hash-sized ids (an ENS name's) survive. Null for anything else.
 */
export function parseNftTokenId(text: string): bigint | null {
  const trimmed = text.trim();
  if (!/^\d{1,78}$/.test(trimmed)) return null;
  const id = BigInt(trimmed);
  return id < 2n ** 256n ? id : null;
}

/** Gas headroom on an ETH gesture's estimate: the cost of a gesture moves with the cycle's state. */
const GESTURE_GAS_HEADROOM = 2n;

export interface EthGestureInfo {
  AuctionDuration: number;
  ETHPrice: number;
  /**
   * The same price in wei, exact, for amounts that must match the wallet
   * (the funding check before submit). Absent on hand-built quotes.
   */
  ETHPriceWei?: bigint;
  SecondsElapsed: number;
}

const CST_REWARD_PREVIEW_REFRESH_MS = 1_000;

interface LiveCstPreviewTestGlobals {
  expect?: unknown;
  __COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__?: boolean;
  __COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__?: number;
}

function shouldScheduleLiveCstPreviewTimer(): boolean {
  const testGlobals = globalThis as LiveCstPreviewTestGlobals;
  const isJest = typeof testGlobals.expect === 'function';
  return !isJest || testGlobals.__COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__ === true;
}

function getLiveCstPreviewRefreshMs(): number {
  const testInterval = (globalThis as LiveCstPreviewTestGlobals)
    .__COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__;
  if (typeof testInterval === 'number' && Number.isFinite(testInterval) && testInterval > 0) {
    return testInterval;
  }
  return CST_REWARD_PREVIEW_REFRESH_MS;
}

/** Where the list of the wallet's unused Random Walk NFTs stands. */
export type RwlkListStatus = 'no-wallet' | 'loading' | 'ready' | 'error';

export interface UseGestureFormOptions {
  /**
   * The cycle has no Gesture yet. Its first Gesture is made with ETH (the
   * contract rejects a CST or Random Walk first Gesture), so the form holds
   * ETH whatever was chosen before, for example CST in the previous cycle.
   */
  firstGesture?: boolean;
}

export function useGestureForm({ firstGesture = false }: UseGestureFormOptions = {}) {
  const t = useTranslations('toasts');
  const locale = useLocale();
  const contractAddrs = useContractAddresses();
  const { account } = useActiveWeb3React();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const cosmicGameContract = useCosmicGameContract();
  const nftRWLKContract = useRWLKNFTContract();
  const { notify, notifyErrorFromEthers } = useNotify();
  const tx = useTxFlow();
  const uxScenario = useUxScenarioSnapshot();
  // The hash of the last confirmed Gesture, read right after a submit resolves
  // (a ref, so the caller's closure sees it without waiting for a render).
  const lastGestureHashRef = useRef<`0x${string}` | null>(null);
  const getLastGestureHash = useCallback(() => lastGestureHashRef.current, []);

  const { data: ctPriceData } = useCTPrice();
  const { data: bidEthPriceData } = useGestureEthCost();
  const { data: usedRWLKData } = useUsedRWLKNFTs();

  const [gestureType, setBidType] = useState('ETH');
  // No attachment until the person picks one: opening Advanced to change
  // another setting must not present empty NFT fields as the default.
  const [contributionType, setContributionType] = useState('');
  const [message, setMessageState] = useState('');
  // The contract's live cap, in UTF-8 bytes; the documented default until read.
  const [messageMaxBytes, setMessageMaxBytes] = useState<number>(GESTURE_MESSAGE_MAX_BYTES);
  const [nftDonateAddress, setNftDonateAddress] = useState('');
  const [nftId, setNftId] = useState('');
  const [tokenDonateAddress, setTokenDonateAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [rwlkId, setRwlkIdState] = useState(-1);
  // A token the form let go because it is not one of this wallet's unused
  // Random Walk NFTs (a deep link, another wallet's pick): said once, in the picker.
  const [rwlkRejectedId, setRwlkRejectedId] = useState<number | null>(null);
  const [gestureCostPlus, setBidPricePlus] = useState(2);
  const [isGesturing, setIsBidding] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [rwlknftIds, setRwlknftIds] = useState<number[]>([]);
  // Which wallet the list above was read for, and whether that read failed.
  const [rwlkListSettled, setRwlkListSettled] = useState<{
    account: string;
    failed: boolean;
  } | null>(null);
  const [contractCstDurations, setContractCstDurations] = useState<CstAuctionDurations | null>(
    null,
  );
  const [contractCstPriceWei, setContractCstPriceWei] = useState<bigint | null>(null);
  const [gestureCstRewardAmountWei, setGestureCstRewardAmountWei] = useState<bigint | null>(null);
  const [isCstRewardLoading, setIsCstRewardLoading] = useState(false);
  // The last read of the Participation CST preview failed. The preview keeps
  // polling, so this clears on the next successful read; the form shows
  // "Unavailable" instead of a skeleton that would pulse forever.
  const [cstRewardReadFailed, setCstRewardReadFailed] = useState(false);
  const [cstRewardTolerancePercent, setCstRewardTolerancePercent] = useState(1);
  const [acceptAnyCstReward, setAcceptAnyCstReward] = useState(false);

  /** The wallet's unused Random Walk NFTs: not read without a wallet, then loading, ready or failed. */
  const rwlkListStatus: RwlkListStatus = !account
    ? 'no-wallet'
    : rwlkListSettled?.account !== account
      ? 'loading'
      : rwlkListSettled.failed
        ? 'error'
        : 'ready';

  // Keep the chosen method and token valid for the phase and the wallet, in
  // one place for every surface that renders this form. Adjusted during
  // render, so no surface ever paints (or submits) the invalid combination.
  if (firstGesture && (gestureType !== 'ETH' || rwlkId !== -1)) {
    setBidType('ETH');
    setRwlkIdState(-1);
  }
  if (
    rwlkId !== -1 &&
    rwlkListStatus === 'ready' &&
    !isUsableRandomWalkToken(rwlkId, rwlkListStatus, rwlknftIds)
  ) {
    setRwlkIdState(-1);
    setRwlkRejectedId(rwlkId);
  }

  /** Picks a Random Walk NFT (or none, with -1); a new pick clears the rejected-link note. */
  const setRwlkId = useCallback((value: number) => {
    setRwlkIdState(value);
    setRwlkRejectedId(null);
  }, []);

  /** Sets the message, cut at the contract's byte cap after the last whole character. */
  const setMessage = useCallback(
    (value: string) => setMessageState(fitGestureMessage(value, messageMaxBytes)),
    [messageMaxBytes],
  );

  // The owner can change the message cap; read the live one once per contract.
  useEffect(() => {
    if (!cosmicGameContract || uxScenario) return undefined;
    let cancelled = false;
    (
      (cosmicGameContract.read.bidMessageLengthMaxLimit?.() as Promise<bigint | undefined>) ??
      Promise.resolve(undefined)
    )
      .then((value) => {
        if (cancelled || typeof value !== 'bigint' || value <= 0n) return;
        if (value > BigInt(Number.MAX_SAFE_INTEGER)) return;
        setMessageMaxBytes(Number(value));
      })
      .catch((e) => {
        if (!cancelled) reportErrorThrottled(e, 'bidMessageLengthMaxLimit');
      });
    return () => {
      cancelled = true;
    };
  }, [cosmicGameContract, uxScenario]);

  const cstGestureData = useMemo<CSTGestureData>(() => {
    return mapCTPriceInfo(ctPriceData, contractCstDurations, contractCstPriceWei);
  }, [contractCstDurations, contractCstPriceWei, ctPriceData]);

  const ethGestureInfo = useMemo<EthGestureInfo | null>(() => {
    if (!bidEthPriceData) return null;
    const priceWei = BigInt(bidEthPriceData.ETHPrice);
    return {
      AuctionDuration: parseInt(bidEthPriceData.AuctionDuration),
      ETHPrice: parseFloat(formatEther(priceWei)),
      ETHPriceWei: priceWei,
      SecondsElapsed: parseInt(bidEthPriceData.SecondsElapsed),
    };
  }, [bidEthPriceData]);

  const gestureCstRewardAmount = useMemo(() => {
    if (gestureCstRewardAmountWei == null) return null;
    const value = Number(formatEther(gestureCstRewardAmountWei));
    return Number.isFinite(value) ? value : null;
  }, [gestureCstRewardAmountWei]);

  const cstRewardToleranceBps = useMemo(() => {
    const clamped = Math.min(100, Math.max(0, cstRewardTolerancePercent));
    return Math.round(clamped * 100);
  }, [cstRewardTolerancePercent]);

  const gestureCstRewardAmountMinLimitWei = useMemo(() => {
    if (acceptAnyCstReward) return 0n;
    if (!gestureCstRewardAmountWei || gestureCstRewardAmountWei <= 0n) return 0n;
    return (gestureCstRewardAmountWei * BigInt(10_000 - cstRewardToleranceBps)) / 10_000n;
  }, [acceptAnyCstReward, gestureCstRewardAmountWei, cstRewardToleranceBps]);

  const gestureCstRewardAmountMin = useMemo(() => {
    const value = Number(formatEther(gestureCstRewardAmountMinLimitWei));
    return Number.isFinite(value) ? value : 0;
  }, [gestureCstRewardAmountMinLimitWei]);

  useEffect(() => {
    if (uxScenario) {
      setContractCstDurations(null);
      setContractCstPriceWei(null);
      setGestureCstRewardAmountWei(100n * 10n ** 18n);
      setIsCstRewardLoading(false);
      setCstRewardReadFailed(false);
      return;
    }

    const canReadDurations = !!publicClient && !!contractAddrs.cosmicGame;
    const canReadReward = !!cosmicGameContract;
    const canReadPrice = !!cosmicGameContract;

    if (!canReadDurations) {
      setContractCstDurations(null);
    }
    if (!canReadPrice) {
      setContractCstPriceWei(null);
    }
    if (!canReadReward) {
      setGestureCstRewardAmountWei(null);
      setIsCstRewardLoading(false);
    }
    if (!canReadDurations && !canReadReward && !canReadPrice) {
      return;
    }

    let cancelled = false;
    let inFlight = false;
    let timeoutId: number | null = null;

    // The preview refresh polls continuously, so a transport failure (dev
    // server restart, network blip, machine waking from sleep) would emit one
    // console dump + Sentry event per read per retry. Those failures recover
    // on the next poll; report them at most once per throttle window and keep
    // the last known preview values instead of blanking the form.
    const reportPreviewError = (error: unknown, context: string) => {
      if (isTransientNetworkError(error)) {
        reportErrorThrottled(error, context);
      } else {
        reportError(error, context);
      }
    };

    const refreshLiveCstPreview = async (showLoading = false) => {
      if (cancelled || inFlight) return;
      inFlight = true;
      if (showLoading && canReadReward) setIsCstRewardLoading(true);

      try {
        await Promise.all([
          canReadDurations
            ? publicClient!
                .readContract({
                  address: contractAddrs.cosmicGame as `0x${string}`,
                  abi: cosmicGameAbi,
                  functionName: 'getCstDutchAuctionDurations',
                })
                .then((value) => {
                  if (cancelled || !Array.isArray(value)) return;
                  const [auctionDuration, secondsElapsed] = value;
                  if (typeof auctionDuration !== 'bigint' || typeof secondsElapsed !== 'bigint') {
                    return;
                  }
                  const next = {
                    AuctionDuration: Number(auctionDuration),
                    SecondsElapsed: Number(secondsElapsed),
                    updatedAtMs: Date.now(),
                  };
                  setContractCstDurations((current) => {
                    if (
                      current?.AuctionDuration === next.AuctionDuration &&
                      current?.SecondsElapsed === next.SecondsElapsed
                    ) {
                      return { ...current, updatedAtMs: next.updatedAtMs };
                    }
                    return next;
                  });
                })
                .catch((e) => {
                  if (!cancelled) reportPreviewError(e, 'getCstDutchAuctionDurations');
                })
            : Promise.resolve(),
          canReadPrice
            ? (
                (cosmicGameContract!.read.getNextCstBidPrice?.() as Promise<bigint | undefined>) ??
                Promise.resolve(undefined)
              )
                .then((value) => {
                  if (!cancelled) setContractCstPriceWei(value ?? null);
                })
                .catch((e) => {
                  if (!cancelled) {
                    if (!isTransientNetworkError(e)) setContractCstPriceWei(null);
                    reportPreviewError(e, 'getNextCstBidPrice');
                  }
                })
            : Promise.resolve(),
          canReadReward
            ? readCosmicGameWithFallback<bigint>([
                () =>
                  cosmicGameContract!.read.getBidCstRewardAmount?.() as Promise<bigint | undefined>,
                () =>
                  cosmicGameContract!.read.getBidCstRewardAmountAdvanced?.([0n]) as Promise<
                    bigint | undefined
                  >,
              ])
                .then((value) => {
                  if (cancelled) return;
                  setGestureCstRewardAmountWei(value ?? null);
                  setCstRewardReadFailed(value == null);
                })
                .catch((e) => {
                  if (!cancelled) {
                    if (!isTransientNetworkError(e)) setGestureCstRewardAmountWei(null);
                    setCstRewardReadFailed(true);
                    reportPreviewError(e, 'getBidCstRewardAmount');
                  }
                })
            : Promise.resolve(),
        ]);
      } finally {
        inFlight = false;
        if (!cancelled && showLoading) setIsCstRewardLoading(false);
      }
    };

    const scheduleNextRefresh = () => {
      if (cancelled) return;
      timeoutId = window.setTimeout(() => {
        void refreshLiveCstPreview().finally(scheduleNextRefresh);
      }, getLiveCstPreviewRefreshMs());
    };

    const scheduleLiveTimer = shouldScheduleLiveCstPreviewTimer();
    if (scheduleLiveTimer) {
      void refreshLiveCstPreview(true).finally(scheduleNextRefresh);
    } else {
      void refreshLiveCstPreview(true);
    }
    const handleGesturePlaced = () => {
      void refreshLiveCstPreview();
    };
    window.addEventListener('cosmic:gesture-placed', handleGesturePlaced);

    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      window.removeEventListener('cosmic:gesture-placed', handleGesturePlaced);
    };
  }, [contractAddrs.cosmicGame, cosmicGameContract, publicClient, uxScenario]);

  // Amounts in validation and success messages follow the one precision
  // policy the form itself uses (`exact`: up to six places, the locale's
  // separators, no padded zeros). The catalogs print the unit themselves.
  const formatWei = (wei: bigint, unit: 'ETH' | 'CST') =>
    formatAmount(wei, { unit, locale, context: 'exact', withUnit: false });

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
        args: [ERC721_INTERFACE_ID],
      });
    } catch {
      return false;
    }
  };

  const ensureNftOwnership = async (nftAddress: string, tokenId: bigint) => {
    try {
      const owner = (await publicClient!.readContract({
        address: nftAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'ownerOf',
        args: [tokenId],
      })) as string;
      if (owner?.toLowerCase() !== account?.toLowerCase()) {
        notify('error', t('gesture.validation.notNftOwner'));
        return false;
      }
      return true;
    } catch (err) {
      notifyErrorFromEthers(err);
      return false;
    }
  };

  /**
   * Whether the Allocations wallet may already move this one NFT: approved for
   * the token itself, or (from an earlier, wider grant) for the collection.
   */
  const isNftApprovedForGesture = async (nftAddress: string, tokenId: bigint) => {
    const operator = (contractAddrs.prizesWallet as string).toLowerCase();
    const [approved, approvedForAll] = await Promise.all([
      publicClient!
        .readContract({
          address: nftAddress as `0x${string}`,
          abi: NFT_ABI,
          functionName: 'getApproved',
          args: [tokenId],
        })
        .catch(() => null),
      publicClient!
        .readContract({
          address: nftAddress as `0x${string}`,
          abi: NFT_ABI,
          functionName: 'isApprovedForAll',
          args: [account as `0x${string}`, contractAddrs.prizesWallet as `0x${string}`],
        })
        .catch(() => false),
    ]);
    return (
      approvedForAll === true ||
      (typeof approved === 'string' && approved.toLowerCase() === operator)
    );
  };

  /** Exact, per-token approval — never operator rights over the whole collection. */
  const approveNftForGesture = async (ctx: TxContext, nftAddress: string, tokenId: bigint) => {
    const feeParams = await getFeeParams();
    return ctx.writeContract({
      address: nftAddress as `0x${string}`,
      abi: NFT_ABI,
      functionName: 'approve',
      args: [contractAddrs.prizesWallet as `0x${string}`, tokenId],
      account: ctx.account,
      ...feeParams,
    });
  };

  const readErc20Allowance = async (tokenAddress: string) =>
    (await publicClient!.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [account as `0x${string}`, contractAddrs.prizesWallet as `0x${string}`],
    })) as bigint;

  /** Exactly the attached amount — never an unlimited allowance. */
  const approveErc20Exactly = async (ctx: TxContext, tokenAddress: string, amountWei: bigint) => {
    const feeParams = await getFeeParams();
    return ctx.writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [contractAddrs.prizesWallet as `0x${string}`, amountWei],
      account: ctx.account,
      ...feeParams,
    });
  };

  const getErc20Decimals = async (tokenAddress: string) => {
    try {
      return (await publicClient!.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      })) as number;
    } catch {
      notify('warning', t('gesture.validation.tokenDecimalsWarning'));
      return 18;
    }
  };

  /** Wallet ETH on the app chain, or null when it cannot be read (the wallet then decides). */
  const readEthBalance = async (): Promise<bigint | null> => {
    try {
      return await publicClient!.getBalance({ address: account as `0x${string}` });
    } catch (e) {
      reportError(e, 'check ETH balance');
      return null;
    }
  };

  /**
   * Wallet CST, read on-chain (`balanceOf`), or null when it cannot be read.
   * Never the indexer: it lags by seconds to minutes, so right after CST
   * arrives (the Participation CST the last gesture imprinted) it would
   * refuse a gesture the wallet can pay for. On a failed read the check is
   * skipped and the simulation, then the contract, decides.
   */
  const readCstBalance = async (): Promise<bigint | null> => {
    if (!isAddress(contractAddrs.cosmicToken)) return null;
    try {
      return (await publicClient!.readContract({
        address: contractAddrs.cosmicToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account as `0x${string}`],
      })) as bigint;
    } catch (e) {
      reportError(e, 'check CST balance');
      return null;
    }
  };

  /**
   * The least Participation CST this gesture accepts (V2 entry points), from
   * the person's tolerance: 0 with "accept any". Uses the live preview, or a
   * fresh read when the preview has not arrived or failed, so a missing
   * preview never silently drops the protection. Null when no reward can be
   * read at all: the gesture then stops and says why.
   */
  const resolveCstRewardFloor = async (): Promise<bigint | null> => {
    if (acceptAnyCstReward) return 0n;
    let reward = gestureCstRewardAmountWei;
    if (reward == null) {
      try {
        reward =
          (await readCosmicGameWithFallback<bigint>([
            () => cosmicGameContract!.read.getBidCstRewardAmount?.() as Promise<bigint | undefined>,
            () =>
              cosmicGameContract!.read.getBidCstRewardAmountAdvanced?.([0n]) as Promise<
                bigint | undefined
              >,
          ])) ?? null;
      } catch (e) {
        reportError(e, 'gesture CST reward floor');
        reward = null;
      }
    }
    if (reward == null) return null;
    if (reward <= 0n) return 0n;
    return (reward * BigInt(10_000 - cstRewardToleranceBps)) / 10_000n;
  };

  const getNextEthGestureCostWithModifiers = async () => {
    const base = (await cosmicGameContract!.read.getNextEthBidPrice?.()) as bigint;
    // A negative or non-numeric buffer would underpay (and revert) or make parseEther throw.
    const buffer = clampCollisionBufferPercent(gestureCostPlus);
    let price = (base * parseEther((100 + buffer).toString())) / parseEther('100');
    if (gestureType === 'RandomWalk') {
      price = (price * parseEther('50')) / parseEther('100');
    }
    return price;
  };

  /**
   * The message fits the contract's byte cap. Past it the Gesture would
   * revert with TooLongBidMessage after the wallet prompt (and, for a plain
   * ETH Gesture sent with a fixed gas limit, still cost the network fee).
   */
  const ensureMessageFits = () => {
    if (gestureMessageBytes(message) <= messageMaxBytes) return true;
    notify('error', t('gesture.contractErrors.tooLongBidMessage'));
    return false;
  };

  /**
   * The Random Walk NFT still belongs to this wallet and was never used for
   * a Gesture, read from the chain right before the wallet prompt: a token
   * transferred or used since the list was read would otherwise revert with
   * CallerIsNotNftOwner or UsedRandomWalkNft. A refusal names its cause:
   * another owner, a used token, or, when no token is chosen or the chain
   * cannot be read and the wallet's list does not confirm the token, a
   * request to choose one of the wallet's unused NFTs.
   */
  const ensureRandomWalkTokenUsable = async (tokenId: number): Promise<boolean> => {
    if (tokenId < 0) {
      notify('error', t('gesture.validation.chooseRandomWalkNft'));
      return false;
    }
    const [owner, used] = await Promise.all([
      publicClient
        ?.readContract({
          address: contractAddrs.randomWalkNft as `0x${string}`,
          abi: NFT_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        })
        .catch((e) => {
          reportError(e, 'check Random Walk NFT owner');
          return null;
        }),
      publicClient
        ?.readContract({
          address: contractAddrs.cosmicGame as `0x${string}`,
          abi: cosmicGameAbi,
          functionName: 'usedRandomWalkNfts',
          args: [BigInt(tokenId)],
        })
        .catch((e) => {
          reportError(e, 'check Random Walk NFT use');
          return null;
        }),
    ]);
    if (typeof owner === 'string' && !sameAddress(owner, account)) {
      notify('error', t('gesture.contractErrors.callerIsNotNftOwner'));
      return false;
    }
    if (typeof used === 'bigint' && used !== 0n) {
      notify('error', t('gesture.contractErrors.usedRandomWalkNft'));
      return false;
    }
    // Both reads answered: the chain has the last word. Otherwise the list
    // read for this wallet must vouch for the token, and a read that fails
    // for a listed token leaves the decision to the contract.
    if (typeof owner === 'string' && typeof used === 'bigint') return true;
    if (!isUsableRandomWalkToken(tokenId, rwlkListStatus, rwlknftIds)) {
      notify('error', t('gesture.validation.chooseRandomWalkNft'));
      return false;
    }
    return true;
  };

  /**
   * Validates the attachment the form describes and returns what to attach,
   * `null` for none, or `false` (after telling the person why) when the
   * gesture must not be sent.
   */
  const prepareAttachment = async (): Promise<PreparedAttachment | null | false> => {
    if (contributionType === 'NFT' && nftDonateAddress && nftId) {
      const tokenId = parseNftTokenId(nftId);
      if (tokenId === null) {
        notify('error', t('gesture.validation.invalidNftId'));
        return false;
      }
      if (!(await isContractAddress(nftDonateAddress))) {
        notify('error', t('gesture.validation.invalidContractAddress'));
        return false;
      }
      if (!(await isERC721(nftDonateAddress))) {
        notify('error', t('gesture.validation.notErc721'));
        return false;
      }
      if (!(await ensureNftOwnership(nftDonateAddress, tokenId))) return false;
      return { kind: 'nft', address: nftDonateAddress, tokenId };
    }

    if (contributionType === 'Token' && tokenDonateAddress && tokenAmount) {
      if (!(await isContractAddress(tokenDonateAddress))) {
        notify('error', t('gesture.validation.invalidContractAddress'));
        return false;
      }
      try {
        const totalSupply = await publicClient!.readContract({
          address: tokenDonateAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'totalSupply',
        });
        if (!totalSupply) throw new Error('Not an ERC20');
      } catch {
        notify('error', t('gesture.validation.notErc20'));
        return false;
      }
      const decimals = await getErc20Decimals(tokenDonateAddress);
      // Digits and one decimal point only: no sign, no exponent, no more
      // fraction digits than the token has, never zero.
      const { wei: amountWei, error: amountError } = parseTokenAmount(tokenAmount, { decimals });
      if (amountError || amountWei === null) {
        notify('error', t('gesture.validation.invalidTokenAmount'));
        return false;
      }
      const balance = (await publicClient!.readContract({
        address: tokenDonateAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account as `0x${string}`],
      })) as bigint;
      if (balance < amountWei) {
        notify('error', t('gesture.validation.insufficientAttachedToken'));
        return false;
      }
      return { kind: 'token', address: tokenDonateAddress, amountWei };
    }

    return null;
  };

  /**
   * The approval step for the prepared attachment (exact amount or the one
   * NFT), shown as "Approve 1 of 2" with a sentence on why the wallet asks.
   * Evaluated after `prepare`, so it reads the attachment that passed
   * validation.
   */
  const attachmentApprovals = (
    getAttachment: () => PreparedAttachment | null,
  ): TxApprovalStep[] => [
    {
      description:
        contributionType === 'NFT'
          ? t('gesture.approval.nft', { tokenId: nftId })
          : t('gesture.approval.token', { amount: tokenAmount }),
      isNeeded: async () => {
        const attachment = getAttachment();
        if (!attachment) return false;
        if (attachment.kind === 'nft') {
          return !(await isNftApprovedForGesture(attachment.address, attachment.tokenId));
        }
        return (await readErc20Allowance(attachment.address)) < attachment.amountWei;
      },
      write: async (ctx) => {
        const attachment = getAttachment();
        if (!attachment) throw new Error('No attachment to approve.');
        return attachment.kind === 'nft'
          ? approveNftForGesture(ctx, attachment.address, attachment.tokenId)
          : approveErc20Exactly(ctx, attachment.address, attachment.amountWei);
      },
    },
  ];

  const clearAttachment = (attachment: PreparedAttachment | null) => {
    if (attachment?.kind === 'nft') {
      setNftId('');
      setNftDonateAddress('');
    } else if (attachment?.kind === 'token') {
      setTokenAmount('');
      setTokenDonateAddress('');
    }
  };

  /** "Gesture recorded…", with the Participation CST the receipt shows was imprinted. */
  const gestureSuccessMessage = (receipt: TransactionReceipt) => {
    const imprinted = sumImprintedTo(receipt.logs, contractAddrs.cosmicToken, account);
    if (imprinted <= 0n) return t('gesture.confirmed');
    return t('gesture.confirmedWithCst', { cst: formatWei(imprinted, 'CST') });
  };

  /**
   * A gas limit for an ETH gesture: the node's estimate with headroom, since
   * the gesture's cost depends on the cycle's state when it lands. A revert
   * is thrown (the contract would reject the gesture: nothing is sent, and
   * the decoded error explains why). When the estimate cannot run at all,
   * no limit is set and the wallet estimates.
   */
  const estimateGestureGas = async (
    fnName: CosmicGameGestureFunctionName,
    args: readonly unknown[],
    value: bigint,
    cstRewardFloor: bigint,
  ): Promise<bigint | undefined> => {
    const estimate = async (callArgs: readonly unknown[]) =>
      publicClient!.estimateContractGas({
        address: contractAddrs.cosmicGame as `0x${string}`,
        abi: pickGestureWriteAbi(fnName, callArgs),
        functionName: fnName,
        args: callArgs as unknown[],
        value,
        account: account as `0x${string}`,
      });

    try {
      return (
        (await withGestureArgsV1ThenV2(fnName, args, estimate, {
          cstRewardAmountMinLimit: cstRewardFloor,
        })) * GESTURE_GAS_HEADROOM
      );
    } catch (err) {
      const { kind } = classifyTxError(err);
      if (kind === 'would-revert' || kind === 'insufficient-funds') throw err;
      reportErrorThrottled(err, 'gesture-gas-estimate');
      return undefined;
    }
  };

  /**
   * EIP-1559 fees with floor from current block to avoid "max fee per gas less than block base fee".
   * Uses latest block baseFee * 2 as min to handle block progression and wallet re-estimation.
   */
  const getFeeParams = async (): Promise<{
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
  }> => {
    if (!publicClient) return {};
    try {
      const [block, fees] = await Promise.all([
        publicClient.getBlock({ blockTag: 'latest' }),
        publicClient.estimateFeesPerGas({ chain: activeChain }),
      ]);
      const baseFee = block?.baseFeePerGas ?? 0n;
      const minFromBase = baseFee ? (baseFee * 200n) / 100n : 0n;
      const fromEstimate =
        fees?.maxFeePerGas && fees?.maxPriorityFeePerGas ? (fees.maxFeePerGas * 125n) / 100n : 0n;
      const maxFeePerGas = fromEstimate > minFromBase ? fromEstimate : minFromBase;
      const maxPriorityFeePerGas = fees?.maxPriorityFeePerGas ?? 1_000_000_000n;
      if (maxFeePerGas > 0n) {
        return { maxFeePerGas, maxPriorityFeePerGas };
      }
    } catch {
      /* fallback: no fee override, wallet will supply */
    }
    return {};
  };

  /**
   * Sends the gesture through the flow's `ctx.writeContract` (target check,
   * simulation, then the wallet), trying the V2 argument shape first.
   */
  const writeGesture = async (
    ctx: TxContext,
    functionName: CosmicGameGestureFunctionName,
    args: readonly unknown[],
    options: { cstRewardFloor: bigint; value?: bigint; gas?: bigint },
  ) => {
    const feeParams = await getFeeParams();
    return withGestureArgsV1ThenV2(
      functionName,
      args,
      async (callArgs) =>
        // The ABI slice is chosen at run time (V1 or V2 shape), so viem cannot
        // infer that the function is payable and types `value` as undefined.
        ctx.writeContract({
          address: contractAddrs.cosmicGame as `0x${string}`,
          abi: pickGestureWriteAbi(functionName, callArgs),
          functionName,
          args: callArgs as unknown[],
          account: ctx.account,
          ...feeParams,
          ...(options.value !== undefined ? { value: options.value } : {}),
          ...(options.gas !== undefined ? { gas: options.gas } : {}),
        } as unknown as TxWriteRequest),
      { cstRewardAmountMinLimit: options.cstRewardFloor },
    );
  };

  /** Stops a gesture whose Participation CST floor cannot be read, and says why. */
  const cstRewardFloorOrStop = async (): Promise<bigint | null> => {
    const floor = await resolveCstRewardFloor();
    if (floor === null) notify('error', t('gesture.validation.cstRewardUnavailable'));
    return floor;
  };

  /**
   * Submit an ETH gesture (with an optional attached NFT or token).
   * Runs through `useTxFlow`: chain guard, pre-flight checks, the exact
   * approval as step 1 of 2 when an asset is attached, and one lifecycle
   * toast. Returns `true` once confirmed so the caller can refresh.
   */
  const onGesture = async (): Promise<boolean> => {
    if (!account) {
      notify('error', t('wallet.connect'));
      return false;
    }
    if (!cosmicGameContract) {
      notify('error', t('wallet.connectCorrectNetwork'));
      return false;
    }

    // Only the Random Walk method carries a token; every other ETH Gesture sends -1.
    const tokenId = gestureType === 'RandomWalk' ? rwlkId : -1;
    setIsBidding(true);
    let ethGestureCost = 0n;
    let cstRewardFloor = 0n;
    let attachment: PreparedAttachment | null = null;
    try {
      const result = await tx.run({
        prepare: async () => {
          if (!ensureMessageFits()) return false;
          if (gestureType === 'RandomWalk' && !(await ensureRandomWalkTokenUsable(tokenId))) {
            return false;
          }
          const floor = await cstRewardFloorOrStop();
          if (floor === null) return false;
          cstRewardFloor = floor;
          ethGestureCost = await getNextEthGestureCostWithModifiers();
          const balance = await readEthBalance();
          if (balance !== null && balance < ethGestureCost) {
            notify(
              'error',
              t('gesture.validation.insufficientEth', {
                required: formatWei(ethGestureCost, 'ETH'),
                available: formatWei(balance, 'ETH'),
                network: REQUIRED_CHAIN_NAME,
              }),
            );
            return false;
          }
          const prepared = await prepareAttachment();
          if (prepared === false) return false;
          attachment = prepared;
          return true;
        },
        approvals: attachmentApprovals(() => attachment),
        write: async (ctx) => {
          const prepared: PreparedAttachment | null = attachment;
          const [functionName, args] = !prepared
            ? (['bidWithEth', [tokenId, message]] as const)
            : prepared.kind === 'nft'
              ? ([
                  'bidWithEthAndDonateNft',
                  [tokenId, message, prepared.address, prepared.tokenId],
                ] as const)
              : ([
                  'bidWithEthAndDonateToken',
                  [tokenId, message, prepared.address, prepared.amountWei],
                ] as const);
          const gas = await estimateGestureGas(functionName, args, ethGestureCost, cstRewardFloor);
          return writeGesture(ctx, functionName, args, {
            cstRewardFloor,
            value: ethGestureCost,
            gas,
          });
        },
        successMessage: gestureSuccessMessage,
        onConfirmed: () => {
          clearAttachment(attachment);
          // The token is used now: it leaves the list, and the form lets it go.
          if (tokenId !== -1) {
            setRwlknftIds((ids) => ids.filter((id) => id !== tokenId));
            setRwlkIdState(-1);
          }
        },
        describeError: (err) => {
          const descriptor = getContractErrorDescriptor(err, {
            gestureCurrency: 'ETH',
            displayedPrice: ethGestureInfo?.ETHPrice,
            locale,
          });
          return descriptor ? t(descriptor.key, descriptor.values) : null;
        },
        failureMessage: t('gesture.transaction.failed'),
        errorContext: 'gesture-eth',
      });
      if (result.status !== 'confirmed') return false;
      lastGestureHashRef.current = result.hash;
      return true;
    } finally {
      setIsBidding(false);
    }
  };

  /**
   * Submit a CST gesture (with an optional attached NFT or token). Same flow
   * as `onGesture`; the CST cost is burned by the game directly, so no CST
   * approval is ever requested.
   */
  const onGestureWithCST = async (): Promise<boolean> => {
    if (!account) {
      notify('error', t('wallet.connect'));
      return false;
    }
    if (!cosmicGameContract) {
      notify('error', t('wallet.connectCorrectNetwork'));
      return false;
    }
    // The cycle's first Gesture is made with ETH: a CST one would revert.
    if (firstGesture) {
      notify('error', t('gesture.contractErrors.wrongBidType'));
      return false;
    }

    setIsBidding(true);
    let priceMaxLimit: bigint | null = null;
    let cstRewardFloor = 0n;
    let attachment: PreparedAttachment | null = null;
    try {
      const result = await tx.run({
        prepare: async () => {
          if (!ensureMessageFits()) return false;
          const floor = await cstRewardFloorOrStop();
          if (floor === null) return false;
          cstRewardFloor = floor;
          const limit =
            ((await cosmicGameContract.read.getNextCstBidPrice?.()) as bigint | undefined) ??
            cstGestureData.CSTPriceWei;
          priceMaxLimit = limit;
          if (limit > 0n) {
            // No ERC-20 approval: the game burns the participant's CST through
            // the privileged `CosmicSignatureToken.burn(account, value)`.
            const balance = await readCstBalance();
            if (balance !== null && balance < limit) {
              notify(
                'error',
                t('gesture.validation.insufficientCst', {
                  required: formatWei(limit, 'CST'),
                  available: formatWei(balance, 'CST'),
                }),
              );
              return false;
            }
          }
          const prepared = await prepareAttachment();
          if (prepared === false) return false;
          attachment = prepared;
          return true;
        },
        approvals: attachmentApprovals(() => attachment),
        write: async (ctx) => {
          const limit = priceMaxLimit ?? 0n;
          const prepared: PreparedAttachment | null = attachment;
          const [functionName, args] = !prepared
            ? (['bidWithCst', [limit, message]] as const)
            : prepared.kind === 'nft'
              ? ([
                  'bidWithCstAndDonateNft',
                  [limit, message, prepared.address, prepared.tokenId],
                ] as const)
              : ([
                  'bidWithCstAndDonateToken',
                  [limit, message, prepared.address, prepared.amountWei],
                ] as const);
          return writeGesture(ctx, functionName, args, { cstRewardFloor });
        },
        successMessage: gestureSuccessMessage,
        onConfirmed: () => clearAttachment(attachment),
        describeError: (err, info) => {
          const descriptor = getContractErrorDescriptor(err, {
            gestureCurrency: 'CST',
            displayedPriceWei: priceMaxLimit,
            locale,
          });
          if (descriptor) return t(descriptor.key, descriptor.values);
          return info.kind === 'would-revert' || info.kind === 'reverted'
            ? t('gesture.transaction.cstReverted')
            : null;
        },
        failureMessage: t('gesture.transaction.failed'),
        errorContext: 'gesture-cst',
      });
      if (result.status !== 'confirmed') return false;
      lastGestureHashRef.current = result.hash;
      return true;
    } finally {
      setIsBidding(false);
    }
  };

  useEffect(() => {
    if (!nftRWLKContract || !account || !usedRWLKData) return;
    const gesturedRWLKIds = usedRWLKData.map((x) => x.RWalkTokenId);
    let cancelled = false;
    (nftRWLKContract.read.walletOfOwner?.([account]) as Promise<readonly bigint[]>)
      .then((tokens) => {
        if (cancelled) return;
        const nftIds = tokens
          .map((t) => Number(t))
          .filter((t: number) => !gesturedRWLKIds.includes(t))
          .reverse();
        setRwlknftIds(nftIds);
        setRwlkListSettled({ account, failed: false });
      })
      .catch((e) => {
        if (cancelled) return;
        reportError(e, 'getRwlkNFTIds');
        setRwlkListSettled({ account, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [nftRWLKContract, account, usedRWLKData]);

  const updateCstRewardTolerancePercent = useCallback((value: number) => {
    if (!Number.isFinite(value)) return;
    setCstRewardTolerancePercent(Math.min(100, Math.max(0, value)));
  }, []);

  return {
    gestureType,
    setBidType,
    contributionType,
    setContributionType,
    cstGestureData,
    ethGestureInfo,
    gestureCstRewardAmount,
    gestureCstRewardAmountMin,
    gestureCstRewardAmountMinLimitWei,
    isCstRewardLoading,
    cstRewardReadFailed,
    cstRewardTolerancePercent,
    setCstRewardTolerancePercent: updateCstRewardTolerancePercent,
    acceptAnyCstReward,
    setAcceptAnyCstReward,
    message,
    setMessage,
    /** The contract's cap on the message, in UTF-8 bytes (read live; the documented default until then). */
    messageMaxBytes,
    nftDonateAddress,
    setNftDonateAddress,
    nftId,
    setNftId,
    tokenDonateAddress,
    setTokenDonateAddress,
    tokenAmount,
    setTokenAmount,
    rwlkId,
    setRwlkId,
    /** A token the form let go because it is not one of this wallet's unused Random Walk NFTs. */
    rwlkRejectedId,
    gestureCostPlus,
    setBidPricePlus,
    isGesturing,
    /** Lifecycle of the latest gesture transaction, for button labels and `TxStatus`. */
    gestureTxStage: tx.stage,
    advancedExpanded,
    setAdvancedExpanded,
    rwlknftIds,
    rwlkListStatus,
    onGesture,
    onGestureWithCST,
    /** The hash of the last confirmed Gesture, for its explorer link while it indexes. */
    getLastGestureHash,
  } as const;
}
