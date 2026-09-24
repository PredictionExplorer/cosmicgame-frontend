import { toFiniteNumber } from '@/utils/finiteNumber';
import type { DashboardInfo } from '@/services/api/types';

/**
 * The Allocations Wallet's ETH on the dashboard, grouped so that a retrieved
 * figure always sits beside a deposit of the same scope.
 *
 * The wallet holds two ETH tracks until each recipient retrieves them:
 * Stellar Selection ETH (`TotalRaffleEthDeposits`) and Chrono-Warrior ETH
 * (`TotalChronoWarriorEthDeposits`, a field the typed shape leaves out).
 * `TotalRaffleEthWithdrawn` counts every retrieval from the wallet, both
 * tracks together, so it is only comparable with their sum: set beside the
 * Stellar Selection deposits alone it read as more ETH retrieved than
 * deposited (8.2731 against 2.7577 on the live dashboard).
 */
export interface AllocationsWalletEth {
  /** Stellar Selection ETH deposited into the wallet, or null when unread. */
  stellarDeposited: number | null;
  /** Chrono-Warrior ETH deposited into the wallet, or null when unread. */
  chronoDeposited: number | null;
  /** Both tracks' deposits, or null when either is unread. */
  deposited: number | null;
  /** ETH retrieved from the wallet across both tracks, or null when unread. */
  retrieved: number | null;
}

type MainStatsWire = DashboardInfo['MainStats'] & { TotalChronoWarriorEthDeposits?: unknown };

export function allocationsWalletEth(main: DashboardInfo['MainStats']): AllocationsWalletEth {
  const wire = main as MainStatsWire;
  const stellarDeposited = toFiniteNumber(wire.TotalRaffleEthDeposits);
  const chronoDeposited = toFiniteNumber(wire.TotalChronoWarriorEthDeposits);
  return {
    stellarDeposited,
    chronoDeposited,
    deposited:
      stellarDeposited === null || chronoDeposited === null
        ? null
        : stellarDeposited + chronoDeposited,
    retrieved: toFiniteNumber(wire.TotalRaffleEthWithdrawn),
  };
}
