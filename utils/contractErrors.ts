import { decodeErrorResult, formatEther, type Abi, type Hex } from 'viem';

import { cosmicGameAbi } from '@/contracts/abis';

/**
 * Contract-revert error helpers.
 *
 * These utilities import viem and deal exclusively with on-chain
 * revert decoding — they live in a separate module from
 * `utils/errors.ts` so that generic error-reporting consumers
 * (ErrorBoundary, globalErrorHandlers, the LandingShell) don't drag
 * viem into their bundle.
 */

/**
 * Detects reads against addresses with no bytecode in local/e2e environments.
 *
 * Walks the `cause` chain once, iteratively, with a visited set. Calling
 * viem's `walk` with this function as the predicate re-walked every tail of
 * the chain from every link, which grows exponentially with the chain's
 * depth and froze the page on a deeply wrapped read error.
 */
export function isEmptyContractReadError(err: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = err;
  while (current instanceof Error && !seen.has(current)) {
    seen.add(current);
    const message = current.message;
    if (
      message.includes('Cannot decode zero data ("0x")') ||
      message.includes('returned no data ("0x")')
    ) {
      return true;
    }
    current = (current as Error & { cause?: unknown }).cause;
  }
  return false;
}

const CUSTOM_ERROR_TRANSLATION_KEYS: Record<string, string> = {
  InsufficientReceivedBidAmount: 'gesture.contractErrors.insufficientReceivedBidAmount',
  UsedRandomWalkNft: 'gesture.contractErrors.usedRandomWalkNft',
  CallerIsNotNftOwner: 'gesture.contractErrors.callerIsNotNftOwner',
  RoundIsInactive: 'gesture.contractErrors.roundIsInactive',
  TooLongBidMessage: 'gesture.contractErrors.tooLongBidMessage',
  WrongBidType: 'gesture.contractErrors.wrongBidType',
  FundTransferFailed: 'gesture.contractErrors.fundTransferFailed',
  MainPrizeEarlyClaim: 'finalize.contractErrors.mainPrizeEarlyClaim',
  MainPrizeClaimDenied: 'finalize.contractErrors.mainPrizeClaimDenied',
  NoBidsPlacedInCurrentRound: 'finalize.contractErrors.noGestures',
};

type GestureCurrency = 'ETH' | 'CST';

export interface ContractErrorOptions {
  gestureCurrency?: GestureCurrency;
  displayedPrice?: number;
  displayedPriceWei?: bigint | null;
}

export interface ContractErrorDescriptor {
  /** Key relative to the `toasts` namespace. */
  key: string;
  values?: Record<string, string | number>;
  errorName: string;
}

/**
 * Extracts the custom error name from a viem `ContractFunctionRevertedError`
 * nested inside a `ContractFunctionExecutionError`.
 */
function extractContractErrorName(err: unknown): string | null {
  if (!(err instanceof Error)) return null;

  const walkable = err as Error & { cause?: unknown; walk?: (fn: (e: Error) => boolean) => Error };

  if (typeof walkable.walk === 'function') {
    try {
      const inner = walkable.walk((e: Error) => e.name === 'ContractFunctionRevertedError');
      if (inner && 'data' in inner) {
        const data = (inner as Error & { data?: { errorName?: string; args?: unknown[] } }).data;
        if (data?.errorName) return data.errorName;
      }
    } catch {
      /* Fall through to the explicit cause chain. */
    }
  }

  if (walkable.cause instanceof Error) {
    return extractContractErrorName(walkable.cause);
  }

  return null;
}

function normalizeContractErrorOptions(
  optionsOrDisplayedEthPrice?: number | ContractErrorOptions,
): ContractErrorOptions {
  return typeof optionsOrDisplayedEthPrice === 'number'
    ? { gestureCurrency: 'ETH', displayedPrice: optionsOrDisplayedEthPrice }
    : (optionsOrDisplayedEthPrice ?? {});
}

function getPriceChangeDescriptor(
  err: unknown,
  errorName: string,
  options: ContractErrorOptions,
): ContractErrorDescriptor | null {
  if (
    errorName !== 'InsufficientReceivedBidAmount' ||
    (options.displayedPrice === undefined && options.displayedPriceWei == null)
  ) {
    return null;
  }

  const walkable = err as Error & { walk?: (fn: (e: Error) => boolean) => Error };
  if (typeof walkable.walk !== 'function') return null;

  let inner: Error | null = null;
  try {
    inner = walkable.walk((e: Error) => e.name === 'ContractFunctionRevertedError');
  } catch {
    return null;
  }
  if (!inner || !('data' in inner)) return null;

  const data = (inner as Error & { data?: { args?: readonly unknown[] } }).data;
  const requiredWei = data?.args?.[1];
  if (typeof requiredWei !== 'bigint') return null;

  const displayedPrice =
    options.displayedPrice ??
    (options.displayedPriceWei != null ? parseFloat(formatEther(options.displayedPriceWei)) : 0);
  const requiredAmount = parseFloat(formatEther(requiredWei));
  const delta = requiredAmount - displayedPrice;
  if (delta <= 0) return null;

  if ((options.gestureCurrency ?? 'ETH') === 'CST') {
    return {
      key: 'gesture.contractErrors.cstCostChanged',
      values: {
        required: requiredAmount.toFixed(6),
        maximum: displayedPrice.toFixed(6),
      },
      errorName,
    };
  }

  return {
    key: 'gesture.contractErrors.ethCostChanged',
    values: {
      increase: delta.toFixed(6),
      required: requiredAmount.toFixed(6),
    },
    errorName,
  };
}

