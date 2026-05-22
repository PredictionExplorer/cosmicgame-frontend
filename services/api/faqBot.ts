import { getAPIUrl } from './client';

export interface FaqHealthResponse {
  status: string;
  haystack?: { documents?: number };
  sessions?: { ttl_seconds?: number };
}

export interface FaqQueryResponse {
  answer: string;
  sources?: string[];
  session_id: string;
}

export interface FaqErrorDetail {
  error?: string;
  component?: string;
}

export class FaqBotError extends Error {
  readonly status: number;
  readonly component?: string;

  constructor(message: string, status: number, component?: string) {
    super(message);
    this.name = 'FaqBotError';
    this.status = status;
    this.component = component;
  }
}

/** Optional direct FAQ bot base URL (e.g. http://127.0.0.1:8000) when Go proxy is not deployed yet. */
function resolveFaqUrl(kind: 'health' | 'query'): string {
  const direct = process.env.NEXT_PUBLIC_FAQ_BOT_URL?.trim();
  if (direct) {
    const base = direct.replace(/\/+$/, '');
    return kind === 'health' ? `${base}/health` : `${base}/api/query`;
  }
  return getAPIUrl(`faq/${kind}`);
}

function parseErrorDetail(data: unknown): FaqErrorDetail {
  if (!data || typeof data !== 'object') return {};
  const record = data as Record<string, unknown>;
  const detail = record.detail;
  if (detail && typeof detail === 'object') {
    const d = detail as Record<string, unknown>;
    return {
      error: typeof d.error === 'string' ? d.error : undefined,
      component: typeof d.component === 'string' ? d.component : undefined,
    };
  }
  if (typeof record.error === 'string') {
    return {
      error: record.error,
      component: typeof record.component === 'string' ? record.component : undefined,
    };
  }
  return {};
}

async function readJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) {
    throw new FaqBotError(`FAQ service returned empty response (HTTP ${res.status})`, res.status);
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const snippet = trimmed.length > 160 ? `${trimmed.slice(0, 160)}…` : trimmed;
    if (res.status === 404 || /^404\b/.test(trimmed)) {
      throw new FaqBotError(
        'FAQ endpoint not found (404). Restart websrv with AI_BOT_BACKEND_URL, or set NEXT_PUBLIC_FAQ_BOT_URL=http://127.0.0.1:8000 for local dev.',
        res.status,
        'faq_route',
      );
    }
    throw new FaqBotError(
      `FAQ service returned non-JSON (HTTP ${res.status}): ${snippet}`,
      res.status,
    );
  }
}

export async function faqHealth(): Promise<FaqHealthResponse> {
  const res = await fetch(resolveFaqUrl('health'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const data = (await readJsonResponse(res)) as FaqHealthResponse | { detail?: FaqHealthResponse };
  if (!res.ok) {
    const detail = parseErrorDetail(data);
    throw new FaqBotError(detail.error || 'FAQ health check failed', res.status, detail.component);
  }
  if ('detail' in data && data.detail) {
    return data.detail;
  }
  return data as FaqHealthResponse;
}

export async function faqQuery(
  question: string,
  sessionId?: string | null,
): Promise<FaqQueryResponse> {
  const res = await fetch(resolveFaqUrl('query'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ question, session_id: sessionId ?? null }),
  });
  const data = (await readJsonResponse(res)) as FaqQueryResponse | { detail?: FaqErrorDetail };
  if (!res.ok) {
    const detail = parseErrorDetail(data);
    const msg = detail.error || JSON.stringify(data);
    throw new FaqBotError(msg, res.status, detail.component);
  }
  return data as FaqQueryResponse;
}
