import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';

import { resolveTokenLogo } from '@/services/tokenLogos';

function cachedJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const address = (searchParams.get('address') ?? '').trim();
  const chainId = Number(searchParams.get('chainId') ?? '42161');

  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }
  if (!isAddress(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }
  if (!Number.isInteger(chainId)) {
    return NextResponse.json({ error: 'Invalid chainId' }, { status: 400 });
  }

  const logo = await resolveTokenLogo({ chainId, address });
  return cachedJson(logo);
}
