'use client';

import { useLocale, useTranslations } from 'next-intl';

import {
  useCSTAnchorActions,
  useCSTAnchorDistributions,
  useGlobalRWLKAnchorImprints,
  useRWLKAnchorActions,
} from '@/hooks/useApiQuery';
import { UnknownValue } from '@/components/ui/unknown-value';
import { formatCount } from '@/utils/format';

/**
 * Client figures for the server-rendered page headers
 * (`PublicDataRouteSeoSummary`): values the server cannot read, or read and
 * lost, which the page's own client queries can still supply.
 */

/** A value still on its way: a quiet bar the width of a short figure, announced once. */
function PendingFigure() {
  const t = useTranslations('common');
  return (
    <span aria-busy="true">
      <span
        aria-hidden
        className="inline-block h-[0.8em] w-12 animate-pulse rounded-edge bg-muted align-baseline motion-reduce:animate-none"
      />
      <span className="sr-only">{t('status.loading')}</span>
    </span>
  );
}

/** A value that could not be read here either: the dash, and "Unavailable" said once. */
function UnavailableFigure() {
  const t = useTranslations('common');
  const label = t('status.unavailable');
  return (
    <>
      <UnknownValue label={label} />
      <span
        aria-hidden
        data-caption={label}
        className="block type-caption text-subtle after:content-[attr(data-caption)]"
      />
    </>
  );
}

function CountFigure({
  counts,
  pending,
  failed,
}: {
  counts: readonly (number | undefined)[];
  pending: boolean;
  failed: boolean;
}) {
  const locale = useLocale();
  if (counts.every((count) => count !== undefined)) {
    return (
      <>
        {formatCount(
          counts.reduce<number>((sum, count) => sum + (count ?? 0), 0),
          locale,
        )}
      </>
    );
  }
  if (failed) return <UnavailableFigure />;
  return pending ? <PendingFigure /> : <UnavailableFigure />;
}

/** The /anchoring header figures the server could not read. */
export type AnchoringFigureId = 'actions' | 'ethDeposits' | 'stellarImprints';

function AnchorActionsFigure() {
  const cst = useCSTAnchorActions();
  const rwlk = useRWLKAnchorActions();
  return (
    <CountFigure
      counts={[cst.data?.length, rwlk.data?.length]}
      pending={cst.isPending || rwlk.isPending}
      failed={cst.isError || rwlk.isError}
    />
  );
}

function EthDepositsFigure() {
  // The same query as the page's ETH Anchor Distributions ledger: no second request.
  const deposits = useCSTAnchorDistributions();
  return (
    <CountFigure
      counts={[deposits.data?.length]}
      pending={deposits.isPending}
      failed={deposits.isError}
    />
  );
}

function StellarImprintsFigure() {
  // The same query as the page's Stellar Selection imprints ledger.
  const imprints = useGlobalRWLKAnchorImprints();
  return (
    <CountFigure
      counts={[imprints.data?.length]}
      pending={imprints.isPending}
      failed={imprints.isError}
    />
  );
}

/**
 * An /anchoring header figure whose server read failed, filled from the
 * page's own client queries after hydration, so a transient failure (or an
 * ISR render cached during one) never leaves the header at odds with the
 * ledgers below it. It says "Unavailable" only when the client read fails
 * too.
 */
export function AnchoringFigure({ id }: { id: AnchoringFigureId }) {
  if (id === 'actions') return <AnchorActionsFigure />;
  if (id === 'ethDeposits') return <EthDepositsFigure />;
  return <StellarImprintsFigure />;
}
