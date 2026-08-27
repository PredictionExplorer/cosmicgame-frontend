/**
 * The single module that spells raw contract ABI names. Everything else in
 * the harness speaks the coined vocabulary (gesture, cycle, allocation,
 * anchoring, imprint) and calls through these wrappers.
 *
 * ABI method-name string literals are preserved per the lexicon's ABI
 * exception and tagged line-by-line, mirroring app code practice
 * (see utils/cosmicGameContractCompat.ts).
 */

import type { Address, Hash, TransactionReceipt } from 'viem';
import { decodeEventLog, parseAbi } from 'viem';

import {
  cosmicGameAbi,
  cosmicTokenAbi,
  cosmicSignatureAbi,
  prizesWalletAbi,
  randomWalkNftAbi,
  stakingWalletCosmicSignatureNftAbi,
  stakingWalletRandomWalkNftAbi,
} from '../../../contracts/generated';

import type { DirectorWalletClient, World } from './world';

/** "No RandomWalk token attached" sentinel for ETH gestures. */
export const NO_RWLK_TOKEN = -1n;

const UNRECOGNIZED_SELECTOR_MARKERS = [
  'function selector was not recognized',
  "there's no fallback function",
  'there is no fallback function',
] as const;

/** Mirrors utils/cosmicGameContractCompat.ts: proxy has no such function. */
function isUnrecognizedSelectorError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const text = [
    err.message,
    (err as Error & { shortMessage?: string }).shortMessage,
    (err as Error & { details?: string }).details,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (UNRECOGNIZED_SELECTOR_MARKERS.some((marker) => text.includes(marker))) return true;
  const cause = (err as Error & { cause?: unknown }).cause;
  return cause !== undefined && isUnrecognizedSelectorError(cause);
}

const sleep = (ms: number) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

async function send(
  world: World,
  wallet: DirectorWalletClient,
  request: {
    address: Address;
    abi:
      | typeof cosmicGameAbi
      | typeof cosmicTokenAbi
      | typeof cosmicSignatureAbi
      | typeof prizesWalletAbi
      | typeof randomWalkNftAbi
      | typeof stakingWalletCosmicSignatureNftAbi
      | typeof stakingWalletRandomWalkNftAbi;
    functionName: string;
    args?: readonly unknown[];
    value?: bigint;
  },
): Promise<TransactionReceipt> {
  // Simulation/estimation can fail transiently while the node's interval
  // miner races a fresh time warp (seed traffic is bursty), so pre-send
  // failures get one retry. Nothing has landed at that point, so a retry is
  // safe; a transaction that mined but reverted is never retried.
  let hash: Hash | undefined;
  for (let attempt = 0; ; attempt++) {
    try {
      const { request: simulated } = await world.publicClient.simulateContract({
        account: wallet.account,
        address: request.address,
        // Simulation picks the overload by argument arity, same as the app does.
        abi: request.abi as never,
        functionName: request.functionName as never,
        args: request.args as never,
        value: request.value,
      });
      // Finalization gas is entropy-dependent (stellar recipients differ per
      // block, cold vs warm account costs), so the exact estimate from the
      // simulation block can starve the mined execution. Pad generously.
      const estimatedGas = await world.publicClient.estimateContractGas({
        account: wallet.account,
        address: request.address,
        abi: request.abi as never,
        functionName: request.functionName as never,
        args: request.args as never,
        value: request.value,
      });
      hash = await wallet.writeContract({
        ...(simulated as Record<string, unknown>),
        gas: (estimatedGas * 3n) / 2n,
      } as never);
      break;
    } catch (err) {
      if (attempt >= 1 || isUnrecognizedSelectorError(err)) throw err;
      await sleep(1_500);
    }
  }
  const receipt = await world.publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== 'success') {
    throw new Error(`${request.functionName} reverted (tx ${hash})`);
  }
  return receipt;
}

// ---------------------------------------------------------------------------
// Game reads
// ---------------------------------------------------------------------------

