/**
 * Reads token amounts out of a transaction receipt's logs without an ABI
 * decode: an ERC-20 `Transfer(from, to, value)` has the event signature as
 * topic 0, the two addresses as topics 1 and 2 (left-padded to 32 bytes) and
 * the value as data.
 */

/** keccak256("Transfer(address,address,uint256)") */
export const ERC20_TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

const ZERO_TOPIC = `0x${'0'.repeat(64)}`;

export interface ReceiptLogLike {
  address: string;
  topics: readonly (string | null | undefined)[];
  data: string;
}

function addressTopic(address: string): string {
  return `0x${address.toLowerCase().replace(/^0x/, '').padStart(64, '0')}`;
}

/**
 * Sum of `token` newly created for `recipient` in this receipt (transfers
 * from the zero address) — e.g. the Participation CST a gesture imprints.
 * Returns 0n when the token, the recipient or matching logs are missing.
 */
export function sumImprintedTo(
  logs: readonly ReceiptLogLike[] | null | undefined,
  token: string | null | undefined,
  recipient: string | null | undefined,
): bigint {
  if (!logs || !token || !recipient) return 0n;
  const tokenAddress = token.toLowerCase();
  const recipientTopic = addressTopic(recipient);
  let total = 0n;
  for (const log of logs) {
    if (log.address.toLowerCase() !== tokenAddress) continue;
    const [signature, from, to] = log.topics;
    if (signature?.toLowerCase() !== ERC20_TRANSFER_TOPIC) continue;
    if (from?.toLowerCase() !== ZERO_TOPIC || to?.toLowerCase() !== recipientTopic) continue;
    try {
      total += BigInt(log.data);
    } catch {
      /* Malformed data: skip the log. */
    }
  }
  return total;
}
