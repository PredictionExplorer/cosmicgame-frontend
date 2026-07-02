#!/usr/bin/env tsx
/**
 * Live-chain drift audit for `content/protocol-facts.ts`.
 *
 * Reads the deployed Cosmic Signature contracts on Arbitrum One and compares
 * every verifiable fact against the values the frontend copy quotes. Run it
 * whenever contract parameters may have changed (upgrades, owner
 * reconfiguration, or a suspicious support report):
 *
 *   npx tsx scripts/audit-protocol-facts.ts
 *   RPC_URL=https://arb1.arbitrum.io/rpc npx tsx scripts/audit-protocol-facts.ts
 *
 * Exit code 0 = no drift; 1 = at least one mismatch (printed as DRIFT rows).
 * Informational rows (INFO) are values expected to move on their own, such as
 * the live time increment, and never fail the audit.
 */

import { createPublicClient, http, parseAbi, formatEther, type Abi } from 'viem';
import { arbitrum } from 'viem/chains';

import { protocolFacts } from '../content/protocol-facts';

const RPC_URL =
  process.env.RPC_URL ?? process.env.NEXT_PUBLIC_RPC_URL ?? 'https://arb1.arbitrum.io/rpc';

const client = createPublicClient({ chain: arbitrum, transport: http(RPC_URL) });

// lexicon-allow-start: verbatim on-chain ABI method names (sealed contract surface, cannot be renamed)
const gameAbi = parseAbi([
  'function mainEthPrizeAmountPercentage() view returns (uint256)',
  'function chronoWarriorEthPrizeAmountPercentage() view returns (uint256)',
  'function raffleTotalEthPrizeAmountForBiddersPercentage() view returns (uint256)',
  'function cosmicSignatureNftStakingTotalEthRewardAmountPercentage() view returns (uint256)',
  'function charityEthDonationAmountPercentage() view returns (uint256)',
  'function cstPrizeAmount() view returns (uint256)',
  'function marketingWalletCstContributionAmount() view returns (uint256)',
  'function numRaffleEthPrizesForBidders() view returns (uint256)',
  'function numRaffleCosmicSignatureNftsForBidders() view returns (uint256)',
  'function numRaffleCosmicSignatureNftsForRandomWalkNftStakers() view returns (uint256)',
  'function timeoutDurationToClaimMainPrize() view returns (uint256)',
  'function mainPrizeTimeIncrementInMicroSeconds() view returns (uint256)',
  'function mainPrizeTimeIncrementIncreaseDivisor() view returns (uint256)',
  'function ethBidPriceIncreaseDivisor() view returns (uint256)',
  'function ethDutchAuctionEndingBidPriceDivisor() view returns (uint256)',
  'function cstDutchAuctionDurationChangeDivisor() view returns (uint256)',
  'function cstDutchAuctionBeginningBidPriceMinLimit() view returns (uint256)',
  'function bidMessageLengthMaxLimit() view returns (uint256)',
  'function delayDurationBeforeRoundActivation() view returns (uint256)',
  'function roundNum() view returns (uint256)',
  'function token() view returns (address)',
  'function nft() view returns (address)',
  'function randomWalkNft() view returns (address)',
  'function prizesWallet() view returns (address)',
  'function stakingWalletCosmicSignatureNft() view returns (address)',
  'function stakingWalletRandomWalkNft() view returns (address)',
  'function marketingWallet() view returns (address)',
  'function charityAddress() view returns (address)',
]);

const allocationsWalletAbi = parseAbi([
  'function timeoutDurationToWithdrawPrizes() view returns (uint256)',
]);

const daoAbi = parseAbi([
  'function votingDelay() view returns (uint256)',
  'function votingPeriod() view returns (uint256)',
  'function proposalThreshold() view returns (uint256)',
  'function quorumNumerator() view returns (uint256)',
]);
// lexicon-allow-end

interface Row {
  status: 'OK' | 'DRIFT' | 'INFO';
  fact: string;
  expected: string;
  live: string;
}

const rows: Row[] = [];

function check(fact: string, expected: string | number | bigint, live: string | number | bigint) {
  const same = String(expected).toLowerCase() === String(live).toLowerCase();
  rows.push({
    status: same ? 'OK' : 'DRIFT',
    fact,
    expected: String(expected),
    live: String(live),
  });
}

function info(fact: string, note: string, live: string | number | bigint) {
  rows.push({ status: 'INFO', fact, expected: note, live: String(live) });
}

