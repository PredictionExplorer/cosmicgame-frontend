import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { useRouter } from 'next/navigation';

import api from '@/services/api';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import useCosmicSignatureContract from '@/hooks/useCosmicSignatureContract';
import type { DashboardInfo } from '@/services/api/types';
import { isUserRejection, reportError } from '@/utils/errors';
import { useNotify } from '@/hooks/useNotify';

const GAS_FLOOR = BigInt(2_000_000);
const GAS_BUFFER_BPS = BigInt(12_000);

interface UsePrizeClaimOptions {
  data: DashboardInfo | null;
  offset: number;
}

export function usePrizeClaim({ data, offset }: UsePrizeClaimOptions) {
  const router = useRouter();
  const publicClient = usePublicClient();
  const cosmicGameContract = useCosmicGameContract();
  const cosmicSignatureContract = useCosmicSignatureContract();
  const { notify, notifyErrorFromEthers } = useNotify();

  const [prizeTime, setPrizeTime] = useState(0);
  const [timeoutClaimPrize, setTimeoutClaimPrize] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimHistory, setClaimHistory] = useState<
    import('@/components/tables/WinningHistoryTable').WinningHistoryEntry[] | null
  >(null);
  const [activationTime, setActivationTime] = useState(0);

  const handleTx = async (hashPromise: Promise<`0x${string}`>) => {
    const hash = await hashPromise;
    await publicClient!.waitForTransactionReceipt({ hash });
  };

  const minGasWithBuffer = (estimate: bigint) => {
    const buffered = (estimate * GAS_BUFFER_BPS) / BigInt(10_000);
    return buffered > GAS_FLOOR ? buffered : GAS_FLOOR;
  };

  /**
   * Claim the main prize.
   * Returns `true` on success so the caller can trigger a post-tx refresh.
   */
  const onClaimPrize = async (): Promise<boolean> => {
    setIsClaiming(true);
    try {
      if (!cosmicGameContract) {
        notify('error', 'Please connect your wallet and ensure you are on the correct network.');
        return false;
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
        return false;
      }
      const totalSupply = await cosmicSignatureContract.read.totalSupply?.();
      const tokenId = Number(totalSupply ?? 0) - 1;

      let count = (data?.NumRaffleNFTWinnersBidding ?? 0) + 3;
      if ((data?.MainStats?.StakeStatisticsRWalk?.TotalTokensStaked ?? 0) > 0) {
        count += data?.NumRaffleNFTWinnersStakingRWalk ?? 0;
      }

      await api.create(tokenId, count);
      const params = new URLSearchParams();
      params.set('round', String(data?.CurRoundNum ?? ''));
      params.set('message', 'success');
      router.push(`/prize-claimed?${params.toString()}`);

      return true;
    } catch (err: unknown) {
      if (isUserRejection(err)) {
        return false;
      }
      notifyErrorFromEthers(err);
      return false;
    } finally {
      setIsClaiming(false);
    }
  };

  const fetchPrizeTime = useCallback(async () => {
    try {
      const t = await api.get_prize_time();
      const current = await api.get_current_time();
      const diff = current * 1000 - Date.now();
      setPrizeTime(t * 1000 - diff);
    } catch (err) {
      reportError(err, 'fetch prize time');
    }
  }, []);

  const fetchClaimHistory = useCallback(async () => {
    try {
      const history = await api.get_claim_history();
      setClaimHistory(
        history as unknown as import('@/components/tables/WinningHistoryTable').WinningHistoryEntry[],
      );
    } catch (err) {
      reportError(err, 'fetch claim history');
    }
  }, []);

  const fetchActivationTime = useCallback(async () => {
    if (!cosmicGameContract) return;
    const time = await cosmicGameContract.read.roundActivationTime?.();
    setActivationTime(Number(time ?? 0) - offset / 1000);
  }, [cosmicGameContract, offset]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cosmicGameContract, offset]);

  return {
    prizeTime,
    timeoutClaimPrize,
    isClaiming,
    claimHistory,
    activationTime,
    onClaimPrize,
    fetchPrizeTime,
    fetchClaimHistory,
    fetchActivationTime,
  } as const;
}
