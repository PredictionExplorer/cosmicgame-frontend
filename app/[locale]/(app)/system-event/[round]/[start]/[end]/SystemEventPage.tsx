'use client';

import { useEffect } from 'react';
import { ArrowRight, Link2Off } from 'lucide-react';
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

import {
  historyRange,
  isValidWindow,
  windowRange,
  type SystemEventWindow,
} from './systemEventWindow';

interface SystemEventPageProps extends SystemEventWindow {
  /** The mode change list holds no window for the cycle: the page says the window does not exist. */
  missing?: boolean;
}

const NO_EVENTS: AdminEventRow[] = [];

/** The earliest and latest change of the window, in seconds. */
function changeSpan(rows: readonly AdminEventRow[]): { first: number; latest: number } | null {
  const times = rows
    .map((row) => row.TimeStamp)
    .filter((time) => Number.isFinite(time) && time > 0);
  if (times.length === 0) return null;
  return { first: Math.min(...times), latest: Math.max(...times) };
}

/**
 * The coordination changes the contract owner recorded in one window, the
 * one before a cycle opened: how many, when they began and ended, and each
 * change with its new value, the value it replaced (from every change before
 * the window) and its transaction, in one reading column. The window is
 * named by its cycle, never by its event log ids (the route's layout keeps
 * those ids the cycle's own). A window without changes says so once, under
 * the H1 and with no section title or lede promising rows, with one way back
 * to the full log, centred on the full width like every ledger state (so is
 * a failed read).
 */
const SystemEventPage = (props: SystemEventPageProps) => {
  const { round, start, end, missing = false } = props;
  const t = useTranslations('coordination');
  const locale = useLocale();
  const valid = !missing && isValidWindow(props);
  const range = valid ? windowRange(props) : { start: -1, end: -1 };
  const { data, isLoading, error, refetch } = useSystemEvents(range.start, range.end);
  // Every change before the window: what each parameter was before it changed here.
  const before = (valid && historyRange({ round, start, end })) || { start: -1, end: -1 };
  const history = useSystemEvents(before.start, before.end);

  useEffect(() => {
    if (error) reportError(error, 'fetch system events');
  }, [error]);

  // The ledger's own title, so the trail reads as the page it leads back to.
  const trail = [{ label: t('page.title'), href: '/coordination-changes' }];
  // The header meta keeps the quiet style; an empty state's next step is a real link.
  const allChanges = (
    <Link
      href="/coordination-changes"
      className="link-quiet inline-flex min-h-11 items-center gap-1.5 text-muted-foreground sm:min-h-6"
    >
      {t('systemEvent.allChanges')}
      <ArrowRight aria-hidden className="size-3.5 text-subtle" />
    </Link>
  );
  const allChangesAction = (
    <Link
      href="/coordination-changes"
      className="link inline-flex min-h-11 items-center gap-1.5 sm:min-h-6"
    >
      {t('systemEvent.allChanges')}
      <ArrowRight aria-hidden className="size-3.5" />
    </Link>
  );

  if (!valid) {
    return (
      <LedgerPage
        header={
          <PageHeader section="records" breadcrumbs={trail} title={t('systemEvent.invalidTitle')} />
        }
      >
        <EmptyState
          variant="page"
          headingLevel={2}
          icon={<Link2Off aria-hidden />}
          title={t('systemEvent.invalidTitle')}
          description={t('systemEvent.invalidDescription')}
          action={allChangesAction}
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
  // Dates only when there is something to date, once each: a window whose
  // changes share one moment gets a single date. They stay at figure-md.
  if (span && span.first === span.latest) {
    figures.push({
      id: 'changed',
      label: t('systemEvent.figures.changed'),
      value: <DateTime timestamp={span.first} year="always" />,
      size: 'md',
    });
  } else if (!ready || span) {
    figures.push(
      {
        id: 'first',
        label: t('systemEvent.figures.first'),
        value: span ? <DateTime timestamp={span.first} year="always" /> : pending,
        size: 'md',
      },
      {
        id: 'latest',
        label: t('systemEvent.figures.latest'),
        value: span ? <DateTime timestamp={span.latest} year="always" /> : pending,
        size: 'md',
      },
    );
  }

  const initial = round === 0;
  // No changes: the empty ledger says so, once, with the one link back; a lone
  // "0" and the same link in the header would only repeat it.
  const empty = ready && rows.length === 0;

  return (
    <LedgerPage
      width={empty || error ? 'full' : 'narrow'}
      header={
        <PageHeader
          section="records"
          breadcrumbs={trail}
          title={initial ? t('systemEvent.titleInitial') : t('systemEvent.title', { cycle: round })}
          // The lede promises rows; an empty window's state says what there is instead.
          subtitle={
            empty
              ? undefined
              : initial
                ? t('systemEvent.ledeInitial')
                : t('systemEvent.lede', { cycle: round })
          }
          figures={empty ? undefined : figures}
          meta={empty ? undefined : allChanges}
        />
      }
    >
      <AdminEventsTable
        list={rows}
        history={history.data}
        loading={isLoading}
        error={error ? t('systemEvent.loadError') : undefined}
        onRetry={() => void refetch()}
        // No section title over an empty window: the state is the page's one statement.
        title={empty ? undefined : t('systemEvent.tableTitle')}
        emptyTitle={t('systemEvent.emptyTitle')}
        emptyDescription={
          initial
            ? t('systemEvent.emptyDescriptionInitial')
            : t('systemEvent.emptyDescription', { cycle: round })
        }
        emptyAction={allChangesAction}
      />
    </LedgerPage>
  );
};

export default SystemEventPage;
