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
import { formatAmount, formatExactUnits } from '@/utils/format/numbers';
import {
  type CosmicGameGestureFunctionName,
  isMissingFunctionReadError,
  pickGestureWriteAbi,
  readCosmicGameWithFallback,
  withGestureArgsV1ThenV2,
} from '@/utils/cosmicGameContractCompat';
import {
  LATE_GESTURE_CURVE_HEADROOM_PERCENT,
  computeMaxLateGesturePrice,
  resolveLateGesturePhase,
} from '@/utils/lateBidPricing';
import { formatSeconds } from '@/utils/format';
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
  | { kind: 'token'; address: string; amountWei: bigint; decimals: number };

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

/**
 * The V3 late-gesture window, as the form's live preview reads it once per
 * second from the contract (never derived from the last paid price).
 * Absent (null) on V1/V2 deployments and before the cycle's first gesture,
 * where there is no premium and `nextEthBidPrice` is stale (Comment-202501022).
 */
export interface LateGestureWindowInfo {
  /** `getRoundLateBidDuration()`: the window's length, in seconds. */
  windowSeconds: number;
  /**
   * `getDurationUntilMainPrize()`: signed seconds until the finalization
   * deadline; negative once it has passed. The window spans the last
   * `windowSeconds` of it, so `secondsUntilMainPrize - windowSeconds` is the
   * time until the window opens (≤ 0 while it is active).
   */
  secondsUntilMainPrize: number;
  /**
   * The live premium, `getNextEthBidPrice() - nextEthBidPrice()`, in wei;
   * null outside the window (no premium applies there).
   */
  premiumWei: bigint | null;
  /** When these figures were read (`Date.now()`), for staleness checks. */
  readAtMs: number;
}

/** A contract-fresh ETH quote outlives one refresh tick, then the API quote rules again. */
const CONTRACT_ETH_QUOTE_FRESH_MS = 5_000;

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
  /**
   * The cycle's latest gesturer (the dashboard's `LastBidderAddr`), for the
   * Participation CST floor's preselection: when the connected wallet IS the
   * latest gesturer, the next gesture imprints the accrued CST to that same
   * wallet, so guarding a minimum protects it; for anyone else the imprint
   * goes to a third party and a floor only invites spurious reverts.
   */
  lastGesturerAddress?: string | null;
}

