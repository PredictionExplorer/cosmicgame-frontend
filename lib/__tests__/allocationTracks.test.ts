import { deriveAllocationTrackAmounts } from '../allocationTracks';

const fullDashboard = {
  PrizeAmountEth: 1.5,
  CurPrizeAmountEth: 1.2,
  RaffleAmountEth: 0.4,
  StakingAmountEth: 0.6,
  CosmicGameBalanceEth: 10,
  PrizePercentage: 25,
  ChronoWarriorPercentage: 8,
  RafflePercentage: 4,
  StakingPercentage: 6,
  CharityPercentage: 7,
  NumRaffleEthWinnersBidding: 3,
  NumRaffleNFTWinnersBidding: 10,
  NumRaffleNFTWinnersStakingRWalk: 10,
};

describe('deriveAllocationTrackAmounts', () => {
  it('derives every live track amount from the dashboard read', () => {
    const amounts = deriveAllocationTrackAmounts(fullDashboard);

    expect(amounts.signatureEth).toBe(1.5);
    expect(amounts.chronoEth).toBeCloseTo(0.8); // 10 ETH × 8%
    expect(amounts.stellarEth).toBe(0.4);
    expect(amounts.stellarEthEach).toBeCloseTo(0.4 / 3);
    expect(amounts.stellarEthRecipients).toBe(3);
    expect(amounts.stellarNftRecipients).toBe(10);
    expect(amounts.cosmicAnchorEth).toBe(0.6);
    expect(amounts.rwlkAnchorRecipients).toBe(10);
    expect(amounts.publicGoodsEth).toBeCloseTo(0.7); // 10 ETH × 7%
  });

  it('derives the next-cycle rollover from the full live percentage set', () => {
    const amounts = deriveAllocationTrackAmounts(fullDashboard);

    // 100 − (25 + 8 + 4 + 6 + 7) = 50% stays in the reserve.
    expect(amounts.nextCyclePercent).toBe(50);
    expect(amounts.nextCycleEth).toBeCloseTo(5);
  });

  it('reports no rollover when any distribution percentage is missing', () => {
    const amounts = deriveAllocationTrackAmounts({
      ...fullDashboard,
      RafflePercentage: undefined,
    });

    // A partial percentage sum would overstate the rollover — refuse instead.
    expect(amounts.nextCyclePercent).toBeNull();
    expect(amounts.nextCycleEth).toBe(0);
  });

  it('clamps the rollover to zero when reported percentages exceed 100', () => {
    const amounts = deriveAllocationTrackAmounts({
      ...fullDashboard,
      PrizePercentage: 80,
      ChronoWarriorPercentage: 30,
    });

    expect(amounts.nextCyclePercent).toBe(0);
    expect(amounts.nextCycleEth).toBe(0);
  });

  it('falls back to CurPrizeAmountEth when PrizeAmountEth is absent', () => {
    const amounts = deriveAllocationTrackAmounts({
      ...fullDashboard,
      PrizeAmountEth: undefined,
    });

    expect(amounts.signatureEth).toBe(1.2);
  });

  it('never divides by zero when no ETH Stellar recipients are configured', () => {
    const amounts = deriveAllocationTrackAmounts({
      ...fullDashboard,
      NumRaffleEthWinnersBidding: 0,
    });

    expect(amounts.stellarEthEach).toBe(0);
  });

  it('returns all-zero amounts for a null dashboard', () => {
    const amounts = deriveAllocationTrackAmounts(null);

    expect(amounts.signatureEth).toBe(0);
    expect(amounts.chronoEth).toBe(0);
    expect(amounts.stellarEth).toBe(0);
    expect(amounts.cosmicAnchorEth).toBe(0);
    expect(amounts.publicGoodsEth).toBe(0);
    expect(amounts.nextCyclePercent).toBeNull();
    expect(amounts.nextCycleEth).toBe(0);
  });
});
