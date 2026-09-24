'use client';

import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format';
import { useCSTInfo, useCSTAnchorActionInfo, useRWLKAnchorActionInfo } from '@/hooks/useApiQuery';
import { Link } from '@/i18n/navigation';
import type { AnchorAction } from '@/services/api/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { WallLabel } from '@/components/ui/art-frame';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { Skeleton, SkeletonArtPlate } from '@/components/ui/skeleton';
import { useSignatureAlt } from '@/components/nft/signatureArt';
import { AnchorTimeline } from '@/components/anchoring/AnchorTimeline';
import { TokenPlate } from '@/components/anchoring/TokenPlate';
import {
  anchorTokenHref,
  collectionFromRouteFlag,
  tokenDistributionsHref,
  type AnchorCollection,
} from '@/components/anchoring/anchorLinks';

/** A release record exists once the indexer has seen its event. */
function isReleased(release: AnchorAction | null | undefined): release is AnchorAction {
  return Boolean(release?.EvtLogId);
}

/**
 * The public record of one anchor action: the NFT on its plate, who anchored
 * it, its timeline (anchored, then released or still anchored) and where to
 * go next. A missing record says why it may be missing and leads back to the
 * anchoring ledgers.
 */
function AnchorActionDetailPage({ IsRwalk, actionId }: { IsRwalk: number; actionId: number }) {
  const t = useTranslations('anchoring');
  const collection = collectionFromRouteFlag(IsRwalk);
  const isRwalk = collection === 'randomWalk';

  const rwlkQuery = useRWLKAnchorActionInfo(isRwalk ? actionId : null);
  const cstQuery = useCSTAnchorActionInfo(!isRwalk ? actionId : null);
  const query = isRwalk ? rwlkQuery : cstQuery;
  const anchor = query.data?.Stake ?? null;
  const release = query.data?.Unstake ?? null;
  const released = isReleased(release);

  const collectionName = t(`anchorActionDetail.token.labels.${collection}`);
  const status = anchor ? (
    <Badge tone={released ? 'neutral' : 'positive'} dot={!released} data-testid="anchor-status">
      {released ? t('status.released') : t('status.anchored')}
    </Badge>
  ) : undefined;

  let body: ReactNode;
  if (query.isLoading) {
    body = <AnchorActionSkeleton />;
  } else if (query.error) {
    body = (
      <ErrorState
        variant="page"
        headingLevel={2}
        title={t('anchorActionDetail.errorTitle')}
        message={t('anchorActionDetail.error')}
        onRetry={() => void query.refetch()}
      />
    );
  } else if (!anchor) {
    body = <AnchorActionMissing actionId={actionId} />;
  } else {
    body = (
      <AnchorActionBody
        collection={collection}
        anchor={anchor}
        release={released ? release : null}
      />
    );
  }

  return (
    <PageShell variant="data">
      {/* A public record: it sits under the Anchor Distributions ledger, not
          under the reader's own anchors. */}
      <PageHeader
        section="records"
        breadcrumbs={[{ label: t('overview.title'), href: '/anchoring' }]}
        title={t('anchorActionDetail.breadcrumbs.action', { id: actionId })}
        subtitle={t('anchorActionDetail.subtitle', { token: collectionName })}
        meta={status}
      />
      {body}
    </PageShell>
  );
}

