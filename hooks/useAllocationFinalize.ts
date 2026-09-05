import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useConfig, usePublicClient } from 'wagmi';
import { getAccount, writeContract } from '@wagmi/core';
import { zeroAddress } from 'viem';

import { cosmicGameAbi } from '@/contracts/abis';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useRouter } from '@/i18n/navigation';
import api from '@/services/api';
import { isAxiosError } from '@/services/api/client';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import type { DashboardInfo } from '@/services/api/types';
import { isUserRejection, reportError } from '@/utils/errors';
import { getContractErrorDescriptor, isEmptyContractReadError } from '@/utils/contractErrors';
import { assertSuccessfulTransactionReceipt } from '@/utils/transactions';
import { useNotify } from '@/hooks/useNotify';
import { useRequireChain } from '@/hooks/useRequireChain';
import { useAllocationTime, useCurrentTime, useClaimHistory } from '@/hooks/useApiQuery';
import { getStableClientTargetTime } from '@/utils/time';
import type { ServerTimingSample } from '@/utils/time';
import { useUxScenarioSnapshot } from '@/lib/uxCycleScenarios';

const GAS_EXTRA = BigInt(1_000_000);
const GAS_FLOOR = BigInt(2_000_000);

interface UseAllocationFinalizeOptions {
  data: DashboardInfo | null;
  offset: number;
  initialTimingSample?: ServerTimingSample | null;
}

