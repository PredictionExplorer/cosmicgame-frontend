'use client';

/**
 * Harness burner wallet: a dev-only connector over the local chain's
 * well-known persona accounts, so testing mode needs no browser extension
 * and Playwright can send real transactions.
 *
 * Loaded exclusively via dynamic import from the harness dev panel, which is
 * itself mounted only when the harness gate is on — production bundles never
 * include this module. Keys below are Hardhat's public dev keys (local-only).
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Chain,
  type EIP1193Parameters,
  type Hex,
  type WalletClient,
  type Transport,
  type Account,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';
import type { Config } from 'wagmi';
import { connect, disconnect, getAccount } from 'wagmi/actions';
import { injected } from 'wagmi/connectors';

import { HARDHAT_ACCOUNTS, PERSONAS } from '@/scripts/harness/director/personas';

import { networkConfig } from '@/config/networks';

export interface HarnessPersonaOption {
  name: string;
  address: Address;
}

interface BurnerState {
  personaIndex: number;
  wallets: Array<WalletClient<Transport, Chain, Account>>;
  listeners: Map<string, Set<(payload: unknown) => void>>;
}

const CONNECTOR_ID = 'cosmicHarnessPersonas';

let state: BurnerState | null = null;
let installedConfig: Config | null = null;

function chain(): Chain {
  return { ...hardhat, rpcUrls: { default: { http: [networkConfig.rpcUrl] } } };
}

function buildState(): BurnerState {
  const target = chain();
  const wallets = PERSONAS.map((spec) => {
    const account = HARDHAT_ACCOUNTS[spec.accountIndex];
    if (!account) throw new Error(`No dev account at index ${spec.accountIndex}`);
    return createWalletClient({
      account: privateKeyToAccount(account.privateKey),
      chain: target,
      transport: http(networkConfig.rpcUrl),
    });
  });
  return { personaIndex: 0, wallets, listeners: new Map() };
}

export function harnessPersonaOptions(): HarnessPersonaOption[] {
  return PERSONAS.map((spec) => {
    const account = HARDHAT_ACCOUNTS[spec.accountIndex];
    return { name: spec.name, address: (account?.address ?? '0x') as Address };
  });
}

function currentWallet(s: BurnerState): WalletClient<Transport, Chain, Account> {
  const wallet = s.wallets[s.personaIndex];
  if (!wallet) throw new Error('Burner wallet not initialized');
  return wallet;
}

function emit(s: BurnerState, event: string, payload: unknown): void {
  for (const listener of s.listeners.get(event) ?? []) listener(payload);
}

type RpcRequest = EIP1193Parameters;

/** Minimal surface of the wallet client the provider signs/sends with. */
export interface BurnerWalletLike {
  account: { address: Address };
  sendTransaction: (args: {
    to?: Address;
    data?: Hex;
    value?: bigint;
    gas?: bigint;
  }) => Promise<unknown>;
  signMessage: (args: { message: { raw: Hex } }) => Promise<unknown>;
  signTypedData: (typedData: unknown) => Promise<unknown>;
}

export interface BurnerProviderSource {
  chainId: number;
  currentWallet: () => BurnerWalletLike;
  /** Read-path fallback: every non-wallet method goes to the chain RPC. */
  passthrough: (args: RpcRequest) => Promise<unknown>;
  listeners: Map<string, Set<(payload: unknown) => void>>;
}

/**
 * EIP-1193 provider over a local-account wallet: account/sign/send methods
 * answer locally, everything else forwards to the chain RPC. Exported for
 * unit tests; the connector below is the only production consumer.
 */
