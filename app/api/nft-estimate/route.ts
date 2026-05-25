import { NextRequest, NextResponse } from 'next/server';

const RESERVOIR_BASE_BY_CHAIN: Record<number, string> = {
  42161: 'https://api-arbitrum.reservoir.tools',
};

interface ReservoirCollection {
  floorAsk?: {
    price?: {
      amount?: {
        native?: number;
      };
      currency?: {
        symbol?: string;
      };
    };
    source?: {
      name?: string;
      domain?: string;
      url?: string;
    };
  };
}

interface ReservoirCollectionsResponse {
  collections?: ReservoirCollection[];
}

function jsonUnavailable(status = 200) {
  return NextResponse.json(null, {
    status,
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
    },
  });
}

function isValidContract(contract: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(contract);
}

function sourceUrlFromDomain(domain: string | undefined): string | undefined {
  if (!domain) return undefined;
  return domain.startsWith('http') ? domain : `https://${domain}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const contract = (searchParams.get('contract') ?? '').trim();
  const chainId = Number(searchParams.get('chainId') ?? '42161');

  if (!contract) {
    return NextResponse.json({ error: 'Missing contract' }, { status: 400 });
  }
  if (!isValidContract(contract)) {
    return NextResponse.json({ error: 'Invalid contract' }, { status: 400 });
  }

  const reservoirBase = RESERVOIR_BASE_BY_CHAIN[chainId];
  if (!reservoirBase) return jsonUnavailable();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const url = `${reservoirBase}/collections/v7?id=${encodeURIComponent(contract)}&limit=1`;
    const headers: HeadersInit = { Accept: 'application/json' };
    const apiKey = process.env.RESERVOIR_API_KEY?.trim();
    if (apiKey) headers['x-api-key'] = apiKey;

    const response = await fetch(url, {
      headers,
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    if (!response.ok) return jsonUnavailable();

    const data = (await response.json()) as ReservoirCollectionsResponse;
    const collection = data.collections?.[0];
    const floorAsk = collection?.floorAsk;
    const nativeFloor = floorAsk?.price?.amount?.native;
    if (typeof nativeFloor !== 'number' || !Number.isFinite(nativeFloor) || nativeFloor <= 0) {
      return jsonUnavailable();
    }

    const source = floorAsk?.source;
    return NextResponse.json(
      {
        floorPriceEth: nativeFloor,
        currency: floorAsk?.price?.currency?.symbol ?? 'ETH',
        source: source?.name ?? 'Reservoir',
        sourceUrl: source?.url ?? sourceUrlFromDomain(source?.domain),
        updatedAt: new Date().toISOString(),
        confidence: 'collection-floor',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
        },
      },
    );
  } catch {
    return jsonUnavailable();
  } finally {
    clearTimeout(timeoutId);
  }
}
