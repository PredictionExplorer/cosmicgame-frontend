/**
 * Where a transaction may go.
 *
 * The app learns its contract addresses from the dashboard API
 * (`ContractAddrs`), which is fine for reads but not for writes: those
 * addresses decide where gesture ETH is sent, which contract an ERC-20 or NFT
 * approval names as spender, and who receives collection-wide operator rights
 * when anchoring. A compromised API host (or response) could point any of them
 * at another contract while the UI looks normal.
 *
 * So every write is checked against addresses read on-chain from the game
 * proxy itself: `prizesWallet()`, `token()`, `nft()`, the two anchoring
 * wallets and so on. On a network with a pinned proxy (Arbitrum One, from
 * `protocolFacts`) the proxy address never comes from the API at all; on a
 * test network the API's game address is the root and everything else must
 * agree with it on-chain.
 *
 * A write passes when it targets one of those contracts, or when it is an
 * approval (`approve`, `setApprovalForAll`, `increaseAllowance`) whose
 * spender or operator is one of them: attached tokens and NFTs are the
 * participant's own contracts, so for an approval the spender is what matters.
 *
 * Duck-typed on the client (`readContract` only) and free of viem imports, so
 * it stays small and testable.
 */
import type { Abi } from 'viem';

import { cosmicGameAbi } from '@/contracts/abis';
import { protocolFacts } from '@/content/protocol-facts';

/** The game proxy, pinned per chain id. Where one is set, the API's game address is ignored. */
export const PINNED_GAME_PROXY: Readonly<Partial<Record<number, string>>> = {
  42161: protocolFacts.contractAddresses.proxy,
};

/** Game getters that name every other contract the app writes to. */
export const PROTOCOL_ADDRESS_GETTERS = [
  'prizesWallet',
  'stakingWalletCosmicSignatureNft',
  'stakingWalletRandomWalkNft',
  'token',
  'nft',
  'randomWalkNft',
  'charityAddress',
  'marketingWallet',
] as const;

/** Functions whose first argument receives a right over the caller's assets. */
const APPROVAL_FUNCTIONS: ReadonlySet<string> = new Set([
  'approve',
  'setApprovalForAll',
  'increaseAllowance',
]);

/** How long an on-chain read of the protocol's addresses is reused (ms). */
export const TRUSTED_ADDRESSES_TTL_MS = 10 * 60_000;

/**
 * Thrown before any wallet prompt when a write would go to (or grant rights
 * to) an address that is not one of the protocol's on-chain contracts.
 */
export class UntrustedContractError extends Error {
  readonly address: string;
  readonly role: 'target' | 'spender';
  constructor(address: string, role: 'target' | 'spender') {
    super(
      role === 'target'
        ? `Refusing to write to ${address}: it is not a Cosmic Signature contract on this chain.`
        : `Refusing to approve ${address}: it is not a Cosmic Signature contract on this chain.`,
    );
    this.name = 'UntrustedContractError';
    this.address = address;
    this.role = role;
  }
}

/**
 * Thrown when the protocol's addresses cannot be established: the dashboard
 * has not named a game contract yet, on a network without a pinned proxy.
 * Reads as a network failure, which a refresh fixes.
 */
export class ProtocolAddressesUnavailableError extends Error {
  constructor() {
    super('The Cosmic Signature contract addresses are not known yet.');
    this.name = 'ProtocolAddressesUnavailableError';
  }
}

/** The one client method the check needs. */
export interface ContractReader {
  readContract: (args: {
    address: `0x${string}`;
    abi: Abi;
    functionName: string;
  }) => Promise<unknown>;
}

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const ZERO_ADDRESS = `0x${'0'.repeat(40)}`;

function normalize(value: unknown): string | null {
  if (typeof value !== 'string' || !ADDRESS_PATTERN.test(value)) return null;
  const lower = value.toLowerCase();
  return lower === ZERO_ADDRESS ? null : lower;
}

/** The game address writes are rooted in (lower case): the pinned proxy, else the API's. */
export function gameRootFor(chainId: number, apiGameAddress: string | undefined): string | null {
  return normalize(PINNED_GAME_PROXY[chainId]) ?? normalize(apiGameAddress);
}

const cache = new Map<string, { at: number; addresses: Promise<ReadonlySet<string>> }>();

/** Forgets every cached read (tests use it between cases). */
export function clearTrustedAddressCache(): void {
  cache.clear();
}

/** A getter the deployed contract does not implement (an older build), rather than an outage. */
function isMissingGetter(err: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = err;
  while (current && typeof current === 'object' && !seen.has(current)) {
    seen.add(current);
    const node = current as { name?: unknown; message?: unknown; cause?: unknown };
    if (node.name === 'ContractFunctionZeroDataError') return true;
    const message = typeof node.message === 'string' ? node.message.toLowerCase() : '';
    if (message.includes('returned no data') || message.includes('selector was not recognized')) {
      return true;
    }
    current = node.cause;
  }
  return false;
}

/**
 * The lower-cased addresses a write may target: the game proxy and every
 * contract it names on-chain. Cached per chain and game for
 * {@link TRUSTED_ADDRESSES_TTL_MS}; a failed read is not cached. A getter the
 * contract does not implement is skipped (that contract then takes no
 * writes); any other failure rejects, so a flaky RPC stops the write instead
 * of widening what it may reach.
 */
export function readTrustedAddresses(
  client: ContractReader,
  chainId: number,
  apiGameAddress: string | undefined,
  now: number = Date.now(),
): Promise<ReadonlySet<string>> {
  const game = gameRootFor(chainId, apiGameAddress);
  if (!game) return Promise.reject(new ProtocolAddressesUnavailableError());

  const key = `${chainId}:${game}`;
  const hit = cache.get(key);
  if (hit && now - hit.at < TRUSTED_ADDRESSES_TTL_MS) return hit.addresses;

  const addresses: Promise<ReadonlySet<string>> = Promise.all(
    PROTOCOL_ADDRESS_GETTERS.map((functionName) =>
      client
        .readContract({ address: game as `0x${string}`, abi: cosmicGameAbi, functionName })
        .then(normalize, (err: unknown) => {
          if (isMissingGetter(err)) return null;
          throw err;
        }),
    ),
  ).then((named) => new Set([game, ...named.filter((value): value is string => !!value)]));

  cache.set(key, { at: now, addresses });
  addresses.catch(() => {
    if (cache.get(key)?.addresses === addresses) cache.delete(key);
  });
  return addresses;
}

/** The parts of a contract write the check reads. */
export interface WriteTargetRequest {
  address: string;
  functionName: string;
  args?: readonly unknown[];
}

/**
 * Throws {@link UntrustedContractError} unless the address is one of the
 * protocol's contracts: the target of a write, or the recipient of a plain
 * ETH send (the Public Goods Vault's `receive()`).
 */
export function assertTrustedTarget(address: string, trusted: ReadonlySet<string>): void {
  const target = normalize(address);
  if (!target || !trusted.has(target)) {
    throw new UntrustedContractError(address, 'target');
  }
}

/**
 * Throws {@link UntrustedContractError} unless the write targets a protocol
 * contract, or is an approval whose spender or operator is one.
 */
export function assertTrustedWrite(
  request: WriteTargetRequest,
  trusted: ReadonlySet<string>,
): void {
  if (APPROVAL_FUNCTIONS.has(request.functionName)) {
    const spender = normalize(request.args?.[0]);
    if (!spender || !trusted.has(spender)) {
      throw new UntrustedContractError(String(request.args?.[0] ?? ''), 'spender');
    }
    return;
  }
  assertTrustedTarget(request.address, trusted);
}
