import { NextRequest, NextResponse } from 'next/server';
import axios, { type Method, type AxiosRequestConfig } from 'axios';

import { reportError } from '@/utils/errors';

const ALLOWED_HOSTS = new Set(
  (process.env.PROXY_ALLOWED_HOSTS || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean),
);

ALLOWED_HOSTS.add('nfts.cosmicsignature.com');
// Allow the known Cosmic Game API hosts so the proxy works without extra env config.
ALLOWED_HOSTS.add('127.0.0.1');
ALLOWED_HOSTS.add('api-sepolia.cosmicsignature.com');
ALLOWED_HOSTS.add('api.cosmicsignature.com');

function isAllowedUrl(raw: string): URL | null {
  try {
    const parsed = new URL(raw.startsWith('http') ? raw : `http://${raw}`);

    if (ALLOWED_HOSTS.has(parsed.hostname)) return parsed;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      try {
        const allowed = new URL(apiUrl);
        if (parsed.hostname === allowed.hostname && parsed.port === allowed.port) {
          return parsed;
        }
      } catch {
        /* ignore bad env */
      }
    }

    return null;
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic';

async function handleProxy(req: NextRequest) {
  let targetUrl: string | undefined = undefined;
  try {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is missing or invalid' }, { status: 400 });
    }

    const parsed = isAllowedUrl(url);
    if (!parsed) {
      return NextResponse.json({ error: 'Target host is not allowed' }, { status: 403 });
    }

    targetUrl = parsed.href;

    const axiosConfig: AxiosRequestConfig = {
      method: req.method as Method,
      url: targetUrl,
      headers: Object.fromEntries(req.headers),
      responseType: 'arraybuffer',
    };

    // Forward request body for non-GET/HEAD methods
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      axiosConfig.data = await req.arrayBuffer();
    }

    // Override host header to target
    axiosConfig.headers!.host = parsed.host;

    const response = await axios(axiosConfig);

    const responseHeaders = new Headers();
    for (const [key, value] of Object.entries(response.headers)) {
      if (value && typeof value === 'string') {
        responseHeaders.set(key, value);
      }
    }

    return new NextResponse(response.data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const axiosErr = error as { message?: string; response?: { status?: number } };
    reportError(error, 'proxy request');
    return NextResponse.json(
      { message: 'Proxy request failed', status: axiosErr.response?.status || 500 },
      { status: axiosErr.response?.status || 500 },
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
