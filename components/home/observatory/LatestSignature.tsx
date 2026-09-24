'use client';

import { useId, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ArtFrame, PendingPlate, WallLabel, WallLabelMeta } from '@/components/ui/art-frame';
import { Button } from '@/components/ui/button';
import { DateTime } from '@/components/ui/date-time';
import { isRenderPending, signatureMedia, signatureSources } from '@/components/nft/signatureMedia';
import { useNow } from '@/hooks/useNow';
import { Link } from '@/i18n/navigation';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import type { CSTTokenInfo } from '@/services/api';
import { formatId } from '@/utils/format/ids';

export interface LatestSignatureProps {
  /** The newest imprinted Signatures, newest first. */
  signatures: readonly CSTTokenInfo[];
  /** The list has not been read yet: the plate is a skeleton. */
  loading?: boolean;
  /**
   * The plate's rendered width at each breakpoint. The desk passes its
   * column; phones draw the plate edge to edge.
   */
  sizes?: string;
  className?: string;
}

const DEFAULT_SIZES = '(max-width: 639px) 100vw, (max-width: 1023px) 90vw, 26rem';

/**
 * The art on the Observatory: the newest imprinted Signature on its black
 * plate at the native ratio, captioned by its wall label (name, token number,
 * the cycle that imprinted it, and when), with a quiet way to step back
 * through the latest imprints. Nothing overlays the art; the whole plate is
 * the link to its page. On phones the plate runs edge to edge.
 */
export function LatestSignature({
  signatures,
  loading = false,
  sizes = DEFAULT_SIZES,
  className,
}: LatestSignatureProps) {
  const t = useTranslations('home.latestSignature');
  const tDetail = useTranslations('detail');
  const headingId = useId();
  const nowMs = useNow(60_000);
  const [index, setIndex] = useState(0);
  // Set by the stepper, so the first paint announces nothing.
  const [stepped, setStepped] = useState(false);
  const step = (to: number) => {
    setIndex(to);
    setStepped(true);
  };

  const count = signatures.length;
  const current = Math.min(index, Math.max(0, count - 1));
  const token = signatures[current] ?? null;
  const id = token ? formatId(token.TokenId) : null;
  const name = token?.TokenName?.trim() || null;
  const media = signatureMedia(token?.Seed);
  const title = token && id ? (name ?? t('unnamed', { id })) : null;
  const alt = token && id ? (name ? t('named', { name, id }) : t('unnamed', { id })) : '';
  const imprintedAt = token?.TimeStamp ?? token?.MintTimeStamp ?? null;
  const position = count > 1 ? t('position', { index: current + 1, count }) : null;

  return (
    <section
      aria-labelledby={headingId}
      data-testid="latest-signature"
      className={cn('min-w-0', className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={headingId} className="type-heading-3 text-foreground">
          {t('title')}
        </h2>
        <Link
          href="/gallery"
          className={cn(
            'link-quiet inline-flex items-center gap-1 type-label text-primary',
            TOUCH_TARGET_TEXT_LINK_CLASS,
          )}
        >
          {t('gallery')}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <figure className="mt-3 min-w-0">
        {/* Edge to edge on phones: the plate is the page's one full-bleed object. */}
        <div className="max-sm:-mx-[var(--gutter)]">
          {token && media && id ? (
            <Link
              href={`/detail/${token.TokenId}`}
              data-testid="latest-signature-link"
              className="block rounded-edge max-sm:rounded-none"
            >
              <ArtFrame
                key={token.TokenId}
                sources={signatureSources(media)}
                alt={alt}
                sizes={sizes}
                // The newest plate is the page's only artwork and sits in the
                // first viewport from 1024px: load it eagerly, at high priority.
                priority={current === 0}
                unavailableLabel={
                  isRenderPending(imprintedAt, nowMs)
                    ? tDetail('image.rendering')
                    : tDetail('image.artworkUnavailable')
                }
                unavailableDetail={id}
                className="max-sm:rounded-none"
              />
            </Link>
          ) : (
            <PendingPlate
              busy={loading}
              label={loading ? undefined : t('none')}
              className="max-sm:rounded-none"
            />
          )}
        </div>

        {token && title && id && (
          <figcaption className="mt-3 min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <WallLabel title={title} />
              {count > 1 && (
                <div
                  className="-me-2.5 flex shrink-0 items-center"
                  data-testid="latest-signature-stepper"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-subtle hover:text-foreground"
                    aria-label={t('newer')}
                    disabled={current === 0}
                    onClick={() => step(current - 1)}
                  >
                    <ChevronLeft aria-hidden />
                  </Button>
                  <span className="type-caption min-w-[3.5ch] text-center tabular-nums text-subtle">
                    {position}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-subtle hover:text-foreground"
                    aria-label={t('older')}
                    disabled={current >= count - 1}
                    onClick={() => step(current + 1)}
                  >
                    <ChevronRight aria-hidden />
                  </Button>
                </div>
              )}
            </div>
            {/* The number leads only when a name took the title line. */}
            <WallLabelMeta
              className="mt-0.5"
              items={[
                name ? (
                  <span key="id" className="type-mono">
                    {id}
                  </span>
                ) : null,
                token.RoundNum != null
                  ? t('imprintedIn', { number: String(token.RoundNum) })
                  : null,
                imprintedAt ? (
                  <DateTime key="at" timestamp={imprintedAt} variant="relative" />
                ) : null,
              ]}
            />
          </figcaption>
        )}
        {/* Stepping is announced once, in words: which Signature is shown. */}
        <p role="status" className="sr-only">
          {stepped && title && position ? `${title}, ${position}` : ''}
        </p>
      </figure>
    </section>
  );
}
