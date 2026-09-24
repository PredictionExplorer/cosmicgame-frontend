'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatEther } from 'viem';

import {
  charityWalletAbi as CHARITY_WALLET_ABI,
  cosmicGameAbi as COSMICGAME_ABI,
} from '@/contracts/abis';

import { networkConfig } from '@/config/networks';
import type { ContractAddresses } from '@/services/api/types';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { PageShell } from '@/components/ui/page-shell';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import { reportError } from '@/utils/errors';
import { readCosmicGameWithFallback } from '@/utils/cosmicGameContractCompat';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { percentFromDivisor } from '@/utils/protocolParams';
import useContractNoSigner from '@/hooks/useContractNoSigner';
import { PageHeader } from '@/components/layout/PageHeader';

import { CalibrationWindows } from './components/CalibrationWindows';
import { ContractAddressList } from './components/ContractAddressList';
import { FundDistribution } from './components/FundDistribution';
import { ProtocolConfiguration } from './components/ProtocolConfiguration';
import { PublicGoodsVaultAction } from './components/PublicGoodsVaultAction';
import type { CalibrationWindowReading } from './components/calibrationWindow';

/**
 * The preview grows with the seconds since the last gesture, so it stays live, but at a pace
 * that does not hammer the RPC from every open tab; hidden tabs stop polling entirely.
 */
const CST_REWARD_PREVIEW_REFRESH_MS = 2_000;

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

/** A positive finite number from a contract read; `null` (unknown) for anything else. */
function positiveOrNull(value: unknown): number | null {
  const numeric = toFiniteNumber(value);
  return numeric !== null && numeric > 0 ? numeric : null;
}

/** A `[duration, elapsed]` pair from a Calibration Window read, stamped with when it was read. */
function windowReading(value: unknown): CalibrationWindowReading | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const duration = toFiniteNumber(value[0]);
  const elapsed = toFiniteNumber(value[1]);
  if (duration === null || elapsed === null) return null;
  return { durationSeconds: duration, elapsedSeconds: elapsed, readAtMs: Date.now() };
}

function getLiveCstPreviewRefreshMs(): number {
  const testInterval = (globalThis as LiveCstPreviewTestGlobals)
    .__COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__;
  if (typeof testInterval === 'number' && Number.isFinite(testInterval) && testInterval > 0) {
    return testInterval;
  }
  return CST_REWARD_PREVIEW_REFRESH_MS;
}

/** A contract read: `undefined` while it is in flight, `null` when it failed. */
type Read<T> = T | null | undefined;

interface ContractsProps {
  /** The server-rendered page header, the page's only header. */
  seoSummary?: ReactNode;
  /**
   * The server-rendered address list (`ContractAddressList`), so every address is in
   * the server HTML. Without it (tests, a render outside the route) the body renders
   * the list itself from the addresses it has.
   */
  addresses?: ReactNode;
  /** The contract addresses from the page's server read, for the fallback list. */
  initialContractAddrs?: ContractAddresses | null;
}

/**
 * /contracts, below its header: the address list, the allocation tracks, the live
 * protocol configuration, the two Calibration Windows and Public Goods. Figures read
 * from the contracts show a skeleton while they load and a dash when a read fails.
 */
