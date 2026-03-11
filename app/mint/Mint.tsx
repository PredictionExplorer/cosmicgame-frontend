'use client';

import { useState, useEffect } from 'react';
import { formatEther, parseEther } from 'viem';
import { usePublicClient } from 'wagmi';
import Link from 'next/link';

import { parseBalance } from '@/utils';

import { Button } from '@/components/ui/button';
import { MainWrapper, CenterBox } from '@/components/styled';
import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { useActiveWeb3React } from '@/hooks/web3';
import { asWriteFn } from '@/utils/contractWrite';
import {
  isUserRejection,
  isEthProviderError,
  reportError,
  getEthErrorMessage,
} from '@/utils/errors';

const Mint = () => {
  const [mintPrice, setMintPrice] = useState('0');
  const [nftIds, setNftIds] = useState<number[]>([]);
  const { account } = useActiveWeb3React();
  const publicClient = usePublicClient();
  const nftContract = useRWLKNFTContract();

  const handleMint = async () => {
    if (nftContract) {
      try {
        const mintPrice = (await nftContract.read.getMintPrice?.()) as bigint;
        const newPrice = parseFloat(formatEther(mintPrice)) * 1.01;

        const hash = await asWriteFn(nftContract.write.mint)({
          value: parseEther(newPrice.toFixed(6)),
        });
        await publicClient?.waitForTransactionReceipt({ hash });
      } catch (err: unknown) {
        if (isUserRejection(err)) return;
        reportError(err, 'mint RWLK NFT');
        if (isEthProviderError(err)) {
          alert(getEthErrorMessage(err, 'Mint failed'));
        }
      }
    }
  };

  useEffect(() => {
    const getData = async () => {
      const mintPrice = (await nftContract!.read.getMintPrice?.()) as bigint;
      setMintPrice((parseFloat(parseBalance(mintPrice)) * 1.01 + 0.008).toFixed(4));
    };
    if (nftContract) {
      getData();
    }
  }, [nftContract]);

  useEffect(() => {
    const getTokens = async () => {
      try {
        const tokens = (await nftContract!.read.walletOfOwner?.([account])) as readonly bigint[];
        const nftIds = tokens
          .map((t) => Number(t))
          .sort()
          .reverse();
        setNftIds(nftIds);
      } catch (err) {
        reportError(err, 'get user NFT tokens');
      }
    };

    if (account && nftContract) {
      getTokens();
    }
  }, [nftContract, account]);

  return (
    <>
      <MainWrapper>
        <CenterBox>
          <span className="text-2xl font-bold">GET A</span>
          <span className="text-2xl font-bold text-primary ml-3">RANDOM WALK</span>
          <span className="text-2xl font-bold ml-3">NFT FOR</span>
          <span className="text-2xl font-bold text-primary ml-3">{mintPrice}Ξ</span>
        </CenterBox>
        <div className="mt-6">
          <Button onClick={handleMint}>Mint now</Button>
        </div>
        {/* My NFTs */}
        <div className="flex justify-center items-center flex-wrap mt-8">
          <span className="text-2xl font-bold text-secondary">MY</span>
          <span className="text-2xl font-bold ml-3">RANDOM</span>
          <span className="text-2xl font-bold text-primary ml-3">WALK</span>
          <span className="text-2xl font-bold ml-3">NFTS</span>
        </div>
        {nftIds.length > 0 && (
          <div className="mt-4">
            {nftIds.map((tokenId) => (
              <Link
                key={tokenId}
                href={`/?randomwalk=true&tokenId=${tokenId}`}
                className="mr-4 text-inherit"
              >
                <span className="text-base">{tokenId}</span>
              </Link>
            ))}
          </div>
        )}
      </MainWrapper>
    </>
  );
};

export default Mint;