export function useAllocationFinalize({
  data,
  offset,
  initialTimingSample = null,
}: UseAllocationFinalizeOptions) {
  const t = useTranslations('toasts');
  const router = useRouter();
  const config = useConfig();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { cosmicGame } = useContractAddresses();
  const cosmicGameContract = useCosmicGameContract();
  const { notify, notifyErrorFromEthers } = useNotify();
  const { ensureCorrectChain } = useRequireChain();
  const uxScenario = useUxScenarioSnapshot();

  const { data: prizeTimeRaw } = useAllocationTime(
    initialTimingSample?.targetServerTimeSec,
    initialTimingSample ? 0 : undefined,
  );
  const { data: currentTimeRaw, dataUpdatedAt: currentTimeUpdatedAt } = useCurrentTime(
    initialTimingSample?.currentServerTimeSec,
    initialTimingSample ? 0 : undefined,
  );
  const { data: claimHistoryRaw } = useClaimHistory();

  const [allocationTime, setAllocationTime] = useState(() => {
    if (initialTimingSample && initialTimingSample.targetServerTimeSec > 0) {
      return (
        initialTimingSample.sampledAtMs +
        (initialTimingSample.targetServerTimeSec - initialTimingSample.currentServerTimeSec) * 1000
      );
    }
    const stableTargetMs = getStableClientTargetTime({
      targetServerTimeSec: prizeTimeRaw,
      currentServerTimeSec: currentTimeRaw,
      currentServerTimeUpdatedAtMs: currentTimeUpdatedAt,
    });
    if (stableTargetMs > 0) return stableTargetMs;
    // Server-seeded fallback: the dashboard snapshot already carries the
    // finalization timestamp the dedicated queries will re-fetch. Using it
    // for the first render keeps the server-rendered phase correct (live /
    // approach instead of a spurious ready-to-finalize) so the home page's
    // sections do not mount/unmount — and shift layout — after hydration.
    const seededSeconds = data?.PrizeClaimTs;
    return typeof seededSeconds === 'number' && seededSeconds > 0 ? seededSeconds * 1000 : 0;
  });

  useEffect(() => {
    const updateId = window.setTimeout(() => {
      setAllocationTime((previousTargetMs) => {
        const nextTargetMs = getStableClientTargetTime({
          targetServerTimeSec: prizeTimeRaw,
          currentServerTimeSec: currentTimeRaw,
          currentServerTimeUpdatedAtMs: currentTimeUpdatedAt,
          previousTargetMs,
          correctionToleranceMs: 1500,
        });
        // While the timing queries are still in flight the helper yields 0;
        // keep the seeded target instead of clobbering it back to "ready".
        return nextTargetMs > 0 ? nextTargetMs : previousTargetMs;
      });
    }, 0);
    return () => window.clearTimeout(updateId);
  }, [prizeTimeRaw, currentTimeRaw, currentTimeUpdatedAt]);

  const claimHistory =
    (claimHistoryRaw as
      | import('@/components/tables/RecipientHistoryTable').WinningHistoryEntry[]
      | null) ?? null;

  const [timeoutFinalize, setTimeoutClaimPrize] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [activationTime, setActivationTime] = useState(0);

  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Claim the Signature Allocation for the current cycle.
   * Returns `true` on a successfully mined transaction so the caller can
   * trigger a post-tx refresh. Returns `false` on wallet-not-connected,
   * user rejection, tx failure, or concurrent double-submit attempt.
   */
  const onFinalize = async (): Promise<boolean> => {
    if (inFlightRef.current) return false;
    if (!cosmicGame) {
      notify('error', t('wallet.connectCorrectNetwork'));
      return false;
    }
    if (!publicClient) {
      notify('error', t('network.unavailable'));
      return false;
    }

    inFlightRef.current = true;
    setIsClaiming(true);
    try {
      // Hold the submission lock while the wallet asks to switch networks.
      // Resolve the signer at write time: a successful switch can precede
      // React's next render and the old contract can still be read-only.
      if (!(await ensureCorrectChain())) return false;
      const contract = { address: cosmicGame as `0x${string}`, abi: cosmicGameAbi };
      const roundBefore = (await publicClient.readContract({
        ...contract,
        functionName: 'roundNum',
      })) as bigint;
      const finalCstGestureParticipant =
        ((await publicClient.readContract({
          ...contract,
          functionName: 'lastCstBidderAddress',
        })) as string | undefined) ?? zeroAddress;
      const hasFinalCstGesture = finalCstGestureParticipant !== zeroAddress;

      let gasLimit = GAS_FLOOR;
      try {
        const estimate = await publicClient.estimateContractGas({
          ...contract,
          functionName: 'claimMainPrize',
          account: getAccount(config).address,
        });
        if (estimate) gasLimit = estimate + GAS_EXTRA;
      } catch (estimateErr) {
        reportError(estimateErr, 'finalize-cycle-gas-estimate');
      }

      const hash = await writeContract(config, {
        ...contract,
        functionName: 'claimMainPrize',
        chainId: activeChain.id,
        gas: gasLimit,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      assertSuccessfulTransactionReceipt(receipt);

      const roundAfter = (await publicClient.readContract({
        ...contract,
        functionName: 'roundNum',
      })) as bigint;
      if (roundAfter <= roundBefore) {
        notify('warning', t('finalize.roundDidNotAdvance'));
        return true;
      }

      /** Completed cycle is the on-chain round before advance — matches `api.get_round_info`. */
      const claimedRound = Number(roundBefore);

      let count = (data?.NumRaffleNFTWinnersBidding ?? 0) + 3 + (hasFinalCstGesture ? 1 : 0);
      if ((data?.MainStats?.StakeStatisticsRWalk?.TotalTokensStaked ?? 0) > 0) {
        count += data?.NumRaffleNFTWinnersStakingRWalk ?? 0;
      }

      try {
        await api.create(Number(roundBefore), count);
      } catch (apiErr) {
        const missingIndexer = isAxiosError(apiErr) && apiErr.response?.status === 404;
        if (!missingIndexer) {
          reportError(apiErr, 'post-claim-api');
          notify('warning', t('finalize.metadataUpdating'));
        }
      }

      const params = new URLSearchParams();
      params.set('cycle', String(claimedRound));
      params.set('message', 'success');
      router.push(`/allocation-finalized?${params.toString()}`);

      return true;
    } catch (err: unknown) {
      if (isUserRejection(err)) {
        notify('info', t('walletTransactionCancelled'));
        return false;
      }
      reportError(err, 'finalize-cycle');
      const descriptor = getContractErrorDescriptor(err);
      if (descriptor) {
        notify('error', t(descriptor.key, descriptor.values));
      } else {
        notifyErrorFromEthers(err, t('finalize.failed'));
      }
      return false;
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setIsClaiming(false);
    }
  };

  const fetchActivationTime = useCallback(async () => {
    if (uxScenario) {
      if (mountedRef.current) setActivationTime(0);
      return;
    }
    if (!cosmicGameContract) return;
    try {
      const time = await cosmicGameContract.read.roundActivationTime?.();
      if (!mountedRef.current) return;
      const targetServerTimeSec = Number(time ?? 0);
      const projectedTargetMs = getStableClientTargetTime({
        targetServerTimeSec,
        currentServerTimeSec: currentTimeRaw,
        currentServerTimeUpdatedAtMs: currentTimeUpdatedAt,
      });
      setActivationTime(
        projectedTargetMs > 0 ? projectedTargetMs / 1000 : targetServerTimeSec - offset / 1000,
      );
    } catch (err) {
      if (!isEmptyContractReadError(err)) {
        reportError(err, 'fetchActivationTime');
      }
      if (mountedRef.current) setActivationTime(0);
    }
  }, [cosmicGameContract, currentTimeRaw, currentTimeUpdatedAt, offset, uxScenario]);

  useEffect(() => {
    if (uxScenario) {
      setTimeoutClaimPrize(300);
      setActivationTime(0);
      return;
    }
    const fetchTimeoutFinalize = async () => {
      if (!cosmicGameContract) return;
      try {
        const timeout = await cosmicGameContract.read.timeoutDurationToClaimMainPrize?.();
        if (!mountedRef.current) return;
        setTimeoutClaimPrize(Number(timeout ?? 0));
      } catch (err) {
        if (!isEmptyContractReadError(err)) {
          reportError(err, 'fetchTimeoutFinalize');
        }
        if (mountedRef.current) setTimeoutClaimPrize(0);
      }
    };

    if (cosmicGameContract) {
      void fetchTimeoutFinalize();
      // Setting activation time state from a one-shot async contract read.
      // Migrating to React Query would be cleaner long-term but is a larger
      // refactor (the gesture flow couples to fetchActivationTime via the
      // returned callback).
      void fetchActivationTime();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cosmicGameContract, offset]);

  return {
    allocationTime,
    timeoutFinalize,
    isClaiming,
    claimHistory,
    activationTime,
    onFinalize,
    fetchActivationTime,
  } as const;
}
