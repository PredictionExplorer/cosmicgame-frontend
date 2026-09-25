'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import {
  useDashboardInfo,
  useUniqueDonors,
  useUniqueParticipants,
  useUniqueRecipients,
} from '@/hooks/useApiQuery';
import { useHydrated } from '@/hooks/useHydrated';
import { DefinitionsDisclosure } from '@/components/statistics/DefinitionsDisclosure';
import { StatsSection } from '@/components/statistics/StatsSection';
import {
  UniqueParticipantsTable,
  type Participant,
} from '@/components/tables/UniqueParticipantsTable';
import { UniqueRecipientsTable, type Recipient } from '@/components/tables/UniqueRecipientsTable';
import {
  UniqueEthDonorsTable,
  type UniqueEthDonor,
} from '@/components/tables/UniqueEthDonorsTable';

import { dashboardCount } from '../dashboardCounts';

/**
 * The participation ledgers: every participant by gesture count, every
 * allocation recipient, every ETH contributor. The header above carries the
 * four counts, so the body is the lists themselves, one section each, and
 * what each list counts is in one Definitions disclosure at the end. Those
 * counts size each list's skeleton to the table it becomes, and an empty
 * list the header counts rows for reads as one that did not load.
 */
const ParticipationPanel = () => {
  const t = useTranslations('statistics');
  const hydrated = useHydrated();
  const { data: dashboard } = useDashboardInfo(undefined, { poll: false });
  // Read after hydration only: the server has no dashboard in this island.
  const expected = (metric: Parameters<typeof dashboardCount>[1]) =>
    hydrated ? dashboardCount(dashboard, metric) : null;
  const participantsQuery = useUniqueParticipants();
  const recipientsQuery = useUniqueRecipients();
  const donorsQuery = useUniqueDonors();

  const uniqueParticipants = useMemo(() => {
    if (!participantsQuery.data) return [];
    return [...participantsQuery.data].sort(
      (a: Participant, b: Participant) => b.NumBids - a.NumBids,
    );
  }, [participantsQuery.data]);

  const uniqueRecipients = (recipientsQuery.data ?? []) as Recipient[];
  const uniqueDonors = (donorsQuery.data ?? []) as UniqueEthDonor[];

  return (
    <div data-testid="participation-panel" className="space-y-12 sm:space-y-16">
      <StatsSection
        title={t('participation.sections.participants')}
        isLoading={participantsQuery.isLoading}
        isError={participantsQuery.isError}
        onRetry={() => participantsQuery.refetch()}
        isEmpty={uniqueParticipants.length === 0}
        expectedCount={expected('uniqueParticipants')}
        emptyTitle={t('participation.empty.participantsTitle')}
        emptyDescription={t('participation.empty.participantsDescription')}
      >
        <UniqueParticipantsTable list={uniqueParticipants} />
      </StatsSection>

      <StatsSection
        title={t('participation.sections.recipients')}
        isLoading={recipientsQuery.isLoading}
        isError={recipientsQuery.isError}
        onRetry={() => recipientsQuery.refetch()}
        isEmpty={uniqueRecipients.length === 0}
        expectedCount={expected('uniqueRecipients')}
        emptyTitle={t('participation.empty.recipientsTitle')}
        emptyDescription={t('participation.empty.recipientsDescription')}
      >
        <UniqueRecipientsTable list={uniqueRecipients} />
      </StatsSection>

      <StatsSection
        title={t('participation.sections.contributors')}
        isLoading={donorsQuery.isLoading}
        isError={donorsQuery.isError}
        onRetry={() => donorsQuery.refetch()}
        isEmpty={uniqueDonors.length === 0}
        expectedCount={expected('uniqueContributors')}
        emptyTitle={t('participation.empty.contributorsTitle')}
        emptyDescription={t('participation.empty.contributorsDescription')}
      >
        <UniqueEthDonorsTable list={uniqueDonors} />
      </StatsSection>

      <DefinitionsDisclosure
        className="border-t border-rule pt-8 sm:pt-10"
        label={t('shared.definitions')}
        items={[
          {
            term: t('participation.sections.participants'),
            definition: t('sectionTooltips.uniqueParticipants'),
          },
          {
            term: t('participation.sections.recipients'),
            definition: t('sectionTooltips.uniqueRecipients'),
          },
          {
            term: t('participation.sections.contributors'),
            definition: t('sectionTooltips.uniqueEthContributors'),
          },
        ]}
      />
    </div>
  );
};

export default ParticipationPanel;
