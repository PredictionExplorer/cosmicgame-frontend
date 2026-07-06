export interface MessageSegment {
  /** Segment kind: plain text or a linkified URL. */
  type: 'text' | 'url';
  /** Raw text exactly as it appeared in the message. */
  value: string;
  /** Normalized absolute http(s) URL. Present only on `url` segments. */
  href?: string;
}

const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>]+/gi;

const TRAILING_PUNCTUATION = new Set(['.', ',', ';', ':', '!', '?', "'", '"', '\u2026']);

const CLOSING_TO_OPENING_BRACKET: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

function countOccurrences(value: string, char: string): number {
  let count = 0;
  for (const current of value) {
    if (current === char) count += 1;
  }
  return count;
}

/**
 * Trims sentence punctuation from the end of a URL match ("see https://x.com."
 * should link to https://x.com). Closing brackets are only trimmed when they
 * are unbalanced, so wiki-style URLs like https://x.com/a_(b) stay intact.
 */
function trimTrailingPunctuation(match: string): string {
  let url = match;
  for (;;) {
    const last = url.charAt(url.length - 1);
    if (TRAILING_PUNCTUATION.has(last)) {
      url = url.slice(0, -1);
      continue;
    }
    const opening = CLOSING_TO_OPENING_BRACKET[last];
    if (opening && countOccurrences(url, last) > countOccurrences(url, opening)) {
      url = url.slice(0, -1);
      continue;
    }
    break;
  }
  return url;
}

/** Validates a candidate URL, returning a normalized href or null when unsafe. */
function toSafeHref(rawUrl: string): string | null {
  const candidate = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  // Gesture messages are permissionless content; only link hosts that look
  // like real public domains (dotted, not a bare word or trailing-dot stub).
  const { hostname } = parsed;
  if (!hostname.includes('.') || hostname.startsWith('.') || hostname.endsWith('.')) return null;
  return candidate;
}

/**
 * Splits free-form message text into plain-text and URL segments.
 * Only explicit http(s) URLs and `www.` hosts are linkified; anything that
 * fails URL validation stays plain text.
 */
export function linkifyMessage(text: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  if (!text) return segments;

  let lastIndex = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    const url = trimTrailingPunctuation(match[0]);
    const href = url.length > 0 ? toSafeHref(url) : null;
    if (!href) continue;

    if (start > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, start) });
    }
    segments.push({ type: 'url', value: url, href });
    lastIndex = start + url.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return segments;
}
