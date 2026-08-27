/**
 * Persona-level game actions. Each action is a small, guarded unit — read the
 * relevant on-chain state, act, confirm — so scenarios can compose them
 * without re-implementing protocol rules.
 */

import { parseEther, zeroAddress, type Address } from 'viem';

import { createLogger, type PrefixLogger } from '../log';

import {
  readCstBalance,
  readDiscountedEthGestureCost,
  readEscrowEthAmount,
  readLastGestureAddress,
  readNextCstGestureCost,
  readNextEthGestureCost,
  readRwlkImprintCost,
  readRwlkTokensOf,
  readRwlkTokenUsed,
  readCosmicNftTokensOf,
  readSecondsUntilFinalization,
  writeAnchorCosmicNft,
  writeAnchorRwlkNft,
  writeCosmicNftApprovalForAll,
  writeCstApproval,
  writeCstGesture,
  writeEthContribution,
  writeEthGesture,
  writeEthGestureWithNftAttachment,
  writeEthGestureWithTokenAttachment,
  writeFinalizeCycle,
  writeReleaseCosmicNft,
  writeRetrieveEscrowEth,
  writeRwlkApprovalForAll,
  writeRwlkImprint,
  allocationsEscrowAddress,
} from './abiCalls';
import { GESTURE_MESSAGES } from './messages';
import { pickOne } from './personas';
import type { Persona, World } from './world';

const log: PrefixLogger = createLogger('director');

/** Approval bookkeeping so repeat actions don't spam approval transactions. */
const grantedOperatorApprovals = new Set<string>();

function approvalKey(owner: Address, operator: Address, asset: string): string {
  return `${asset}:${owner.toLowerCase()}:${operator.toLowerCase()}`;
}

export type GestureKind = 'eth' | 'cst' | 'rwlk';

export interface GestureResult {
  kind: GestureKind;
  persona: Persona;
  message: string;
  txHash: `0x${string}`;
}

function chooseMessage(world: World, persona: Persona, explicit?: string): string {
  if (explicit !== undefined) return explicit;
  if (world.rng() > persona.style.chattiness) return '';
  return pickOne(world.rng, GESTURE_MESSAGES);
}

/** Value headroom over the read cost: covers one +1% step race; overpay refunds. */
function withHeadroom(cost: bigint): bigint {
  return cost + cost / 50n + 1n;
}

export async function performEthGesture(
  world: World,
  persona: Persona,
  options: { message?: string } = {},
): Promise<GestureResult> {
  const message = chooseMessage(world, persona, options.message);
  const cost = await readNextEthGestureCost(world);
  const receipt = await writeEthGesture(world, persona.wallet, {
    message,
    value: withHeadroom(cost),
  });
  log.info(`${persona.name} made an ETH gesture (${message || 'no message'})`);
  return { kind: 'eth', persona, message, txHash: receipt.transactionHash };
}

/** Imprint (or reuse) a RandomWalk token whose one-time discount is unspent. */
export async function ensureSpareRwlkToken(world: World, persona: Persona): Promise<bigint> {
  const owned = await readRwlkTokensOf(world, persona.address);
  for (const tokenId of owned) {
    if (!(await readRwlkTokenUsed(world, tokenId))) return tokenId;
  }
  const cost = await readRwlkImprintCost(world);
  const receipt = await writeRwlkImprint(world, persona.wallet, withHeadroom(cost));
  const after = await readRwlkTokensOf(world, persona.address);
  const fresh = after[after.length - 1];
  if (fresh === undefined) {
    throw new Error(
      `RandomWalk imprint succeeded but no token found (tx ${receipt.transactionHash})`,
    );
  }
  log.info(`${persona.name} imprinted RandomWalk token #${fresh}`);
  return fresh;
}

export async function performRwlkGesture(
  world: World,
  persona: Persona,
  options: { message?: string } = {},
): Promise<GestureResult> {
  const tokenId = await ensureSpareRwlkToken(world, persona);
  const message = chooseMessage(world, persona, options.message);
  const base = await readNextEthGestureCost(world);
  const discounted = await readDiscountedEthGestureCost(world, base);
  const receipt = await writeEthGesture(world, persona.wallet, {
    message,
    value: withHeadroom(discounted),
    rwlkTokenId: tokenId,
  });
  log.info(`${persona.name} made a RandomWalk-discount gesture with token #${tokenId}`);
  return { kind: 'rwlk', persona, message, txHash: receipt.transactionHash };
}

/** CST gesture; returns null when the persona cannot afford the current cost. */
export async function performCstGesture(
  world: World,
  persona: Persona,
  options: { message?: string } = {},
): Promise<GestureResult | null> {
  const [cost, balance] = await Promise.all([
    readNextCstGestureCost(world),
    readCstBalance(world, persona.address),
  ]);
  if (balance < cost) return null;
  const message = chooseMessage(world, persona, options.message);
  const costMaxLimit = cost * 2n + 1n;
  const receipt = await writeCstGesture(world, persona.wallet, { message, costMaxLimit });
  log.info(`${persona.name} made a CST gesture`);
  return { kind: 'cst', persona, message, txHash: receipt.transactionHash };
}

/** ETH gesture that attaches CST (as the ERC-20) to the cycle's escrow. */
export async function performGestureWithTokenAttachment(
  world: World,
  persona: Persona,
  options: { message?: string } = {},
): Promise<GestureResult | null> {
  const balance = await readCstBalance(world, persona.address);
  if (balance < parseEther('5')) return null;
  const amount = balance / 10n;
  await writeCstApproval(world, persona.wallet, allocationsEscrowAddress(world), amount);
  const message = chooseMessage(world, persona, options.message);
  const cost = await readNextEthGestureCost(world);
  const receipt = await writeEthGestureWithTokenAttachment(world, persona.wallet, {
    message,
    value: withHeadroom(cost),
    tokenAddress: world.addresses.cosmicToken as Address,
    amount,
  });
  log.info(`${persona.name} attached CST to a gesture`);
  return { kind: 'eth', persona, message, txHash: receipt.transactionHash };
}

