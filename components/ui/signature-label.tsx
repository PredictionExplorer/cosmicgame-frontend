import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { AnchoringIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import { formatId } from '@/utils/format/ids';
import { WallLabel } from '@/components/ui/art-frame';
import { withMonoId } from '@/components/ui/mono-id';

/**
 * The wall label of a Signature: one rule on every surface and both hosts
 * (docs/design-system.md → Art → Wall labels).
 *
 * - Title: the token's name, or "Signature #000023" (the localized noun from
 *   `common.signature.untitled`) with the number in the identifier face,
 *   never Inter figures or Clash.
 * - Caption, in one fixed order: the number (only when a name took the
 *   title, so it never shows twice), the cycle ("Cycle 1"), structure,
 *   palette, then an optional date.
 * - Anchored: one quiet anchor after the title, named for screen readers and
 *   titled for a pointer, never a text tag.
 *
 * No `'use client'`: the hook reads messages the same way in a server
 * component (how-it-works) and in a client one (the gallery, the landing).
 */

/** The noun around an unnamed Signature's number in a compact title: shown from `sm`. */
const COMPACT_NOUN_CLASS = 'max-sm:hidden';

/** What a Signature's label can say. */
export interface SignatureLabelFacts {
  tokenId: number;
  name?: string | null;
  /** The cycle the Signature was imprinted in. */
  cycle?: number | null;
  /** Where the cycle leads (its allocation record); plain text without it. */
  cycleHref?: string;
  /** Localized trait values. */
  structure?: string | null;
  palette?: string | null;
  /** The last fact: a date or a relative time. */
  date?: ReactNode;
}

/** The token number as a caption fact: the identifier face, never broken. */
export function SignatureNumber({ tokenId, className }: { tokenId: number; className?: string }) {
  return <span className={cn('type-mono', className)}>{formatId(tokenId)}</span>;
}

/** The title, caption facts and plain-text name of a Signature, from the one rule above. */
export function useSignatureLabel() {
  const t = useTranslations('common.signature');
  const nameOf = (facts: Pick<SignatureLabelFacts, 'name'>) => facts.name?.trim() || null;
  const untitled = (tokenId: number) => t('untitled', { id: formatId(tokenId) });
  const cycleOf = (facts: SignatureLabelFacts): ReactNode => {
    if (typeof facts.cycle !== 'number' || facts.cycle < 0) return null;
    const label = t('cycle', { n: facts.cycle });
    return facts.cycleHref ? (
      <Link key="cycle" href={facts.cycleHref} className="link-quiet">
        {label}
      </Link>
    ) : (
      label
    );
  };

  return {
    /** The title as plain text, for alt text, announcements and accessible names. */
    text: (facts: Pick<SignatureLabelFacts, 'tokenId' | 'name'>): string =>
      nameOf(facts) ?? untitled(facts.tokenId),
    /**
     * Line 1: the name, or "Signature #000023" with the number in mono.
     * `compact` is for a phone's two-across wall: below `sm` an unnamed
     * Signature's title is its number alone, so every title keeps to one line
     * beside the status slot; the noun stays in the text for assistive technology.
     */
    title: (
      facts: Pick<SignatureLabelFacts, 'tokenId' | 'name'>,
      { compact = false }: { compact?: boolean } = {},
    ): ReactNode =>
      nameOf(facts) ??
      withMonoId(
        untitled(facts.tokenId),
        formatId(facts.tokenId),
        compact ? COMPACT_NOUN_CLASS : undefined,
      ),
    /** Line 2, for WallLabelMeta: the facts in their fixed order. */
    meta: (facts: SignatureLabelFacts): ReactNode[] => [
      nameOf(facts) ? <SignatureNumber key="id" tokenId={facts.tokenId} /> : null,
      cycleOf(facts),
      facts.structure ?? null,
      facts.palette ?? null,
      facts.date ?? null,
    ],
  };
}

/** The anchored state: one quiet anchor, named for screen readers and titled for a pointer. */
export function AnchoredMark({ className }: { className?: string }) {
  const t = useTranslations('common.signature');
  const label = t('anchored');
  return (
    <span
      className={cn('inline-flex shrink-0 items-center text-subtle', className)}
      title={label}
      data-testid="anchored-mark"
    >
      <AnchoringIcon aria-hidden className="size-4" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export interface SignatureWallLabelProps extends SignatureLabelFacts {
  anchored?: boolean;
  /** `figcaption` inside a `<figure>` that holds the plate. */
  as?: 'figcaption' | 'div';
  titleAs?: 'h1' | 'h2' | 'h3' | 'p';
  /** Lines under the caption (why the piece is here, an address). */
  children?: ReactNode;
  className?: string;
}

/** A Signature's wall label: WallLabel with its title, caption and anchor composed by the rule. */
export function SignatureWallLabel({
  anchored = false,
  as,
  titleAs,
  children,
  className,
  ...facts
}: SignatureWallLabelProps) {
  const label = useSignatureLabel();
  const title = label.title(facts);
  return (
    <WallLabel
      as={as}
      titleAs={titleAs}
      className={className}
      title={
        anchored ? (
          <span className="inline-flex max-w-full items-center gap-2">
            <span className="min-w-0">{title}</span>
            <AnchoredMark />
          </span>
        ) : (
          title
        )
      }
      meta={label.meta(facts)}
    >
      {children}
    </WallLabel>
  );
}
