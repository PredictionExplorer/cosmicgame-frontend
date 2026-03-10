'use client';

import { useEffect, useState } from 'react';
import { Box, Grid, Link, Typography } from '@mui/material';
import axios from 'axios';

import { MainWrapper } from '@/components/styled';
import RandomWalkNFT from '@/components/nft/RandomWalkNFT';
import NFTImage from '@/components/nft/NFTImage';
import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';
import { useBidInfo } from '@/hooks/useApiQuery';

interface NFTTokenURI {
  image?: string;
  collection_name?: string;
  artist?: string;
  platform?: string;
  description?: string;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------
  Page Component: BidPage
  Displays detailed information for a specific bid, including:
    - Bid date/time
    - Bidder address
    - Round number
    - Bid price (in ETH or CST)
    - Optional: NFT donation info + metadata
    - Optional: RandomWalk NFT rendering if used
------------------------------------------------------------------ */
const BidPage = ({ bidId }: { bidId: number }) => {
  const { data: bidInfo = null, isLoading: loading } = useBidInfo(bidId);

  const [tokenURI, setTokenURI] = useState<NFTTokenURI | null>(null);

  useEffect(() => {
    if (bidInfo?.NFTTokenURI) {
      axios.get(bidInfo.NFTTokenURI).then(({ data }) => setTokenURI(data));
    }
  }, [bidInfo]);

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
      ) : !bidInfo ? (
        <Typography variant="h6">No bid information found.</Typography>
      ) : (
        <>
          {/* Bid Datetime + link to Arbiscan transaction */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Bid Datetime:</Typography>
            &nbsp;
            <Link
              href={getExplorerUrl('tx', bidInfo.TxHash)}
              style={{ color: 'inherit' }}
              target="_blank"
            >
              <Typography>{convertTimestampToDateTime(bidInfo.TimeStamp)}</Typography>
            </Link>
          </Box>

          {/* Bidder address (linked to a user detail page) */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Bidder Address:</Typography>
            &nbsp;
            <Link href={`/user/${bidInfo.BidderAddr}`} style={{ color: 'rgb(255, 255, 255)' }}>
              <Typography fontFamily="monospace">{bidInfo.BidderAddr}</Typography>
            </Link>
          </Box>

          {/* Round Number (linked to a prize detail page) */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Round Number:</Typography>
            &nbsp;
            <Link
              href={`/prize/${bidInfo.RoundNum}`}
              sx={{ fontSize: 'inherit', color: 'inherit' }}
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
                ? `${
                    (bidInfo.NumCSTTokensEth ?? 0) > 0 && (bidInfo.NumCSTTokensEth ?? 0) < 1
                      ? (bidInfo.NumCSTTokensEth ?? 0).toFixed(7)
                      : (bidInfo.NumCSTTokensEth ?? 0).toFixed(2)
                  } CST`
                : `${
                    (bidInfo.BidPriceEth ?? 0) > 0 && (bidInfo.BidPriceEth ?? 0) < 1
                      ? (bidInfo.BidPriceEth ?? 0).toFixed(7)
                      : (bidInfo.BidPriceEth ?? 0).toFixed(2)
                  } ETH`}
            </Typography>
          </Box>

          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">CST Reward Amount:</Typography>
            &nbsp;
            <Typography>{bidInfo.ERC20RewardAmountEth.toFixed(2)} ETH</Typography>
          </Box>

          {/* Indicates whether the bid used a RandomWalkNFT */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Was bid with RandomWalkNFT:</Typography>
            &nbsp;
            <Typography>{(bidInfo.RWalkNFTId ?? -1) < 0 ? 'No' : 'Yes'}</Typography>
          </Box>

          {/* Indicates whether the bid used a Cosmic Signature Token (CST) */}
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Was bid with Cosmic Signature Token:</Typography>
            &nbsp;
            <Typography>{bidInfo.BidType === 2 ? 'Yes' : 'No'}</Typography>
          </Box>

          {/* If the user actually used a RandomWalk NFT, display its ID */}
          {(bidInfo.RWalkNFTId ?? -1) >= 0 && (
            <Box mb={1} display="flex" flexWrap="wrap">
              <Typography color="primary">RandomWalkNFT ID:</Typography>
              &nbsp;
              <Typography>{bidInfo.RWalkNFTId}</Typography>
            </Box>
          )}

          {bidInfo.DonatedERC20TokenAddr && (
            <>
              <Box mb={1} display="flex" flexWrap="wrap">
                <Typography color="primary">Donated ERC20 Token Address:</Typography>
                &nbsp;
                <Typography>{bidInfo.DonatedERC20TokenAddr}</Typography>
              </Box>
              <Box mb={1} display="flex" flexWrap="wrap">
                <Typography color="primary">Donated ERC20 Token Amount:</Typography>
                &nbsp;
                <Typography>{(bidInfo.DonatedERC20TokenAmountEth ?? 0).toFixed(2)}</Typography>
              </Box>
            </>
          )}

          {/*
            If there's a donated NFT, show its contract address and TokenId
            along with any metadata (image, name, description, etc.).
          */}
          {bidInfo.NFTDonationTokenAddr !== '' && bidInfo.NFTDonationTokenId !== -1 && (
            <>
              <Box mb={1} display="flex" flexWrap="wrap">
                <Typography color="primary">Donated NFT Contract Address (aka Token):</Typography>
                &nbsp;
                <Typography fontFamily="monospace">{bidInfo.NFTDonationTokenAddr}</Typography>
              </Box>

              <Box mb={1} display="flex" flexWrap="wrap">
                <Typography color="primary">Donated NFT Token Id:</Typography>
                &nbsp;
                <Typography>{bidInfo.NFTDonationTokenId}</Typography>
              </Box>

              <Box mb={1} display="flex" flexWrap="wrap">
                <Typography color="primary">Donated NFT Token URI:</Typography>
                &nbsp;
                <Typography>{bidInfo.NFTTokenURI}</Typography>
              </Box>

              {/* NFT Metadata (if fetched from the tokenURI) */}
              <Box mb={1} display="flex" flexWrap="wrap">
                <Typography color="primary">Image:</Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <NFTImage src={tokenURI?.image} sx={{ backgroundSize: 'contain' }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    {/* Additional NFT info like collection name, artist, platform, etc. */}
                    <Box mb={1} display="flex" flexWrap="wrap">
                      <Typography color="primary">Collection Name:</Typography>
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
          {(bidInfo.RWalkNFTId ?? -1) >= 0 && (
            <Box width="400px" mt={4}>
              <RandomWalkNFT tokenId={bidInfo.RWalkNFTId!} selectable={false} />
            </Box>
          )}
        </>
      )}
    </MainWrapper>
  );
};

export default BidPage;
