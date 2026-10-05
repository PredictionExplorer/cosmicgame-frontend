import { allocationsWalletEth } from '../allocationsWallet';
import { createDashboardInfo } from '../test-support/statisticsTestFixtures';

type MainStats = ReturnType<typeof createDashboardInfo>['MainStats'];

const mainStats = (overrides: Record<string, unknown>): MainStats =>
  ({ ...createDashboardInfo().MainStats, ...overrides }) as MainStats;

describe('allocationsWalletEth', () => {
  it('never puts a retrieved figure beside a smaller deposit of another scope', () => {
    // The live dashboard: every retrieval from the wallet (8.2731) against the Stellar
    // Selection deposits alone (2.7577) read as more ETH retrieved than deposited.
    const wallet = allocationsWalletEth(
      mainStats({
        TotalRaffleEthDeposits: 2.757712095479994,
        TotalChronoWarriorEthDeposits: 5.515424190959988,
        TotalRaffleEthWithdrawn: 8.273136286439982,
      }),
    );
    expect(wallet.stellarDeposited).toBeCloseTo(2.7577, 4);
    expect(wallet.chronoDeposited).toBeCloseTo(5.5154, 4);
    // What left the wallet is within what both tracks put in.
    expect(wallet.retrieved!).toBeLessThanOrEqual(
      wallet.stellarDeposited! + wallet.chronoDeposited! + 1e-9,
    );
  });

  it('leaves the Chrono-Warrior deposit unknown when its field is missing', () => {
    const wallet = allocationsWalletEth(
      mainStats({
        TotalRaffleEthDeposits: 1,
        TotalChronoWarriorEthDeposits: undefined,
        TotalRaffleEthWithdrawn: 3,
      }),
    );
    expect(wallet.stellarDeposited).toBe(1);
    expect(wallet.chronoDeposited).toBeNull();
    expect(wallet.retrieved).toBe(3);
  });
});
