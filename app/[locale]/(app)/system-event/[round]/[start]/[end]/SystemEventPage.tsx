'use client';

import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { formatCount } from '@/utils/format';
import { reportError } from '@/utils/errors';
import { useSystemEvents } from '@/hooks/useApiQuery';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import { PageHeader, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { AdminEventsTable, type AdminEventRow } from '@/components/tables/AdminEventsTable';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemEventPageProps {
  /** The cycle the window opened before; 0 is the protocol's first setup. */
  round: number;
  /** The first and last event log ids of the window (from the mode change list). */
  start: number;
  end: number;
}

const NO_EVENTS: AdminEventRow[] = [];

/** A window the link can actually name: whole, non-negative, in order. */
function isValidWindow({ round, start, end }: SystemEventPageProps): boolean {
  return [round, start, end].every((n) => Number.isSafeInteger(n) && n >= 0) && start <= end;
}

/** The earliest and latest change of the window, in seconds. */
function changeSpan(rows: readonly AdminEventRow[]): { first: number; latest: number } | null {
  const times = rows
    .map((row) => row.TimeStamp)
    .filter((time) => Number.isFinite(time) && time > 0);
  if (times.length === 0) return null;
  return { first: Math.min(...times), latest: Math.max(...times) };
}

/**
 * The configuration changes the contract owner recorded in one maintenance
 * window, the one before a cycle opened: how many, when they began and
 * ended, and each change with its new value and transaction. The window is
 * named by its cycle, never by its event log ids.
 */
const SystemEventPage = (props: SystemEventPageProps) => {
  const { round, start, end } = props;
  const t = useTranslations('coordination');
  const tTables = useTranslations('tables');
  const locale = useLocale();
  const valid = isValidWindow(props);
  const { data, isLoading, error, refetch } = useSystemEvents(valid ? start : -1, valid ? end : -1);

  useEffect(() => {
    if (error) reportError(error, 'fetch system events');
  }, [error]);

  // The ledger's own title, so the trail reads as the page it leads back to.
  const trail = [{ label: t('page.title'), href: '/coordination-changes' }];
  const allChanges = (
    <Link
      href="/coordination-changes"
      className="link-quiet inline-flex min-h-6 items-center gap-1.5 text-muted-foreground"
    >
      {t('systemEvent.allChanges')}
      <ArrowRight aria-hidden className="size-3.5 text-subtle" />
    </Link>
  );

  if (!valid) {
    return (
      <LedgerPage
        width="narrow"
        header={
          <PageHeader section="records" breadcrumbs={trail} title={t('systemEvent.invalidTitle')} />
        }
      >
        <EmptyState
          variant="page"
          headingLevel={2}
          title={t('systemEvent.invalidTitle')}
          description={t('systemEvent.invalidDescription')}
          action={allChanges}
        />
      </LedgerPage>
    );
  }

  const rows = data ?? NO_EVENTS;
  const ready = !isLoading && !error;
  const span = ready ? changeSpan(rows) : null;
  // While the list loads a figure is a skeleton; when it fails, the header's
  // unavailable dash (`null`).
  const pending = isLoading ? <Skeleton className="h-7 w-24" /> : null;
  const figures: PageHeaderFigure[] = [
    {
      id: 'changes',
      label: t('systemEvent.figures.changes'),
      value: ready ? formatCount(rows.length, locale) : pending,
    },
  ];
  // Dates only when there is something to date.
  if (!ready || span) {
    figures.push(
      {
        id: 'first',
        label: t('systemEvent.figures.first'),
        value: span ? <DateTime timestamp={span.first} year="always" /> : pending,
      },
      {
        id: 'latest',
        label: t('systemEvent.figures.latest'),
        value: span ? <DateTime timestamp={span.latest} year="always" /> : pending,
      },
    );
  }

  const initial = round === 0;

  return (
    <LedgerPage
      header={
        <PageHeader
          section="records"
          breadcrumbs={trail}
          title={initial ? t('systemEvent.titleInitial') : t('systemEvent.title', { cycle: round })}
          subtitle={
            initial ? t('systemEvent.ledeInitial') : t('systemEvent.lede', { cycle: round })
          }
          figures={figures}
          meta={allChanges}
        />
      }
    >
      <AdminEventsTable
        list={rows}
        loading={isLoading}
        error={error ? t('systemEvent.loadError') : undefined}
        onRetry={() => void refetch()}
        title={tTables('names.parameterChanges')}
        emptyDescription={t('systemEvent.emptyDescription')}
        emptyAction={allChanges}
      />
    </LedgerPage>
  );
};

export default SystemEventPage;
