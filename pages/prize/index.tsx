import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { GetServerSideProps } from 'next';

import { MainWrapper } from '../../components/styled';
import { PrizeTable } from '../../components/tables/PrizeTable';
import { createOpenGraphProps } from '../../utils/seo';
import { useRoundList } from '../../hooks/useApiQuery';

// PrizeWinners component that displays a list of prize winners
const PrizeWinners = () => {
  const { data: rawPrizeClaims = [], isLoading: loading } = useRoundList();
  const prizeClaims = useMemo(
    () => [...rawPrizeClaims].sort((a, b) => b.TimeStamp - a.TimeStamp),
    [rawPrizeClaims],
  );

  return (
    <MainWrapper>
      {/* Title of the page */}
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Main Prize Winnings
      </Typography>
      <Box mt={6}>
        {/* Render the prize table with loading state */}
        <PrizeTable list={prizeClaims} loading={loading} />
      </Box>
    </MainWrapper>
  );
};

// Server-side logic for setting metadata
export const getServerSideProps: GetServerSideProps = async () => ({
  props: createOpenGraphProps('Main Prize Winnings | Cosmic Signature', 'Main Prize Winnings'),
});

export default PrizeWinners;
