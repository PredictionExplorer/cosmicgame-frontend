import { useQuery } from '@tanstack/react-query';

import useStellarSelectionWalletContract from '@/hooks/useStellarSelectionWalletContract';

import { uniqueRounds } from './retrieval';

/** Each cycle's retrieval deadline, in Unix seconds, keyed by cycle number. */
export type RetrievalDeadlines = Readonly<Record<number, number>>;

const NO_DEADLINES: RetrievalDeadlines = {};

/**
 * The retrieval deadline of each cycle (PrizesWallet
 * `roundTimeoutTimesToWithdrawPrizes`): until then only the recipient can
 * retrieve that cycle's ETH and attached assets, after it anyone can. One
 * cached query per set of cycles, shared by the summary and the tables; a
 * cycle whose deadline could not be read is simply absent (shown as unknown).
 */
export function useRetrievalDeadlines(rounds: readonly number[]): {
  deadlines: RetrievalDeadlines;
  isLoading: boolean;
} {
  const contract = useStellarSelectionWalletContract();
  const cycles = uniqueRounds(rounds);
  const query = useQuery({
    queryKey: ['retrievalDeadlines', contract?.address ?? null, cycles],
    enabled: contract !== null && cycles.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<RetrievalDeadlines> => {
      const readDeadline = contract?.read.roundTimeoutTimesToWithdrawPrizes;
      if (!readDeadline) return NO_DEADLINES;
      const reads = await Promise.allSettled(cycles.map((cycle) => readDeadline([BigInt(cycle)])));
      const deadlines: Record<number, number> = {};
      reads.forEach((read, index) => {
        const seconds = read.status === 'fulfilled' ? Number(read.value) : Number.NaN;
        const cycle = cycles[index];
        if (cycle !== undefined && Number.isFinite(seconds) && seconds > 0) {
          deadlines[cycle] = seconds;
        }
      });
      return deadlines;
    },
  });
  return { deadlines: query.data ?? NO_DEADLINES, isLoading: query.isLoading };
}
