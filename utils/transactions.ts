export interface TransactionReceiptLike {
  status?: string;
  transactionHash?: string;
}

/** Ensures an optional contract write actually produced a transaction hash. */
export function assertTransactionHash(
  hash: string | null | undefined,
): asserts hash is `0x${string}` {
  if (!hash || !hash.startsWith('0x')) {
    throw new Error('Contract write returned no transaction hash.');
  }
}

/**
 * Prevents a reverted or missing receipt from being presented as a successful
 * transaction. The technical error is intended for logs; callers should show a
 * localized, action-specific fallback to the user.
 */
export function assertSuccessfulTransactionReceipt(
  receipt: TransactionReceiptLike | null | undefined,
): asserts receipt is TransactionReceiptLike & { status: 'success' } {
  if (!receipt) {
    throw new Error('Transaction receipt was unavailable.');
  }
  if (receipt.status !== 'success') {
    throw new Error(
      receipt.transactionHash
        ? `Transaction ${receipt.transactionHash} reverted.`
        : 'Transaction receipt reported a reverted status.',
    );
  }
}
