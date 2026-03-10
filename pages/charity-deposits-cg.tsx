import React from 'react';
import { Typography } from '@mui/material';
import { GetServerSideProps } from 'next';

import { MainWrapper } from '../components/styled';
import {
  CharityDepositTable,
  type CharityDepositDonation,
} from '../components/tables/CharityDepositTable';
import { createOpenGraphProps } from '../utils/seo';
import { useCharityCGDeposits } from '../hooks/useApiQuery';

/**
 * Component for displaying Cosmic Game Charity Deposits.
 */
const CharityCGDeposits = () => {
  const { data: charityCGDeposits = [], isLoading: loading } = useCharityCGDeposits();

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Cosmic Game Charity Deposits
      </Typography>
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <CharityDepositTable list={charityCGDeposits as CharityDepositDonation[]} />
      )}
    </MainWrapper>
  );
};

/**
 * Retrieves SEO-related metadata for server-side rendering,
 * including open graph data for social media previews.
 */
export const getServerSideProps: GetServerSideProps = async () => ({
  props: createOpenGraphProps(
    'Cosmic Game Charity Deposits | Cosmic Signature',
    'Cosmic Game Charity Deposits',
  ),
});

export default CharityCGDeposits;
