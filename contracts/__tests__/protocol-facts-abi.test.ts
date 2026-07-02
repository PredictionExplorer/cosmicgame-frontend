import type { Abi, AbiFunction } from 'viem';

import * as abis from '../abis';

/**
 * Copy-to-contract binding guard.
 *
 * The FAQ, terms, tooltips, and llms docs describe specific on-chain
 * mechanics. This suite pins the contract surface those explanations rely on:
 * if a regenerated ABI drops or renames one of these members, the copy that
 * references the mechanic must be re-verified, so the test fails loudly.
 */

function functionNames(abi: Abi): Set<string> {
  return new Set(
    abi.filter((item): item is AbiFunction => item.type === 'function').map((item) => item.name),
  );
}

describe('protocol facts <-> ABI binding', () => {
  it('game ABI exposes every configuration getter quoted in explanations', () => {
    const names = functionNames(abis.cosmicGameAbi);
    const quotedGetters = [
      // Allocation-track percentages (25 / 8 / 4 / 6 / 7).
      'mainEthPrizeAmountPercentage',
      'chronoWarriorEthPrizeAmountPercentage',
      'raffleTotalEthPrizeAmountForBiddersPercentage',
      'cosmicSignatureNftStakingTotalEthRewardAmountPercentage',
      'charityEthDonationAmountPercentage',
      // Recognition / outreach CST amounts (1,000 / 3,000).
      'cstPrizeAmount',
      'marketingWalletCstContributionAmount',
      // Stellar Selection counts (3 / 10 / 10).
      'numRaffleEthPrizesForBidders',
      'numRaffleCosmicSignatureNftsForBidders',
      'numRaffleCosmicSignatureNftsForRandomWalkNftStakers',
      // Timing: 48h exclusivity, 1%-per-cycle increment, next-cycle delay.
      'timeoutDurationToClaimMainPrize',
      'mainPrizeTimeIncrementInMicroSeconds',
      'mainPrizeTimeIncrementIncreaseDivisor',
      'initialDurationUntilMainPrizeDivisor',
      'delayDurationBeforeRoundActivation',
      'roundActivationTime',
      // Calibration Window mechanics.
      'ethDutchAuctionDurationDivisor',
      'ethDutchAuctionEndingBidPriceDivisor',
      'ethBidPriceIncreaseDivisor',
      'cstDutchAuctionDuration',
      'cstDutchAuctionDurationChangeDivisor',
      'cstDutchAuctionBeginningBidPriceMinLimit',
      // Dynamic Participation CST formula inputs.
      'bidCstRewardAmountMultiplier',
      'getBidCstRewardAmount',
      // Gesture messages (280 chars).
      'bidMessageLengthMaxLimit',
      // Live cost reads referenced by the calibration explanations.
      'getNextEthBidPrice',
      'getNextCstBidPrice',
      'getEthPlusRandomWalkNftBidPrice',
      'getDurationUntilMainPrize',
    ] as const;
    for (const getter of quotedGetters) {
      expect(names).toContain(getter);
    }
  });

  it('game ABI exposes the open-finalization entry point the FAQ describes', () => {
    // claimMainPrize is callable by anyone after the 48h exclusivity window,
    // and the caller receives the Signature Allocation.
    expect(functionNames(abis.cosmicGameAbi)).toContain('claimMainPrize');
  });

  it('allocations wallet ABI matches the 5-week escrow-timeout explanation', () => {
    const names = functionNames(abis.prizesWalletAbi);
    for (const member of [
      'timeoutDurationToWithdrawPrizes',
      'roundTimeoutTimesToWithdrawPrizes',
      'withdrawEth',
      'claimDonatedToken',
      'claimDonatedNft',
      'mainPrizeBeneficiaryAddresses',
    ]) {
      expect(names).toContain(member);
    }
  });

  it('anchoring wallet ABIs match the once-only and payout-at-release explanations', () => {
    const cst = functionNames(abis.stakingWalletCstAbi);
    // usedNfts backs the "each NFT can be anchored only once" rule.
    expect(cst).toContain('usedNfts');
    // ETH accrues per deposit and is paid out at unstake (anchor release);
    // there is no separate claim function.
    expect(cst).toContain('deposit');
    expect(cst).toContain('unstake');
    expect(cst).toContain('rewardAmountPerStakedNft');

    const rwlk = functionNames(abis.stakingWalletRwlkAbi);
    expect(rwlk).toContain('usedNfts');
    expect(rwlk).toContain('unstake');
    // RandomWalk anchors earn selection eligibility only - no ETH deposit path.
    expect(rwlk.has('deposit')).toBe(false);
    expect(rwlk).toContain('pickRandomStakerAddressesIfPossible');
  });

  it('public goods vault ABI matches the forwarding explanation', () => {
    const names = functionNames(abis.charityWalletAbi);
    // Anyone can forward the vault balance; the owner configures the beneficiary.
    expect(names).toContain('send');
    expect(names).toContain('charityAddress');
    expect(names).toContain('setCharityAddress');
  });

  it('CST token ABI matches the burn-on-CST-gesture and delegation explanations', () => {
    const names = functionNames(abis.cosmicTokenAbi);
    expect(names).toContain('burn');
    // ERC20Votes surface backing "delegate to activate Coordination Weight".
    expect(names).toContain('delegate');
    expect(names).toContain('getVotes');
  });

  it('Cosmic Council ABI matches the published coordination parameters', () => {
    const names = functionNames(abis.cosmicDaoAbi);
    for (const member of ['votingDelay', 'votingPeriod', 'proposalThreshold', 'quorum']) {
      expect(names).toContain(member);
    }
  });
});