const game = (world: World) =>
  ({ address: world.addresses.cosmicGame as Address, abi: cosmicGameAbi }) as const;

export async function readCycleIndex(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'roundNum', // lexicon-allow-abi
  })) as bigint;
}

export async function readCycleActivationTime(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'roundActivationTime', // lexicon-allow-abi
  })) as bigint;
}

/** Signed seconds until activation (negative = already active). */
export async function readSecondsUntilActivation(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'getDurationUntilRoundActivation', // lexicon-allow-abi
  })) as bigint;
}

/** Seconds until the cycle can finalize; 0 when finalizable (or no gesture yet). */
export async function readSecondsUntilFinalization(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'getDurationUntilMainPrize', // lexicon-allow-abi
  })) as bigint;
}

export async function readFinalizationTime(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'mainPrizeTime', // lexicon-allow-abi
  })) as bigint;
}

export async function readLastGestureAddress(world: World): Promise<Address> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'lastBidderAddress', // lexicon-allow-abi
  })) as Address;
}

export async function readNextEthGestureCost(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'getNextEthBidPrice', // lexicon-allow-abi
  })) as bigint;
}

export async function readDiscountedEthGestureCost(world: World, base: bigint): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'getEthPlusRandomWalkNftBidPrice', // lexicon-allow-abi
    args: [base],
  })) as bigint;
}

export async function readNextCstGestureCost(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'getNextCstBidPrice', // lexicon-allow-abi
  })) as bigint;
}

/** Seconds added to the finalization time by each gesture. */
export async function readTimeIncrementSeconds(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'getMainPrizeTimeIncrement', // lexicon-allow-abi
  })) as bigint;
}

export async function readInitialCountdownSeconds(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'getInitialDurationUntilMainPrize', // lexicon-allow-abi
  })) as bigint;
}

export async function readFinalizeExclusivitySeconds(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'timeoutDurationToClaimMainPrize', // lexicon-allow-abi
  })) as bigint;
}

export async function readActivationDelaySeconds(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...game(world),
    functionName: 'delayDurationBeforeRoundActivation', // lexicon-allow-abi
  })) as bigint;
}

// ---------------------------------------------------------------------------
// Game writes: gestures, finalization, contributions
// ---------------------------------------------------------------------------

export interface EthGestureArgs {
  message: string;
  /** Total ETH sent; overpay is refunded by the contract. */
  value: bigint;
  /** RandomWalk token id for the discount, or NO_RWLK_TOKEN. */
  rwlkTokenId?: bigint;
}

/**
 * Try the V2 argument shape (extra min-CST-reward arg) first — that is what
 * runs on Arbitrum One and what the harness deploys — and fall back to the
 * V1 shape when a pinned older contracts repo lacks the V2 overload.
 */
async function sendGesture(
  world: World,
  wallet: DirectorWalletClient,
  functionName: string,
  v2Args: readonly unknown[],
  v1Args: readonly unknown[],
  value?: bigint,
): Promise<TransactionReceipt> {
  try {
    return await send(world, wallet, { ...game(world), functionName, args: v2Args, value });
  } catch (err) {
    if (!isUnrecognizedSelectorError(err)) throw err;
    return send(world, wallet, { ...game(world), functionName, args: v1Args, value });
  }
}

export async function writeEthGesture(
  world: World,
  wallet: DirectorWalletClient,
  { message, value, rwlkTokenId = NO_RWLK_TOKEN }: EthGestureArgs,
): Promise<TransactionReceipt> {
  return sendGesture(
    world,
    wallet,
    'bidWithEth', // lexicon-allow-abi
    [rwlkTokenId, message, 0n],
    [rwlkTokenId, message],
    value,
  );
}

