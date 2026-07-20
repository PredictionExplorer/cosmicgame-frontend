'use client';

import { useMemo } from 'react';
import { Award, Gift, TrendingUp, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  useDashboardInfo,
  useUniqueDonors,
  useUniqueParticipants,
  useUniqueRecipients,
} from '@/hooks/useApiQuery';
import { StatCard } from '@/components/ui/stat-card';
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

/** Community participation tables: unique participants, recipients, and ETH contributors. */
const ParticipationPanel = () => {
  const t = useTranslations('statistics');
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardInfo(undefined, {
    poll: false,
  });
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
  const mainStats = dashboardData?.MainStats;

  return (
    <div data-testid="participation-panel">
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          label={t('metrics.uniqueParticipants.label')}
          value={mainStats?.NumUniqueBidders ?? '—'}
          icon={<Users className="h-4 w-4" />}
          tooltip={t('metrics.uniqueParticipants.tooltip')}
          loading={dashboardLoading}
        />
        <StatCard
          label={t('metrics.uniqueRecipients.label')}
          value={mainStats?.NumUniqueWinners ?? '—'}
          icon={<Award className="h-4 w-4" />}
          tooltip={t('metrics.uniqueRecipients.tooltip')}
          loading={dashboardLoading}
        />
        <StatCard
          label={t('metrics.uniqueEthContributors.label')}
          value={mainStats?.NumUniqueDonors ?? '—'}
          icon={<Gift className="h-4 w-4" />}
          tooltip={t('metrics.uniqueEthContributors.tooltip')}
          loading={dashboardLoading}
        />
        <StatCard
          label={t('metrics.uniqueAnchorHolders.label')}
          value={mainStats ? mainStats.NumUniqueStakersCST + mainStats.NumUniqueStakersRWalk : '—'}
          icon={<TrendingUp className="h-4 w-4" />}
          tooltip={t('metrics.uniqueAnchorHolders.tooltip')}
          loading={dashboardLoading}
        />
      </div>

      <div className="space-y-8">
        <StatsSection
          title={t('participation.sections.participants')}
          tooltip={t('sectionTooltips.uniqueParticipants')}
          icon={<Users className="h-3.5 w-3.5" />}
          isLoading={participantsQuery.isLoading}
          isError={participantsQuery.isError}
          onRetry={() => participantsQuery.refetch()}
          isEmpty={uniqueParticipants.length === 0}
          emptyTitle={t('participation.empty.participantsTitle')}
          emptyDescription={t('participation.empty.participantsDescription')}
        >
          <UniqueParticipantsTable list={uniqueParticipants} />
        </StatsSection>

        <StatsSection
          title={t('participation.sections.recipients')}
          tooltip={t('sectionTooltips.uniqueRecipients')}
          icon={<Award className="h-3.5 w-3.5" />}
          isLoading={recipientsQuery.isLoading}
          isError={recipientsQuery.isError}
          onRetry={() => recipientsQuery.refetch()}
          isEmpty={uniqueRecipients.length === 0}
          emptyTitle={t('participation.empty.recipientsTitle')}
          emptyDescription={t('participation.empty.recipientsDescription')}
        >
          <UniqueRecipientsTable list={uniqueRecipients} />
        </StatsSection>

        <StatsSection
          title={t('participation.sections.contributors')}
          tooltip={t('sectionTooltips.uniqueEthContributors')}
          icon={<Gift className="h-3.5 w-3.5" />}
          isLoading={donorsQuery.isLoading}
          isError={donorsQuery.isError}
          onRetry={() => donorsQuery.refetch()}
          isEmpty={uniqueDonors.length === 0}
          emptyTitle={t('participation.empty.contributorsTitle')}
          emptyDescription={t('participation.empty.contributorsDescription')}
        >
          <UniqueEthDonorsTable list={uniqueDonors} />
        </StatsSection>
      </div>
    </div>
  );
};

export default ParticipationPanel;