const Contracts = ({ seoSummary, addresses, initialContractAddrs = null }: ContractsProps) => {
  const t = useTranslations('contracts');
  const { data, isLoading: loading } = useDashboardInfo();
  const { charity: appVaultAddress, cosmicGame } = useContractAddresses();
  // The vault from the app-wide addresses, else from this page's own reads, so the
  // Public Goods section is in the server HTML rather than appearing after hydration.
  const vaultAddress =
    [
      appVaultAddress,
      data?.ContractAddrs?.CharityWalletAddr,
      initialContractAddrs?.CharityWalletAddr,
    ].find(Boolean) ?? '';

  const [charityAddress, setCharityAddress] = useState<Read<string>>(undefined);
  const [priceIncrease, setPriceIncrease] = useState<Read<number>>(undefined);
  const [timeIncrease, setTimeIncrease] = useState<Read<number>>(undefined);
  const [timeIncrement, setTimeIncrement] = useState<Read<number>>(undefined);
  const [initialIncrement, setInitialIncrement] = useState<Read<number>>(undefined);
  const [msgMaxLen, setMsgMaxLen] = useState<Read<number>>(undefined);
  const [cstRewardAmountForBidding, setCstRewardAmountForBidding] =
    useState<Read<number>>(undefined);
  const [cstWindow, setCstWindow] = useState<Read<CalibrationWindowReading>>(undefined);
  const [ethWindow, setEthWindow] = useState<Read<CalibrationWindowReading>>(undefined);
  const [cstStartingCost, setCstStartingCost] = useState<Read<number>>(undefined);

  const charityWalletContract = useContractNoSigner(vaultAddress, CHARITY_WALLET_ABI);
  const cosmicGameContract = useContractNoSigner(cosmicGame, COSMICGAME_ABI);

  useEffect(() => {
    if (!cosmicGameContract) return;

    /** Runs one read; a failure is reported and stored as `null` (unknown). */
    const read = async <T,>(
      name: string,
      fn: () => Promise<T | null>,
      set: (value: T | null) => void,
    ) => {
      try {
        set(await fn());
      } catch (e) {
        reportError(e, `contracts read ${name}`);
        set(null);
      }
    };

    void read(
      'bidMessageLengthMaxLimit',
      async () => positiveOrNull(await cosmicGameContract.read.bidMessageLengthMaxLimit?.()),
      setMsgMaxLen,
    );
    void read(
      'ethBidPriceIncreaseDivisor',
      async () => percentFromDivisor(await cosmicGameContract.read.ethBidPriceIncreaseDivisor?.()),
      setPriceIncrease,
    );
    void read(
      'mainPrizeTimeIncrementIncreaseDivisor',
      async () =>
        percentFromDivisor(await cosmicGameContract.read.mainPrizeTimeIncrementIncreaseDivisor?.()),
      setTimeIncrease,
    );
    void read(
      'mainPrizeTimeIncrementInMicroSeconds',
      async () => {
        const v = positiveOrNull(
          await cosmicGameContract.read.mainPrizeTimeIncrementInMicroSeconds?.(),
        );
        return v === null ? null : v / 1_000_000;
      },
      setTimeIncrement,
    );
    // The resolved initial duration (seconds), read from the contract rather than the
    // legacy `InitialSecondsUntilPrize` API field, which carries a divisor, not seconds.
    void read(
      'getInitialDurationUntilMainPrize',
      async () =>
        positiveOrNull(await cosmicGameContract.read.getInitialDurationUntilMainPrize?.()),
      setInitialIncrement,
    );
    void read(
      'getCstDutchAuctionDurations',
      async () => windowReading(await cosmicGameContract.read.getCstDutchAuctionDurations?.()),
      setCstWindow,
    );
    void read(
      'getEthDutchAuctionDurations',
      async () => windowReading(await cosmicGameContract.read.getEthDutchAuctionDurations?.()),
      setEthWindow,
    );
    // The current CST window's own starting cost, not its lower bound.
    void read(
      'cstDutchAuctionBeginningBidPrice',
      async () => {
        const v = await cosmicGameContract.read.cstDutchAuctionBeginningBidPrice?.();
        return typeof v === 'bigint' ? Number(formatEther(v)) : null;
      },
      setCstStartingCost,
    );
  }, [cosmicGameContract]);

  useEffect(() => {
    if (!cosmicGameContract) return;

    let cancelled = false;
    let inFlight = false;
    let timeoutId: number | null = null;

    const refreshCstRewardPreview = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;

      try {
        const v = await readCosmicGameWithFallback<bigint>([
          () => cosmicGameContract.read.getBidCstRewardAmount?.() as Promise<bigint | undefined>,
          () =>
            cosmicGameContract.read.getBidCstRewardAmountAdvanced?.([0n]) as Promise<
              bigint | undefined
            >,
          () =>
            cosmicGameContract.read.cstRewardAmountForBidding?.() as Promise<bigint | undefined>,
        ]);
        const amount = Number(formatEther(v ?? 0n));
        if (!cancelled) {
          setCstRewardAmountForBidding(Number.isFinite(amount) ? amount : null);
        }
      } catch (e) {
        if (!cancelled) {
          setCstRewardAmountForBidding(null);
          reportError(e, 'contracts live cstRewardAmountForBidding');
        }
      } finally {
        inFlight = false;
      }
    };

    // One refresh-then-wait chain at a time; it stops while the tab is hidden and
    // restarts with a fresh read when the tab becomes visible again.
    let polling = false;
    const tick = async () => {
      await refreshCstRewardPreview();
      if (cancelled || document.hidden) {
        polling = false;
        return;
      }
      timeoutId = window.setTimeout(() => {
        timeoutId = null;
        void tick();
      }, getLiveCstPreviewRefreshMs());
    };
    const startPolling = () => {
      if (polling || cancelled) return;
      polling = true;
      void tick();
    };

    const liveTimers = shouldScheduleLiveCstPreviewTimer();
    if (liveTimers) {
      startPolling();
    } else {
      void refreshCstRewardPreview();
    }

    const handleVisibilityChange = () => {
      if (liveTimers && !document.hidden) startPolling();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleGesturePlaced = () => {
      void refreshCstRewardPreview();
    };
    window.addEventListener('cosmic:gesture-placed', handleGesturePlaced);

    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('cosmic:gesture-placed', handleGesturePlaced);
    };
  }, [cosmicGameContract]);

  useEffect(() => {
    if (!charityWalletContract) return;
    const fetchData = async () => {
      try {
        const addr = (await charityWalletContract.read.charityAddress?.()) as string | undefined;
        setCharityAddress(addr || null);
      } catch (e) {
        reportError(e, 'fetch public goods beneficiary address');
        setCharityAddress(null);
      }
    };
    void fetchData();
  }, [charityWalletContract]);

  // Dashboard figures: `undefined` while the dashboard loads, `null` when a field is missing.
  const dashboardNumber = (value: unknown): Read<number> =>
    loading && !data ? undefined : toFiniteNumber(value);
  // Whether the cycle has a gesture decides the ETH window's state; unknown until the
  // dashboard answers, never read as "no gestures".
  const gestureCount = dashboardNumber(data?.CurNumBids);
  const cycleHasGestures = typeof gestureCount === 'number' ? gestureCount > 0 : gestureCount;

  return (
    <PageShell variant="data" backdrop="signature">
      {/* The server-rendered header (ContractsSeoSummary) is the page's only header. */}
      {seoSummary ?? (
        <PageHeader
          section="trust"
          title={t('page.title')}
          subtitle={t('page.subtitle')}
          meta={
            <>
              <span className="text-muted-foreground">{networkConfig.chainName}</span>
              <span>{t('network.chain', { chainId: networkConfig.chainId })}</span>
            </>
          }
        />
      )}

      <div className="space-y-16 sm:space-y-20">
        {addresses ?? (
          <ContractAddressList apiAddresses={data?.ContractAddrs ?? initialContractAddrs} />
        )}

        <FundDistribution
          prizePercentage={data?.PrizePercentage}
          chronoWarriorPercentage={data?.ChronoWarriorPercentage}
          stellarSelectionPercentage={data?.RafflePercentage}
          stakingPercentage={data?.StakingPercentage}
          charityPercentage={data?.CharityPercentage}
          loading={loading}
        />

        <ProtocolConfiguration
          priceIncrease={priceIncrease}
          timeIncrease={timeIncrease ?? null}
          timeIncrement={timeIncrement}
          cstRewardPerBid={cstRewardAmountForBidding}
          maxMessageLength={msgMaxLen}
          claimTimeout={loading && !data ? undefined : positiveOrNull(data?.TimeoutClaimPrize)}
          initialIncrement={initialIncrement}
          ethStellarRecipients={dashboardNumber(data?.NumRaffleEthWinnersBidding)}
          nftStellarRecipients={dashboardNumber(data?.NumRaffleNFTWinnersBidding)}
          anchoredStellarRecipients={dashboardNumber(data?.NumRaffleNFTWinnersStakingRWalk)}
        />

        <CalibrationWindows
          cst={cstWindow}
          eth={ethWindow}
          cstStartingCost={cstStartingCost}
          cycleHasGestures={cycleHasGestures}
        />

        <PublicGoodsVaultAction
          vaultAddress={vaultAddress}
          beneficiaryAddress={charityAddress}
          vaultBalanceEth={dashboardNumber(data?.CharityBalanceEth)}
          sharePercent={dashboardNumber(data?.CharityPercentage)}
        />
      </div>
    </PageShell>
  );
};

export default Contracts;
