import React, { useEffect, useRef, useState } from "react";
import { Box, Link, Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import { useRouter } from "next/router";
import Fireworks, { FireworksHandlers } from "@fireworks-js/react";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import api from "../services/api";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";

/* ------------------------------------------------------------------
  Page Component: PrizeClaimed
  This page shows details of a claimed prize for a specific round. 
  If a "message" query param is present, fireworks are displayed 
  until the user clicks to stop them.

  - Query param "round" indicates the round number to fetch info for.
  - "message" param triggers the fireworks display (for a congratulatory moment).
------------------------------------------------------------------ */
const PrizeClaimed = () => {
  // Access Next.js router to read query params like "round" and "message".
  const router = useRouter();

  // Reference to the Fireworks component so we can stop it on click.
  const fireworksRef = useRef<FireworksHandlers>(null);

  // Track whether the user has ended the fireworks show.
  const [finishFireworks, setFinishFireworks] = useState(false);

  // Prize data fetched from the API.
  const [prizeInfo, setPrizeInfo] = useState<any>(null);

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
   * Fetches the prize info from the API based on the "round" query param.
   * - If successful, stores data in `prizeInfo`.
   * - If there's an error, logs it and sets loading to false.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Safely parse the "round" query parameter to a number.
        const roundStr = router.query.round;
        const roundNum = parseInt(
          Array.isArray(roundStr) ? roundStr[0] : roundStr
        );

        // Fetch round/prize info from the API.
        const fetchedPrizeInfo = await api.get_round_info(roundNum);
        setPrizeInfo(fetchedPrizeInfo);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    // Only fetch if we indeed have a "round" in the router query.
    if (router.query && router.query.round !== undefined) {
      fetchData();
    }
  }, [router.query]);

  /**
   * Page content rendering logic:
   * - Show "Loading..." while fetching.
   * - If no prize info, display "No prize information."
   * - Otherwise, display fireworks (if "message" is in query and fireworks aren't finished)
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
          {/* Fireworks if user navigated with a "message" query AND haven't stopped them yet */}
          {router.query.message && !finishFireworks && (
            <Fireworks
              ref={fireworksRef}
              options={{ opacity: 0.5 }}
              style={{
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                position: "fixed",
                zIndex: 10000,
              }}
              onClick={handleFireworksClick}
            />
          )}

          {/* Main Prize Info */}
          <Typography
            variant="h4"
            color="primary"
            gutterBottom
            textAlign="center"
            mb={6}
          >
            {`Congratulations! You won Round ${prizeInfo.PrizeNum}.`}
          </Typography>

          <Typography variant="h5" mb={2}>
            {`Round ${prizeInfo.PrizeNum} rewards are:`}
          </Typography>
          <Box ml={4}>
            {/* ETH Reward */}
            <Typography variant="subtitle1">
              {prizeInfo?.AmountEth.toFixed(6)} ETH
            </Typography>

            {/* Winning Token */}
            <Typography variant="subtitle1">
              Cosmic Signature Token Number{" "}
              <Link
                href={`/detail/${prizeInfo.TokenId}`}
                sx={{ fontSize: "inherit", color: "inherit" }}
              >
                {prizeInfo.TokenId}
              </Link>
            </Typography>

            {/* Donated NFTs, if any */}
            {!!prizeInfo.RoundStats.TotalDonatedNFTs && (
              <Typography variant="subtitle1">
                {prizeInfo.RoundStats.TotalDonatedNFTs} donated tokens (ERC721)
              </Typography>
            )}
          </Box>

          {/* Additional Info + Links to check other potential rewards */}
          <Typography variant="subtitle2" mt={4}>
            There could also be random rewards from raffles. To check your
            winnings, go to{" "}
            <Link href="/my-winnings" color="inherit">
              My-Winnings
            </Link>{" "}
            page. For staking rewards, visit{" "}
            <Link href="/my-staking" color="inherit">
              My-Staking
            </Link>{" "}
            page.
          </Typography>
        </>
      )}
    </MainWrapper>
  );
};

/* ------------------------------------------------------------------
  getServerSideProps:
  Provides server-side rendered meta tags (title, description, 
  Open Graph data). This ensures proper SEO for social sharing.
------------------------------------------------------------------ */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Claimed Prize Rewards | Cosmic Signature";
  const description = "Claimed Prize Rewards";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default PrizeClaimed;
