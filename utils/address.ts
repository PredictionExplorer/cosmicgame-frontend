/**
 * Whether two addresses are the same account: case-insensitive, `false` when
 * either side is empty. The API returns checksummed addresses and wallets may
 * report lowercase ones, so never compare addresses with `===`.
 *
 *   sameAddress(dashboard.LastBidderAddr, account)
 */
export function sameAddress(a: string | null | undefined, b: string | null | undefined): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}
