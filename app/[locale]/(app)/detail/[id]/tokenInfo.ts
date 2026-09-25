import { cache } from 'react';

import { getAPIUrl } from '@/services/api/client';
import type { CSTTokenInfo } from '@/services/api/types';

import { seedsDisabled } from '../../QuerySeed';

/**
 * Whether a 400 is the API saying it holds no such record
 * (`{"error":"record not found"}`). Its other errors share the status, and
 * one of those must not turn an existing token into a 404.
 */
async function saysRecordNotFound(response: Response): Promise<boolean> {
  try {
    const body = (await response.json()) as { error?: unknown } | null;
    return typeof body?.error === 'string' && /\brecord not found\b/i.test(body.error);
  } catch {
    return false;
  }
}

/**
 * A Signature's record, read once per request: the route layout decides
 * with it whether the token exists, and the page's metadata, JSON-LD and
 * first paint render it. `fetch` (not axios) so the read lands in the Next.js
 * Data Cache, and React `cache()` so the three share one request.
 *
 * Resolves `null` when the API says it holds no such token (a 404, or a 400
 * whose body says "record not found"), so the route answers a real 404;
 * `undefined` when the read failed for any other reason or was skipped, and
 * the page then loads the record itself. Under the e2e harness the browser
 * mocks the API, so the server reads nothing and never turns a fixture token
 * away.
 */
export const loadTokenInfo = cache(
  async (tokenId: number): Promise<CSTTokenInfo | null | undefined> => {
    if (seedsDisabled()) return undefined;
    try {
      const response = await fetch(getAPIUrl(`cst/info/${tokenId}`), {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 },
      });
      if (response.status === 404) return null;
      if (response.status === 400) return (await saysRecordNotFound(response)) ? null : undefined;
      if (!response.ok) return undefined;
      const data = (await response.json()) as { TokenInfo?: CSTTokenInfo | null };
      return data.TokenInfo ?? null;
    } catch {
      return undefined;
    }
  },
);
