'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Box, Link, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import Fireworks, { FireworksHandlers } from '@fireworks-js/react';

import { MainWrapper } from '@/components/styled';
import api from '@/services/api';
import { reportError } from '@/utils/errors';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

/* ------------------------------------------------------------------
  Page Component: PrizeClaimedPage
  This page shows details of a claimed prize for a specific round.
  If a "message" search param is present, fireworks are displayed
  until the user clicks to stop them.

  - Search param "round" indicates the round number to fetch info for.
  - "message" param triggers the fireworks display (for a congratulatory moment).
------------------------------------------------------------------ */
const PrizeClaimedPage = () => {
  const searchParams = useSearchParams();

  // Reference to the Fireworks component so we can stop it on click.
  const fireworksRef = useRef<FireworksHandlers>(null);

  // Track whether the user has ended the fireworks show.
  const [finishFireworks, setFinishFireworks] = useState(false);

  // Prize data fetched from the API.
  const [prizeInfo, setPrizeInfo] = useState<import('@/services/api/types').RoundInfo | null>(null);

  // Loading state to show a spinner/message while data is being fetched.
  const [loading, setLoading] = useState(true);

  /**
   * Called when the Fireworks component is clicked.
   * Stops the fireworks display and updates state to ensure they don't return.
   */
  const handleFireworksClick = () => {
    fireworksRef.current?.stop();
    setFinishFireworks(true);
  };

  /**
   * Fetches the prize info from the API based on the "round" search param.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Safely parse the "round" search parameter to a number.
        const roundStr = searchParams.get('round');
        const roundNum = parseInt(roundStr ?? '0');

        // Fetch round/prize info from the API.
        const fetchedPrizeInfo = await api.get_round_info(roundNum);
        setPrizeInfo(fetchedPrizeInfo);
        setLoading(false);
      } catch (error) {
        reportError(error, 'fetch prize claimed info');
        setLoading(false);
      }
    };

    // Only fetch if we indeed have a "round" in the search params.
    if (searchParams.get('round') !== null) {
      fetchData();
    }
  }, [searchParams]);

  /**
   * Page content rendering logic:
   * - Show "Loading..." while fetching.
   * - If no prize info, display "No prize information."
   * - Otherwise, display fireworks (if "message" is in search params and fireworks aren't finished)
   *   and the prize details (Round, Amount, associated tokens, links, etc.).
   */
  return (
    <MainWrapper>
      {loading ? (
        /* Loading state */
        <Typography variant="h6">Loading...</Typography>
      ) : prizeInfo === null ? (
        /* No prize found for the given round */
        <Typography variant="h6">No prize information.</Typography>
      ) : (
        <>
          {/* Fireworks if user navigated with a "message" search param AND haven't stopped them yet */}
          {searchParams.get('message') && !finishFireworks && (
            <Fireworks
              ref={fireworksRef}
              options={{ opacity: 0.5 }}
              style={{
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                position: 'fixed',
                zIndex: 10000,
              }}
              onClick={handleFireworksClick}
            />
          )}

          {/* Main Prize Info */}
          <Typography variant="h4" color="primary" gutterBottom textAlign="center" mb={6}>
            {`Congratulations! You won Round ${prizeInfo.RoundNum}.`}
          </Typography>

          <Typography variant="h5" mb={2}>
            {`Round ${prizeInfo.RoundNum} rewards are:`}
          </Typography>
          <Box ml={4}>
            {/* ETH Reward */}
            <Typography variant="subtitle1">{prizeInfo?.AmountEth.toFixed(6)} ETH</Typography>

            {/* Winning Token */}
            <Typography variant="subtitle1">
              Cosmic Signature Token Number{' '}
              <Link
                href={`/detail/${prizeInfo.TokenId}`}
                sx={{ fontSize: 'inherit', color: 'inherit' }}
              >
                {prizeInfo.TokenId}
              </Link>
            </Typography>

            {/* Donated NFTs, if any */}
            {!!(prizeInfo.RoundStats.TotalDonatedNFTs as number) && (
              <Typography variant="subtitle1">
                {prizeInfo.RoundStats.TotalDonatedNFTs as ReactNode} donated tokens (ERC721)
              </Typography>
            )}
          </Box>

          {/* Additional Info + Links to check other potential rewards */}
          <Typography variant="subtitle2" mt={4}>
            There could also be random rewards from raffles. To check your winnings, go to{' '}
            <Link href="/my-winnings" color="inherit">
              My-Winnings
            </Link>{' '}
            page. For staking rewards, visit{' '}
            <Link href="/my-staking" color="inherit">
              My-Staking
            </Link>{' '}
            page.
          </Typography>
        </>
      )}
    </MainWrapper>
  );
};

export default PrizeClaimedPage;
