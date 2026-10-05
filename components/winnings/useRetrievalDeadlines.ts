import { useQuery } from '@tanstack/react-query';

import useStellarSelectionWalletContract, {
  useStellarSelectionWalletContractFactory,
} from '@/hooks/useStellarSelectionWalletContract';
import { uniqueRounds } from '@/utils/allocationRetrieval';

/** Each cycle's retrieval deadline, in Unix seconds, keyed by cycle number. */
export type RetrievalDeadlines = Readonly<Record<number, number>>;

const NO_DEADLINES: RetrievalDeadlines = {};

/**
 * The retrieval deadline of each cycle (PrizesWallet
 * `roundTimeoutTimesToWithdrawPrizes`): until then only the recipient can
 * retrieve that cycle's ETH and attached assets, after it anyone can. One
 * cached query per set of cycles, shared by the summary and the tables; a
 * cycle whose deadline could not be read is simply absent (shown as unknown).
 *
 * A cycle's deadline lives on the stellar-selection wallet holding its
 * items. `walletByRound` names that wallet for cycles held by a superseded
 * wallet (the game can be pointed at a replacement; the superseded wallet
 * only knows its own cycles); cycles without an entry read from the
 * currently configured wallet.
 */
export function useRetrievalDeadlines(
  rounds: readonly number[],
  walletByRound?: Readonly<Record<number, string>>,
): {
  deadlines: RetrievalDeadlines;
  isLoading: boolean;
} {
  const contract = useStellarSelectionWalletContract();
  const getWalletContract = useStellarSelectionWalletContractFactory();
  const cycles = uniqueRounds(rounds);
  // Part of the query key, so a wallet reassignment refetches.
  const assignments = cycles.map((cycle) => walletByRound?.[cycle]?.toLowerCase() ?? null);
  const query = useQuery({
    queryKey: ['retrievalDeadlines', contract?.address ?? null, cycles, assignments],
    enabled: contract !== null && cycles.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<RetrievalDeadlines> => {
      const reads = await Promise.allSettled(
        cycles.map((cycle) => {
          const holding = walletByRound?.[cycle];
          const target = holding ? getWalletContract(holding) : contract;
          const readDeadline = target?.read.roundTimeoutTimesToWithdrawPrizes;
          if (!readDeadline) return Promise.reject(new Error('wallet contract unavailable'));
          return readDeadline([BigInt(cycle)]);
        }),
      );
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
