import { cache } from 'react';

import { SERVER_READ_TIMEOUT_MS, getAPIUrl } from '@/services/api/client';
import { saysRecordNotFound } from '@/services/api/readError';
import type { CSTTokenInfo } from '@/services/api/types';

import { seedsDisabled } from '../../QuerySeed';

/**
 * Whether a 400 is the API saying it holds no such record
 * (`saysRecordNotFound`). Its other errors share the status, and one of
 * those must not turn an existing token into a missing one.
 */
async function answersRecordNotFound(response: Response): Promise<boolean> {
  try {
    return saysRecordNotFound(await response.json());
  } catch {
    return false;
  }
}

/**
 * A Signature's record, read once per render: the page decides with it
 * whether the token exists, and its metadata, JSON-LD and first paint render
 * it. `fetch` (not axios) so the read lands in the Next.js Data Cache, and
 * React `cache()` so the page and its metadata share one request.
 *
 * Resolves `null` when the API says it holds no such token (a 404, or a 400
 * whose body says "record not found"), and the page renders the Signature's
 * not-found state; `undefined` when the read failed for any other reason,
 * took longer than `SERVER_READ_TIMEOUT_MS`, or was skipped, and the page
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
        signal: AbortSignal.timeout(SERVER_READ_TIMEOUT_MS),
      });
      if (response.status === 404) return null;
      if (response.status === 400)
        return (await answersRecordNotFound(response)) ? null : undefined;
      if (!response.ok) return undefined;
      const data = (await response.json()) as { TokenInfo?: CSTTokenInfo | null };
      return data.TokenInfo ?? null;
    } catch {
      return undefined;
    }
  },
);
