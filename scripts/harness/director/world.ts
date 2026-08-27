/**
 * The director's view of the running harness: viem clients over the local
 * chain, the deployed address book, and one wallet per persona. This is the
 * shared context threaded through actions, scenarios, and the control server.
 */

import {
  createPublicClient,
  createTestClient,
  createWalletClient,
  http,
  type Address,
  type PublicClient,
  type TestClient,
  type WalletClient,
  type Chain,
  type Account,
  type Transport,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';

import type { HarnessConfig } from '../config';
import { chainRpcUrl } from '../orchestrator/chain';
import { readDeployReport, type DeployedAddresses } from '../orchestrator/deploy';

import {
  HARDHAT_ACCOUNTS,
  OWNER_ACCOUNT_INDEX,
  PERSONAS,
  createRng,
  type PersonaSpec,
} from './personas';

export type DirectorWalletClient = WalletClient<Transport, Chain, Account>;

export interface Persona extends PersonaSpec {
  address: Address;
  wallet: DirectorWalletClient;
}

export interface World {
  config: HarnessConfig;
  addresses: DeployedAddresses;
  chain: Chain;
  publicClient: PublicClient;
  testClient: TestClient<'hardhat'>;
  /** Protocol owner (deployer) wallet — used for pace setters and activation. */
  owner: DirectorWalletClient;
  personas: readonly Persona[];
  rng: () => number;
}

function buildChain(config: HarnessConfig): Chain {
  return {
    ...hardhat,
    rpcUrls: { default: { http: [chainRpcUrl(config)] } },
  };
}

function walletFor(privateKey: `0x${string}`, chain: Chain, url: string): DirectorWalletClient {
  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain,
    transport: http(url),
  });
}

/** Assemble the world from the deploy report (must exist in .harness/). */
export function createWorld(config: HarnessConfig): World {
  const addresses = readDeployReport(config);
  const chain = buildChain(config);
  const url = chainRpcUrl(config);

  const ownerAccount = HARDHAT_ACCOUNTS[OWNER_ACCOUNT_INDEX];
  if (!ownerAccount) throw new Error('Missing owner account definition');

  const personas: Persona[] = PERSONAS.map((spec) => {
    const account = HARDHAT_ACCOUNTS[spec.accountIndex];
    if (!account) throw new Error(`No Hardhat account at index ${spec.accountIndex}`);
    return {
      ...spec,
      address: account.address,
      wallet: walletFor(account.privateKey, chain, url),
    };
  });

  return {
    config,
    addresses,
    chain,
    publicClient: createPublicClient({ chain, transport: http(url) }),
    testClient: createTestClient({ mode: 'hardhat', chain, transport: http(url) }),
    owner: walletFor(ownerAccount.privateKey, chain, url),
    personas,
    rng: createRng(config.rngSeed),
  };
}

export function personaByName(world: World, name: string): Persona {
  const persona = world.personas.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (!persona) {
    const names = world.personas.map((p) => p.name).join(', ');
    throw new Error(`Unknown persona "${name}". Available: ${names}`);
  }
  return persona;
}

export function personaByAddress(world: World, address: string): Persona | undefined {
  return world.personas.find((p) => p.address.toLowerCase() === address.toLowerCase());
}
