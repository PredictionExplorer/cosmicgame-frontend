import { useEffect, useState } from "react";
import { Grid, Link, Typography } from "@mui/material";
import { formatSeconds } from "../utils";
import api from "../services/api";

export const SpecialPrizeWinners = () => {
  const [specialWinners, setSpecialWinners] = useState(null);
  useEffect(() => {
    const fetchSpecialWinners = async () => {
      const special = await api.get_current_special_winners();
      setSpecialWinners(special);
    };
    fetchSpecialWinners();
    const interval = setInterval(fetchSpecialWinners, 12000);

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Typography variant="subtitle1" color="primary" mt={4} mb={2}>
        Potential winners of Special Prizes
      </Typography>
      <Grid container spacing={2} mb={2} alignItems="center">
        <Grid item xs={12} sm={4} md={4}>
          <Typography>Endurance Champion</Typography>
        </Grid>
        <Grid item xs={12} sm={8} md={8}>
          <Typography>
            <Link
              href={`/user/${specialWinners?.EnduranceChampionAddress}`}
              color="rgb(255, 255, 255)"
              fontSize="inherit"
              sx={{ wordBreak: "break-all" }}
            >
              {specialWinners?.EnduranceChampionAddress}
            </Link>
            {specialWinners?.EnduranceChampionDuration > 0 && (
              <>
                {` (Lasted ${formatSeconds(
                  specialWinners?.EnduranceChampionDuration
                )})`}
              </>
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={2} alignItems="center">
        <Grid item xs={12} sm={4} md={4}>
          <Typography>Chrono Warrior</Typography>
        </Grid>
        {specialWinners?.EnduranceChampionAddress && (
          <Grid item xs={12} sm={8} md={8}>
            <Typography>
              <Link
                href={`/user/${specialWinners?.EnduranceChampionAddress}`}
                color="rgb(255, 255, 255)"
                fontSize="inherit"
                sx={{ wordBreak: "break-all" }}
              >
                {specialWinners?.EnduranceChampionAddress}
              </Link>
              {specialWinners?.EnduranceChampionDuration > 0 && (
                <>
                  {` (Lasted ${formatSeconds(
                    specialWinners?.EnduranceChampionDuration
                  )})`}
                </>
              )}
            </Typography>
          </Grid>
        )}
      </Grid>
      <Grid container spacing={2} mb={2} alignItems="center">
        <Grid item xs={12} sm={4} md={4}>
          <Typography>Last Cst Bidder</Typography>
        </Grid>
        <Grid item xs={12} sm={8} md={8}>
          <Typography>
            <Link
              href={`/user/${specialWinners?.LastCstBidderAddress}`}
              color="rgb(255, 255, 255)"
              fontSize="inherit"
              sx={{ wordBreak: "break-all" }}
            >
              {specialWinners?.LastCstBidderAddress}
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};