async function main(): Promise<void> {
  const game = protocolFacts.contractAddresses.proxy as `0x${string}`;

  // EIP-1967 implementation slot.
  const implementationSlot = await client.getStorageAt({
    address: game,
    slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
  });
  check(
    'contractAddresses.implementation',
    protocolFacts.contractAddresses.implementation.toLowerCase(),
    `0x${(implementationSlot ?? '0x').slice(-40)}`,
  );

  const read = <T>(
    functionName: string,
    abi: Abi = gameAbi as Abi,
    address: `0x${string}` = game,
  ) => client.readContract({ address, abi, functionName }) as Promise<T>;

  const [
    mainPercent,
    chronoPercent,
    stellarPercent,
    anchorPercent,
    publicGoodsPercent,
    cstPrizeWei,
    outreachWei,
    ethSelections,
    nftSelections,
    rwlkSelections,
    claimTimeout,
    incrementMicroseconds,
    incrementDivisor,
    ethStepDivisor,
    ethFloorDivisor,
    cstWindowDivisor,
    cstCeilingMinWei,
    messageMax,
    nextCycleDelay,
    roundNum,
  ] = await Promise.all([
    read<bigint>('mainEthPrizeAmountPercentage'),
    read<bigint>('chronoWarriorEthPrizeAmountPercentage'),
    read<bigint>('raffleTotalEthPrizeAmountForBiddersPercentage'),
    read<bigint>('cosmicSignatureNftStakingTotalEthRewardAmountPercentage'),
    read<bigint>('charityEthDonationAmountPercentage'),
    read<bigint>('cstPrizeAmount'),
    read<bigint>('marketingWalletCstContributionAmount'),
    read<bigint>('numRaffleEthPrizesForBidders'),
    read<bigint>('numRaffleCosmicSignatureNftsForBidders'),
    read<bigint>('numRaffleCosmicSignatureNftsForRandomWalkNftStakers'),
    read<bigint>('timeoutDurationToClaimMainPrize'),
    read<bigint>('mainPrizeTimeIncrementInMicroSeconds'),
    read<bigint>('mainPrizeTimeIncrementIncreaseDivisor'),
    read<bigint>('ethBidPriceIncreaseDivisor'),
    read<bigint>('ethDutchAuctionEndingBidPriceDivisor'),
    read<bigint>('cstDutchAuctionDurationChangeDivisor'),
    read<bigint>('cstDutchAuctionBeginningBidPriceMinLimit'),
    read<bigint>('bidMessageLengthMaxLimit'),
    read<bigint>('delayDurationBeforeRoundActivation'),
    read<bigint>('roundNum'),
  ]);

  check('mainEthPercentage', protocolFacts.mainEthPercentage, mainPercent);
  check('chronoWarriorEthPercentage', protocolFacts.chronoWarriorEthPercentage, chronoPercent);
  check(
    'stellarSelectionEthPercentage',
    protocolFacts.stellarSelectionEthPercentage,
    stellarPercent,
  );
  check('anchorDistributionPercentage', protocolFacts.anchorDistributionPercentage, anchorPercent);
  check('publicGoodsPercentage', protocolFacts.publicGoodsPercentage, publicGoodsPercent);
  check('specialAllocationCst', protocolFacts.specialAllocationCst, formatEther(cstPrizeWei));
  check('outreachReserveCst', protocolFacts.outreachReserveCst, formatEther(outreachWei));
  check(
    'ethStellarSelectionRecipients',
    protocolFacts.ethStellarSelectionRecipients,
    ethSelections,
  );
  check(
    'nftStellarSelectionRecipients',
    protocolFacts.nftStellarSelectionRecipients,
    nftSelections,
  );
  check(
    'anchoredRwlkNftSelectionRecipients',
    protocolFacts.anchoredRwlkNftSelectionRecipients,
    rwlkSelections,
  );
  check(
    'finalGestureExclusivityHours',
    protocolFacts.finalGestureExclusivityHours,
    claimTimeout / 3600n,
  );
  check(
    'cycleTimeIncrementIncreasePercentPerCycle (100/divisor)',
    protocolFacts.cycleTimeIncrementIncreasePercentPerCycle,
    100n / incrementDivisor,
  );
  check(
    'ethGestureCostStepUpPercent (100/divisor)',
    protocolFacts.ethGestureCostStepUpPercent,
    100n / ethStepDivisor,
  );
  check('ethCalibrationFloorDivisor', protocolFacts.ethCalibrationFloorDivisor, ethFloorDivisor);
  check(
    'cstCalibrationWindowChangeDivisor',
    protocolFacts.cstCalibrationWindowChangeDivisor,
    cstWindowDivisor,
  );
  check(
    'cstCalibrationCeilingMinCst',
    protocolFacts.cstCalibrationCeilingMinCst,
    formatEther(cstCeilingMinWei),
  );
  check('gestureMessageMaxLength', protocolFacts.gestureMessageMaxLength, messageMax);

  const [token, nft, randomWalk, prizesWallet, stakingCst, stakingRwlk, marketing, charity] =
    await Promise.all([
      read<string>('token'),
      read<string>('nft'),
      read<string>('randomWalkNft'),
      read<string>('prizesWallet'),
      read<string>('stakingWalletCosmicSignatureNft'),
      read<string>('stakingWalletRandomWalkNft'),
      read<string>('marketingWallet'),
      read<string>('charityAddress'),
    ]);
  check('contractAddresses.cstToken', protocolFacts.contractAddresses.cstToken, token);
  check(
    'contractAddresses.cosmicSignatureNft',
    protocolFacts.contractAddresses.cosmicSignatureNft,
    nft,
  );
  check(
    'contractAddresses.randomWalkNft',
    protocolFacts.contractAddresses.randomWalkNft,
    randomWalk,
  );
  check(
    'contractAddresses.allocationsWallet',
    protocolFacts.contractAddresses.allocationsWallet,
    prizesWallet,
  );
  check(
    'contractAddresses.cosmicSignatureNftAnchoringWallet',
    protocolFacts.contractAddresses.cosmicSignatureNftAnchoringWallet,
    stakingCst,
  );
  check(
    'contractAddresses.rwlkAnchoringWallet',
    protocolFacts.contractAddresses.rwlkAnchoringWallet,
    stakingRwlk,
  );
  check(
    'contractAddresses.outreachReserve',
    protocolFacts.contractAddresses.outreachReserve,
    marketing,
  );
  check(
    'contractAddresses.publicGoodsVault',
    protocolFacts.contractAddresses.publicGoodsVault,
    charity,
  );

  const withdrawTimeout = await read<bigint>(
    'timeoutDurationToWithdrawPrizes', // lexicon-allow-abi
    allocationsWalletAbi,
    protocolFacts.contractAddresses.allocationsWallet as `0x${string}`,
  );
  check(
    'secondaryRetrievalTimeoutWeeks',
    protocolFacts.secondaryRetrievalTimeoutWeeks,
    withdrawTimeout / (7n * 24n * 3600n),
  );

  const dao = protocolFacts.contractAddresses.cosmicCouncil as `0x${string}`;
  const [votingDelay, votingPeriod, threshold, quorum] = await Promise.all([
    read<bigint>('votingDelay', daoAbi, dao),
    read<bigint>('votingPeriod', daoAbi, dao),
    read<bigint>('proposalThreshold', daoAbi, dao),
    read<bigint>('quorumNumerator', daoAbi, dao),
  ]);
  check('councilVotingDelayDays', protocolFacts.councilVotingDelayDays, votingDelay / 86_400n);
  check(
    'councilVotingPeriodWeeks',
    protocolFacts.councilVotingPeriodWeeks,
    votingPeriod / (7n * 24n * 3600n),
  );
  check(
    'councilProposalThresholdCst',
    protocolFacts.councilProposalThresholdCst,
    formatEther(threshold),
  );
  check('councilQuorumPercent', protocolFacts.councilQuorumPercent, quorum);

  // Values that move on their own or are owner-tuned; report but never fail.
  info('roundNum', 'live cycle number', roundNum);
  info(
    'mainPrizeTimeIncrement (hours)',
    'starts at 1h, grows 1%/cycle',
    `${Number(incrementMicroseconds) / 3_600_000_000}`,
  );
  info(
    'delayDurationBeforeRoundActivation (hours)',
    `Solidity default ${protocolFacts.defaultNextCycleDelayMinutes} min; owner-set`,
    `${Number(nextCycleDelay) / 3600}`,
  );

  const width = Math.max(...rows.map((row) => row.fact.length));
  let drift = 0;
  for (const row of rows) {
    if (row.status === 'DRIFT') drift += 1;
    const icon =
      row.status === 'OK' ? '\u2705' : row.status === 'INFO' ? '\u2139\ufe0f ' : '\u274c';
    // eslint-disable-next-line no-console -- CLI tool output
    console.log(`${icon} ${row.fact.padEnd(width)}  expected: ${row.expected}  live: ${row.live}`);
  }
  // eslint-disable-next-line no-console -- CLI tool output
  console.log(drift === 0 ? '\nNo drift detected.' : `\n${drift} fact(s) drifted from chain.`);
  if (drift > 0) process.exit(1);
}

main().catch((error: unknown) => {
  console.error('audit-protocol-facts failed:', error);
  process.exit(1);
});