export function createBurnerProvider(source: BurnerProviderSource) {
  return {
    async request(args: RpcRequest): Promise<unknown> {
      const wallet = source.currentWallet();
      const params = (args.params ?? []) as unknown[];
      switch (args.method) {
        case 'eth_accounts':
        case 'eth_requestAccounts':
          return [wallet.account.address];
        case 'eth_chainId':
          return `0x${source.chainId.toString(16)}`;
        case 'eth_sendTransaction': {
          const tx = (params[0] ?? {}) as {
            to?: Address;
            data?: Hex;
            value?: Hex;
            gas?: Hex;
          };
          return wallet.sendTransaction({
            to: tx.to,
            data: tx.data,
            value: tx.value ? BigInt(tx.value) : undefined,
            gas: tx.gas ? BigInt(tx.gas) : undefined,
          });
        }
        case 'personal_sign': {
          const [message] = params as [Hex, Address];
          return wallet.signMessage({ message: { raw: message } });
        }
        case 'eth_signTypedData_v4': {
          const [, typedDataJson] = params as [Address, string];
          return wallet.signTypedData(JSON.parse(typedDataJson));
        }
        case 'wallet_switchEthereumChain':
        case 'wallet_addEthereumChain':
          return null;
        default:
          return source.passthrough(args);
      }
    },
    on(event: string, listener: (payload: unknown) => void): void {
      const bucket = source.listeners.get(event) ?? new Set();
      bucket.add(listener);
      source.listeners.set(event, bucket);
    },
    removeListener(event: string, listener: (payload: unknown) => void): void {
      source.listeners.get(event)?.delete(listener);
    },
  };
}

function buildProvider(s: BurnerState) {
  const passthrough = createPublicClient({ chain: chain(), transport: http(networkConfig.rpcUrl) });
  return createBurnerProvider({
    chainId: chain().id,
    currentWallet: () => currentWallet(s) as unknown as BurnerWalletLike,
    passthrough: (args) => passthrough.request(args as never),
    listeners: s.listeners,
  });
}

/**
 * Install (once) and connect the burner connector on the given wagmi config.
 * Returns the active persona name.
 *
 * A previously persisted wallet session (e.g. MetaMask from a mainnet dev
 * run) can be restored on a chain other than the harness chain, which makes
 * every wagmi client query fail with ConnectorChainMismatchError. Testing
 * mode owns the wallet state: such sessions are replaced by the burner. A
 * foreign wallet deliberately connected on the harness chain is left alone.
 */
export async function connectHarnessBurner(config: Config): Promise<string> {
  if (!state) state = buildState();
  if (installedConfig !== config) {
    const provider = buildProvider(state);
    const connectorFn = injected({
      shimDisconnect: false,
      target: () => ({
        id: CONNECTOR_ID,
        name: 'Harness Personas',
        provider: provider as never,
      }),
    });
    config._internal.connectors.setState((current) => {
      if (current.some((existing) => existing.id === CONNECTOR_ID)) return current;
      return [...current, config._internal.connectors.setup(connectorFn)];
    });
    installedConfig = config;
  }
  const connector = config.connectors.find((c) => c.id === CONNECTOR_ID);
  if (!connector) throw new Error('Burner connector failed to install');

  const account = getAccount(config);
  if (account.connector && account.connector.id !== CONNECTOR_ID) {
    const connectorChainId = await account.connector.getChainId().catch(() => null);
    if (connectorChainId === chain().id) {
      // A working wallet on the harness chain — respect the user's choice.
      return PERSONAS[state.personaIndex]?.name ?? 'Unknown';
    }
    await disconnect(config);
  }
  if (getAccount(config).connector?.id !== CONNECTOR_ID) {
    await connect(config, { connector });
  }
  const persona = PERSONAS[state.personaIndex];
  return persona?.name ?? 'Unknown';
}

/** Switch the active persona; the connector emits accountsChanged. */
export async function setHarnessPersona(config: Config, name: string): Promise<void> {
  if (!state) throw new Error('Burner not connected yet');
  const index = PERSONAS.findIndex((p) => p.name.toLowerCase() === name.toLowerCase());
  if (index < 0) throw new Error(`Unknown persona "${name}"`);
  state.personaIndex = index;
  const wallet = currentWallet(state);
  emit(state, 'accountsChanged', [wallet.account.address]);
  // Reconnect if the burner is not the active connector (e.g. after manual
  // disconnect) so switching personas always lands in a connected state.
  if (getAccount(config).connector?.id !== CONNECTOR_ID) {
    await connectHarnessBurner(config);
  }
}

export async function disconnectHarnessBurner(config: Config): Promise<void> {
  if (getAccount(config).connector?.id === CONNECTOR_ID) {
    await disconnect(config);
  }
}

export function activeHarnessPersona(): string | null {
  if (!state) return null;
  return PERSONAS[state.personaIndex]?.name ?? null;
}
