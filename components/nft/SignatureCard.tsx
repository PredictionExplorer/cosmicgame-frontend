'use client';

import { Fragment, type ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import type { NftTraitEntry } from '@/lib/nftMetadata';
import { AnchoringIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { ArtFrame, ArtTag, type ArtSource } from '@/components/ui/art-frame';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

import { signatureMedia, useSignatureAlt } from './signatureArt';
import { useSignatureArtLabel } from './useSignatureArtLabel';
import { useTraitLabels } from './traits/useTraitLabels';

/** A card on a wall in select mode (choosing Signatures to send). */
export interface SignatureCardSelect {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** The checkbox's name ("Select #000025"). */
  label: string;
  /**
   * Why the Signature cannot be chosen ("Anchored", "Owner changed"), shown
   * as a tag in its label; `null` when it can be.
   */
  unavailable?: string | null;
  /** Choosing is paused (a send is running). */
  disabled?: boolean;
}

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
  /**
   * When the token was imprinted (unix seconds): a missing render reads
   * "Rendering" for the first hour, as on its own page.
   */
  imprintedAt?: number | null;
  /** The plate's rendered width at each breakpoint, for the srcset choice. */
  sizes: string;
  /** The first row of a grid in the first viewport: load eagerly. */
  priority?: boolean;
  /** Extra caption facts after the traits ("Stellar Selection", a date). */
  extraMeta?: readonly ReactNode[];
  /** Opens the quick view; the button shows to a mouse on hover and focus. */
  onQuickView?: (tokenId: number) => void;
  /**
   * Select mode: the card becomes a checkbox's label (a click anywhere
   * chooses it) instead of a link, the checkbox sits in the label row and a
   * chosen card draws its plate edge in the accent. Nothing covers or dims
   * the art; a Signature that cannot be chosen says why in a tag.
   */
  select?: SignatureCardSelect;
  /**
   * Caption lines after the card's link, for facts that carry links of
   * their own (who named it and when, with the proof).
   */
  after?: ReactNode;
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
 * carries the number (for a named token), then structure and palette from
 * `sm` (a phone's two-across label keeps to the name and number). An anchored
 * Signature says so in a word tag from `sm` and with the anchor alone on a
 * phone. The whole card is one link to the detail page, named by the plate's
 * alt text (composed from the traits); the visible label repeats part of it,
 * so it is hidden from assistive technology rather than read twice.
 */
export function SignatureCard({
  tokenId,
  seed,
  name,
  entry,
  anchored = false,
  imprintedAt,
  sizes,
  priority = false,
  extraMeta,
  onQuickView,
  select,
  after,
  className,
}: SignatureCardProps) {
  const tTraits = useTranslations('traits');
  const { label: unavailableLabel } = useSignatureArtLabel(imprintedAt);
  const signatureAlt = useSignatureAlt();
  const { valueLabel } = useTraitLabels();
  const id = formatId(tokenId);
  const trimmedName = name?.trim() || null;
  const alt = signatureAlt({ id, name: trimmedName, entry });
  const traitsLoading = entry === undefined;
  const idFact = trimmedName
    ? { key: 'id', node: <span className="tabular-nums">{id}</span> }
    : null;
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
  const anchoredState = tTraits('card.anchoredState');
  const selectable = Boolean(select && !select.unavailable);
  // In select mode a reason not to choose it outranks the anchored tag it
  // usually is ("Anchored"); otherwise an anchored card shows the word from `sm`.
  const tag = select?.unavailable ? (
    <ArtTag>{select.unavailable}</ArtTag>
  ) : anchored ? (
    <ArtTag className="max-sm:hidden">
      <AnchoringIcon aria-hidden className="size-3 shrink-0" />
      {anchoredState}
    </ArtTag>
  ) : null;

  const content = (
    <>
      <ArtFrame
        sources={signatureCardSources(seed)}
        alt={alt}
        sizes={sizes}
        priority={priority}
        unavailableLabel={unavailableLabel}
        unavailableDetail={id}
        className={cn(
          'group-hover:after:shadow-[var(--art-edge-active)]',
          select?.checked &&
            'after:shadow-[inset_0_0_0_2px_var(--color-primary)] group-hover:after:shadow-[inset_0_0_0_2px_var(--color-primary)] hover:after:shadow-[inset_0_0_0_2px_var(--color-primary)]',
        )}
      />
      <div className="mt-3 flex min-w-0 items-start gap-2">
        {select ? (
          <span className="mt-0.5 inline-flex shrink-0">
            <Checkbox
              checked={select.checked}
              disabled={!selectable || select.disabled}
              aria-label={select.label}
              onChange={(event) => select.onCheckedChange(event.target.checked)}
            />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          {/* The alt text above already says all of this. */}
          <div aria-hidden>
            <p
              className={cn(
                'line-clamp-2 type-body-md font-medium text-foreground [overflow-wrap:anywhere]',
                'decoration-rule underline-offset-4',
                !select && 'group-hover:underline',
                !trimmedName && 'tabular-nums',
              )}
            >
              {trimmedName ?? id}
            </p>
            {traitsLoading ? (
              <>
                <CaptionLine facts={[idFact]} />
                <Skeleton className="mt-1.5 h-3 w-2/3 max-sm:hidden" data-testid="trait-skeleton" />
              </>
            ) : (
              <CaptionLine
                facts={[
                  idFact,
                  traitSummary ? { key: 'traits', node: traitSummary, fromSm: true } : null,
                ]}
              />
            )}
          </div>
          {extraMeta && extraMeta.length > 0 ? (
            <CaptionLine
              facts={extraMeta.map((node, index) => ({ key: `extra-${index}`, node }))}
            />
          ) : null}
          {tag ? (
            <div aria-hidden className="mt-1.5 flex" data-testid="card-tag">
              {tag}
            </div>
          ) : null}
        </div>
        {/*
         * The status slot: the anchor on a phone, and (to a mouse, on hover
         * or focus) the quick-view button in its place, so the label never
         * gains a gap for a control that is not showing.
         */}
        {!select && (anchored || onQuickView) ? (
          <span
            aria-hidden
            className={cn(
              '-mt-1 flex size-8 shrink-0 items-center justify-center transition-opacity duration-[var(--duration-fast)]',
              !anchored && 'pointer-coarse:hidden',
              anchored && !onQuickView && 'sm:hidden',
              onQuickView &&
                'pointer-fine:group-hover:opacity-0 pointer-fine:group-focus-within:opacity-0',
            )}
          >
            {anchored ? (
              <AnchoringIcon className="size-4 text-subtle sm:hidden" data-testid="anchored-mark" />
            ) : null}
          </span>
        ) : null}
        {anchored ? <span className="sr-only">{anchoredState}</span> : null}
        {select?.unavailable && !anchored ? (
          <span className="sr-only">{select.unavailable}</span>
        ) : null}
      </div>
    </>
  );

  return (
    <article
      className={cn('group relative min-w-0 @container', className)}
      data-testid="signature-card"
      data-token-id={tokenId}
      data-selected={select?.checked || undefined}
    >
      {select ? (
        <label
          className={cn(
            'block rounded-edge',
            selectable && !select.disabled ? 'cursor-pointer' : 'cursor-not-allowed',
          )}
        >
          {content}
        </label>
      ) : (
        <Link href={`/detail/${tokenId}`} className="block rounded-edge">
          {content}
        </Link>
      )}
      {after}
      {onQuickView && !select ? (
        <button
          type="button"
          onClick={() => onQuickView(tokenId)}
          aria-label={tTraits('card.quickViewAria', { id })}
          className={cn(
            'absolute end-0 inline-flex size-8 items-center justify-center rounded-control text-subtle',
            LABEL_TOP,
            'transition-[opacity,color,background-color] duration-[var(--duration-fast)]',
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

/** One fact of a wall-label caption. */
interface CaptionFact {
  key: string;
  node: ReactNode;
  /** Shown from `sm` only, with its separator: a phone's label keeps to the name and number. */
  fromSm?: boolean;
}

/**
 * A wall-label caption: short facts joined by middle dots. The space before
 * each dot does not break, so a wrapped caption ends its line with the dot
 * instead of starting the next one with it; two lines at most.
 */
function CaptionLine({ facts }: { facts: readonly (CaptionFact | null)[] }) {
  const present = facts.filter(
    (fact): fact is CaptionFact =>
      fact !== null && fact.node !== null && fact.node !== undefined && fact.node !== '',
  );
  if (present.length === 0) return null;
  return (
    <p
      className={cn(
        'mt-0.5 line-clamp-2 type-caption text-subtle',
        present.every((fact) => fact.fromSm) && 'max-sm:hidden',
      )}
    >
      {present.map((fact, index) => {
        const content = (
          <>
            {index > 0 ? '\u00a0· ' : null}
            {fact.node}
          </>
        );
        return fact.fromSm ? (
          <span key={fact.key} className="max-sm:hidden">
            {content}
          </span>
        ) : (
          <Fragment key={fact.key}>{content}</Fragment>
        );
      })}
    </p>
  );
}
