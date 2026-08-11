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

/**
 * Stateful filter creation is refused: a filter ID lives in one node's memory,
 * but this proxy rotates between redundant nodes (hourly + on failover), which
 * strands the filter and silently breaks event watching. Refusing creation up
 * front makes viem fall back to its stateless `eth_getLogs` polling strategy,
 * which any node can answer and which survives every rotation.
 */
const BLOCKED_METHODS = new Set([
  'eth_newFilter',
  'eth_newBlockFilter',
  'eth_newPendingTransactionFilter',
]);

interface JsonRpcRequestItem {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
}

function isBlocked(item: JsonRpcRequestItem | null | undefined): boolean {
  return typeof item?.method === 'string' && BLOCKED_METHODS.has(item.method);
}

function blockedError(item: JsonRpcRequestItem | null | undefined) {
  return {
    jsonrpc: item?.jsonrpc ?? '2.0',
    id: item?.id ?? null,
    error: {
      code: -32601,
      message: 'stateful filter methods are disabled on this proxy; use eth_getLogs',
    },
  };
}

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

  if (!Array.isArray(body) && isBlocked(body as JsonRpcRequestItem)) {
    return NextResponse.json(blockedError(body as JsonRpcRequestItem));
  }
  if (Array.isArray(body) && body.some((item) => isBlocked(item as JsonRpcRequestItem))) {
    if (body.every((item) => isBlocked(item as JsonRpcRequestItem))) {
      return NextResponse.json(body.map((item) => blockedError(item as JsonRpcRequestItem)));
    }
    // Mixed batch: answer the blocked entries locally, forward the rest, and
    // merge (JSON-RPC batch responses are matched by id, not by order).
    const forwarded = body.filter((item) => !isBlocked(item as JsonRpcRequestItem));
    const locallyAnswered = body
      .filter((item) => isBlocked(item as JsonRpcRequestItem))
      .map((item) => blockedError(item as JsonRpcRequestItem));
    const upstream = await forwardToNodes(JSON.stringify(forwarded));
    if (!upstream.ok) return upstream.response;
    const upstreamItems = Array.isArray(upstream.data) ? upstream.data : [upstream.data];
    return NextResponse.json([...upstreamItems, ...locallyAnswered]);
  }

  const payload = JSON.stringify(body);
  const result = await forwardToNodes(payload);
  if (!result.ok) return result.response;
  return NextResponse.json(result.data, { status: result.status });
}

type ForwardResult =
  | { ok: true; data: unknown; status: number }
  | { ok: false; response: NextResponse };

/** Tries the rotation pick first, then each remaining node once. */
async function forwardToNodes(payload: string): Promise<ForwardResult> {
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
        markServerDown(rpcUrl, Date.now(), `HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      return { ok: true, data, status: res.status };
    } catch (err) {
      markServerDown(rpcUrl, Date.now(), err instanceof Error ? err.message : 'request failed');
      if (process.env.PLAYWRIGHT !== '1') {
        console.error('[rpc proxy] node failed, rotating:', rpcUrl, err);
      }
    }
  }

  return {
    ok: false,
    response: NextResponse.json(
      { error: 'RPC proxy request failed on all nodes' },
      { status: 502 },
    ),
  };
}