/** ETH gesture that attaches a RandomWalk NFT to the cycle's escrow. */
export async function performGestureWithNftAttachment(
  world: World,
  persona: Persona,
  options: { message?: string } = {},
): Promise<GestureResult> {
  const tokenId = await ensureSpareRwlkToken(world, persona);
  const escrowOperator = allocationsEscrowAddress(world);
  const key = approvalKey(persona.address, escrowOperator, 'rwlk');
  if (!grantedOperatorApprovals.has(key)) {
    await writeRwlkApprovalForAll(world, persona.wallet, escrowOperator);
    grantedOperatorApprovals.add(key);
  }
  const message = chooseMessage(world, persona, options.message);
  const cost = await readNextEthGestureCost(world);
  const receipt = await writeEthGestureWithNftAttachment(world, persona.wallet, {
    message,
    value: withHeadroom(cost),
    nftAddress: world.addresses.randomWalkNft as Address,
    nftId: tokenId,
  });
  log.info(`${persona.name} attached RandomWalk #${tokenId} to a gesture`);
  return { kind: 'eth', persona, message, txHash: receipt.transactionHash };
}

/**
 * Finalize the current cycle. When `by` is omitted the last gesturer (if it
 * is one of our personas) finalizes; pass another persona to exercise the
 * post-exclusivity open finalization path.
 */
export async function performFinalizeCycle(world: World, by?: Persona): Promise<Persona> {
  const remaining = await readSecondsUntilFinalization(world);
  const lastGesture = await readLastGestureAddress(world);
  if (lastGesture === zeroAddress) throw new Error('No gestures this cycle — nothing to finalize');
  if (remaining > 0n) throw new Error(`Cycle not finalizable yet (${remaining}s remaining)`);

  const finalizer =
    by ??
    world.personas.find((p) => p.address.toLowerCase() === lastGesture.toLowerCase()) ??
    world.personas[0];
  if (!finalizer) throw new Error('No persona available to finalize');
  await writeFinalizeCycle(world, finalizer.wallet);
  log.info(`${finalizer.name} finalized the cycle`);
  return finalizer;
}

/**
 * Retrieve escrowed ETH allocations from a finalized cycle. `keepFraction`
 * leaves some allocations unretrieved so "retrievable" UI states exist.
 */
export async function performRetrievals(
  world: World,
  cycle: bigint,
  keepFraction = 0,
): Promise<number> {
  let retrieved = 0;
  for (const persona of world.personas) {
    const amount = await readEscrowEthAmount(world, cycle, persona.address);
    if (amount === 0n) continue;
    if (keepFraction > 0 && world.rng() < keepFraction) continue;
    await writeRetrieveEscrowEth(world, persona.wallet, cycle);
    retrieved += 1;
    log.info(`${persona.name} retrieved an escrowed allocation from cycle ${cycle}`);
  }
  return retrieved;
}

export interface AnchorRecord {
  persona: Persona;
  tokenId: bigint;
  anchorActionId: bigint;
  kind: 'cosmic' | 'rwlk';
}

/** Anchor one of the persona's Cosmic Signature NFTs, if any are available. */
export async function performAnchorCosmicNft(
  world: World,
  persona: Persona,
): Promise<AnchorRecord | null> {
  const tokens = await readCosmicNftTokensOf(world, persona.address);
  const tokenId = tokens[0];
  if (tokenId === undefined) return null;
  const operator = world.addresses.anchoringCst as Address;
  const key = approvalKey(persona.address, operator, 'cosmic-nft');
  if (!grantedOperatorApprovals.has(key)) {
    await writeCosmicNftApprovalForAll(world, persona.wallet, operator);
    grantedOperatorApprovals.add(key);
  }
  const anchorActionId = await writeAnchorCosmicNft(world, persona.wallet, tokenId);
  log.info(`${persona.name} anchored Cosmic Signature NFT #${tokenId}`);
  return { persona, tokenId, anchorActionId, kind: 'cosmic' };
}

export async function performReleaseCosmicNft(world: World, record: AnchorRecord): Promise<void> {
  await writeReleaseCosmicNft(world, record.persona.wallet, record.anchorActionId);
  log.info(`${record.persona.name} released Cosmic Signature NFT #${record.tokenId}`);
}

/** Anchor a (fresh or spare) RandomWalk NFT for stellar-selection eligibility. */
export async function performAnchorRwlkNft(world: World, persona: Persona): Promise<AnchorRecord> {
  const tokenId = await ensureSpareRwlkToken(world, persona);
  const operator = world.addresses.anchoringRwlk as Address;
  const key = approvalKey(persona.address, operator, 'rwlk');
  if (!grantedOperatorApprovals.has(key)) {
    await writeRwlkApprovalForAll(world, persona.wallet, operator);
    grantedOperatorApprovals.add(key);
  }
  const anchorActionId = await writeAnchorRwlkNft(world, persona.wallet, tokenId);
  log.info(`${persona.name} anchored RandomWalk NFT #${tokenId}`);
  return { persona, tokenId, anchorActionId, kind: 'rwlk' };
}

export async function performEthContribution(
  world: World,
  persona: Persona,
  amountEth: string,
): Promise<void> {
  await writeEthContribution(world, persona.wallet, parseEther(amountEth));
  log.info(`${persona.name} contributed ${amountEth} ETH to the cycle reserve`);
}
