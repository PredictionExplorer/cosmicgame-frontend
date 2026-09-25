import { cache } from 'react';

import { getAPIUrl } from '@/services/api/client';
import type { CSTTokenInfo } from '@/services/api/types';

import { seedsDisabled } from '../../QuerySeed';

/**
 * A Signature's record, read once per request: the route layout decides
 * with it whether the token exists, and the page's metadata, JSON-LD and
 * first paint render it. `fetch` (not axios) so the read lands in the Next.js
 * Data Cache, and React `cache()` so the three share one request.
 *
 * Resolves `null` when the API says it holds no such token (it answers
 * `400 {"error":"record not found"}`, some routes 404), so the route answers
 * a real 404; `undefined` when the read failed or was skipped, and the page
 * then loads the record itself. Under the e2e harness the browser mocks the
 * API, so the server reads nothing and never turns a fixture token away.
 */
export const loadTokenInfo = cache(
  async (tokenId: number): Promise<CSTTokenInfo | null | undefined> => {
    if (seedsDisabled()) return undefined;
    try {
      const response = await fetch(getAPIUrl(`cst/info/${tokenId}`), {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 },
      });
      if (response.status === 400 || response.status === 404) return null;
      if (!response.ok) return undefined;
      const data = (await response.json()) as { TokenInfo?: CSTTokenInfo | null };
      return data.TokenInfo ?? null;
    } catch {
      return undefined;
    }
  },
);
