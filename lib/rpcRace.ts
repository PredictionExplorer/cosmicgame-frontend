/**
 * Direct JSON-RPC reads racing all configured nodes.
 *
 * Used only during the cycle endgame (see hooks/useEndgameChainSync): the
 * decisive on-chain values are fetched straight from the RPC nodes — bypassing
 * the backend/ETL pipeline AND the app's own `/api/rpc` proxy hop — by posting
 * the same batched request to every configured node in parallel and taking the
 * first successful answer. If every direct request fails (e.g. the nodes don't
 * allow browser CORS), the app's `/api/rpc` proxy is used as a fallback and
 * direct attempts are suspended for a cooldown.
 */
import { decodeFunctionResult, encodeFunctionData } from 'viem';

import { cosmicGameAbi } from '@/contracts/abis';

import { rpcUrls } from '@/lib/serverRotation';

/** One consistent endgame snapshot read straight from a node. */
export interface EndgameChainSample {
  /** Contract `mainPrizeTime()` — absolute deadline, epoch seconds. */
  mainPrizeTimeSec: number;
  /** Contract `lastBidderAddress()`. */
  lastBidderAddress: string;
  /** Contract `roundNum()` — increments when the main prize is claimed. */
  roundNum: number;
  /** Latest block timestamp, epoch seconds — the clock the contract judges by. */
  blockTimestampSec: number;
  /** Local wall-clock time the sample was received. */
  sampledAtMs: number;
}

const REQUEST_TIMEOUT_MS = 2_500;
const DIRECT_COOLDOWN_MS = 5 * 60_000;

/** Epoch ms until which direct node requests are skipped after total failure. */
let directDisabledUntilMs = 0;

interface JsonRpcResponseItem {
  id?: number;
  result?: unknown;
  error?: { code?: number; message?: string };
}

interface BatchIds {
  mainPrizeTime: number;
  lastBidderAddress: number;
  roundNum: number;
  latestBlock: number;
}

function buildBatch(contractAddress: string): { payload: string; ids: BatchIds } {
  const ids: BatchIds = { mainPrizeTime: 1, lastBidderAddress: 2, roundNum: 3, latestBlock: 4 };
  const call = (id: number, functionName: string) => ({
    jsonrpc: '2.0',
    id,
    method: 'eth_call',
    params: [
      { to: contractAddress, data: encodeFunctionData({ abi: cosmicGameAbi, functionName }) },
      'latest',
    ],
  });
  const payload = JSON.stringify([
    call(ids.mainPrizeTime, 'mainPrizeTime'),
    call(ids.lastBidderAddress, 'lastBidderAddress'),
    call(ids.roundNum, 'roundNum'),
    {
      jsonrpc: '2.0',
      id: ids.latestBlock,
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
    },
  ]);
  return { payload, ids };
}

async function postBatch(url: string, payload: string): Promise<JsonRpcResponseItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`RPC ${url} responded ${res.status}`);
    const data: unknown = await res.json();
    if (!Array.isArray(data)) throw new Error(`RPC ${url} returned a non-batch response`);
    return data as JsonRpcResponseItem[];
  } finally {
    clearTimeout(timer);
  }
}

function pick(items: JsonRpcResponseItem[], id: number): unknown {
  const item = items.find((it) => it.id === id);
  if (!item) throw new Error(`batch response missing id ${id}`);
  if (item.error) throw new Error(`RPC error ${item.error.code}: ${item.error.message}`);
  return item.result;
}

function decodeUintCall(functionName: string, hex: unknown): number {
  const value = decodeFunctionResult({
    abi: cosmicGameAbi,
    functionName,
    data: hex as `0x${string}`,
  });
  return Number(value as bigint);
}

function parseSample(items: JsonRpcResponseItem[], ids: BatchIds): EndgameChainSample {
  const block = pick(items, ids.latestBlock) as { timestamp?: string } | null;
  const timestampHex = block?.timestamp;
  if (typeof timestampHex !== 'string') throw new Error('latest block missing timestamp');
  const lastBidder = decodeFunctionResult({
    abi: cosmicGameAbi,
    functionName: 'lastBidderAddress',
    data: pick(items, ids.lastBidderAddress) as `0x${string}`,
  });
  return {
    mainPrizeTimeSec: decodeUintCall('mainPrizeTime', pick(items, ids.mainPrizeTime)),
    lastBidderAddress: String(lastBidder),
    roundNum: decodeUintCall('roundNum', pick(items, ids.roundNum)),
    blockTimestampSec: Number(BigInt(timestampHex)),
    sampledAtMs: Date.now(),
  };
}

/** Race the payload across `urls`; first successful response wins. */
async function race(urls: string[], payload: string): Promise<JsonRpcResponseItem[]> {
  return Promise.any(urls.map((url) => postBatch(url, payload)));
}

/**
 * Reads the endgame snapshot, racing all configured RPC nodes directly and
 * falling back to the app's `/api/rpc` proxy when direct access fails.
 */
export async function fetchEndgameChainSample(
  contractAddress: string,
): Promise<EndgameChainSample> {
  const { payload, ids } = buildBatch(contractAddress);
  const directUrls = Date.now() >= directDisabledUntilMs ? rpcUrls : [];

  if (directUrls.length > 0) {
    try {
      return parseSample(await race(directUrls, payload), ids);
    } catch {
      // Likely CORS or all nodes unreachable from this browser; use the proxy
      // for a while instead of paying the failed round-trips every second.
      directDisabledUntilMs = Date.now() + DIRECT_COOLDOWN_MS;
    }
  }

  const proxyUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/rpc` : '';
  if (!proxyUrl) throw new Error('no RPC endpoint available for endgame sample');
  return parseSample(await race([proxyUrl], payload), ids);
}

/** Test helper: clears the direct-access cooldown. */
export function __resetRpcRace(): void {
  directDisabledUntilMs = 0;
}
