'use client';

import { Typography } from '@mui/material';

import { MainWrapper } from '@/components/styled';
import {
  CharityDepositTable,
  type CharityDepositDonation,
} from '@/components/tables/CharityDepositTable';
import { useCharityVoluntary } from '@/hooks/useApiQuery';

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

export default CharityDepositsVoluntary;
