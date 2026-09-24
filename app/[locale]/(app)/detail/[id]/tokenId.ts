/** A token id from the URL: a whole, safe, non-negative number, else null. */
export function parseTokenId(id: string): number | null {
  if (!/^\d+$/.test(id)) return null;
  const tokenId = Number(id);
  return Number.isSafeInteger(tokenId) ? tokenId : null;
}
