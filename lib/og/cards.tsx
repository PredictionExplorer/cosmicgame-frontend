import type { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { getAddress, isAddress } from 'viem';

import { getLocaleConfig } from '@/i18n/localeConfig';
import {
  fetchNftMetadata,
  normalizeTraitEntry,
  resolveTraitValueLabel,
  type TraitTranslator,
} from '@/lib/nftMetadata';
import { parseCanonicalNonNegativeSafeInteger } from '@/utils/routeParams';

import {
  OG_DATA_REVALIDATE_SECONDS,
  loadCycleArtwork,
  loadGesture,
  loadLatestArtworks,
  loadParticipantArtworks,
  loadTokenArtwork,
  type OgArtwork,
} from './art';
import { COSMIC_OG_SIZE, type OgPlate } from './CosmicOgCard';
import {
  fillOgTemplate,
  formatOgCycle,
  getOgCatalog,
  getOgCopy,
  type OgGestureMethods,
  type OgRoute,
  type OgRouteCopy,
} from './copy';
import { createCosmicOgImage, type OgCardContent } from './createCosmicOgImage';

/**
 * One builder per share-card route; the `opengraph-image.tsx` files only
 * resolve params and call these. Every builder degrades to the text card
 * when the API or the media origin cannot answer.
 */

export type OgHost = 'app' | 'landing';

/** The public host printed on a card, whatever origin rendered it. */
export const OG_DOMAINS: Record<OgHost, string> = {
  app: 'app.cosmicsignature.com',
  landing: 'cosmicsignature.com',
};

/** `generateImageMetadata` result for a card with `alt`. */
export function ogImageMetadata(alt: string) {
  return [{ id: 'default', alt, size: COSMIC_OG_SIZE, contentType: 'image/png' }];
}

/** Zero-padded token number without the `#`: `24` → `000024`. */
export function tokenNumber(tokenId: number): string {
  return String(tokenId).padStart(6, '0');
}

/** `Twisted Mind`, or `Signature #000024` for a token without a name. */
function artworkTitle(locale: string, artwork: Pick<OgArtwork, 'tokenId' | 'name'>): string {
  return (
    artwork.name ??
    fillOgTemplate(getOgCopy(locale, 'token').title, { id: tokenNumber(artwork.tokenId) })
  );
}

/** Wall label under a plate: `Signature #000047 · Cycle 1`. */
function wallLabel(locale: string, artwork: OgArtwork, withCycle = true): string {
  const name = artworkTitle(locale, artwork);
  if (!withCycle || artwork.cycle === null) return name;
  return fillOgTemplate(getOgCatalog(locale).shared.plateCaption, {
    name,
    cycle: formatOgCycle(locale, artwork.cycle),
  });
}

function textOf(copy: OgRouteCopy): Pick<OgCardContent, 'eyebrow' | 'title' | 'subhead' | 'fact'> {
  return { eyebrow: copy.eyebrow, title: copy.title, subhead: copy.subhead, fact: copy.fact };
}

/**
 * A route's own copy beside the newest Signature: the brand cards of both
 * hosts, and the app pages whose subject is the collection itself.
 */
export async function latestArtworkCard(
  locale: string,
  route: OgRoute,
  host: OgHost,
): Promise<ImageResponse> {
  const [artwork] = await loadLatestArtworks(1);
  return createCosmicOgImage(locale, {
    ...textOf(getOgCopy(locale, route)),
    domain: OG_DOMAINS[host],
    art: artwork ? [{ src: artwork.src, label: wallLabel(locale, artwork) }] : [],
  });
}

/** A route's copy on the text card. */
export function textCard(locale: string, route: OgRoute, host: OgHost): Promise<ImageResponse> {
  return createCosmicOgImage(locale, {
    ...textOf(getOgCopy(locale, route)),
    domain: OG_DOMAINS[host],
  });
}

/** The gallery: its title above the three newest Signatures. */
export async function galleryCard(locale: string): Promise<ImageResponse> {
  const artworks = await loadLatestArtworks(3);
  const copy = getOgCopy(locale, 'gallery');
  if (artworks.length < 2) return latestArtworkCard(locale, 'gallery', 'app');
  return createCosmicOgImage(locale, {
    eyebrow: copy.eyebrow,
    title: copy.title,
    domain: OG_DOMAINS.app,
    art: artworks.map((artwork) => ({
      src: artwork.src,
      number: `#${tokenNumber(artwork.tokenId)}`,
    })),
  });
}

/**
 * `/detail/[id]`: the piece on its plate, named, with its cycle. Without its
 * render the card still names this token, on the text layout; it never shows
 * another Signature in its place.
 */
export async function tokenCard(locale: string, rawId: string): Promise<ImageResponse> {
  const copy = getOgCopy(locale, 'token');
  const tokenId = parseCanonicalNonNegativeSafeInteger(rawId);
  if (tokenId === null) return textCard(locale, 'default', 'app');
  const artwork = await loadTokenArtwork(tokenId);
  return createCosmicOgImage(locale, {
    eyebrow: artwork?.cycle != null ? formatOgCycle(locale, artwork.cycle) : undefined,
    title: artworkTitle(locale, artwork ?? { tokenId, name: null }),
    subhead: copy.subhead,
    domain: OG_DOMAINS.app,
    art: artwork ? [{ src: artwork.src }] : [],
  });
}

/**
 * Alt text for a token card, composed from its traits in the locale
 * (`Cosmic Signature #24: Orbit Ribbons structure, Glacial Split palette`).
 */
export async function tokenCardAlt(locale: string, rawId: string): Promise<string> {
  const copy = getOgCopy(locale, 'token');
  const tokenId = parseCanonicalNonNegativeSafeInteger(rawId);
  if (tokenId === null) return getOgCopy(locale, 'default').alt;
  try {
    const metadata = await fetchNftMetadata(tokenId, {
      next: { revalidate: OG_DATA_REVALIDATE_SECONDS },
    });
    const entry = metadata ? normalizeTraitEntry(metadata, tokenId) : null;
    if (entry?.structure && entry.palette && copy.altWithTraits) {
      const t = (await getTranslations({ locale, namespace: 'traits' })) as TraitTranslator;
      return fillOgTemplate(copy.altWithTraits, {
        id: tokenId,
        structure: resolveTraitValueLabel(t, 'structure', entry.structure),
        palette: resolveTraitValueLabel(t, 'palette', entry.palette),
      });
    }
  } catch {
    // Metadata is optional for alt text; the plain form below still names the piece.
  }
  return fillOgTemplate(copy.alt, { id: tokenId });
}

const GESTURE_METHODS: Record<number, keyof OgGestureMethods> = {
  0: 'eth',
  1: 'ethRandomWalk',
  2: 'cst',
};

/** `/gesture/[id]`: the gesture's position and cycle in the headline, its method above. */
export async function gestureCard(locale: string, rawId: string): Promise<ImageResponse> {
  const catalog = getOgCatalog(locale);
  const copy = catalog.gesture;
  const eventId = parseCanonicalNonNegativeSafeInteger(rawId);
  const gesture = eventId === null ? null : await loadGesture(eventId);
  const method = gesture?.method != null ? GESTURE_METHODS[gesture.method] : undefined;
  const title =
    gesture && gesture.cycle !== null && copy.titleWithValue
      ? fillOgTemplate(copy.titleWithValue, { position: gesture.position, cycle: gesture.cycle })
      : copy.title;
  return createCosmicOgImage(locale, {
    eyebrow: method ? copy.methods[method] : copy.eyebrow,
    title,
    subhead: copy.subhead,
    domain: OG_DOMAINS.app,
  });
}

export async function gestureCardAlt(locale: string, rawId: string): Promise<string> {
  const copy = getOgCopy(locale, 'gesture');
  const eventId = parseCanonicalNonNegativeSafeInteger(rawId);
  const gesture = eventId === null ? null : await loadGesture(eventId);
  return gesture && gesture.cycle !== null && copy.altWithValue
    ? fillOgTemplate(copy.altWithValue, { position: gesture.position, cycle: gesture.cycle })
    : copy.alt;
}

/** `/allocation/[id]`: the cycle in the headline, beside the cycle's Signature. */
export async function allocationCard(locale: string, rawId: string): Promise<ImageResponse> {
  const copy = getOgCopy(locale, 'allocation');
  const cycle = parseCanonicalNonNegativeSafeInteger(rawId);
  if (cycle === null) return textCard(locale, 'allocation', 'app');
  const artwork = await loadCycleArtwork(cycle);
  return createCosmicOgImage(locale, {
    eyebrow: copy.eyebrow,
    title: copy.titleWithValue ? fillOgTemplate(copy.titleWithValue, { cycle }) : copy.title,
    subhead: copy.subhead,
    domain: OG_DOMAINS.app,
    art: artwork ? [{ src: artwork.src, label: wallLabel(locale, artwork, false) }] : [],
  });
}

export function allocationCardAlt(locale: string, rawId: string): string {
  const copy = getOgCopy(locale, 'allocation');
  const cycle = parseCanonicalNonNegativeSafeInteger(rawId);
  return cycle !== null && copy.altWithValue
    ? fillOgTemplate(copy.altWithValue, { cycle })
    : copy.alt;
}

/**
 * A checksummed address shortened with the locale's ellipsis
 * (`0xA169…63B6`), or `null` when `raw` is not an address.
 */
export function shortAddress(locale: string, raw: string): string | null {
  const trimmed = raw.trim();
  if (!isAddress(trimmed, { strict: false })) return null;
  const address = getAddress(trimmed);
  return `${address.slice(0, 6)}${getLocaleConfig(locale).ellipsis}${address.slice(-4)}`;
}

/** `/user/[address]`: the participant's address, with up to three of their Signatures. */
export async function participantCard(locale: string, rawAddress: string): Promise<ImageResponse> {
  const copy = getOgCopy(locale, 'participant');
  const short = shortAddress(locale, rawAddress);
  if (!short) return textCard(locale, 'participant', 'app');
  const artworks = await loadParticipantArtworks(getAddress(rawAddress.trim()), 3);
  const art: OgPlate[] =
    artworks.length === 1
      ? [{ src: artworks[0]!.src, label: wallLabel(locale, artworks[0]!) }]
      : artworks.map((artwork) => ({
          src: artwork.src,
          number: `#${tokenNumber(artwork.tokenId)}`,
        }));
  return createCosmicOgImage(locale, {
    eyebrow: copy.eyebrow,
    title: short,
    monoTitle: true,
    subhead: copy.subhead,
    domain: OG_DOMAINS.app,
    art,
  });
}

export function participantCardAlt(locale: string, rawAddress: string): string {
  const copy = getOgCopy(locale, 'participant');
  const trimmed = rawAddress.trim();
  return isAddress(trimmed, { strict: false }) && copy.altWithValue
    ? fillOgTemplate(copy.altWithValue, { address: getAddress(trimmed) })
    : copy.alt;
}
