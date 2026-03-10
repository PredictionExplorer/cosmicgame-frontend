import React from 'react';
import { Typography } from '@mui/material';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

import { MainWrapper } from '../../../components/styled';
import EthDonationTable, { type EthDonation } from '../../../components/tables/EthDonationTable';
import { createOpenGraphProps } from '../../../utils/seo';
import { useDonationsBothByRound } from '../../../hooks/useApiQuery';

// Define TypeScript types for props
interface EthDonationByRoundProps {
  round: number;
}

// Component to display Ethereum donations by specific round
const EthDonationByRound: React.FC<EthDonationByRoundProps> = ({ round }) => {
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

// Server-side rendering to fetch initial props
export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  // Extract round parameter from URL context
  const paramRound = context.params!.round;
  const round = Array.isArray(paramRound) ? paramRound[0] : paramRound;

  const title = `Direct (ETH) Donations for Round ${round} | Cosmic Signature`;
  const description = `View Direct (ETH) Donations for Round ${round}`;

  return { props: { ...createOpenGraphProps(title, description), round } };
};

export default EthDonationByRound;
