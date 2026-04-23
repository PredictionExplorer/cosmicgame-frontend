import * as Sentry from '@sentry/nextjs';
import { formatEther } from 'viem';

export interface EthProviderError {
  code?: number;
  data?: { message?: string };
}

/** Type-guard for wallet/provider errors that carry a `.data` bag. */
export function isEthProviderError(err: unknown): err is EthProviderError {
  return typeof err === 'object' && err !== null && 'data' in err;
}

/**
 * Shown when the user closes the wallet or rejects signing (EIP-1193 code 4001).
 * Prefer `type: 'info'` in notifications — this is not a failure.
 */
export const WALLET_TRANSACTION_CANCELLED_MESSAGE =
  'Transaction not sent — you cancelled it in your wallet.';

/**
 * Returns `true` when the user dismissed the wallet or rejected signing (EIP-1193 4001).
 * Walks viem `cause` chains and `UserRejectedRequestError` — rejection is often nested.
 */
export function isUserRejection(err: unknown): boolean {
  if (err == null) return false;
  const seen = new WeakSet<object>();

  function walk(e: unknown): boolean {
    if (e == null || typeof e !== 'object') return false;
    if (seen.has(e as object)) return false;
    seen.add(e as object);

    const o = e as Record<string, unknown>;

    const code = o.code;
    if (code === 4001 || code === 'ACTION_REJECTED') return true;

    const name = typeof o.name === 'string' ? o.name : '';
    if (name === 'UserRejectedRequestError') return true;

    const msg = typeof o.message === 'string' ? o.message.toLowerCase() : '';
    const short =
      typeof (o as { shortMessage?: string }).shortMessage === 'string'
        ? (o as { shortMessage: string }).shortMessage.toLowerCase()
        : '';
    const combined = `${msg} ${short}`;
    if (
      combined.includes('user rejected') ||
      combined.includes('user denied') ||
      combined.includes('rejected the request') ||
      combined.includes('denied transaction') ||
      combined.includes('denied the transaction') ||
      combined.includes('user cancelled') ||
      combined.includes('user canceled') ||
      combined.includes('request rejected') ||
      combined.includes('rejected this request')
    ) {
      return true;
    }

    if (o.cause) return walk(o.cause);

    const walkFn = (o as { walk?: (fn: (e: Error) => boolean) => Error }).walk;
    if (typeof walkFn === 'function') {
      try {
        const inner = walkFn.call(o, (child: Error) => {
          const c = child as unknown as Record<string, unknown>;
          return (
            child.name === 'UserRejectedRequestError' ||
            c.code === 4001 ||
            c.code === 'ACTION_REJECTED'
          );
        });
        if (inner) return true;
      } catch {
        /* ignore */
      }
    }

    return false;
  }

  return walk(err);
}

/**
 * Extracts a user-friendly message from an Ethereum provider error,
 * falling back to a default when none is available.
 */
export function getEthErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (isEthProviderError(err) && err.data?.message) {
    return err.data.message;
  }
  return fallback;
}

/** Detects viem's `ContractFunctionExecutionError` (on-chain revert) by error name. */
export function isContractRevertError(err: unknown): boolean {
  return err instanceof Error && err.name === 'ContractFunctionExecutionError';
}