export async function writeEthGestureWithNftAttachment(
  world: World,
  wallet: DirectorWalletClient,
  args: EthGestureArgs & { nftAddress: Address; nftId: bigint },
): Promise<TransactionReceipt> {
  const rwlkTokenId = args.rwlkTokenId ?? NO_RWLK_TOKEN;
  return sendGesture(
    world,
    wallet,
    'bidWithEthAndDonateNft', // lexicon-allow-abi
    [rwlkTokenId, args.message, 0n, args.nftAddress, args.nftId],
    [rwlkTokenId, args.message, args.nftAddress, args.nftId],
    args.value,
  );
}

export async function writeEthGestureWithTokenAttachment(
  world: World,
  wallet: DirectorWalletClient,
  args: EthGestureArgs & { tokenAddress: Address; amount: bigint },
): Promise<TransactionReceipt> {
  const rwlkTokenId = args.rwlkTokenId ?? NO_RWLK_TOKEN;
  return sendGesture(
    world,
    wallet,
    'bidWithEthAndDonateToken', // lexicon-allow-abi
    [rwlkTokenId, args.message, 0n, args.tokenAddress, args.amount],
    [rwlkTokenId, args.message, args.tokenAddress, args.amount],
    args.value,
  );
}

export async function writeCstGesture(
  world: World,
  wallet: DirectorWalletClient,
  { message, costMaxLimit }: { message: string; costMaxLimit: bigint },
): Promise<TransactionReceipt> {
  return sendGesture(
    world,
    wallet,
    'bidWithCst', // lexicon-allow-abi
    [costMaxLimit, message, 0n],
    [costMaxLimit, message],
  );
}

export async function writeFinalizeCycle(
  world: World,
  wallet: DirectorWalletClient,
): Promise<TransactionReceipt> {
  return send(world, wallet, {
    ...game(world),
    functionName: 'claimMainPrize', // lexicon-allow-abi
  });
}

export async function writeEthContribution(
  world: World,
  wallet: DirectorWalletClient,
  value: bigint,
): Promise<TransactionReceipt> {
  return send(world, wallet, {
    ...game(world),
    functionName: 'donateEth', // lexicon-allow-abi
    value,
  });
}

// ---------------------------------------------------------------------------
// Owner configuration (only callable while the cycle is inactive)
// ---------------------------------------------------------------------------

/**
 * V2 replaced the CST window's derived divisor with a directly-set duration.
 * The frontend ABI (which never calls owner setters) doesn't carry these two,
 * so they are declared here.
 */
const v2CstWindowSettersAbi = parseAbi([
  'function setCstDutchAuctionDuration(uint256 newValue_)', // lexicon-allow-abi
]);

export interface PaceSetterValues {
  timeIncrementMicros: bigint;
  initialCountdownDivisor: bigint;
  ethWindowDivisor: bigint;
  cstWindowSeconds: bigint;
  cstWindowDivisor: bigint;
  activationDelaySeconds: bigint;
  finalizeExclusivitySeconds: bigint;
  retrievalTimeoutSeconds: bigint;
}

export async function writePaceSetters(world: World, values: PaceSetterValues): Promise<void> {
  const gameCalls: Array<[string, bigint]> = [
    ['setMainPrizeTimeIncrementInMicroSeconds', values.timeIncrementMicros], // lexicon-allow-abi
    ['setInitialDurationUntilMainPrizeDivisor', values.initialCountdownDivisor], // lexicon-allow-abi
    ['setEthDutchAuctionDurationDivisor', values.ethWindowDivisor], // lexicon-allow-abi
    ['setDelayDurationBeforeRoundActivation', values.activationDelaySeconds], // lexicon-allow-abi
    ['setTimeoutDurationToClaimMainPrize', values.finalizeExclusivitySeconds], // lexicon-allow-abi
  ];
  for (const [functionName, value] of gameCalls) {
    await send(world, world.owner, { ...game(world), functionName, args: [value] });
  }

  // CST Calibration Window: V2 sets the duration directly; V1 derives it
  // from the time increment via a divisor.
  try {
    await send(world, world.owner, {
      address: world.addresses.cosmicGame as Address,
      abi: v2CstWindowSettersAbi as never,
      functionName: 'setCstDutchAuctionDuration', // lexicon-allow-abi
      args: [values.cstWindowSeconds],
    });
  } catch (err) {
    if (!isUnrecognizedSelectorError(err)) throw err;
    await send(world, world.owner, {
      ...game(world),
      functionName: 'setCstDutchAuctionDurationDivisor', // lexicon-allow-abi
      args: [values.cstWindowDivisor],
    });
  }

  await send(world, world.owner, {
    address: world.addresses.allocationsWallet as Address,
    abi: prizesWalletAbi,
    functionName: 'setTimeoutDurationToWithdrawPrizes', // lexicon-allow-abi
    args: [values.retrievalTimeoutSeconds],
  });
}

