'use client';

import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatAddress, formatId } from '@/utils/format';
import { useCSTInfo, useCSTAnchorActionInfo, useRWLKAnchorActionInfo } from '@/hooks/useApiQuery';
import { Link } from '@/i18n/navigation';
import type { AnchorAction } from '@/services/api/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { WallLabel } from '@/components/ui/art-frame';
import { withMonoId } from '@/components/ui/mono-id';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { TxProofLink } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { SignatureWallLabel } from '@/components/ui/signature-label';
import { SpecList, SpecRow } from '@/components/ui/spec-list';
import { useSignatureAlt } from '@/components/nft/signatureArt';
import { AnchorTimeline } from '@/components/anchoring/AnchorTimeline';
import { TokenPlate } from '@/components/anchoring/TokenPlate';
import {
  anchorTokenHref,
  collectionFromRouteFlag,
  tokenDistributionsHref,
  type AnchorCollection,
} from '@/components/anchoring/anchorLinks';

import { AnchorActionSkeleton } from './AnchorActionSkeleton';
import { isReleased } from './anchorRelease';

/**
 * The public record of one anchor action: its status under the title, the
 * NFT on its plate (the wall label names the collection), who anchored it
 * and the transaction, its timeline (anchored, then released or still
 * anchored) and where to go next. A missing record says why it may be
 * missing and leads back to the anchoring ledgers.
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
        // "Anchor action #23": the title stands alone, without the trail; its status sits
        // directly under it, one line, instead of a lede that repeated the title in words.
        title={t('anchorActionDetail.title', { id: actionId })}
        identity={status}
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
  const tTables = useTranslations('tables');
  const signatureAlt = useSignatureAlt();
  const isRwalk = collection === 'randomWalk';
  const { TokenId, StakerAddr, TxHash } = anchor;
  // The action record carries no seed or name; the token's own record does.
  const token = useCSTInfo(isRwalk ? null : TokenId);
  const name = isRwalk ? null : (token.data?.TokenName ?? null);
  const cycle = isRwalk ? null : (token.data?.RoundNum ?? null);
  const tokenId = formatId(TokenId);
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
            <span className="sr-only">{tTables('links.newTab')}</span>
          </a>
        ) : (
          <Link href={tokenHref} className="block">
            {plate}
          </Link>
        )}
        {isRwalk ? (
          <WallLabel
            as="figcaption"
            className="mt-4"
            title={withMonoId(t('art.randomWalkTitle', { id: tokenId }), tokenId)}
          />
        ) : (
          // A Signature's label follows the one rule every art surface does.
          <SignatureWallLabel
            as="figcaption"
            className="mt-4"
            tokenId={TokenId}
            name={name}
            cycle={cycle}
          />
        )}
      </figure>

      <div className="min-w-0 space-y-10 lg:col-span-5">
        <section aria-labelledby="anchor-action-record">
          <h2 id="anchor-action-record" className="type-section text-foreground">
            {t('anchorActionDetail.record.title')}
          </h2>
          {/* The token is the plate's wall label; the record holds who anchored it and the proof. */}
          <SpecList density="dense" className="mt-3">
            <SpecRow density="dense" label={t('anchorActionDetail.record.holder')}>
              <AddressChip address={StakerAddr} variant="plain" />
            </SpecRow>
            {TxHash ? (
              <SpecRow density="dense" label={t('anchorActionDetail.record.transaction')}>
                <TxProofLink hash={TxHash} className="type-hash">
                  {formatAddress(TxHash)}
                </TxProofLink>
              </SpecRow>
            ) : null}
          </SpecList>
        </section>

        <section aria-labelledby="anchor-action-timeline">
          <h2 id="anchor-action-timeline" className="type-section text-foreground">
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
  const tTables = useTranslations('tables');
  const Icon = external ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      {children}
      <Icon aria-hidden className="ms-1 inline size-3.5 align-[-0.125em] text-subtle" />
      {external ? <span className="sr-only">{tTables('links.newTab')}</span> : null}
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

export default AnchorActionDetailPage;
