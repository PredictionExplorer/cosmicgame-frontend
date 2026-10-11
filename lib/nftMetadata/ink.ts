import * as z from 'zod';

import { bareSeed, getSeedPackageUrl, mediaFailoverUrl } from '@/utils/urls';

export type InkFilmVariant = 'short' | 'medium' | 'slow';

export interface InkFilm {
  variant: InkFilmVariant;
  url: string;
  /** Actual running time supplied by the asset manifest. */
  durationSeconds: number;
}

export interface InkFilms {
  films: InkFilm[];
  poster: string | undefined;
}

const MANIFEST_PATH = 'metadata/assets.json';
const REQUEST_TIMEOUT_MS = 8_000;
const FILM_ASSETS = [
  { variant: 'short', role: 'ember_web', path: 'videos/web/ember.mp4' },
  { variant: 'medium', role: 'ember_medium_web', path: 'videos/web/ember_medium.mp4' },
  { variant: 'slow', role: 'ember_slow_web', path: 'videos/web/ember_slow.mp4' },
] as const;
const POSTER_ASSETS = [
  { role: 'ember_web_full', path: 'images/web/ember_full.webp' },
  { role: 'ember_web_preview', path: 'images/web/ember_preview.webp' },
] as const;

const ManifestSchema = z.object({
  schema_version: z.literal(2),
  assets: z.array(z.object({ role: z.string(), path: z.string(), kind: z.string() }).loose()),
});

/** Distinguishes temporary read failures from an unusable manifest. */
export class InkFilmsError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = 'InkFilmsError';
  }
}

/** A seed is a package identifier, never a relative path or a remote URL. */
export function normalizeInkSeed(seed: string | number | null | undefined): string | undefined {
  if (seed == null) return undefined;
  if (typeof seed === 'number' && (!Number.isSafeInteger(seed) || seed < 0)) return undefined;
  const normalized = bareSeed(seed);
  return /^[0-9a-f]{1,64}$/.test(normalized) ? normalized : undefined;
}

/** Prefer the two-minute version, then the shortest available alternative. */
export function chooseDefaultInkFilm(films: readonly InkFilm[]): InkFilm | undefined {
  for (const variant of ['medium', 'short', 'slow'] as const) {
    const film = films.find((candidate) => candidate.variant === variant);
    if (film) return film;
  }
  return undefined;
}

function parseManifest(raw: unknown, manifestUrl: string): InkFilms | null {
  const parsed = ManifestSchema.safeParse(raw);
  if (!parsed.success) throw new InkFilmsError('Ink film manifest is unusable');
  const packageUrl = manifestUrl.slice(0, -MANIFEST_PATH.length);
  const films: InkFilm[] = [];
  let poster: string | undefined;

  for (const expected of FILM_ASSETS) {
    const matches = parsed.data.assets.filter((asset) => asset.role === expected.role);
    if (matches.length === 0) continue;
    const asset = matches[0]!;
    if (
      matches.length !== 1 ||
      asset.path !== expected.path ||
      asset.kind !== 'video' ||
      asset.format !== 'mp4' ||
      typeof asset.duration_seconds !== 'number' ||
      !Number.isFinite(asset.duration_seconds) ||
      asset.duration_seconds <= 0
    ) {
      throw new InkFilmsError('Ink film manifest contains an invalid video');
    }
    films.push({
      variant: expected.variant,
      url: `${packageUrl}${expected.path}`,
      durationSeconds: asset.duration_seconds,
    });
  }

  for (const expected of POSTER_ASSETS) {
    const matches = parsed.data.assets.filter((asset) => asset.role === expected.role);
    if (matches.length === 0) continue;
    const asset = matches[0]!;
    if (
      matches.length !== 1 ||
      asset.path !== expected.path ||
      asset.kind !== 'image' ||
      asset.format !== 'webp'
    ) {
      throw new InkFilmsError('Ink film manifest contains an invalid poster');
    }
    poster ??= `${packageUrl}${expected.path}`;
  }

  // An older package can have a perfectly valid manifest without ink films.
  return films.length > 0 ? { films, poster } : null;
}

async function readManifest(url: string, signal?: AbortSignal): Promise<InkFilms | null> {
  signal?.throwIfAborted();
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(
    () => controller.abort(new InkFilmsError('Ink film manifest request timed out', true)),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      // Manifests grow as new versions render; revalidate the browser cache.
      cache: 'no-cache',
      signal: controller.signal,
    });
    signal?.throwIfAborted();
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new InkFilmsError(
        `Failed to load ink film manifest (${response.status})`,
        response.status >= 500 || response.status === 408 || response.status === 429,
      );
    }
    const raw: unknown = await response.json();
    signal?.throwIfAborted();
    return parseManifest(raw, url);
  } catch (error) {
    signal?.throwIfAborted();
    if (controller.signal.aborted) throw controller.signal.reason;
    if (error instanceof InkFilmsError) throw error;
    if (error instanceof SyntaxError) throw new InkFilmsError('Ink film manifest is not JSON');
    throw new InkFilmsError('Ink film manifest could not be reached', true);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

/**
 * Discovers advertised ink films without requesting any video bytes. A missing
 * manifest or one without ink films resolves to null; malformed data and failed
 * reads reject. Temporary failures try the next configured media server once.
 */
export async function fetchInkFilms(
  seed: string | number,
  { signal }: { signal?: AbortSignal } = {},
): Promise<InkFilms | null> {
  const normalized = normalizeInkSeed(seed);
  if (!normalized) throw new InkFilmsError('Invalid ink film seed');
  const url = getSeedPackageUrl(normalized, MANIFEST_PATH);
  try {
    return await readManifest(url, signal);
  } catch (error) {
    signal?.throwIfAborted();
    const fallback = mediaFailoverUrl(url);
    if (!(error instanceof InkFilmsError) || !error.retryable || !fallback) throw error;
    return readManifest(fallback, signal);
  }
}