export async function writeCycleActivationTime(world: World, timestamp: bigint): Promise<void> {
  await send(world, world.owner, {
    ...game(world),
    functionName: 'setRoundActivationTime', // lexicon-allow-abi
    args: [timestamp],
  });
}

// ---------------------------------------------------------------------------
// CST token
// ---------------------------------------------------------------------------

export async function readCstBalance(world: World, owner: Address): Promise<bigint> {
  return (await world.publicClient.readContract({
    address: world.addresses.cosmicToken as Address,
    abi: cosmicTokenAbi,
    functionName: 'balanceOf',
    args: [owner],
  })) as bigint;
}

export async function writeCstApproval(
  world: World,
  wallet: DirectorWalletClient,
  spender: Address,
  amount: bigint,
): Promise<TransactionReceipt> {
  return send(world, wallet, {
    address: world.addresses.cosmicToken as Address,
    abi: cosmicTokenAbi,
    functionName: 'approve',
    args: [spender, amount],
  });
}

// ---------------------------------------------------------------------------
// RandomWalk NFTs
// ---------------------------------------------------------------------------

const rwlk = (world: World) =>
  ({ address: world.addresses.randomWalkNft as Address, abi: randomWalkNftAbi }) as const;

export async function readRwlkImprintCost(world: World): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...rwlk(world),
    functionName: 'getMintPrice', // lexicon-allow-abi
  })) as bigint;
}

export async function readRwlkTokensOf(world: World, owner: Address): Promise<readonly bigint[]> {
  return (await world.publicClient.readContract({
    ...rwlk(world),
    functionName: 'walletOfOwner',
    args: [owner],
  })) as readonly bigint[];
}

/** Non-zero once the token's one-time gesture discount has been consumed. */
export async function readRwlkTokenUsed(world: World, tokenId: bigint): Promise<boolean> {
  const used = (await world.publicClient.readContract({
    ...game(world),
    functionName: 'usedRandomWalkNfts', // lexicon-allow-abi
    args: [tokenId],
  })) as bigint;
  return used !== 0n;
}

export async function writeRwlkImprint(
  world: World,
  wallet: DirectorWalletClient,
  value: bigint,
): Promise<TransactionReceipt> {
  return send(world, wallet, {
    ...rwlk(world),
    functionName: 'mint', // lexicon-allow-abi
    value,
  });
}

export async function writeRwlkApprovalForAll(
  world: World,
  wallet: DirectorWalletClient,
  operator: Address,
): Promise<TransactionReceipt> {
  return send(world, wallet, {
    ...rwlk(world),
    functionName: 'setApprovalForAll',
    args: [operator, true],
  });
}

// ---------------------------------------------------------------------------
// Cosmic Signature NFTs + anchoring
// ---------------------------------------------------------------------------

const cosmicNft = (world: World) =>
  ({ address: world.addresses.cosmicSignature as Address, abi: cosmicSignatureAbi }) as const;

export async function readCosmicNftTokensOf(
  world: World,
  owner: Address,
): Promise<readonly bigint[]> {
  const balance = (await world.publicClient.readContract({
    ...cosmicNft(world),
    functionName: 'balanceOf',
    args: [owner],
  })) as bigint;
  const tokens: bigint[] = [];
  for (let i = 0n; i < balance; i++) {
    tokens.push(
      (await world.publicClient.readContract({
        ...cosmicNft(world),
        functionName: 'tokenOfOwnerByIndex',
        args: [owner, i],
      })) as bigint,
    );
  }
  return tokens;
}

