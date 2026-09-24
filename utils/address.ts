import { sameAddress as sameAccount } from './format/addresses';

/**
 * Whether two addresses are the same account: case-insensitive, `false` when
 * either side is empty. The API returns checksummed addresses and wallets may
 * report lowercase ones, so never compare addresses with `===`.
 *
 *   sameAddress(dashboard.LastBidderAddr, account)
 *
 * The one implementation lives in the formatting layer (`@/utils/format`);
 * new code imports it from there, and this entry keeps existing imports.
 */
export const sameAddress = sameAccount;
