/**
 * Shared logic for the CST supply endpoints consumed by token trackers
 * (CoinGecko and similar). Trackers expect a public GET endpoint, no
 * authentication, returning the decimal-adjusted supply. The response shape
 * mirrors CoinGecko's reference endpoint (api.coingecko.com/api/v3/supply/eth):
 *
 *   {"result":"63260.015574058815237756"}
 *
 * Total and circulating supply are identical by design: CST has no team
 * allocation, no vesting, and no locked balances, and the Outreach Reserve's
 * undistributed balance counts as circulating. Both endpoints therefore
 * report the token contract's totalSupply, which its ERC-20 burn reduces
 * directly, so "imprinted minus burned" is exactly what the contract reports.
 *
 * These endpoints intentionally query public Arbitrum One RPC nodes rather
 * than the app's configured nodes: CST exists only on Arbitrum One, and the
 * answer must not depend on deployment-specific RPC environment variables.
 */
import { protocolFacts } from '@/content/protocol-facts';

const ARBITRUM_RPC_URLS = [
  'https://arb1.arbitrum.io/rpc',
  'https://arbitrum-one.publicnode.com',
  'https://1rpc.io/arb',
] as const;

const CST_DECIMALS = 18n;
const TOTAL_SUPPLY_SELECTOR = '0x18160ddd';

const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  value: string;
  expiresAt: number;
}

let cache: CacheEntry | null = null;

async function ethCall(to: string, data: string): Promise<bigint> {
  let lastError: unknown;
  for (const url of ARBITRUM_RPC_URLS) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{ to, data }, 'latest'],
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) throw new Error(`RPC ${url} responded ${response.status}`);
      const json = (await response.json()) as { result?: string; error?: { message?: string } };
      if (typeof json.result !== 'string') {
        throw new Error(json.error?.message ?? `RPC ${url} returned no result`);
      }
      return BigInt(json.result);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('all Arbitrum RPC nodes failed');
}

/** Formats a raw 18-decimal token amount as a plain decimal string. */
export function formatTokenAmount(raw: bigint): string {
  const base = 10n ** CST_DECIMALS;
  const whole = raw / base;
  const fraction = raw % base;
  if (fraction === 0n) return whole.toString();
  const fractionText = fraction.toString().padStart(Number(CST_DECIMALS), '0').replace(/0+$/, '');
  return `${whole.toString()}.${fractionText}`;
}

export async function getSupplyValue(): Promise<string> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;

  const raw = await ethCall(protocolFacts.contractAddresses.cstToken, TOTAL_SUPPLY_SELECTOR);
  const value = formatTokenAmount(raw);
  cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}

export function supplyResponse(value: string): Response {
  return new Response(JSON.stringify({ result: value }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
      'access-control-allow-origin': '*',
    },
  });
}

export function supplyErrorResponse(error: unknown): Response {
  const message = error instanceof Error ? error.message : 'supply lookup failed';
  return new Response(JSON.stringify({ error: message }), {
    status: 503,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
