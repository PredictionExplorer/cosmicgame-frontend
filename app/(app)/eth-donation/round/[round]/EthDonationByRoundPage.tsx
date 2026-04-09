'use client';

import { MainWrapper } from '@/components/styled';
import EthDonationTable, { type EthDonation } from '@/components/tables/EthDonationTable';
import { useDonationsBothByRound } from '@/hooks/useApiQuery';

interface EthDonationByRoundPageProps {
  round: number;
}

const EthDonationByRoundPage = ({ round }: EthDonationByRoundPageProps) => {
  const { data: donationInfo = [], isLoading: loading } = useDonationsBothByRound(round);

  if (round < 0) {
    return (
      <MainWrapper>
        <p className="text-lg font-semibold">Invalid Round Number</p>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <h2 className="text-2xl font-bold text-primary text-center mb-8">
        Direct (ETH) Donations for Round {round}
      </h2>

      {loading ? (
        <p className="text-lg font-semibold">Loading...</p>
      ) : (
        <EthDonationTable list={(donationInfo ?? []) as EthDonation[]} />
      )}
    </MainWrapper>
  );
};

export default EthDonationByRoundPage;
