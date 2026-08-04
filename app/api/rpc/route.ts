/**
 * RPC proxy - forwards JSON-RPC requests to the configured Ethereum node.
 * Used when the node does not support CORS (e.g. self-hosted nodes).
 *
 * Supports multiple redundant nodes via NEXT_PUBLIC_RPC_URLS (comma-separated;
 * falls back to NEXT_PUBLIC_RPC_URL): the node is selected by hourly
 * round-robin, an unreachable node is marked down for a cooldown window, and
 * a failed request is retried against the remaining nodes before erroring.
 * See lib/serverRotation.
 */
import { NextRequest, NextResponse } from 'next/server';

import { markServerDown, parseUrlList, pickServer } from '@/lib/serverRotation';

const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'sepolia';
const DEFAULT_RPC: Record<string, string> = {
  local: 'http://161.129.67.42:22945',
  sepolia: 'http://161.129.67.42:22545',
  mainnet: '', // mainnet uses Infura, no proxy by default
};

const RPC_URLS: string[] = (() => {
  const configured = parseUrlList(
    process.env.NEXT_PUBLIC_RPC_URLS,
    process.env.NEXT_PUBLIC_RPC_URL,
  );
  if (configured.length > 0) return configured;
  const fallback = DEFAULT_RPC[NETWORK] || DEFAULT_RPC.sepolia;
  return fallback ? [fallback] : [];
})();

export async function POST(req: NextRequest) {
  if (RPC_URLS.length === 0) {
    return NextResponse.json(
      { error: 'RPC URL not configured (NEXT_PUBLIC_RPC_URLS / NEXT_PUBLIC_RPC_URL)' },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  const payload = JSON.stringify(body);

  // Try the rotation pick first, then each remaining node once.
  const attempted = new Set<string>();
  for (let i = 0; i < RPC_URLS.length; i++) {
    const rpcUrl = pickServer(RPC_URLS, Date.now(), 'RPC');
    if (attempted.has(rpcUrl)) break;
    attempted.add(rpcUrl);
    try {
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
      if (res.status >= 500) {
        markServerDown(rpcUrl);
        continue;
      }
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch (err) {
      markServerDown(rpcUrl);
      if (process.env.PLAYWRIGHT !== '1') {
        console.error('[rpc proxy] node failed, rotating:', rpcUrl, err);
      }
    }
  }

  return NextResponse.json({ error: 'RPC proxy request failed on all nodes' }, { status: 502 });
}
