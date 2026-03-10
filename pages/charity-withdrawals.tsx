import React from 'react';
import { Typography } from '@mui/material';
import { GetServerSideProps } from 'next';

import { MainWrapper } from '../components/styled';
import CharityWithdrawalTable, {
  type CharityWithdrawal,
} from '../components/tables/CharityWithdrawalTable';
import { createOpenGraphProps } from '../utils/seo';
import { useCharityWithdrawals } from '../hooks/useApiQuery';

/**
 * CharityWithdrawals:
 * - Fetches and displays a list of withdrawals from the charity wallet.
 */
const CharityWithdrawals = () => {
  const { data: charityWithdrawals = [], isLoading: loading } = useCharityWithdrawals();

  return (
    <MainWrapper>
      {/* Page Title */}
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Withdrawals from Charity Wallet
      </Typography>

      {/* Conditionally render a loading indicator or the table of withdrawals */}
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <CharityWithdrawalTable list={charityWithdrawals as CharityWithdrawal[]} />
      )}
    </MainWrapper>
  );
};

/**
 * getServerSideProps:
 * Injects metadata for SEO and social sharing into the page.
 */
export const getServerSideProps: GetServerSideProps = async () => ({
  props: createOpenGraphProps(
    'Withdrawals from Charity Wallet | Cosmic Signature',
    'Withdrawals from Charity Wallet',
  ),
});

export default CharityWithdrawals;
