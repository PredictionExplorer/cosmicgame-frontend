'use client';

import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

import { MainWrapper } from '@/components/styled';
import { PrizeTable } from '@/components/tables/PrizeTable';
import { useRoundList } from '@/hooks/useApiQuery';

// PrizeWinnersPage component that displays a list of prize winners
const PrizeWinnersPage = () => {
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

export default PrizeWinnersPage;
