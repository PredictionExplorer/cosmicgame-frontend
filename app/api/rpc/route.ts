/**
 * RPC proxy - forwards JSON-RPC requests to the configured Ethereum node.
 * Used when the node does not support CORS (e.g. self-hosted nodes).
 */
import { NextRequest, NextResponse } from 'next/server';

const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'sepolia';
const DEFAULT_RPC: Record<string, string> = {
  local: 'http://161.129.67.42:22945',
  sepolia: 'http://161.129.67.42:22545',
  mainnet: '', // mainnet uses Infura, no proxy by default
};
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_RPC[NETWORK] || DEFAULT_RPC.sepolia;

export async function POST(req: NextRequest) {
  if (!RPC_URL) {
    return NextResponse.json(
      { error: 'RPC URL not configured (NEXT_PUBLIC_RPC_URL)' },
      { status: 500 },
    );
  }

  try {
    const body = await req.json();
    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[rpc proxy]', err);
    return NextResponse.json(
      { error: 'RPC proxy request failed' },
      { status: 500 },
    );
  }
}
