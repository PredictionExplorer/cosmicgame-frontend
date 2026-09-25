'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ArtFrame, WallLabel } from '@/components/ui/art-frame';
import { signatureMedia, signatureSources } from '@/components/nft/signatureMedia';
import { useFormat } from '@/hooks/useFormat';
import { formatId } from '@/utils/format/ids';

/** Where the gesture sits in its cycle, and what the cycle became. */
export interface GestureCycleRailProps {
  cycle: number;
  /** The gesture's place in the cycle (from 1), when the record carries it. */
  position: number | null;
  /** The cycle's gestures: so far for the live cycle, all of them once finalized; null when unknown. */
  total: number | null;
  /** Whether the cycle is still open; null until the dashboard says. */
  live: boolean | null;
  /** The finalized cycle's Signature, once its record is read. */
  signature: { tokenId: number; seed: string | number | undefined } | null;
  /** The cycle's page (its gesture log), or null until it is known which page that is. */
  cycleHref: string | null;
  className?: string;
}

/**
 * The gesture's cycle, beside its record from `lg` (after it on smaller
 * screens): the gesture's place among the cycle's gestures, drawn as a mark
 * on a line, and the Signature the cycle's gestures shaped, on its plate
 * with a wall label, once the cycle has finalized. While the cycle is open
 * it says when the Signature will exist instead. It ends with the way to
 * every gesture of the cycle.
 */
export function GestureCycleRail({
  cycle,
  position,
  total,
  live,
  signature,
  cycleHref,
  className,
}: GestureCycleRailProps) {
  const t = useTranslations('gesture');
  const tCommon = useTranslations('common');
  const tDetail = useTranslations('detail');
  const format = useFormat();
  const headingId = 'gesture-cycle-heading';
  const hasPlace = position !== null && total !== null && total >= position && position > 0;
  const share = hasPlace ? Math.min(100, Math.max(0, (position / total) * 100)) : 0;
  const sources = useMemo(
    () => signatureSources(signatureMedia(signature?.seed)),
    [signature?.seed],
  );
  const signatureTitle = t('rail.signature', { cycle: format.count(cycle) });

  return (
    <aside aria-labelledby={headingId} className={cn('min-w-0', className)}>
      <h2 id={headingId} className="type-section text-foreground">
        {tCommon('pageHeader.crumbs.cycle', { cycle })}
      </h2>

      {hasPlace ? (
        <div className="mt-4" data-testid="gesture-position">
          <p className="type-body-md text-muted-foreground">
            {t(live ? 'rail.positionLive' : 'rail.position', {
              position: format.count(position),
              total: format.count(total),
            })}
          </p>
          {/* The same place as a mark on the cycle's line of gestures. */}
          <div aria-hidden className="relative mt-3 h-1 rounded-pill bg-surface-sunken">
            <span
              className="absolute inset-y-0 left-0 rounded-pill bg-primary/35"
              style={{ width: `${share}%` }}
            />
            <span
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-primary ring-2 ring-background"
              style={{ left: `${share}%` }}
            />
          </div>
        </div>
      ) : null}

      {signature && signature.tokenId >= 0 && sources.length > 0 ? (
        <figure className="mt-8" data-testid="gesture-cycle-signature">
          {/* The plate repeats the title's link for the pointer; the title is the one tab stop. */}
          <Link href={`/detail/${signature.tokenId}`} tabIndex={-1} aria-hidden className="block">
            <ArtFrame
              sources={sources}
              alt=""
              sizes="(min-width: 1024px) 30vw, 100vw"
              unavailableLabel={tDetail('image.artworkUnavailable')}
              unavailableDetail={formatId(signature.tokenId)}
            />
          </Link>
          <WallLabel
            as="figcaption"
            className="mt-3"
            title={
              <Link href={`/detail/${signature.tokenId}`} className="link-quiet">
                {signatureTitle}
              </Link>
            }
            meta={[`Cosmic Signature ${formatId(signature.tokenId)}`]}
          />
        </figure>
      ) : live ? (
        <p className="mt-6 max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
          {t('rail.liveNote')}
        </p>
      ) : null}

      {cycleHref ? (
        <p className="mt-6">
          <Link
            href={cycleHref}
            className="link inline-flex min-h-6 items-center gap-1.5 type-body-sm"
          >
            {t('nav.all', { cycle: format.count(cycle) })}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </p>
      ) : null}
    </aside>
  );
}
