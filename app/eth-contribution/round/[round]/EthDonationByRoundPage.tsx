'use client';

import { detailPanelClass } from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import EthDonationTable, { type EthDonation } from '@/components/tables/EthDonationTable';
import { useDonationsBothByRound } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';

interface EthDonationByRoundPageProps {
  round: number;
}

const EthDonationByRoundPage = ({ round }: EthDonationByRoundPageProps) => {
  const { data: donationInfo = [], isLoading: loading } = useDonationsBothByRound(round);

  if (round < 0) {
    return (
      <MainWrapper>
        <div className={cn(detailPanelClass, 'mx-auto max-w-lg p-8 text-center')}>
          <p className="font-display text-lg font-semibold text-foreground">Invalid Cycle Number</p>
        </div>
      </MainWrapper>
    );
  }

  const title = `Direct (ETH) Contributions for Cycle ${round}`;

  return (
    <MainWrapper className="max-sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title={title}
          subtitle="All direct ETH contributions recorded for this cycle."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'ETH contributions', href: '/eth-contribution' },
            { label: `Cycle ${round}` },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <div className={cn(detailPanelClass, 'overflow-x-auto p-2 sm:p-4')}>
            <EthDonationTable list={(donationInfo ?? []) as EthDonation[]} />
          </div>
        )}
      </div>
    </MainWrapper>
  );
};

export default EthDonationByRoundPage;
