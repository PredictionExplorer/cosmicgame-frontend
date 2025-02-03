import React, { useEffect, useState } from "react";
import { Box, Grid, Link, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import { GetServerSidePropsContext } from "next";
import api from "../../services/api";
import axios from "axios";
import RandomWalkNFT from "../../components/RandomWalkNFT";
import NFTImage from "../../components/NFTImage";
import { convertTimestampToDateTime, getAssetsUrl } from "../../utils";

const BidInfo = ({ bidId }) => {
  const [loading, setLoading] = useState(true);
  const [bidInfo, setBidInfo] = useState(null);
  const [tokenURI, setTokenURI] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const bidInfo = await api.get_bid_info(bidId);
      setBidInfo(bidInfo);
      if (bidInfo?.NFTTokenURI) {
        const { data } = await axios.get(bidInfo.NFTTokenURI);
        setTokenURI(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" mb={4}>
        Bid Information
      </Typography>
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <>
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
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Round Number:</Typography>
            &nbsp;
            <Link
              href={`/prize/${bidInfo.RoundNum}`}
              sx={{
                fontSize: "inherit",
                color: "inherit",
              }}
            >
              <Typography>{bidInfo.RoundNum}</Typography>
            </Link>
          </Box>
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Bid Price:</Typography>
            &nbsp;
            <Typography>
              {bidInfo.BidType === 2
                ? `${
                    bidInfo.NumCSTTokensEth > 0 && bidInfo.NumCSTTokensEth < 1
                      ? bidInfo.NumCSTTokensEth.toFixed(7)
                      : bidInfo.NumCSTTokensEth.toFixed(2)
                  } CST`
                : `${
                    bidInfo.BidPriceEth > 0 && bidInfo.BidPriceEth < 1
                      ? bidInfo.BidPriceEth.toFixed(7)
                      : bidInfo.BidPriceEth.toFixed(2)
                  } ETH`}
            </Typography>
          </Box>
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Was bid with RandomWalkNFT:</Typography>
            &nbsp;
            <Typography>{bidInfo.RWalkNFTId < 0 ? "No" : "Yes"}</Typography>
          </Box>
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Was bid with Cosmic Token:</Typography>
            &nbsp;
            <Typography>{bidInfo.BidType === 2 ? "Yes" : "No"}</Typography>
          </Box>
          {bidInfo.RWalkNFTId >= 0 && (
            <Box mb={1} display="flex" flexWrap="wrap">
              <Typography color="primary">RandomWalkNFT ID:</Typography>
              &nbsp;
              <Typography>{bidInfo.RWalkNFTId}</Typography>
            </Box>
          )}
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
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Message:</Typography>
            &nbsp;
            <Typography>{bidInfo.Message}</Typography>
          </Box>
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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const params = context.params!.id;
  const id = Array.isArray(params) ? params[0] : params;
  const title = "Bid Information | Cosmic Signature";
  const description = `Bid Information for Bid Id=${id}`;
  const imageUrl = getAssetsUrl("cosmicsignature/logo.png");

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData, bidId: parseInt(id) } };
}

export default BidInfo;
