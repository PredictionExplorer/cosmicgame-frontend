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
import { formatId } from '@/utils/format';
import { parseCanonicalNonNegativeSafeInteger } from '@/utils/routeParams';

import {
  OG_DATA_REVALIDATE_SECONDS,
  OG_FETCH_TIMEOUT_MS,
  loadCycleArtwork,
  loadGesture,
  loadLatestArtworks,
  loadParticipantArtworks,
  loadTokenArtwork,
  loadTokenInfo,
  type OgTokenInfo,
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
import { OG_DOMAINS, type OgHost } from './hosts';

/**
 * One builder per share-card route; the `opengraph-image.tsx` files only
 * resolve params and call these. Every builder degrades to the text card
 * when the API or the media origin cannot answer.
 */

/** `generateImageMetadata` result for a card with `alt`. */
export function ogImageMetadata(alt: string) {
  return [{ id: 'default', alt, size: COSMIC_OG_SIZE, contentType: 'image/png' }];
}

type TokenIdentity = Pick<OgTokenInfo, 'tokenId' | 'name'>;

/** `Twisted Mind`, or `Signature #000024` for a token without a name. */
function artworkTitle(locale: string, token: TokenIdentity): string {
  return (
    token.name ??
    fillOgTemplate(getOgCopy(locale, 'token').title, { number: formatId(token.tokenId) })
  );
}

/** `{name} · {cycle}` in the locale's own form: `#000025 · Cycle 1`. */
function withCycle(locale: string, name: string, cycle: number | null): string {
  if (cycle === null) return name;
  return fillOgTemplate(getOgCatalog(locale).shared.plateCaption, {
    name,
    cycle: formatOgCycle(locale, cycle),
  });
}

/** Wall label under a plate: `Signature #000047 · Cycle 1`. */
function wallLabel(locale: string, token: OgTokenInfo, showCycle = true): string {
  const title = artworkTitle(locale, token);
  return showCycle ? withCycle(locale, title, token.cycle) : title;
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
    art: artworks.map((artwork) => ({ src: artwork.src, number: formatId(artwork.tokenId) })),
  });
}

/**
 * The line above a token's title: its number and cycle when the title is the
 * owner's name (`#000025 · Cycle 1`), or the cycle alone when the title is
 * already the number.
 */
function tokenEyebrow(locale: string, token: OgTokenInfo): string | undefined {
  if (token.name) return withCycle(locale, formatId(token.tokenId), token.cycle);
  return token.cycle === null ? undefined : formatOgCycle(locale, token.cycle);
}

/**
 * `/detail/[id]`: the piece on its plate, with its name, number and cycle.
 * Without its render the card still names this token, on the text layout; it
 * never shows another Signature in its place.
 */
export async function tokenCard(locale: string, rawId: string): Promise<ImageResponse> {
  const copy = getOgCopy(locale, 'token');
  const tokenId = parseCanonicalNonNegativeSafeInteger(rawId);
  if (tokenId === null) return textCard(locale, 'default', 'app');
  const artwork = await loadTokenArtwork(tokenId);
  const token = artwork ?? (await loadTokenInfo(tokenId)) ?? { tokenId, name: null, cycle: null };
  return createCosmicOgImage(locale, {
    eyebrow: tokenEyebrow(locale, token),
    title: artworkTitle(locale, token),
    subhead: copy.subhead,
    domain: OG_DOMAINS.app,
    art: artwork ? [{ src: artwork.src }] : [],
  });
}

/** The token's structure and palette, in the locale, when its metadata can be read. */
async function traitLabels(
  locale: string,
  tokenId: number,
): Promise<{ structure: string; palette: string } | null> {
  try {
    const metadata = await fetchNftMetadata(tokenId, {
      next: { revalidate: OG_DATA_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(OG_FETCH_TIMEOUT_MS),
    });
    const entry = metadata ? normalizeTraitEntry(metadata, tokenId) : null;
    if (!entry?.structure || !entry.palette) return null;
    const t = (await getTranslations({ locale, namespace: 'traits' })) as TraitTranslator;
    return {
      structure: resolveTraitValueLabel(t, 'structure', entry.structure),
      palette: resolveTraitValueLabel(t, 'palette', entry.palette),
    };
  } catch {
    // Traits are optional for alt text; the plain form still names the piece.
    return null;
  }
}

/**
 * Alt text for a token card: the name when it has one, the number, the cycle
 * and the traits, in the locale, each part only when it can be read
 * (`Twisted Mind, Cosmic Signature #25 from Cycle 1: Orbit Ribbons structure,
 * Solar Mono palette`).
 */
export async function tokenCardAlt(locale: string, rawId: string): Promise<string> {
  const tokenId = parseCanonicalNonNegativeSafeInteger(rawId);
  if (tokenId === null) return getOgCopy(locale, 'default').alt;
  const copy = getOgCatalog(locale).token;
  const [token, traits] = await Promise.all([loadTokenInfo(tokenId), traitLabels(locale, tokenId)]);
  let subject = token?.name
    ? fillOgTemplate(copy.altSubjectNamed, { name: token.name, id: tokenId })
    : fillOgTemplate(copy.altSubject, { id: tokenId });
  if (token && token.cycle !== null) {
    subject = fillOgTemplate(copy.altInCycle, { subject, cycle: token.cycle });
  }
  return traits
    ? fillOgTemplate(copy.altWithTraits, { subject, ...traits })
    : fillOgTemplate(copy.alt, { subject });
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
      : artworks.map((artwork) => ({ src: artwork.src, number: formatId(artwork.tokenId) }));
  return createCosmicOgImage(locale, {
    eyebrow: copy.eyebrow,
    title: short,
    monoTitle: true,
    subhead: copy.subhead,
    domain: OG_DOMAINS.app,
    art,
  });
}

export function participantCardAlt(locale: string, rawAddress: string | undefined): string {
  const copy = getOgCopy(locale, 'participant');
  const trimmed = rawAddress?.trim() ?? '';
  return isAddress(trimmed, { strict: false }) && copy.altWithValue
    ? fillOgTemplate(copy.altWithValue, { address: getAddress(trimmed) })
    : copy.alt;
}
