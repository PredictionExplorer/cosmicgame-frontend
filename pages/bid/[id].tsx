import React, { useEffect, useState } from "react";
import { Box, Grid, Link, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import { GetServerSidePropsContext } from "next";
import api from "../../services/api";
import axios from "axios";
import RandomWalkNFT from "../../components/RandomWalkNFT";
import NFTImage from "../../components/NFTImage";
import { convertTimestampToDateTime, logoImgUrl } from "../../utils";

/* ------------------------------------------------------------------
  Page Component: BidInfo
  Displays detailed information for a specific bid, including:
    - Bid date/time
    - Bidder address
    - Round number
    - Bid price (in ETH or CST)
    - Optional: NFT donation info + metadata
    - Optional: RandomWalk NFT rendering if used
------------------------------------------------------------------ */
const BidInfo = ({ bidId }: { bidId: number }) => {
  // Loading state to display while data is being fetched.
  const [loading, setLoading] = useState(true);

  // Main bid data fetched from the API.
  const [bidInfo, setBidInfo] = useState<any>(null);

  // If the user donated an NFT, we fetch its tokenURI to display extra metadata.
  const [tokenURI, setTokenURI] = useState<any>(null);

  /**
   * Fetch the bid info from our API when the component mounts.
   * Also fetch the NFT metadata (if available) via the tokenURI field.
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1) Fetch the main bid info using the provided bidId prop.
      const fetchedBidInfo = await api.get_bid_info(bidId);
      setBidInfo(fetchedBidInfo);

      // 2) If there's an NFT donation with a valid TokenURI, fetch that metadata.
      if (fetchedBidInfo?.NFTTokenURI) {
        const { data } = await axios.get(fetchedBidInfo.NFTTokenURI);
        setTokenURI(data);
      }

      setLoading(false);
    };

    fetchData();
  }, [bidId]);

  if (bidId < 0) {
    return (
      <MainWrapper>
        <Typography variant="h6">Invalid Bid Id</Typography>
      </MainWrapper>
    );
  }

  // Render
  return (
    <MainWrapper>
      {/* Page Title */}
      <Typography variant="h4" color="primary" mb={4}>
        Bid Information
      </Typography>

      {/* Loading State */}
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <>
          {/* 
            If we have bidInfo, display all relevant fields. 
            Otherwise, you may want to add a fallback if bidInfo === null.
          */}

          {/* Bid Datetime + link to Arbiscan transaction */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Bid Datetime:</Typography>
            &nbsp;
            <Link
              href={`https://arbiscan.io/tx/${bidInfo.TxHash}`}
              style={{ color: "inherit" }}
              target="_blank"
            >
              <Typography>
                {convertTimestampToDateTime(bidInfo.TimeStamp)}
              </Typography>
            </Link>
          </Box>

          {/* Bidder address (linked to a user detail page) */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Bidder Address:</Typography>
            &nbsp;
            <Link
              href={`/user/${bidInfo.BidderAddr}`}
              style={{ color: "rgb(255, 255, 255)" }}
            >
              <Typography fontFamily="monospace">
                {bidInfo.BidderAddr}
              </Typography>
            </Link>
          </Box>

          {/* Round Number (linked to a prize detail page) */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Round Number:</Typography>
            &nbsp;
            <Link
              href={`/prize/${bidInfo.RoundNum}`}
              sx={{ fontSize: "inherit", color: "inherit" }}
            >
              <Typography>{bidInfo.RoundNum}</Typography>
            </Link>
          </Box>

          {/* Bid Price (in CST or ETH). CST is indicated by 'BidType === 2' */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Bid Price:</Typography>
            &nbsp;
            <Typography>
              {bidInfo.BidType === 2
                ? // If it's CST, format 'NumCSTTokensEth' accordingly
                  `${
                    bidInfo.NumCSTTokensEth > 0 && bidInfo.NumCSTTokensEth < 1
                      ? bidInfo.NumCSTTokensEth.toFixed(7)
                      : bidInfo.NumCSTTokensEth.toFixed(2)
                  } CST`
                : // Otherwise, it's ETH; format 'BidPriceEth'
                  `${
                    bidInfo.BidPriceEth > 0 && bidInfo.BidPriceEth < 1
                      ? bidInfo.BidPriceEth.toFixed(7)
                      : bidInfo.BidPriceEth.toFixed(2)
                  } ETH`}
            </Typography>
          </Box>

          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">CST Reward Amount:</Typography>
            &nbsp;
            <Typography>
              {bidInfo.ERC20RewardAmountEth.toFixed(2)} ETH
            </Typography>
          </Box>

          {/* Indicates whether the bid used a RandomWalkNFT */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Was bid with RandomWalkNFT:</Typography>
            &nbsp;
            <Typography>{bidInfo.RWalkNFTId < 0 ? "No" : "Yes"}</Typography>
          </Box>

          {/* Indicates whether the bid used a Cosmic Signature Token (CST) */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Was bid with Cosmic Token:</Typography>
            &nbsp;
            <Typography>{bidInfo.BidType === 2 ? "Yes" : "No"}</Typography>
          </Box>

          {/* If the user actually used a RandomWalk NFT, display its ID */}
          {bidInfo.RWalkNFTId >= 0 && (
            <Box mb={1} display="flex" flexWrap="wrap">
              <Typography color="primary">RandomWalkNFT ID:</Typography>
              &nbsp;
              <Typography>{bidInfo.RWalkNFTId}</Typography>
            </Box>
          )}

          {bidInfo.DonatedERC20TokenAddr && (
            <>
              <Box mb={1} display="flex" flexWrap="wrap">
                <Typography color="primary">
                  Donated ERC20 Token Address:
                </Typography>
                &nbsp;
                <Typography>{bidInfo.DonatedERC20TokenAddr}</Typography>
              </Box>
              <Box mb={1} display="flex" flexWrap="wrap">
                <Typography color="primary">
                  Donated ERC20 Token Amount:
                </Typography>
                &nbsp;
                <Typography>
                  {bidInfo.DonatedERC20TokenAmountEth.toFixed(2)}
                </Typography>
              </Box>
            </>
          )}

          {/* 
            If there's a donated NFT, show its contract address and TokenId 
            along with any metadata (image, name, description, etc.).
          */}
          {bidInfo.NFTDonationTokenAddr !== "" &&
            bidInfo.NFTDonationTokenId !== -1 && (
              <>
                <Box mb={1} display="flex" flexWrap="wrap">
                  <Typography color="primary">
                    Donated NFT Contract Address (aka Token):
                  </Typography>
                  &nbsp;
                  <Typography fontFamily="monospace">
                    {bidInfo.NFTDonationTokenAddr}
                  </Typography>
                </Box>

                <Box mb={1} display="flex" flexWrap="wrap">
                  <Typography color="primary">Donated NFT Token Id:</Typography>
                  &nbsp;
                  <Typography>{bidInfo.NFTDonationTokenId}</Typography>
                </Box>

                <Box mb={1} display="flex" flexWrap="wrap">
                  <Typography color="primary">
                    Donated NFT Token URI:
                  </Typography>
                  &nbsp;
                  <Typography>{bidInfo.NFTTokenURI}</Typography>
                </Box>

                {/* NFT Metadata (if fetched from the tokenURI) */}
                <Box mb={1} display="flex" flexWrap="wrap">
                  <Typography color="primary">Image:</Typography>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                      <NFTImage
                        src={tokenURI?.image}
                        sx={{ backgroundSize: "contain" }}
                      />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      {/* Additional NFT info like collection name, artist, platform, etc. */}
                      <Box mb={1} display="flex" flexWrap="wrap">
                        <Typography color="primary">
                          Collection Name:
                        </Typography>
                        &nbsp;
                        <Typography>{tokenURI?.collection_name}</Typography>
                      </Box>
                      <Box mb={1} display="flex" flexWrap="wrap">
                        <Typography color="primary">Artist:</Typography>
                        &nbsp;
                        <Typography>{tokenURI?.artist}</Typography>
                      </Box>
                      <Box mb={1} display="flex" flexWrap="wrap">
                        <Typography color="primary">Platform:</Typography>
                        &nbsp;
                        <Typography>{tokenURI?.platform}</Typography>
                      </Box>
                      <Box mb={1} display="flex" flexWrap="wrap">
                        <Typography color="primary">Description:</Typography>
                        &nbsp;
                        <Typography>{tokenURI?.description}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}

          {/* Message (if any) attached to the bid */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Message:</Typography>
            &nbsp;
            <Typography>{bidInfo.Message}</Typography>
          </Box>

          {/* If a RandomWalkNFT was used, display its visual representation */}
          {bidInfo.RWalkNFTId >= 0 && (
            <Box width="400px" mt={4}>
              <RandomWalkNFT tokenId={bidInfo.RWalkNFTId} selectable={false} />
            </Box>
          )}
        </>
      )}
    </MainWrapper>
  );
};

/* ------------------------------------------------------------------
  getServerSideProps:
  - Retrieves the 'id' from the URL (params).
  - Sets up meta tags (title, description) for SEO.
  - Provides 'bidId' to the component as a prop for data fetching.
------------------------------------------------------------------ */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Get the bid ID from the URL params.
  const params = context.params!.id;
  const id = Array.isArray(params) ? params[0] : params;

  // Construct dynamic SEO metadata
  const title = "Bid Information | Cosmic Signature";
  const description = `Bid Information for Bid Id=${id}`;

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  // Return the props, including the bid ID as a number
  return { props: { title, description, openGraphData, bidId: parseInt(id) } };
}

export default BidInfo;
