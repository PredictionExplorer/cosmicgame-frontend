import { URL } from 'url';

import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { Method, AxiosRequestConfig } from 'axios';

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
};

const ALLOWED_HOSTS = new Set(
  (process.env.PROXY_ALLOWED_HOSTS || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean),
);

ALLOWED_HOSTS.add('nfts.cosmicsignature.com');

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let targetUrl: string | undefined = undefined;
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL parameter is missing or invalid' });
      return;
    }

    const parsed = isAllowedUrl(url);
    if (!parsed) {
      res.status(403).json({ error: 'Target host is not allowed' });
      return;
    }

    targetUrl = parsed.href;

    const axiosConfig: AxiosRequestConfig = {
      method: req.method as Method,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: parsed.host,
      } as unknown as Record<string, string>,
      responseType: 'stream',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      axiosConfig.data = req;
    }

    const response = await axios(axiosConfig);

    res.writeHead(response.status, response.headers as Record<string, string>);
    response.data.pipe(res);
  } catch (error: unknown) {
    const axiosErr = error as { message?: string; response?: { status?: number } };
    console.error('Proxy request failed:', axiosErr.message);
    res.status(axiosErr.response?.status || 500).json({
      message: 'Proxy request failed',
      status: axiosErr.response?.status || 500,
    });
  }
}