const CUSTOM_ERROR_MESSAGES: Record<string, string> = {
  FirstRound: "This action isn't available during the very first cycle.",
  InsufficientReceivedBidAmount:
    'Gesture cost not met. The required ETH amount is greater than what you transferred.',
  UsedRandomWalkNft:
    'This Random Walk NFT has already been used for a gesture-cost discount.',
  CallerIsNotNftOwner: "You don't own this NFT.",
  RoundIsInactive: "The cycle isn't open yet.",
  RoundIsActive: 'The cycle is already in progress.',
  TooLongBidMessage: 'Gesture message is too long. Please shorten it.',
  WrongBidType: "That gesture type isn't allowed right now.",
  BidHasBeenPlacedInCurrentRound: 'A gesture has already been made in this cycle.',
  FundTransferFailed: 'The ETH transfer failed. Please retry.',
  MainPrizeEarlyClaim: "The Performance hasn't closed yet — too early to finalize the cycle.",
  MainPrizeClaimDenied:
    'Only the participant who made the final gesture may finalize the cycle right now.',
  NoBidsPlacedInCurrentRound: 'No gestures have been made yet in this cycle.',
  TooLongNftName: 'That NFT name is too long.',
  EthWithdrawalDenied: "You can't retrieve this allocation yet.",
  DonatedTokenClaimDenied: "You can't retrieve this attached token yet.",
  InvalidDonatedNftIndex: "That attached NFT doesn't exist.",
  DonatedNftAlreadyClaimed: 'This attached NFT has already been retrieved.',
  DonatedNftClaimDenied: "You can't retrieve this attached NFT yet.",
  ThereAreStakedNfts: 'There are still anchored NFTs.',
  NftHasAlreadyBeenStaked:
    'This NFT has been anchored before. Each NFT can be anchored only once.',
  NftStakeActionInvalidId: 'That anchor action ID is invalid.',
  NftStakeActionAccessDenied: 'This anchor action belongs to another wallet.',
  UnauthorizedCaller: "Your wallet isn't authorized for this action.",
  ZeroAddress: 'Please enter a non-zero address.',
  InvalidOperationInCurrentState:
    "This action isn't available in the protocol's current state.",
};

/**
 * Extracts the custom error name from a viem `ContractFunctionRevertedError`
 * nested inside a `ContractFunctionExecutionError`.
 */
function extractContractErrorName(err: unknown): string | null {
  if (!(err instanceof Error)) return null;

  const walkable = err as Error & { cause?: unknown; walk?: (fn: (e: Error) => boolean) => Error };

  if (typeof walkable.walk === 'function') {
    const inner = walkable.walk(
      (e: Error) => e.name === 'ContractFunctionRevertedError',
    );
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
 * Decodes known contract custom errors and detects bid-price-rose scenarios.
 *
 * @param err - The caught error
 * @param displayedEthPrice - The ETH price (in ETH, not wei) shown to the user
 *   before submitting; used to compute the price-rose delta for
 *   `InsufficientReceivedBidAmount`.
 * @returns A friendly message string, or `null` to fall back to generic handling.
 */
export function getContractErrorMessage(err: unknown, displayedEthPrice?: number): string | null {
  const errorName = extractContractErrorName(err);
  if (!errorName) return null;

  if (errorName === 'InsufficientReceivedBidAmount' && displayedEthPrice !== undefined) {
    const walkable = err as Error & { walk?: (fn: (e: Error) => boolean) => Error };
    if (typeof walkable.walk === 'function') {
      const inner = walkable.walk(
        (e: Error) => e.name === 'ContractFunctionRevertedError',
      );
      if (inner && 'data' in inner) {
        const data = (inner as Error & { data?: { args?: readonly unknown[] } }).data;
        const requiredWei = data?.args?.[1];
        if (typeof requiredWei === 'bigint') {
          const requiredEth = parseFloat(formatEther(requiredWei));
          const delta = requiredEth - displayedEthPrice;
          if (delta > 0) {
            return (
              `Gesture cost rose by ${delta.toFixed(6)} ETH while your transaction was in transit. ` +
              `The new required amount is ${requiredEth.toFixed(6)} ETH. Please try again.`
            );
          }
        }
      }
    }
  }

  return CUSTOM_ERROR_MESSAGES[errorName] ?? null;
}

/**
 * Reports an error to Sentry (if configured) and logs it to the console.
 * Use this instead of bare `console.error` throughout the codebase.
 */
export function reportError(error: unknown, context?: string): void {
  if (context) {
    console.error(`[${context}]`, error);
  } else {
    console.error(error);
  }

  if (error instanceof Error) {
    Sentry.captureException(error, context ? { tags: { context } } : undefined);
  } else {
    Sentry.captureMessage(String(error), {
      level: 'error',
      ...(context ? { tags: { context } } : {}),
    });
  }
}
