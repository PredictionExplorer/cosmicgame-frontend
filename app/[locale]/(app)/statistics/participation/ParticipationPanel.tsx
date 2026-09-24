'use client';

import { useMemo } from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatGroupedNumber } from '@/utils';

import { ContributionIcon, RecipientIcon } from '@/lib/conceptIcons';
import { countActiveAnchorHolders } from '@/utils/anchoringStats';
import { toFiniteNumber } from '@/utils/finiteNumber';
import {
  useDashboardInfo,
  useUniqueCSTAnchorHolders,
  useUniqueDonors,
  useUniqueParticipants,
  useUniqueRecipients,
  useUniqueRWLKAnchorHolders,
} from '@/hooks/useApiQuery';
import { StatCard } from '@/components/ui/stat-card';
import { UnknownValue } from '@/components/ui/unknown-value';
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
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardInfo(undefined, {
    poll: false,
  });
  const participantsQuery = useUniqueParticipants();
  const recipientsQuery = useUniqueRecipients();
  const donorsQuery = useUniqueDonors();
  const cstAnchorHoldersQuery = useUniqueCSTAnchorHolders();
  const rwlkAnchorHoldersQuery = useUniqueRWLKAnchorHolders();

  const uniqueParticipants = useMemo(() => {
    if (!participantsQuery.data) return [];
    return [...participantsQuery.data].sort(
      (a: Participant, b: Participant) => b.NumBids - a.NumBids,
    );
  }, [participantsQuery.data]);

  const uniqueRecipients = (recipientsQuery.data ?? []) as Recipient[];
  const uniqueDonors = (donorsQuery.data ?? []) as UniqueEthDonor[];
  const mainStats = dashboardData?.MainStats;
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;
  const count = (value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? unknown : formatGroupedNumber(numeric, locale);
  };
  // The same definition as /anchoring and /statistics/anchoring: distinct wallets anchoring
  // either kind now. The dashboard's per-kind unique counts overlap, so their sum counted a
  // wallet that anchors both kinds twice.
  const activeAnchorHolders = countActiveAnchorHolders(
    cstAnchorHoldersQuery.data,
    rwlkAnchorHoldersQuery.data,
  );

  return (
    <div data-testid="participation-panel">
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          label={t('metrics.uniqueParticipants.label')}
          value={count(mainStats?.NumUniqueBidders)}
          icon={<Users className="h-4 w-4" />}
          tooltip={t('metrics.uniqueParticipants.tooltip')}
          loading={dashboardLoading}
        />
        <StatCard
          label={t('metrics.uniqueRecipients.label')}
          value={count(mainStats?.NumUniqueWinners)}
          icon={<RecipientIcon className="h-4 w-4" />}
          tooltip={t('metrics.uniqueRecipients.tooltip')}
          loading={dashboardLoading}
        />
        <StatCard
          label={t('metrics.uniqueEthContributors.label')}
          value={count(mainStats?.NumUniqueDonors)}
          icon={<ContributionIcon className="h-4 w-4" />}
          tooltip={t('metrics.uniqueEthContributors.tooltip')}
          loading={dashboardLoading}
        />
        <StatCard
          label={t('anchoringPage.snapshot.activeHoldersLabel')}
          value={count(activeAnchorHolders)}
          icon={<TrendingUp className="h-4 w-4" />}
          tooltip={t('anchoringPage.snapshot.activeHoldersTooltip')}
          loading={cstAnchorHoldersQuery.isLoading || rwlkAnchorHoldersQuery.isLoading}
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
          icon={<RecipientIcon className="h-3.5 w-3.5" />}
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
          icon={<ContributionIcon className="h-3.5 w-3.5" />}
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