export function useGestureForm({
  firstGesture = false,
  lastGesturerAddress = null,
}: UseGestureFormOptions = {}) {
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
  // The late-gesture window per the contract, refreshed with the live preview.
  const [lateGestureWindow, setLateGestureWindow] = useState<LateGestureWindowInfo | null>(null);
  // Inside the window the cost climbs every second, so the displayed ETH
  // quote comes straight from the contract on each refresh tick ("re-quote
  // every block near the deadline") instead of the API's 15-second poll.
  const [contractEthQuote, setContractEthQuote] = useState<{
    priceWei: bigint;
    readAtMs: number;
  } | null>(null);
  const [gestureCstRewardAmountWei, setGestureCstRewardAmountWei] = useState<bigint | null>(null);
  const [isCstRewardLoading, setIsCstRewardLoading] = useState(false);
  // The last read of the Participation CST preview failed. The preview keeps
  // polling, so this clears on the next successful read; the form shows
  // "Unavailable" instead of a skeleton that would pulse forever.
  const [cstRewardReadFailed, setCstRewardReadFailed] = useState(false);
  const [cstRewardTolerancePercent, setCstRewardTolerancePercent] = useState(1);
  /**
   * The person's Participation CST floor choice: 'auto' preselects by whether
   * the connected wallet is the cycle's latest gesturer (see
   * `cstRewardGuardActive`); 'any' and 'guarded' are explicit picks.
   */
  const [cstRewardGuardChoice, setCstRewardGuardChoice] = useState<'auto' | 'any' | 'guarded'>(
    'auto',
  );
  /**
   * True on V3 contracts, where the entire per-gesture Participation CST is
   * imprinted to the outbid (previous) participant; the participant placing
   * the gesture receives nothing at gesture time and instead accrues CST
   * while they remain the latest participant. False on V1/V2 (whole reward
   * to the gesturer).
   */
  const [cstRewardToOutbidBidder, setCstRewardToOutbidBidder] = useState<boolean>(false);

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

  // One-shot V3 detection: cstBidPriceDeclineMultiplier() only exists on V3,
  // where the entire per-gesture Participation CST is minted to the outbid
  // previous participant. The selector does not exist on V2, in which case
  // the state stays false and the UI keeps V2 semantics (whole reward to the
  // gesturer).
  useEffect(() => {
    if (uxScenario || !cosmicGameContract) {
      setCstRewardToOutbidBidder(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const value = (await cosmicGameContract.read.cstBidPriceDeclineMultiplier?.()) as
          | bigint
          | undefined;
        if (!cancelled && value !== undefined) {
          setCstRewardToOutbidBidder(true);
        }
      } catch (err) {
        // Expected on V2 deployments (selector absent; behind the proxy this
        // surfaces as a reasonless revert rather than "unrecognized
        // selector"). Anything else is worth reporting.
        if (!cancelled && !isMissingFunctionReadError(err)) {
          reportError(err, 'cstBidPriceDeclineMultiplier');
        }
        if (!cancelled) setCstRewardToOutbidBidder(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cosmicGameContract, uxScenario]);

  const cstGestureData = useMemo<CSTGestureData>(() => {
    return mapCTPriceInfo(ctPriceData, contractCstDurations, contractCstPriceWei);
  }, [contractCstDurations, contractCstPriceWei, ctPriceData]);

  const ethGestureInfo = useMemo<EthGestureInfo | null>(() => {
    // Inside the late-gesture window the contract is re-quoted every refresh
    // tick, and that figure (base plus live premium) beats the API's slower
    // poll. Never derived from the last paid price in either branch.
    const liveQuote =
      contractEthQuote && Date.now() - contractEthQuote.readAtMs < CONTRACT_ETH_QUOTE_FRESH_MS
        ? contractEthQuote
        : null;
    if (!bidEthPriceData && !liveQuote) return null;
    const priceWei = liveQuote ? liveQuote.priceWei : BigInt(bidEthPriceData!.ETHPrice);
    return {
      AuctionDuration: bidEthPriceData ? parseInt(bidEthPriceData.AuctionDuration) : 0,
      ETHPrice: parseFloat(formatEther(priceWei)),
      ETHPriceWei: priceWei,
      SecondsElapsed: bidEthPriceData ? parseInt(bidEthPriceData.SecondsElapsed) : 0,
    };
  }, [bidEthPriceData, contractEthQuote]);

  const gestureCstRewardAmount = useMemo(() => {
    if (gestureCstRewardAmountWei == null) return null;
    const value = Number(formatEther(gestureCstRewardAmountWei));
    return Number.isFinite(value) ? value : null;
  }, [gestureCstRewardAmountWei]);

  /**
   * The Participation CST floor (`bidCstRewardAmountMinLimit_`) offers two
   * easy choices: accept any amount (0, the default) or guard the shown
   * amount minus the tolerance. Under V3 the guarded amount is imprinted to
   * the *previous* participant, so the guard is preselected exactly when the
   * connected wallet IS the cycle's latest gesturer (the imprint would come
   * back to it); for anyone else a nonzero floor only invites spurious
   * `BidCstRewardAmountMinLimitNotReached` reverts when another gesture
   * lands first (Comment-202605279). The contract ignores the value on the
   * cycle's first gesture, and the form sends 0 there regardless.
   */
  const connectedIsLatestGesturer =
    !!account && !!lastGesturerAddress && sameAddress(account, lastGesturerAddress);
  const cstRewardGuardActive =
    !firstGesture &&
    (cstRewardGuardChoice === 'guarded' ||
      (cstRewardGuardChoice === 'auto' && connectedIsLatestGesturer));

  useEffect(() => {
    if (uxScenario) {
      setContractCstDurations(null);
      setContractCstPriceWei(null);
      setGestureCstRewardAmountWei(100n * 10n ** 18n);
      setIsCstRewardLoading(false);
      setCstRewardReadFailed(false);
      setLateGestureWindow(null);
      setContractEthQuote(null);
      return;
    }

    const canReadDurations = !!publicClient && !!contractAddrs.cosmicGame;
    const canReadReward = !!cosmicGameContract;
    const canReadPrice = !!cosmicGameContract;
    // The window exists on V3 only, and only once the cycle has a gesture:
    // before it there is no premium and `nextEthBidPrice` is stale
    // (Comment-202501022), so the difference must not be computed.
    const canReadLateWindow = !!cosmicGameContract && cstRewardToOutbidBidder && !firstGesture;

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
    if (!canReadLateWindow) {
      setLateGestureWindow(null);
      setContractEthQuote(null);
    }
    if (!canReadDurations && !canReadReward && !canReadPrice && !canReadLateWindow) {
      return;
    }

    let cancelled = false;
    let inFlight = false;
    let timeoutId: number | null = null;
    // The window's length is an owner-set parameter: cache it and re-read it
    // only once a minute, while the countdown itself refreshes every tick.
    let windowSecondsCache: bigint | null = null;
    let windowSecondsReadAtMs = 0;
    const WINDOW_SECONDS_TTL_MS = 60_000;

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
          canReadLateWindow
            ? (async () => {
                try {
                  const read = cosmicGameContract!.read;
                  if (
                    windowSecondsCache === null ||
                    Date.now() - windowSecondsReadAtMs > WINDOW_SECONDS_TTL_MS
                  ) {
                    const windowSeconds = (await read.getRoundLateBidDuration?.()) as
                      | bigint
                      | undefined;
                    if (windowSeconds === undefined) return;
                    windowSecondsCache = windowSeconds;
                    windowSecondsReadAtMs = Date.now();
                  }
                  // Signed on V3.1: negative once the deadline has passed
                  // (the window, and its premium cap, then stay active).
                  const remaining = (await read.getDurationUntilMainPrize?.()) as
                    | bigint
                    | undefined;
                  if (remaining === undefined || cancelled) return;
                  const inWindow = remaining <= windowSecondsCache;
                  let premiumWei: bigint | null = null;
                  if (inWindow) {
                    const [quoted, base] = await Promise.all([
                      read.getNextEthBidPrice?.() as Promise<bigint | undefined>,
                      read.nextEthBidPrice?.() as Promise<bigint | undefined>,
                    ]);
                    if (!cancelled && quoted !== undefined) {
                      setContractEthQuote({ priceWei: quoted, readAtMs: Date.now() });
                      if (base !== undefined) premiumWei = quoted > base ? quoted - base : 0n;
                    }
                  } else {
                    setContractEthQuote(null);
                  }
                  if (!cancelled) {
                    setLateGestureWindow({
                      windowSeconds: Number(windowSecondsCache),
                      secondsUntilMainPrize: Number(remaining),
                      premiumWei,
                      readAtMs: Date.now(),
                    });
                  }
                } catch (e) {
                  if (!cancelled) reportPreviewError(e, 'late gesture window preview');
                }
              })()
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
  }, [
    contractAddrs.cosmicGame,
    cosmicGameContract,
    publicClient,
    uxScenario,
    cstRewardToOutbidBidder,
    firstGesture,
  ]);

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
   * The least Participation CST this gesture accepts, from the person's
   * choice and tolerance: 0 with "accept any" (and always 0 on the cycle's
   * first gesture, where the contract ignores the value). When the guard is
   * on, it uses the live preview, or a fresh read when the preview has not
   * arrived or failed, so a missing preview never silently drops the
   * protection. Null when no amount can be read at all: the gesture then
   * stops and says why.
   */
  const resolveCstRewardFloor = async (): Promise<bigint | null> => {
    if (!cstRewardGuardActive) return 0n;
    let amount = gestureCstRewardAmountWei;
    if (amount == null) {
      try {
        amount =
          (await readCosmicGameWithFallback<bigint>([
            () => cosmicGameContract!.read.getBidCstRewardAmount?.() as Promise<bigint | undefined>,
            () =>
              cosmicGameContract!.read.getBidCstRewardAmountAdvanced?.([0n]) as Promise<
                bigint | undefined
              >,
          ])) ?? null;
      } catch (e) {
        reportError(e, 'resolve Participation CST floor');
        amount = null;
      }
    }
    if (amount == null) return null;
    // The tolerance absorbs the drift between this quote and the mined block
    // (the amount keeps growing while you stay the latest gesturer, so the
    // real risk is another gesture landing first, which no margin can cover).
    const toleranceBasisPoints = BigInt(
      Math.round(Math.min(100, Math.max(0, cstRewardTolerancePercent)) * 100),
    );
    return (amount * (10_000n - toleranceBasisPoints)) / 10_000n;
  };

  /**
   * V3 late-gesture price cap for the given live quote, or null when the
   * regular `gestureCostPlus` headroom should apply (V1/V2 deployment, no
   * gestures in the cycle yet, outside the late-gesture window, or reads
   * unavailable). See utils/lateBidPricing.ts for the policy.
   */
  const getLateGestureCap = async (
    quotedPrice: bigint,
    track: 'eth' | 'cst',
  ): Promise<bigint | null> => {
    if (!cstRewardToOutbidBidder) return null; // V1/V2: no late-gesture premium exists.
    try {
      const read = cosmicGameContract!.read;
      // The premium only applies when the cycle has a last gesturer.
      const lastGesturer = (await read.lastBidderAddress?.()) as string | undefined;
      if (!lastGesturer || !lastGesturer.startsWith('0x') || BigInt(lastGesturer) === 0n) {
        return null;
      }
      const [remaining, window] = await Promise.all([
        read.getDurationUntilMainPrize?.() as Promise<bigint | undefined>,
        read.getRoundLateBidDuration?.() as Promise<bigint | undefined>,
      ]);
      if (remaining === undefined || window === undefined) return null;
      const phase = resolveLateGesturePhase(remaining, window);
      if (phase === 'normal') return null;
      if (phase === 'curve') {
        // On the shallow part of the curve a bigger percentage is enough.
        const plus = Math.max(
          clampCollisionBufferPercent(gestureCostPlus),
          LATE_GESTURE_CURVE_HEADROOM_PERCENT,
        );
        return (quotedPrice * BigInt(Math.round((100 + plus) * 100))) / 10_000n;
      }
      // Last minute (or overdue): the cost can reach the full premium (~5× the
      // premium-free base) before the transaction mines, so use the exact
      // contract maximum. ETH overpayment is refunded in the same transaction;
      // the CST limit is only a cap the contract never charges above.
      const [premiumBaseMultiplier, premiumExponent, incrementMicroSeconds] = await Promise.all([
        read.roundLateBidPricePremiumAmountBaseMultiplier?.() as Promise<bigint | undefined>,
        read.roundLateBidPricePremiumAmountExponent?.() as Promise<bigint | undefined>,
        read.mainPrizeTimeIncrementInMicroSeconds?.() as Promise<bigint | undefined>,
      ]);
      if (
        premiumBaseMultiplier === undefined ||
        premiumExponent === undefined ||
        incrementMicroSeconds === undefined
      ) {
        return null;
      }
      // ETH exposes the premium-free base directly; for CST the live quote
      // (base + current premium) over-approximates the base, which is safe
      // because the limit is never charged, only compared against.
      const basePrice =
        track === 'eth'
          ? (((await read.nextEthBidPrice?.()) as bigint | undefined) ?? quotedPrice)
          : quotedPrice;
      const cap = computeMaxLateGesturePrice({
        basePrice,
        roundLateBidDuration: window,
        premiumBaseMultiplier,
        mainPrizeTimeIncrementInMicroSeconds: incrementMicroSeconds,
        premiumExponent,
      });
      // Never cap below the live quote (defensive; the max is ≥ any live price).
      return cap > quotedPrice ? cap : quotedPrice;
    } catch (e) {
      reportError(e, 'late gesture price cap');
      return null;
    }
  };

  const getNextEthGestureCostWithModifiers = async () => {
    const base = (await cosmicGameContract!.read.getNextEthBidPrice?.()) as bigint;
    // Inside the V3 late-gesture window the cost rises every second, so a
    // fixed percentage cannot keep up; the exact contract maximum takes over
    // (ETH overpayment is refunded in the same transaction).
    const lateCap = await getLateGestureCap(base, 'eth');
    // A negative or non-numeric buffer would underpay (and revert) or make parseEther throw.
    const buffer = clampCollisionBufferPercent(gestureCostPlus);
    let price = lateCap ?? (base * parseEther((100 + buffer).toString())) / parseEther('100');
    if (gestureType === 'RandomWalk') {
      // The contract charges ceil(price / 2) for RandomWalk gestures; round the
      // late cap up so it still covers the charge at the exact maximum.
      price = lateCap != null ? (price + 1n) / 2n : (price * parseEther('50')) / parseEther('100');
    }
    return price;
  };

  /**
   * Pre-flight guard: refuse to submit a gesture while the round is still
   * inactive (e.g. in the delay window right after a cycle was finalized).
   * Compares against CHAIN time via getDurationUntilRoundActivation() —
   * authoritative even when the UI's cached activation state is stale or the
   * chain clock differs from the wall clock (local Hardhat). Fails open on
   * read errors: the transaction itself is the final authority, so an RPC
   * hiccup must not lock people out of gesturing.
   */
  const ensureRoundIsActive = async (): Promise<boolean> => {
    try {
      const duration = (await cosmicGameContract!.read.getDurationUntilRoundActivation?.()) as
        | bigint
        | undefined;
      if (duration !== undefined && duration > 0n) {
        notify(
          'warning',
          t('gesture.validation.cycleNotStarted', {
            duration: formatSeconds(Number(duration), locale),
          }),
        );
        return false;
      }
      return true;
    } catch (err) {
      reportError(err, 'getDurationUntilRoundActivation');
      return true;
    }
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
      // Read in the reader's marks, as every other send is (vi "1.000" is a
      // thousand, never 1): digits and one decimal mark only, no sign, no
      // exponent, no more fraction digits than the token has, never zero.
      const { wei: amountWei, error: amountError } = parseTokenAmount(tokenAmount, {
        decimals,
        locale,
      });
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
      return { kind: 'token', address: tokenDonateAddress, amountWei, decimals };
    }

    return null;
  };

  /**
   * The approval step for the prepared attachment (exact amount or the one
   * NFT), shown as "Approve 1 of 2" with a sentence on why the wallet asks.
   * Evaluated after `prepare`, so it reads the attachment that passed
   * validation: the sentence names the amount the wallet is asked for, as
   * parsed and printed in the reader's marks, never the raw typed text.
   */
  const attachmentApprovals = (
    getAttachment: () => PreparedAttachment | null,
  ): TxApprovalStep[] => [
    {
      get description() {
        const attachment = getAttachment();
        if (attachment?.kind === 'token') {
          return t('gesture.approval.token', {
            amount: formatExactUnits(attachment.amountWei, {
              decimals: attachment.decimals,
              locale,
            }),
          });
        }
        return t('gesture.approval.nft', {
          tokenId: attachment?.kind === 'nft' ? attachment.tokenId.toString() : nftId,
        });
      },
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
          if (!(await ensureRoundIsActive())) return false;
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
          if (!(await ensureRoundIsActive())) return false;
          const floor = await cstRewardFloorOrStop();
          if (floor === null) return false;
          cstRewardFloor = floor;
          const quotedCstPrice =
            ((await cosmicGameContract.read.getNextCstBidPrice?.()) as bigint | undefined) ??
            cstGestureData.CSTPriceWei;
          // Apply the person's max-cost tolerance (same knob as ETH gestures).
          // On V2 the CST cost only declines between quote and confirmation,
          // but inside the V3 late-gesture window it rises every second —
          // without headroom the transaction would revert on a stale quote.
          // Near the deadline a percentage cannot keep up, so the V3 cap takes
          // over there. The contract charges the actual cost; the limit is
          // only a cap it never charges above.
          const lateCap = await getLateGestureCap(quotedCstPrice, 'cst');
          const buffer = clampCollisionBufferPercent(gestureCostPlus);
          const limit =
            lateCap ?? (quotedCstPrice * BigInt(Math.round((100 + buffer) * 100))) / 10_000n;
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
    isCstRewardLoading,
    cstRewardReadFailed,
    /** V3: the gesture's Participation CST goes to the outbid previous participant. */
    cstRewardToOutbidBidder,
    cstRewardTolerancePercent,
    setCstRewardTolerancePercent: updateCstRewardTolerancePercent,
    /** True when the next gesture sends a nonzero Participation CST floor. */
    cstRewardGuardActive,
    cstRewardGuardChoice,
    setCstRewardGuardChoice,
    /** The connected wallet is the cycle's latest gesturer (the floor's beneficiary). */
    connectedIsLatestGesturer,
    /** The V3 late-gesture window per the contract; null on V1/V2 or before the first gesture. */
    lateGestureWindow,
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
