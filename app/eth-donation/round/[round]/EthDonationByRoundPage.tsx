'use client';

import { Typography } from '@mui/material';

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
        <Typography variant="h6">Invalid Round Number</Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center" mb={4}>
        Direct (ETH) Donations for Round {round}
      </Typography>

      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <EthDonationTable list={(donationInfo ?? []) as EthDonation[]} />
      )}
    </MainWrapper>
  );
};

export default EthDonationByRoundPage;