export async function writeCosmicNftApprovalForAll(
  world: World,
  wallet: DirectorWalletClient,
  operator: Address,
): Promise<TransactionReceipt> {
  return send(world, wallet, {
    ...cosmicNft(world),
    functionName: 'setApprovalForAll',
    args: [operator, true],
  });
}

/** Anchor a Cosmic Signature NFT; returns the anchor action id for release. */
export async function writeAnchorCosmicNft(
  world: World,
  wallet: DirectorWalletClient,
  tokenId: bigint,
): Promise<bigint> {
  const receipt = await send(world, wallet, {
    address: world.addresses.anchoringCst as Address,
    abi: stakingWalletCosmicSignatureNftAbi,
    functionName: 'stake', // lexicon-allow-abi
    args: [tokenId],
  });
  return anchorActionIdFromReceipt(world, receipt, 'cst');
}

export async function writeReleaseCosmicNft(
  world: World,
  wallet: DirectorWalletClient,
  anchorActionId: bigint,
): Promise<TransactionReceipt> {
  return send(world, wallet, {
    address: world.addresses.anchoringCst as Address,
    abi: stakingWalletCosmicSignatureNftAbi,
    functionName: 'unstake', // lexicon-allow-abi
    args: [anchorActionId],
  });
}

export async function writeAnchorRwlkNft(
  world: World,
  wallet: DirectorWalletClient,
  tokenId: bigint,
): Promise<bigint> {
  const receipt = await send(world, wallet, {
    address: world.addresses.anchoringRwlk as Address,
    abi: stakingWalletRandomWalkNftAbi,
    functionName: 'stake', // lexicon-allow-abi
    args: [tokenId],
  });
  return anchorActionIdFromReceipt(world, receipt, 'rwlk');
}

function anchorActionIdFromReceipt(
  world: World,
  receipt: TransactionReceipt,
  kind: 'cst' | 'rwlk',
): bigint {
  const abi = kind === 'cst' ? stakingWalletCosmicSignatureNftAbi : stakingWalletRandomWalkNftAbi;
  const wallet = kind === 'cst' ? world.addresses.anchoringCst : world.addresses.anchoringRwlk;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== wallet.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({ abi, data: log.data, topics: log.topics });
      if (decoded.eventName === 'NftStaked') {
        // lexicon-allow-abi
        const args = decoded.args as unknown as { stakeActionId?: bigint }; // lexicon-allow-abi
        if (typeof args.stakeActionId === 'bigint') return args.stakeActionId; // lexicon-allow-abi
      }
    } catch {
      // Unrelated log shape — keep scanning.
    }
  }
  throw new Error('Anchor action id not found in receipt logs');
}

// ---------------------------------------------------------------------------
// Allocations escrow (retrievals)
// ---------------------------------------------------------------------------

const escrow = (world: World) =>
  ({ address: world.addresses.allocationsWallet as Address, abi: prizesWalletAbi }) as const;

export async function readEscrowEthAmount(
  world: World,
  cycle: bigint,
  owner: Address,
): Promise<bigint> {
  return (await world.publicClient.readContract({
    ...escrow(world),
    functionName: 'getEthBalanceAmount', // lexicon-allow-abi
    args: [cycle, owner],
  })) as bigint;
}

export async function writeRetrieveEscrowEth(
  world: World,
  wallet: DirectorWalletClient,
  cycle: bigint,
): Promise<TransactionReceipt> {
  return send(world, wallet, {
    ...escrow(world),
    functionName: 'withdrawEth', // lexicon-allow-abi
    args: [cycle],
  });
}

export function allocationsEscrowAddress(world: World): Address {
  return world.addresses.allocationsWallet as Address;
}
