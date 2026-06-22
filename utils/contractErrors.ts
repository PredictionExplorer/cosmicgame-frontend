import { formatEther } from 'viem';

/**
 * Contract-revert error helpers.
 *
 * These utilities import viem and deal exclusively with on-chain
 * revert decoding — they live in a separate module from
 * `utils/errors.ts` so that generic error-reporting consumers
 * (ErrorBoundary, globalErrorHandlers, the LandingShell) don't drag
 * viem into their bundle.
 */

/** Detects viem's `ContractFunctionExecutionError` (on-chain revert) by error name. */
export function isContractRevertError(err: unknown): boolean {
  return err instanceof Error && err.name === 'ContractFunctionExecutionError';
}

/** Detects reads against addresses with no bytecode in local/e2e environments. */
export function isEmptyContractReadError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;

  const message = err.message;
  if (
    message.includes('Cannot decode zero data ("0x")') ||
    message.includes('returned no data ("0x")')
  ) {
    return true;
  }

  const walkable = err as Error & { cause?: unknown; walk?: (fn: (e: Error) => boolean) => Error };
  if (typeof walkable.walk === 'function') {
    try {
      const inner = walkable.walk((e: Error) => isEmptyContractReadError(e));
      if (inner) return true;
    } catch {
      /* ignore */
    }
  }

  return isEmptyContractReadError(walkable.cause);
}

const CUSTOM_ERROR_MESSAGES: Record<string, string> = {
  InsufficientReceivedBidAmount:
    'The current Gesture Cost is greater than the amount you transferred.',
  UsedRandomWalkNft: 'This RandomWalk NFT has already been used for a gesture.',
  CallerIsNotNftOwner: 'You are not the owner of this NFT.',
  RoundIsInactive: 'The current cycle is not active.',
  TooLongBidMessage: 'Your gesture message is too long.',
  WrongBidType: 'Wrong gesture type selected.',
  FundTransferFailed: 'Fund transfer failed.',
  MainPrizeEarlyClaim: 'Not enough time has elapsed to retrieve the Signature Allocation.',
  MainPrizeClaimDenied:
    'Only the Last Participant is permitted to retrieve the Signature Allocation.',
  NoBidsPlacedInCurrentRound: 'No gestures have been made in the current cycle yet.',
};

type GestureCurrency = 'ETH' | 'CST';

interface ContractErrorOptions {
  gestureCurrency?: GestureCurrency;
  displayedPrice?: number;
  displayedPriceWei?: bigint | null;
}

/**
 * Extracts the custom error name from a viem `ContractFunctionRevertedError`
 * nested inside a `ContractFunctionExecutionError`.
 */
function extractContractErrorName(err: unknown): string | null {
  if (!(err instanceof Error)) return null;

  const walkable = err as Error & { cause?: unknown; walk?: (fn: (e: Error) => boolean) => Error };

  if (typeof walkable.walk === 'function') {
    const inner = walkable.walk((e: Error) => e.name === 'ContractFunctionRevertedError');
    if (inner && 'data' in inner) {
      const data = (inner as Error & { data?: { errorName?: string; args?: unknown[] } }).data;
      if (data?.errorName) return data.errorName;
    }
  }

  if (walkable.cause instanceof Error) {
    return extractContractErrorName(walkable.cause);
  }

  return null;
}

/**
 * Returns a user-friendly error message for contract revert failures.
 * Decodes known contract custom errors and detects gesture-cost-rose scenarios.
 *
 * @param err - The caught error
 * @param displayedEthPrice - The ETH price (in ETH, not wei) shown to the user
 *   before submitting; used to compute the price-rose delta for
 *   `InsufficientReceivedBidAmount`.
 * @returns A friendly message string, or `null` to fall back to generic handling.
 */
export function getContractErrorMessage(
  err: unknown,
  optionsOrDisplayedEthPrice?: number | ContractErrorOptions,
): string | null {
  const errorName = extractContractErrorName(err);
  if (!errorName) return null;
  const options: ContractErrorOptions =
    typeof optionsOrDisplayedEthPrice === 'number'
      ? { gestureCurrency: 'ETH', displayedPrice: optionsOrDisplayedEthPrice }
      : (optionsOrDisplayedEthPrice ?? {});
  const gestureCurrency = options.gestureCurrency ?? 'ETH';

  if (
    errorName === 'InsufficientReceivedBidAmount' &&
    (options.displayedPrice !== undefined || options.displayedPriceWei != null)
  ) {
    const walkable = err as Error & { walk?: (fn: (e: Error) => boolean) => Error };
    if (typeof walkable.walk === 'function') {
      const inner = walkable.walk((e: Error) => e.name === 'ContractFunctionRevertedError');
      if (inner && 'data' in inner) {
        const data = (inner as Error & { data?: { args?: readonly unknown[] } }).data;
        const requiredWei = data?.args?.[1];
        if (typeof requiredWei === 'bigint') {
          const displayedPrice =
            options.displayedPrice ??
            (options.displayedPriceWei != null
              ? parseFloat(formatEther(options.displayedPriceWei))
              : 0);
          const requiredAmount = parseFloat(formatEther(requiredWei));
          const delta = requiredAmount - displayedPrice;
          if (delta > 0) {
            if (gestureCurrency === 'CST') {
              return (
                `CST Gesture Cost changed while your transaction was in transit, likely because another gesture landed first. ` +
                `The contract required ${requiredAmount.toFixed(6)} CST, above your ${displayedPrice.toFixed(6)} CST maximum. Refresh and try again.`
              );
            }
            return `Gesture Cost rose by ${delta.toFixed(6)} ETH while your transaction was in transit. The new required cost is ${requiredAmount.toFixed(6)} ETH. Please try again.`;
          }
        }
      }
    }
  }

  return CUSTOM_ERROR_MESSAGES[errorName] ?? null;
}
