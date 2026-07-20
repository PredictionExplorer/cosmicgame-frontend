'use client';

import { useTranslations } from 'next-intl';

import { detailPanelClass } from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import EthDonationTable, { type EthDonation } from '@/components/tables/EthDonationTable';
import { useDonationsBothByRound } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';

interface EthDonationByRoundPageProps {
  round: number;
}

const EthDonationByRoundPage = ({ round }: EthDonationByRoundPageProps) => {
  const t = useTranslations('ethContribution');
  const { data: donationInfo = [], isLoading: loading } = useDonationsBothByRound(round);

  if (!Number.isInteger(round) || round < 0) {
    return (
      <PageShell variant="data" backdrop="signature">
        <div className={cn(detailPanelClass, 'mx-auto max-w-lg p-8 text-center')}>
          <p className="font-display text-lg font-semibold text-foreground">
            {t('cycle.invalidNumber')}
          </p>
        </div>
      </PageShell>
    );
  }

  const title = t('cycle.title', { cycle: round });

  return (
    <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title={title}
          subtitle={t('cycle.subtitle')}
          breadcrumbs={[
            { label: t('cycle.breadcrumbHome'), href: '/' },
            { label: t('cycle.breadcrumbContributions'), href: '/eth-contribution' },
            { label: t('cycle.breadcrumbCycle', { cycle: round }) },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">{t('cycle.loading')}</p>
          </div>
        ) : (
          <div className={cn(detailPanelClass, 'overflow-x-auto p-2 sm:p-4')}>
            <EthDonationTable list={(donationInfo ?? []) as EthDonation[]} />
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default EthDonationByRoundPage;
