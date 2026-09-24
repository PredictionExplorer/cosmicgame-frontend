import { request as httpRequest, type IncomingMessage } from 'node:http';
import { request as httpsRequest } from 'node:https';

import sharp from 'sharp';

/**
 * Artwork pixels for the share cards.
 *
 * The source renders are 3456×2234 PNGs of 3–6 MB. They are downloaded with
 * `node:https` rather than `fetch`: Next.js's Data Cache refuses entries over
 * 2 MB (warning on every render, throwing in dev), and a `no-store` fetch
 * would turn every statically generated card dynamic. The card itself is the
 * cached artifact (each route's `revalidate`).
 *
 * Each render is scaled to the width the card draws it at before it reaches
 * the renderer: next/og rasterizes through sharp (librsvg) when sharp is
 * installed, and librsvg rejects an SVG over 10 MB, which one embedded source
 * render already exceeds. Scaled renders are memoized per process, so the
 * eight locales of one card share a single download. Any failure resolves to
 * `null` and the card falls back to its text layout.
 */

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const DEFAULT_TIMEOUT_MS = 8_000;
const MAX_BYTES = 16 * 1024 * 1024;
const MAX_REDIRECTS = 3;
/** Scaled renders kept in memory (a few hundred kilobytes each). */
const MEMO_SIZE = 24;

export function isPng(bytes: Uint8Array): boolean {
  return bytes.length > PNG_SIGNATURE.length && PNG_SIGNATURE.every((b, i) => bytes[i] === b);
}

function download(url: URL, timeoutMs: number, redirectsLeft: number): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      request.destroy();
      resolve(null);
    }, timeoutMs);
    const done = (value: Buffer | null | Promise<Buffer | null>) => {
      clearTimeout(timer);
      resolve(value);
    };

    const request = (url.protocol === 'https:' ? httpsRequest : httpRequest)(
      url,
      { headers: { Accept: 'image/png' } },
      (response: IncomingMessage) => {
        const status = response.statusCode ?? 0;
        const location = response.headers.location;
        if (status >= 300 && status < 400 && location && redirectsLeft > 0) {
          response.resume();
          done(download(new URL(location, url), timeoutMs, redirectsLeft - 1));
          return;
        }
        if (status !== 200) {
          response.resume();
          done(null);
          return;
        }
        const chunks: Buffer[] = [];
        let received = 0;
        response.on('data', (chunk: Buffer) => {
          received += chunk.length;
          if (received > MAX_BYTES) {
            request.destroy();
            done(null);
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () => {
          const bytes = Buffer.concat(chunks);
          done(isPng(bytes) ? bytes : null);
        });
        response.on('error', () => done(null));
      },
    );
    request.on('error', () => done(null));
    request.end();
  });
}

/** The PNG at `url`, or `null` when it cannot be read in time. */
export function fetchPng(
  url: string,
  { timeoutMs = DEFAULT_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<Buffer | null> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return Promise.resolve(null);
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return Promise.resolve(null);
  return download(parsed, timeoutMs, MAX_REDIRECTS);
}

/**
 * A render scaled to `width` pixels (aspect kept, never enlarged), as PNG:
 * lossless, so the thin orbit lines keep their colour, and a few hundred
 * kilobytes instead of megabytes.
 */
export async function scaleArtwork(png: Uint8Array, width: number): Promise<Buffer | null> {
  try {
    return await sharp(png)
      .resize({ width, withoutEnlargement: true })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
  } catch {
    return null;
  }
}

const memo = new Map<string, Promise<Buffer | null>>();

/** The render at `url`, scaled to `width`, memoized; `null` when unavailable. */
export function loadScaledArtwork(url: string, width: number): Promise<Buffer | null> {
  const key = `${width}@${url}`;
  const cached = memo.get(key);
  if (cached) return cached;
  const pending = fetchPng(url)
    .then((png) => (png ? scaleArtwork(png, width) : null))
    .then((scaled) => {
      // Failures are not remembered: the next render tries again.
      if (!scaled) memo.delete(key);
      return scaled;
    });
  memo.set(key, pending);
  while (memo.size > MEMO_SIZE) {
    const oldest = memo.keys().next().value;
    if (oldest === undefined) break;
    memo.delete(oldest);
  }
  return pending;
}

/** `data:` URI Satori can draw. */
export function pngDataUri(bytes: Uint8Array): string {
  return `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`;
}
