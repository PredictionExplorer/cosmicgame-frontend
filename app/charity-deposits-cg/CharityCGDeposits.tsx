'use client';

import { Typography } from '@mui/material';

import { MainWrapper } from '@/components/styled';
import {
  CharityDepositTable,
  type CharityDepositDonation,
} from '@/components/tables/CharityDepositTable';
import { useCharityCGDeposits } from '@/hooks/useApiQuery';

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

export default CharityCGDeposits;
