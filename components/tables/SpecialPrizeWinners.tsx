import { Grid, Link, Typography } from '@mui/material';

import { formatSeconds } from '@/utils';
import { useCurrentSpecialWinners } from '@/hooks/useApiQuery';

interface SpecialWinners {
  EnduranceChampionAddress?: string;
  EnduranceChampionDuration?: number;
  LastCstBidderAddress?: string;
}

export const SpecialPrizeWinners = () => {
  const { data } = useCurrentSpecialWinners();
  const specialWinners =
    data != null && Array.isArray(data) ? null : (data as SpecialWinners | null);

  return (
    <>
      <Typography variant="subtitle1" color="primary" mt={4} mb={2}>
        Potential winners of Special Prizes
      </Typography>
      <Grid container spacing={2} mb={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Typography>Endurance Champion</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 8 }}>
          <Typography>
            <Link
              href={`/user/${specialWinners?.EnduranceChampionAddress}`}
              color="rgb(255, 255, 255)"
              fontSize="inherit"
              sx={{ wordBreak: 'break-all' }}
            >
              {specialWinners?.EnduranceChampionAddress}
            </Link>
            {(specialWinners?.EnduranceChampionDuration ?? 0) > 0 && (
              <>{` (Lasted ${formatSeconds(specialWinners?.EnduranceChampionDuration ?? 0)})`}</>
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Typography>Chrono Warrior</Typography>
        </Grid>
        {specialWinners?.EnduranceChampionAddress && (
          <Grid size={{ xs: 12, sm: 8, md: 8 }}>
            <Typography>
              <Link
                href={`/user/${specialWinners?.EnduranceChampionAddress}`}
                color="rgb(255, 255, 255)"
                fontSize="inherit"
                sx={{ wordBreak: 'break-all' }}
              >
                {specialWinners?.EnduranceChampionAddress}
              </Link>
              {(specialWinners?.EnduranceChampionDuration ?? 0) > 0 && (
                <>{` (Lasted ${formatSeconds(specialWinners?.EnduranceChampionDuration ?? 0)})`}</>
              )}
            </Typography>
          </Grid>
        )}
      </Grid>
      <Grid container spacing={2} mb={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Typography>Last Cst Bidder</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 8 }}>
          <Typography>
            <Link
              href={`/user/${specialWinners?.LastCstBidderAddress}`}
              color="rgb(255, 255, 255)"
              fontSize="inherit"
              sx={{ wordBreak: 'break-all' }}
            >
              {specialWinners?.LastCstBidderAddress}
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};
