import { decodeErrorResult, formatEther, type Abi, type Hex } from 'viem';

import { cosmicGameAbi } from '@/contracts/abis';

import { SUPPLEMENTAL_ERROR_ABI } from '@/utils/cosmicGameContractCompat';
import { formatAmount } from '@/utils/format/numbers';

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
  BidCstRewardAmountMinLimitNotReached: 'gesture.contractErrors.cstRewardBelowMinimum',
};

type GestureCurrency = 'ETH' | 'CST';

export interface ContractErrorOptions {
  gestureCurrency?: GestureCurrency;
  displayedPrice?: number;
  displayedPriceWei?: bigint | null;
  /**
   * Formats the amounts in a cost-changed message the way the form showed
   * them (the `exact` precision, the locale's separators: vi "0,10211").
   * Default `en`.
   */
  locale?: string;
}

export interface ContractErrorDescriptor {
  /** Key relative to the `toasts` namespace. */
  key: string;
  values?: Record<string, string | number>;
  errorName: string;
}

/** Full ABI used only for decoding revert data (game ABI + supplemental V2 errors). */
const ERROR_DECODE_ABI = [...cosmicGameAbi, ...SUPPLEMENTAL_ERROR_ABI] as Abi;

interface DecodedRevert {
  errorName: string;
  args: readonly unknown[];
}

/**
 * The custom error a contract revert carried, from anywhere in a viem/wagmi
 * error chain. viem fills `ContractFunctionRevertedError.data` only when the
 * ABI the call was made with defines the error; when it does not (a narrow
 * function slice, an older ABI), the raw revert data is decoded here against
 * the full game ABI plus the supplemental V2 errors. Built-in `Error(string)`
 * and `Panic` reverts are not custom errors and return null.
 */
function decodedRevertOf(err: unknown): DecodedRevert | null {
  const walkable = err as { walk?: (fn: (e: Error) => boolean) => Error | null } | null;
  if (typeof walkable?.walk === 'function') {
    try {
      const inner = walkable.walk((e: Error) => e.name === 'ContractFunctionRevertedError');
      const data = (inner as (Error & { data?: { errorName?: string; args?: unknown } }) | null)
        ?.data;
      if (data?.errorName) {
        return {
          errorName: data.errorName,
          args: Array.isArray(data.args) ? (data.args as readonly unknown[]) : [],
        };
      }
    } catch {
      /* Fall through to the raw revert data. */
    }
  }

  const raw = extractRevertData(err);
  if (!raw || raw === '0x') return null;
  try {
    const decoded = decodeErrorResult({ abi: ERROR_DECODE_ABI, data: raw });
    if (decoded.errorName === 'Error' || decoded.errorName === 'Panic') return null;
    return { errorName: decoded.errorName, args: (decoded.args ?? []) as readonly unknown[] };
  } catch {
    return null;
  }
}

/**
 * The name of the custom error a contract revert carried ("UsedRandomWalkNft"),
 * or null. For logs and `TxErrorInfo.contractErrorName`; the UI shows the
 * localized sentence from {@link getContractErrorDescriptor} instead.
 */
export function contractErrorNameOf(err: unknown): string | null {
  return decodedRevertOf(err)?.errorName ?? null;
}

function normalizeContractErrorOptions(
  optionsOrDisplayedEthPrice?: number | ContractErrorOptions,
): ContractErrorOptions {
  return typeof optionsOrDisplayedEthPrice === 'number'
    ? { gestureCurrency: 'ETH', displayedPrice: optionsOrDisplayedEthPrice }
    : (optionsOrDisplayedEthPrice ?? {});
}

function getPriceChangeDescriptor(
  revert: DecodedRevert,
  options: ContractErrorOptions,
): ContractErrorDescriptor | null {
  const { errorName } = revert;
  if (
    errorName !== 'InsufficientReceivedBidAmount' ||
    (options.displayedPrice === undefined && options.displayedPriceWei == null)
  ) {
    return null;
  }

  const requiredWei = revert.args[1];
  if (typeof requiredWei !== 'bigint') return null;

  const displayedPrice =
    options.displayedPrice ??
    (options.displayedPriceWei != null ? parseFloat(formatEther(options.displayedPriceWei)) : 0);
  const requiredAmount = parseFloat(formatEther(requiredWei));
  const delta = requiredAmount - displayedPrice;
  if (delta <= 0) return null;

  const currency = options.gestureCurrency ?? 'ETH';
  // The catalog prints the unit after each placeholder, so the number goes
  // in alone, through the one precision policy the form uses.
  const amount = (value: number) =>
    formatAmount(value, {
      unit: currency,
      context: 'exact',
      locale: options.locale,
      withUnit: false,
    });

  if (currency === 'CST') {
    return {
      key: 'gesture.contractErrors.cstCostChanged',
      values: {
        required: amount(requiredAmount),
        maximum: amount(displayedPrice),
      },
      errorName,
    };
  }

  return {
    key: 'gesture.contractErrors.ethCostChanged',
    values: {
      // The exact policy rounds to six places, which also drops the float
      // noise a difference of two 18-decimal amounts carries.
      increase: amount(delta),
      required: amount(requiredAmount),
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
  const revert = decodedRevertOf(err);
  if (!revert) return null;

  const options = normalizeContractErrorOptions(optionsOrDisplayedEthPrice);
  const priceChange = getPriceChangeDescriptor(revert, options);
  if (priceChange) return priceChange;

  const key = CUSTOM_ERROR_TRANSLATION_KEYS[revert.errorName];
  return key ? { key, errorName: revert.errorName } : null;
}

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
