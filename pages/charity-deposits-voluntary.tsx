import React from 'react';
import { Typography } from '@mui/material';
import { GetServerSideProps } from 'next';

import { MainWrapper } from '../components/styled';
import {
  CharityDepositTable,
  type CharityDepositDonation,
} from '../components/tables/CharityDepositTable';
import { createOpenGraphProps } from '../utils/seo';
import { useCharityVoluntary } from '../hooks/useApiQuery';

/**
 * Page component for displaying voluntary deposits to the charity wallet.
 */
const CharityDepositsVoluntary = () => {
  const { data: voluntaryDeposits = [], isLoading: loading } = useCharityVoluntary();

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Voluntary Deposits
      </Typography>

      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        // Pass the fetched voluntary deposits to the table component
        <CharityDepositTable list={voluntaryDeposits as CharityDepositDonation[]} />
      )}
    </MainWrapper>
  );
};

/**
 * Fetches metadata for server-side rendering, including title, description,
 * and open graph data for social sharing.
 */
export const getServerSideProps: GetServerSideProps = async () => ({
  props: createOpenGraphProps(
    'Deposits To Charity Wallet | Cosmic Signature',
    'Deposits To Charity Wallet',
  ),
});

export default CharityDepositsVoluntary;
