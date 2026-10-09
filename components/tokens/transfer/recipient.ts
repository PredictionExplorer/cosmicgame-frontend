import { getAddress, isAddress, zeroAddress, type Address } from 'viem';

/**
 * Why a typed recipient cannot receive a transfer. Each maps to one sentence
 * in `forms.transfer.recipient.errors`.
 *
 * - `checksum`: the mixed-case letters do not match the address's checksum,
 *   which almost always means a character was mistyped.
 * - `self`: the wallet the tokens would leave; sending there does nothing.
 */
export type RecipientError = 'required' | 'invalid' | 'checksum' | 'zero' | 'self';

export interface ParsedRecipient {
  /** The checksummed address, or null when it cannot receive the transfer. */
  address: Address | null;
  error: RecipientError | null;
}

const HEX_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

/**
 * The typed recipient as a checksummed address, or the reason it cannot be
 * sent to. An all-lowercase address has no checksum to test; a mixed-case one
 * must match its EIP-55 checksum, so a mistyped character is caught before
 * the tokens leave instead of after.
 */
export function parseRecipient(
  text: string,
  { from }: { from?: string | null } = {},
): ParsedRecipient {
  const trimmed = text.trim();
  if (!trimmed) return { address: null, error: 'required' };
  if (!HEX_ADDRESS.test(trimmed)) return { address: null, error: 'invalid' };
  if (!isAddress(trimmed)) return { address: null, error: 'checksum' };

  const address = getAddress(trimmed);
  if (address.toLowerCase() === zeroAddress) return { address: null, error: 'zero' };
  if (from && address.toLowerCase() === from.toLowerCase()) {
    return { address: null, error: 'self' };
  }
  return { address, error: null };
}
