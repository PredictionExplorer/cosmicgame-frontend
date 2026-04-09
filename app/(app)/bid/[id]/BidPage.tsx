'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import { MainWrapper } from '@/components/styled';
import RandomWalkNFT from '@/components/nft/RandomWalkNFT';
import NFTImage from '@/components/nft/NFTImage';
import { useBidInfo } from '@/hooks/useApiQuery';

interface NFTTokenURI {
  image?: string;
  collection_name?: string;
  artist?: string;
  platform?: string;
  description?: string;
  [key: string]: unknown;
}

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
        <h6 className="text-lg font-semibold">Invalid Bid Id</h6>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary mb-8">Bid Information</h4>

      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : !bidInfo ? (
        <h6 className="text-lg font-semibold">No bid information found.</h6>
      ) : (
        <>
          <div className="mb-2 flex flex-wrap">
            <span className="text-primary">Bid Datetime:</span>
            &nbsp;
            <a
              href={getExplorerUrl('tx', bidInfo.TxHash)}
              className="text-inherit"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{convertTimestampToDateTime(bidInfo.TimeStamp)}</span>
            </a>
          </div>

          <div className="mb-2 flex flex-wrap">
            <span className="text-primary">Bidder Address:</span>
            &nbsp;
            <Link href={`/user/${bidInfo.BidderAddr}`} className="text-white">
              <span className="font-mono">{bidInfo.BidderAddr}</span>
            </Link>
          </div>

          <div className="mb-2 flex flex-wrap">
            <span className="text-primary">Round Number:</span>
            &nbsp;
            <Link href={`/prize/${bidInfo.RoundNum}`} className="text-inherit">
              <span>{bidInfo.RoundNum}</span>
            </Link>
          </div>

          <div className="mb-2 flex flex-wrap">
            <span className="text-primary">Bid Price:</span>
            &nbsp;
            <span>
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
            </span>
          </div>

          <div className="mb-2 flex flex-wrap">
            <span className="text-primary">CST Reward Amount:</span>
            &nbsp;
            <span>{bidInfo.ERC20RewardAmountEth.toFixed(2)} ETH</span>
          </div>

          <div className="mb-2 flex flex-wrap">
            <span className="text-primary">Was bid with RandomWalkNFT:</span>
            &nbsp;
            <span>{(bidInfo.RWalkNFTId ?? -1) < 0 ? 'No' : 'Yes'}</span>
          </div>

          <div className="mb-2 flex flex-wrap">
            <span className="text-primary">Was bid with Cosmic Signature Token:</span>
            &nbsp;
            <span>{bidInfo.BidType === 2 ? 'Yes' : 'No'}</span>
          </div>

          {(bidInfo.RWalkNFTId ?? -1) >= 0 && (
            <div className="mb-2 flex flex-wrap">
              <span className="text-primary">RandomWalkNFT ID:</span>
              &nbsp;
              <span>{bidInfo.RWalkNFTId}</span>
            </div>
          )}

          {bidInfo.DonatedERC20TokenAddr && (
            <>
              <div className="mb-2 flex flex-wrap">
                <span className="text-primary">Donated ERC20 Token Address:</span>
                &nbsp;
                <span>{bidInfo.DonatedERC20TokenAddr}</span>
              </div>
              <div className="mb-2 flex flex-wrap">
                <span className="text-primary">Donated ERC20 Token Amount:</span>
                &nbsp;
                <span>{(bidInfo.DonatedERC20TokenAmountEth ?? 0).toFixed(2)}</span>
              </div>
            </>
          )}

          {bidInfo.NFTDonationTokenAddr !== '' && bidInfo.NFTDonationTokenId !== -1 && (
            <>
              <div className="mb-2 flex flex-wrap">
                <span className="text-primary">Donated NFT Contract Address (aka Token):</span>
                &nbsp;
                <span className="font-mono">{bidInfo.NFTDonationTokenAddr}</span>
              </div>

              <div className="mb-2 flex flex-wrap">
                <span className="text-primary">Donated NFT Token Id:</span>
                &nbsp;
                <span>{bidInfo.NFTDonationTokenId}</span>
              </div>

              <div className="mb-2 flex flex-wrap">
                <span className="text-primary">Donated NFT Token URI:</span>
                &nbsp;
                <span>{bidInfo.NFTTokenURI}</span>
              </div>

              <div className="mb-2 flex flex-wrap">
                <span className="text-primary">Image:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                  <div>
                    <NFTImage src={tokenURI?.image} className="bg-contain" />
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-2 flex flex-wrap">
                      <span className="text-primary">Collection Name:</span>
                      &nbsp;
                      <span>{tokenURI?.collection_name}</span>
                    </div>
                    <div className="mb-2 flex flex-wrap">
                      <span className="text-primary">Artist:</span>
                      &nbsp;
                      <span>{tokenURI?.artist}</span>
                    </div>
                    <div className="mb-2 flex flex-wrap">
                      <span className="text-primary">Platform:</span>
                      &nbsp;
                      <span>{tokenURI?.platform}</span>
                    </div>
                    <div className="mb-2 flex flex-wrap">
                      <span className="text-primary">Description:</span>
                      &nbsp;
                      <span>{tokenURI?.description}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mb-2 flex flex-wrap">
            <span className="text-primary">Message:</span>
            &nbsp;
            <span>{bidInfo.Message}</span>
          </div>

          {(bidInfo.RWalkNFTId ?? -1) >= 0 && (
            <div className="w-[400px] mt-8">
              <RandomWalkNFT tokenId={bidInfo.RWalkNFTId!} selectable={false} />
            </div>
          )}
        </>
      )}
    </MainWrapper>
  );
};

export default BidPage;
