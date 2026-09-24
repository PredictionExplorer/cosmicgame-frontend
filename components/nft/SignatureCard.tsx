'use client';

import { Fragment, type ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import type { NftTraitEntry } from '@/lib/nftMetadata';
import { AnchoringIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { ArtFrame, type ArtSource } from '@/components/ui/art-frame';
import { Skeleton, SkeletonNFTCard } from '@/components/ui/skeleton';

import { signatureMedia, useSignatureAlt } from './signatureArt';
import { useTraitLabels } from './traits/useTraitLabels';

export interface SignatureCardProps {
  tokenId: number;
  /** The token's seed; without one the plate shows the designed unavailable state. */
  seed?: string | number | null;
  /** The token's name; an unnamed Signature is titled by its number. */
  name?: string | null;
  /**
   * The token's traits: `undefined` while the collection index loads (a
   * skeleton line), `null` when none are published yet.
   */
  entry?: NftTraitEntry | null;
  /** Anchored right now: a quiet anchor after the title. */
  anchored?: boolean;
  /** The plate's rendered width at each breakpoint, for the srcset choice. */
  sizes: string;
  /** The first row of a grid in the first viewport: load eagerly. */
  priority?: boolean;
  /** Extra caption facts after the traits ("Stellar Selection", a date). */
  extraMeta?: readonly ReactNode[];
  /** Opens the quick view; the button shows to a mouse on hover and focus. */
  onQuickView?: (tokenId: number) => void;
  className?: string;
}

/** The status slot's top: the plate's height at the card's width (100cqw), plus the label's margin. */
const LABEL_TOP = 'top-[calc(100cqw*2234/3456+0.5rem)]';

/**
 * A card's source chain: the 640px thumbnail first, then the full-size files
 * as fallbacks. A wall of cards never asks for the 3456px render (about 12
 * times the bytes); the detail page shows it.
 */
export function signatureCardSources(
  seed: string | number | null | undefined,
): readonly ArtSource[] {
  const media = signatureMedia(seed);
  if (!media) return [];
  const thumbnail = media.renditions[0]?.src;
  return [thumbnail, media.webImage, media.sourceImage].filter((source): source is string =>
    Boolean(source),
  );
}

/**
 * SignatureCard — one Signature on a wall: the art on its black plate at the
 * native ratio with nothing over it, and a quiet wall label under it. The
 * title is the token's name, or its number when it has none; the caption
 * carries the number (for a named token), structure and palette. The whole
 * card is one link to the detail page, named by the plate's alt text (composed
 * from the traits); the visible label repeats part of it, so it is hidden
 * from assistive technology rather than read twice.
 */
export function SignatureCard({
  tokenId,
  seed,
  name,
  entry,
  anchored = false,
  sizes,
  priority = false,
  extraMeta,
  onQuickView,
  className,
}: SignatureCardProps) {
  const tDetail = useTranslations('detail');
  const tTraits = useTranslations('traits');
  const signatureAlt = useSignatureAlt();
  const { valueLabel } = useTraitLabels();
  const id = formatId(tokenId);
  const trimmedName = name?.trim() || null;
  const alt = signatureAlt({ id, name: trimmedName, entry });
  const traitsLoading = entry === undefined;
  const structure = entry?.structure ? valueLabel('structure', entry.structure) : null;
  const palette = entry?.palette ? valueLabel('palette', entry.palette) : null;
  // One locale-aware pair: a palette name may itself hold a middle dot (uk).
  const traitSummary = entry?.hasArtTraits
    ? structure && palette
      ? tTraits('card.traitSummary', { structure, palette })
      : (structure ?? palette)
    : traitsLoading
      ? null
      : tTraits('card.traitsPending');

  return (
    <article
      className={cn('group relative min-w-0 @container', className)}
      data-testid="signature-card"
      data-token-id={tokenId}
    >
      <Link href={`/detail/${tokenId}`} className="block rounded-edge">
        <ArtFrame
          sources={signatureCardSources(seed)}
          alt={alt}
          sizes={sizes}
          priority={priority}
          unavailableLabel={tDetail('image.artworkUnavailable')}
          unavailableDetail={id}
          className="group-hover:after:shadow-[var(--art-edge-active)]"
        />
        <div className="mt-3 flex min-w-0 items-start gap-2">
          <div className="min-w-0 flex-1">
            {/* The alt text above already says all of this. */}
            <div aria-hidden>
              <p
                className={cn(
                  'line-clamp-2 type-body-md font-medium text-foreground [overflow-wrap:anywhere]',
                  'decoration-rule underline-offset-4 group-hover:underline',
                  !trimmedName && 'tabular-nums',
                )}
              >
                {trimmedName ?? id}
              </p>
              {traitsLoading ? (
                <Skeleton className="mt-1.5 h-3 w-2/3" data-testid="trait-skeleton" />
              ) : (
                <CaptionLine
                  facts={[
                    trimmedName ? (
                      <span key="id" className="type-mono">
                        {id}
                      </span>
                    ) : null,
                    traitSummary,
                  ]}
                />
              )}
            </div>
            {extraMeta && extraMeta.length > 0 ? <CaptionLine facts={extraMeta} /> : null}
          </div>
          {/*
           * The status slot: the anchor, and (to a mouse, on hover or focus)
           * the quick-view button in its place, so the label never gains a
           * gap for a control that is not showing.
           */}
          {anchored || onQuickView ? (
            <span
              aria-hidden
              className={cn(
                '-mt-1 flex size-8 shrink-0 items-center justify-center transition-opacity duration-fast',
                !anchored && 'pointer-coarse:hidden',
                onQuickView &&
                  'pointer-fine:group-hover:opacity-0 pointer-fine:group-focus-within:opacity-0',
              )}
            >
              {anchored ? (
                <AnchoringIcon className="size-4 text-subtle" data-testid="anchored-mark" />
              ) : null}
            </span>
          ) : null}
          {anchored ? <span className="sr-only">{tTraits('card.anchoredState')}</span> : null}
        </div>
      </Link>
      {onQuickView ? (
        <button
          type="button"
          onClick={() => onQuickView(tokenId)}
          aria-label={tTraits('card.quickViewAria', { id })}
          className={cn(
            'absolute end-0 inline-flex size-8 items-center justify-center rounded-control text-subtle',
            LABEL_TOP,
            'transition-[opacity,color,background-color] duration-fast',
            'hover:bg-surface-raised hover:text-foreground',
            // A touch has no hover: tapping the card opens the detail page.
            'pointer-coarse:hidden',
            'opacity-0 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100',
          )}
          data-testid="quick-view-button"
        >
          <Maximize2 className="size-4" aria-hidden />
        </button>
      ) : null}
    </article>
  );
}

/**
 * A wall-label caption: short facts joined by middle dots. The space before
 * each dot does not break, so a wrapped caption ends its line with the dot
 * instead of starting the next one with it; two lines at most.
 */
function CaptionLine({ facts }: { facts: readonly ReactNode[] }) {
  const present = facts.filter(
    (fact) => fact !== null && fact !== undefined && fact !== false && fact !== '',
  );
  if (present.length === 0) return null;
  return (
    <p className="mt-0.5 line-clamp-2 type-caption text-subtle">
      {present.map((fact, index) => (
        <Fragment key={index}>
          {index > 0 ? '\u00a0· ' : null}
          {fact}
        </Fragment>
      ))}
    </p>
  );
}

/** Tailwind classes of the card grid: two across on phones, gaps that keep each label with its plate. */
export const SIGNATURE_GRID_CLASS =
  'grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 lg:gap-y-12';

export interface SignatureGridSkeletonProps {
  count: number;
  /** The grid's column classes (the same as the loaded grid's). */
  className?: string;
}

/** The loading grid: plates at the art's own ratio with two label lines, announced once. */
export function SignatureGridSkeleton({ count, className }: SignatureGridSkeletonProps) {
  const t = useTranslations('tables');
  return (
    <div
      role="status"
      aria-label={t('skeleton.loadingNft')}
      className={cn(SIGNATURE_GRID_CLASS, className)}
      data-testid="signature-grid-skeleton"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonNFTCard key={index} announce={false} className="rounded-none" />
      ))}
    </div>
  );
}
