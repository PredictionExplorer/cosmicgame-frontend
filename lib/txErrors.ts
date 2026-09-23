/**
 * Classifies wallet, RPC and contract failures into a small set of kinds the
 * UI can explain in plain language.
 *
 * viem and wagmi wrap errors several layers deep (a `TransactionExecutionError`
 * around an `InsufficientFundsError` around the node's JSON-RPC error, …), and
 * their messages are multi-paragraph developer text in English. The transaction
 * UI never shows that text: it shows a localized sentence chosen from
 * `TxErrorKind` and offers the technical `details` behind a "Copy details"
 * action for support.
 *
 * Duck-typed on error `name`/`code`/message fragments — no viem import — so
 * the module stays tiny and safe for any bundle.
 */
import { isTransientNetworkError, isUserRejection } from '@/utils/errors';

export type TxErrorKind =
  /** The person dismissed or rejected the wallet prompt. Not a failure. */
  | 'rejected'
  /** The wallet cannot cover the value plus gas. */
  | 'insufficient-funds'
  /** The wallet is connected to a different chain than the protocol's. */
  | 'wrong-network'
  /** No wallet, or the wallet session dropped before the write. */
  | 'wallet-not-connected'
  /** The wallet already has an open request (MetaMask -32002). */
  | 'wallet-busy'
  /** Simulation or gas estimation reverted, so nothing was sent. */
  | 'would-revert'
  /** The transaction was mined but reverted on-chain. Gas was spent. */
  | 'reverted'
  /** The receipt did not arrive in time; the transaction may still land. */
  | 'timeout'
  /** The RPC or network could not be reached. */
  | 'network'
  | 'unknown';

export interface TxErrorInfo {
  kind: TxErrorKind;
  /** Name of the error that decided the kind (for logs and tests). */
  name: string | null;
  /** Decoded contract custom error name, when the revert carried one. */
  contractErrorName: string | null;
  /** Plain-text technical summary, safe to copy to the clipboard for support. */
  details: string;
}

/** Thrown by the transaction flow when a mined receipt reports `reverted`. */
export class TxRevertedError extends Error {
  readonly hash: string;
  constructor(hash: string) {
    super(`Transaction ${hash} reverted on-chain.`);
    this.name = 'TxRevertedError';
    this.hash = hash;
  }
}

interface ErrorLike {
  name?: unknown;
  code?: unknown;
  message?: unknown;
  shortMessage?: unknown;
  details?: unknown;
  reason?: unknown;
  cause?: unknown;
  data?: unknown;
}

/** Every error object in the `cause` chain, outermost first. Cycle-safe. */
export function errorChain(err: unknown): ErrorLike[] {
  const chain: ErrorLike[] = [];
  const seen = new Set<unknown>();
  let current: unknown = err;
  while (current && typeof current === 'object' && !seen.has(current)) {
    seen.add(current);
    chain.push(current as ErrorLike);
    current = (current as ErrorLike).cause;
  }
  return chain;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

const WRONG_NETWORK_NAMES = new Set([
  'ChainMismatchError',
  'ConnectorChainMismatchError',
  'ChainNotConfiguredError',
  'ClientChainNotConfiguredError',
  'SwitchChainNotSupportedError',
]);

const NOT_CONNECTED_NAMES = new Set([
  'ConnectorNotConnectedError',
  'ConnectorAccountNotFoundError',
  'ConnectorNotFoundError',
  'ConnectorUnavailableReconnectingError',
  'AccountNotFoundError',
  'ProviderNotFoundError',
  'ProviderDisconnectedError',
  'ChainDisconnectedError',
]);

const WOULD_REVERT_NAMES = new Set([
  'ContractFunctionRevertedError',
  'ExecutionRevertedError',
  'ContractFunctionZeroDataError',
]);

const TIMEOUT_NAMES = new Set(['WaitForTransactionReceiptTimeoutError', 'TimeoutError']);

function contractErrorNameOf(chain: ErrorLike[]): string | null {
  for (const node of chain) {
    const data = node.data;
    if (data && typeof data === 'object' && 'errorName' in data) {
      const errorName = (data as { errorName?: unknown }).errorName;
      if (typeof errorName === 'string' && errorName) return errorName;
    }
  }
  return null;
}

function summarize(chain: ErrorLike[], contractErrorName: string | null): string {
  const lines: string[] = [];
  for (const node of chain) {
    const name = text(node.name) || 'Error';
    const message = text(node.shortMessage) || text(node.message).split('\n')[0] || '';
    const line = message ? `${name}: ${message}` : name;
    if (!lines.includes(line)) lines.push(line);
    const reason = text(node.reason);
    if (reason && !lines.includes(`reason: ${reason}`)) lines.push(`reason: ${reason}`);
  }
  if (contractErrorName) lines.push(`contract error: ${contractErrorName}`);
  return lines.join('\n').slice(0, 2_000);
}

/**
 * Maps any thrown value from a wallet write or receipt wait to a
 * `TxErrorInfo`. The order of checks matters: a rejection wins over
 * everything, and a precise wallet or chain cause wins over the generic
 * "revert" wrapper viem puts around it.
 */
export function classifyTxError(err: unknown): TxErrorInfo {
  const chain = errorChain(err);
  const names = chain.map((node) => text(node.name)).filter(Boolean);
  const contractErrorName = contractErrorNameOf(chain);
  const details = summarize(chain, contractErrorName);
  const lowerText = chain
    .map((node) => `${text(node.shortMessage)} ${text(node.message)} ${text(node.details)}`)
    .join(' ')
    .toLowerCase();
  const innermost = names.at(-1) ?? null;
  const result = (kind: TxErrorKind, name: string | null = innermost): TxErrorInfo => ({
    kind,
    name,
    contractErrorName,
    details,
  });
  const find = (set: Set<string>) => names.find((name) => set.has(name)) ?? null;

  if (isUserRejection(err)) return result('rejected', 'UserRejectedRequestError');

  const wrongNetwork = find(WRONG_NETWORK_NAMES);
  if (wrongNetwork) return result('wrong-network', wrongNetwork);

  if (
    names.includes('InsufficientFundsError') ||
    lowerText.includes('insufficient funds') ||
    lowerText.includes('exceeds the balance of the account')
  ) {
    return result('insufficient-funds', 'InsufficientFundsError');
  }

  const notConnected = find(NOT_CONNECTED_NAMES);
  if (notConnected) return result('wallet-not-connected', notConnected);

  if (
    names.includes('ResourceUnavailableRpcError') ||
    chain.some((node) => node.code === -32002) ||
    lowerText.includes('already pending')
  ) {
    return result('wallet-busy', 'ResourceUnavailableRpcError');
  }

  if (names.includes('TxRevertedError')) return result('reverted', 'TxRevertedError');

  const timeout = find(TIMEOUT_NAMES);
  if (timeout) return result('timeout', timeout);

  const wouldRevert = find(WOULD_REVERT_NAMES);
  if (wouldRevert || contractErrorName || lowerText.includes('execution reverted')) {
    return result('would-revert', wouldRevert ?? innermost);
  }

  if (isTransientNetworkError(err)) return result('network');

  return result('unknown');
}