function AnchorActionBody({
  collection,
  anchor,
  release,
}: {
  collection: AnchorCollection;
  anchor: AnchorAction;
  release: AnchorAction | null;
}) {
  const t = useTranslations('anchoring');
  const signatureAlt = useSignatureAlt();
  const isRwalk = collection === 'randomWalk';
  const { TokenId, StakerAddr } = anchor;
  // The action record carries no seed or name; the token's own record does.
  const token = useCSTInfo(isRwalk ? null : TokenId);
  const name = isRwalk ? null : (token.data?.TokenName ?? null);
  const cycle = isRwalk ? null : (token.data?.RoundNum ?? null);
  const tokenId = formatId(TokenId);
  const title =
    name?.trim() ||
    (isRwalk
      ? t('art.randomWalkTitle', { id: tokenId })
      : t('art.signatureTitle', { id: tokenId }));
  const alt = isRwalk
    ? t('art.randomWalkTitle', { id: tokenId })
    : signatureAlt({ id: tokenId, name });
  const tokenHref = anchorTokenHref(collection, TokenId);

  const plate = (
    <TokenPlate
      collection={collection}
      tokenId={TokenId}
      alt={alt}
      sizes="(min-width: 1024px) 44rem, 100vw"
      density="full"
      priority
    />
  );

  return (
    <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
      <figure className="min-w-0 lg:col-span-7">
        {isRwalk ? (
          <a href={tokenHref} target="_blank" rel="noopener noreferrer" className="block">
            {plate}
            <span className="sr-only">{t('picker.opensNewTab')}</span>
          </a>
        ) : (
          <Link href={tokenHref} className="block">
            {plate}
          </Link>
        )}
        <WallLabel
          as="figcaption"
          className="mt-4"
          title={title}
          meta={[
            // An unnamed token's title already carries its number.
            name?.trim() ? (
              <span key="id" className="font-mono">
                {tokenId}
              </span>
            ) : null,
            cycle === null ? null : t('picker.cycle', { cycle }),
          ]}
        />
      </figure>

      <div className="min-w-0 space-y-10 lg:col-span-5">
        <section aria-labelledby="anchor-action-record">
          <h2 id="anchor-action-record" className="type-heading-3 text-foreground">
            {t('anchorActionDetail.record.title')}
          </h2>
          <dl className="mt-3 divide-y divide-rule-faint border-y border-rule-faint">
            <SpecRow label={t('anchorActionDetail.record.holder')}>
              <AddressChip address={StakerAddr} variant="plain" />
            </SpecRow>
            <SpecRow label={t('anchorActionDetail.record.token')}>
              {isRwalk ? (
                <a
                  href={tokenHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link font-mono tabular-nums"
                >
                  {tokenId}
                  <ArrowUpRight aria-hidden className="ms-0.5 inline size-3.5 align-[-0.125em]" />
                  <span className="sr-only">{t('picker.opensNewTab')}</span>
                </a>
              ) : (
                <Link href={tokenHref} className="link font-mono tabular-nums">
                  {tokenId}
                </Link>
              )}
            </SpecRow>
          </dl>
        </section>

        <section aria-labelledby="anchor-action-timeline">
          <h2 id="anchor-action-timeline" className="type-heading-3 text-foreground">
            {t('anchorActionDetail.timeline.title')}
          </h2>
          <AnchorTimeline
            className="mt-4"
            collection={collection}
            anchor={anchor}
            release={release}
          />
        </section>

        <nav aria-labelledby="anchor-action-next" className="space-y-3">
          <h2 id="anchor-action-next" className="type-label text-subtle">
            {t('anchorActionDetail.next.title')}
          </h2>
          <ul className="flex flex-col items-start gap-2.5">
            {!isRwalk ? (
              <li>
                <NextLink href={tokenDistributionsHref(StakerAddr, TokenId)}>
                  {t('anchorActionDetail.next.distributions')}
                </NextLink>
              </li>
            ) : null}
            <li>
              <NextLink href={tokenHref} external={isRwalk}>
                {t('anchorActionDetail.next.token')}
              </NextLink>
            </li>
            <li>
              <NextLink href="/statistics/anchoring">
                {t('anchorActionDetail.next.allActions')}
              </NextLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

/** A label and its value on one line of the record's spec sheet. */
function SpecRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2.5">
      <dt className="type-label text-subtle">{label}</dt>
      <dd className="min-w-0 type-body-sm text-foreground">{children}</dd>
    </div>
  );
}

/** A next step: an internal link with a trailing arrow, or an external one with ↗. */
function NextLink({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  const t = useTranslations('anchoring');
  const Icon = external ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      {children}
      <Icon aria-hidden className="ms-1 inline size-3.5 align-[-0.125em] text-subtle" />
      {external ? <span className="sr-only">{t('picker.opensNewTab')}</span> : null}
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="link type-body-sm">
      {content}
    </a>
  ) : (
    <Link href={href} className="link type-body-sm">
      {content}
    </Link>
  );
}

/** No record for this action: why that can be, and the ledgers to go back to. */
function AnchorActionMissing({ actionId }: { actionId: number }) {
  const t = useTranslations('anchoring');
  return (
    <EmptyState
      variant="page"
      headingLevel={2}
      icon={<SearchX />}
      title={t('anchorActionDetail.empty.title', { id: actionId })}
      description={t('anchorActionDetail.empty.description')}
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/anchoring" className={buttonVariants({ variant: 'default' })}>
            {t('anchorActionDetail.empty.browse')}
          </Link>
          <Link href="/statistics/anchoring" className={buttonVariants({ variant: 'outline' })}>
            {t('anchorActionDetail.empty.statistics')}
          </Link>
        </div>
      }
    />
  );
}

/** The record's shape while it loads: the plate, the spec rows and the timeline. */
function AnchorActionSkeleton() {
  const t = useTranslations('common');
  return (
    <div
      role="status"
      aria-label={t('status.loading')}
      className="grid gap-x-12 gap-y-10 lg:grid-cols-12"
    >
      <div className="lg:col-span-7" aria-hidden>
        <SkeletonArtPlate />
        <Skeleton className="mt-4 h-5 w-48" />
        <Skeleton className="mt-2 h-3.5 w-28" />
      </div>
      <div className="space-y-4 lg:col-span-5" aria-hidden>
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
        <Skeleton className="mt-8 h-6 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export default AnchorActionDetailPage;
