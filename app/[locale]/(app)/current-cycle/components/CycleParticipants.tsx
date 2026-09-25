'use client';

import { useMemo, type ComponentProps } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { EnduranceChampion } from '@/utils';

import { SectionHeader } from '@/components/ui/section-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ETHSpentTable from '@/components/tables/ETHSpentTable';
import EnduranceChampionsTable from '@/components/tables/EnduranceChampionsTable';
import StellarSelectionHolderTable from '@/components/tables/StellarSelectionHolderTable';
import type { DashboardInfo, GestureInfo } from '@/services/api/types';

import { CYCLE_SECTION_SCROLL_MARGIN } from './CycleSectionNav';
import { TitleWithCount } from './TitleWithCount';

const VIEWS = ['stellarSelectionEntries', 'topEthSpenders', 'enduranceChampions'] as const;

export interface CycleParticipantsProps {
  data: DashboardInfo;
  gestures: GestureInfo[];
  championList: EnduranceChampion[] | null;
  /** The cycle's gesture list is still loading (no rows yet). */
  loading: boolean;
  error?: boolean;
  onRetry?: () => void;
  headingId: string;
}

/**
 * Where each participant stands this cycle, as three views of the same
 * people: Stellar Selection entries (and the chance they give), ETH spent,
 * and Endurance Champion intervals. One tab row replaces three stacked
 * ledgers, so the page stays readable on a phone.
 */
export function CycleParticipants({
  data,
  gestures,
  championList,
  loading,
  error = false,
  onRetry,
  headingId,
}: CycleParticipantsProps) {
  const t = useTranslations('currentCycle');
  const locale = useLocale();
  // Unique addresses, once the gesture list has loaded.
  const participantCount = useMemo(
    () => (loading || error ? null : new Set(gestures.map((gesture) => gesture.BidderAddr)).size),
    [gestures, loading, error],
  );
  const state = {
    loading,
    error: error ? t('error.message') : undefined,
    onRetry,
    headingLevel: 3 as const,
  };
  const describedBy = (view: (typeof VIEWS)[number]) => `${headingId}-${view}-note`;

  return (
    <section aria-labelledby={headingId} id="participants" className={CYCLE_SECTION_SCROLL_MARGIN}>
      <SectionHeader
        headingId={headingId}
        title={
          <TitleWithCount
            title={t('sections.participants.title')}
            count={participantCount}
            locale={locale}
          />
        }
      />
      <Tabs defaultValue={VIEWS[0]}>
        <TabsList variant="underline" scroll aria-labelledby={headingId} className="min-w-full">
          {VIEWS.map((view) => (
            <TabsTrigger key={view} value={view}>
              {t(`sections.${view}.title`)}
            </TabsTrigger>
          ))}
        </TabsList>
        {VIEWS.map((view) => (
          <TabsContent
            key={view}
            value={view}
            className="mt-4"
            aria-describedby={describedBy(view)}
          >
            <p
              id={describedBy(view)}
              className="mb-4 max-w-[var(--measure-lede)] type-body-sm text-muted-foreground"
            >
              {t(`sections.${view}.tooltip`)}
            </p>
            {view === 'stellarSelectionEntries' ? (
              <StellarSelectionHolderTable
                list={gestures}
                stellarEthSelections={data.NumRaffleEthWinnersBidding}
                stellarNftSelections={data.NumRaffleNFTWinnersBidding}
                {...state}
              />
            ) : view === 'topEthSpenders' ? (
              <ETHSpentTable
                list={gestures as ComponentProps<typeof ETHSpentTable>['list']}
                {...state}
              />
            ) : (
              <EnduranceChampionsTable
                championList={championList}
                lastBidderAddress={data.LastBidderAddr ?? null}
                {...state}
                loading={loading || (!error && championList === null)}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