/**
 * Returns a locale-independent descriptor for a known contract custom error.
 * Consumers can pass the descriptor to `useTranslations('toasts')` without
 * ever exposing raw revert diagnostics in localized UI.
 */
export function getContractErrorDescriptor(
  err: unknown,
  optionsOrDisplayedEthPrice?: number | ContractErrorOptions,
): ContractErrorDescriptor | null {
  const errorName = extractContractErrorName(err);
  if (!errorName) return null;

  const options = normalizeContractErrorOptions(optionsOrDisplayedEthPrice);
  const priceChange = getPriceChangeDescriptor(err, errorName, options);
  if (priceChange) return priceChange;

  const key = CUSTOM_ERROR_TRANSLATION_KEYS[errorName];
  return key ? { key, errorName } : null;
}

/**
 * Custom errors that the V2 bid paths can revert with but that are missing from
 * the generated `cosmicGameAbi` (the ABI has the V2 bid *functions* but not these
 * V2 error definitions). Regenerating the ABI from the V2 contracts would make
 * this list unnecessary — keep it in sync until then.
 */
const SUPPLEMENTAL_ERROR_ABI = [
  {
    type: 'error',
    name: 'BidCstRewardAmountMinLimitNotReached',
    inputs: [
      { name: 'bidCstRewardAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'bidCstRewardAmountMinLimit', type: 'uint256', internalType: 'uint256' },
    ],
  },
] as const;

/** Full ABI used only for decoding revert data (game ABI + supplemental V2 errors). */
const ERROR_DECODE_ABI = [...cosmicGameAbi, ...SUPPLEMENTAL_ERROR_ABI] as Abi;

/** Pulls the raw revert data (`0x<selector><args>`) out of a viem/wagmi error chain. */
function extractRevertData(err: unknown): Hex | undefined {
  const seen = new Set<unknown>();
  let e: unknown = err;
  while (e && typeof e === 'object' && !seen.has(e)) {
    seen.add(e);
    const node = e as { raw?: unknown; data?: unknown; cause?: unknown };
    if (typeof node.raw === 'string' && node.raw.startsWith('0x') && node.raw.length >= 10) {
      return node.raw as Hex;
    }
    if (typeof node.data === 'string' && node.data.startsWith('0x') && node.data.length >= 10) {
      return node.data as Hex;
    }
    e = node.cause;
  }
  const walkable = err as { walk?: (fn: (e: unknown) => boolean) => unknown };
  if (typeof walkable.walk === 'function') {
    const found = walkable.walk((x: unknown) => {
      const n = x as { raw?: unknown; data?: unknown };
      return (
        (typeof n?.raw === 'string' && n.raw.startsWith('0x')) ||
        (typeof n?.data === 'string' && n.data.startsWith('0x'))
      );
    }) as { raw?: unknown; data?: unknown } | null;
    const hex = (found?.raw ?? found?.data) as string | undefined;
    if (typeof hex === 'string' && hex.startsWith('0x') && hex.length >= 10) return hex as Hex;
  }
  return undefined;
}

/** Renders a single decoded argument value as a readable string. */
function formatArgValue(v: unknown): string {
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return `[${v.map(formatArgValue).join(', ')}]`;
  if (v && typeof v === 'object') {
    return `{ ${Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${k}: ${formatArgValue(val)}`)
      .join(', ')} }`;
  }
  return String(v);
}

/**
 * Decodes a contract revert into a human-readable custom error string with named
 * args, e.g. `CosmicSignatureErrors.BidCstRewardAmountMinLimitNotReached(
 * bidCstRewardAmount = 777777, bidCstRewardAmountMinLimit = 666666)`. Decodes
 * against the full game ABI plus supplemental V2 errors (the bid calls use a
 * narrow per-function ABI slice with no error defs). Returns `null` when the
 * error is not a decodable contract revert.
 */
function formatCustomContractError(err: unknown): string | null {
  const data = extractRevertData(err);
  if (!data || data === '0x') return null;
  try {
    const decoded = decodeErrorResult({ abi: ERROR_DECODE_ABI, data });
    const name = decoded.errorName;
    const args = (decoded.args ?? []) as readonly unknown[];
    const inputs = ((decoded.abiItem as { inputs?: { name?: string }[] } | undefined)?.inputs ??
      []) as {
      name?: string;
    }[];

    // Built-in reverts: present them plainly rather than as a CosmicSignatureErrors.* call.
    if (name === 'Error') return `Revert: "${formatArgValue(args[0])}"`;
    if (name === 'Panic') return `Panic(${formatArgValue(args[0])})`;

    if (args.length === 0) return `CosmicSignatureErrors.${name}()`;
    const lines = args.map((a, i) => `  ${inputs[i]?.name ?? `arg${i}`} = ${formatArgValue(a)}`);
    return `CosmicSignatureErrors.${name}(\n${lines.join(',\n')}\n)`;
  } catch {
    return null;
  }
}

/**
 * A classified error's technical summary plus the decoded custom error with
 * its named arguments, when the revert carried one. For "Copy details" and
 * support only; the UI always shows a localized sentence instead.
 */
export function withDecodedContractError(details: string, err: unknown): string {
  const decoded = formatCustomContractError(err);
  if (!decoded || details.includes(decoded)) return details;
  return details ? `${details}\n${decoded}` : decoded;
}
