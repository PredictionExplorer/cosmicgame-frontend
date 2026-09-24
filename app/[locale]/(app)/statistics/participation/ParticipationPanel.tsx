'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { useUniqueDonors, useUniqueParticipants, useUniqueRecipients } from '@/hooks/useApiQuery';
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

/**
 * The participation ledgers: every participant by gesture count, every
 * allocation recipient, every ETH contributor. The header above carries the
 * four counts, so the body is the lists themselves, one section each.
 */
const ParticipationPanel = () => {
  const t = useTranslations('statistics');
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
        tooltip={t('sectionTooltips.uniqueParticipants')}
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
  );
};

export default ParticipationPanel;
