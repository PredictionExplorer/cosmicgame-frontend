'use client';

import { useState, useEffect } from 'react';
import { formatEther, parseEther } from 'viem';
import { usePublicClient } from 'wagmi';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { parseBalance } from '@/utils';

import { Button } from '@/components/ui/button';
import { MainWrapper } from '@/components/styled';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionDivider } from '@/components/ui/section-divider';
import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { useActiveWeb3React } from '@/hooks/web3';
import { asWriteFn } from '@/utils/contractWrite';
import {
  isUserRejection,
  isEthProviderError,
  reportError,
  getEthErrorMessage,
  WALLET_TRANSACTION_CANCELLED_MESSAGE,
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
        if (isUserRejection(err)) {
          toast.info(WALLET_TRANSACTION_CANCELLED_MESSAGE);
          return;
        }
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
    <MainWrapper>
      <PageHeader
        title="Mint Random Walk NFT"
        subtitle="Own a Random Walk NFT and get 50% discount on your bids"
      />

      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        RandomWalk NFTs are unique digital collectibles that grant holders a strategic advantage in
        the Cosmic Signature game. By attaching a RandomWalk NFT to your bid, you receive a 50%
        discount on the bid price — a significant edge when competition heats up. Each RandomWalk
        NFT can be used once per wallet, so choose your moment wisely for maximum impact.
      </p>

      <div className="flex flex-col items-center">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.06] to-transparent p-8 text-center max-w-md w-full">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="text-3xl font-bold font-display">
            {mintPrice} <span className="text-primary">ETH</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">Current mint price</p>
          <Button size="lg" onClick={handleMint} className="w-full mt-6">
            Mint Now
          </Button>
        </div>
      </div>

      {nftIds.length > 0 && (
        <div className="mt-16">
          <SectionDivider title="My Random Walk NFTs" className="mb-6" />
          <div className="flex flex-wrap gap-2">
            {nftIds.map((tokenId) => (
              <Link
                key={tokenId}
                href={`/?randomwalk=true&tokenId=${tokenId}`}
                className="inline-flex items-center rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm font-mono hover:bg-white/[0.06] transition-colors"
              >
                #{tokenId}
              </Link>
            ))}
          </div>
        </div>
      )}
    </MainWrapper>
  );
};

export default Mint;
