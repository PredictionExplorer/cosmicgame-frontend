import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePublicClient } from 'wagmi';
import { useRouter } from 'next/navigation';

import api from '@/services/api';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import type { DashboardInfo } from '@/services/api/types';
import { isUserRejection, reportError, WALLET_TRANSACTION_CANCELLED_MESSAGE } from '@/utils/errors';
import { getContractErrorMessage } from '@/utils/contractErrors';
import { asWriteFn } from '@/utils/contractWrite';
import { useNotify } from '@/hooks/useNotify';
import { useAllocationTime, useCurrentTime, useClaimHistory } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';

const GAS_EXTRA = BigInt(1_000_000);
const GAS_FLOOR = BigInt(2_000_000);

interface UseAllocationFinalizeOptions {
  data: DashboardInfo | null;
  offset: number;
}

export function useAllocationFinalize({ data, offset }: UseAllocationFinalizeOptions) {
  const router = useRouter();
  const publicClient = usePublicClient();
  const cosmicGameContract = useCosmicGameContract();
  const { notify, notifyErrorFromEthers } = useNotify();

  const { data: prizeTimeRaw } = useAllocationTime();
  const { data: currentTimeRaw } = useCurrentTime();
  const { data: claimHistoryRaw } = useClaimHistory();
  const now = useNow(1000);

  const allocationTime = useMemo(() => {
    if (prizeTimeRaw == null || currentTimeRaw == null) return 0;
    const diff = currentTimeRaw * 1000 - now;
    return prizeTimeRaw * 1000 - diff;
  }, [prizeTimeRaw, currentTimeRaw, now]);

  const claimHistory =
    (claimHistoryRaw as
      | import('@/components/tables/RecipientHistoryTable').WinningHistoryEntry[]
      | null) ?? null;

  const [timeoutFinalize, setTimeoutClaimPrize] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [activationTime, setActivationTime] = useState(0);

  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);
  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  /**
   * Claim the Signature Allocation for the current cycle.
   * Returns `true` on a successfully mined transaction so the caller can
   * trigger a post-tx refresh. Returns `false` on wallet-not-connected,
   * user rejection, tx failure, or concurrent double-submit attempt.
   */
  const onFinalize = async (): Promise<boolean> => {
    if (inFlightRef.current) return false;
    if (!cosmicGameContract) {
      notify('error', 'Please connect your wallet and ensure you are on the correct network.');
      return false;
    }
    if (!publicClient) {
      notify('error', 'Network unavailable — please reconnect your wallet.');
      return false;
    }

    inFlightRef.current = true;
    setIsClaiming(true);
    try {
      const roundBefore = (await cosmicGameContract.read.roundNum?.()) as bigint;

      let gasLimit = GAS_FLOOR;
      try {
        const estimate = await cosmicGameContract.estimateGas.claimMainPrize?.({});
        if (estimate) gasLimit = estimate + GAS_EXTRA;
      } catch (estimateErr) {
        reportError(estimateErr, 'finalize-cycle-gas-estimate');
      }

      const hash = await asWriteFn(cosmicGameContract.write.claimMainPrize)({ gas: gasLimit });
      await publicClient.waitForTransactionReceipt({ hash });

      const roundAfter = (await cosmicGameContract.read.roundNum?.()) as bigint;
      if (roundAfter <= roundBefore) {
        notify(
          'warning',
          'Claim transaction succeeded but the cycle did not advance. Please refresh the page.',
        );
        return true;
      }

      const claimedRound = data?.CurRoundNum ?? Number(roundBefore);

      let count = (data?.NumRaffleNFTWinnersBidding ?? 0) + 3;
      if ((data?.MainStats?.StakeStatisticsRWalk?.TotalTokensStaked ?? 0) > 0) {
        count += data?.NumRaffleNFTWinnersStakingRWalk ?? 0;
      }

      try {
        await api.create(Number(roundBefore), count);
      } catch (apiErr) {
        reportError(apiErr, 'post-claim-api');
        notify(
          'warning',
          'Cycle finalized on-chain. Token metadata may still be updating — check My Allocations or refresh later.',
        );
      }

      const params = new URLSearchParams();
      params.set('cycle', String(claimedRound));
      params.set('message', 'success');
      router.push(`/allocation-finalized?${params.toString()}`);

      return true;
    } catch (err: unknown) {
      if (isUserRejection(err)) {
        notify('info', WALLET_TRANSACTION_CANCELLED_MESSAGE);
        return false;
      }
      reportError(err, 'finalize-cycle');
      const msg = getContractErrorMessage(err);
      if (msg) {
        notify('error', msg);
      } else {
        notifyErrorFromEthers(err);
      }
      return false;
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setIsClaiming(false);
    }
  };

  const fetchActivationTime = useCallback(async () => {
    if (!cosmicGameContract) return;
    const time = await cosmicGameContract.read.roundActivationTime?.();
    setActivationTime(Number(time ?? 0) - offset / 1000);
  }, [cosmicGameContract, offset]);

  useEffect(() => {
    const fetchTimeoutFinalize = async () => {
      if (!cosmicGameContract) return;
      const timeout = await cosmicGameContract.read.timeoutDurationToClaimMainPrize?.();
      setTimeoutClaimPrize(Number(timeout ?? 0));
    };

    if (cosmicGameContract) {
      fetchTimeoutFinalize();
      // Setting activation time state from a one-shot async contract read.
      // Migrating to React Query would be cleaner long-term but is a larger
      // refactor (the gesture flow couples to fetchActivationTime via the
      // returned callback).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchActivationTime();
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
