'use client';

import { useState, useEffect } from 'react';
import { formatEther, parseEther } from 'viem';
import { usePublicClient } from 'wagmi';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { parseBalance } from '@/utils';

import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/ui/page-shell';
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

const Imprint = () => {
  const [imprintCost, setImprintCost] = useState('0');
  const [nftIds, setNftIds] = useState<number[]>([]);
  const { account } = useActiveWeb3React();
  const publicClient = usePublicClient();
  const nftContract = useRWLKNFTContract();

  const handleImprint = async () => {
    if (nftContract) {
      try {
        const abiImprintCost = (await nftContract.read.getMintPrice?.()) as bigint; // lexicon-allow-abi
        const newPrice = parseFloat(formatEther(abiImprintCost)) * 1.01;

        const hash = await asWriteFn(nftContract.write.mint)({
          // lexicon-allow-abi
          value: parseEther(newPrice.toFixed(6)),
        });
        await publicClient?.waitForTransactionReceipt({ hash });
      } catch (err: unknown) {
        if (isUserRejection(err)) {
          toast.info(WALLET_TRANSACTION_CANCELLED_MESSAGE);
          return;
        }
        reportError(err, 'imprint RWLK NFT');
        if (isEthProviderError(err)) {
          alert(getEthErrorMessage(err, 'Imprint failed'));
        }
      }
    }
  };

  useEffect(() => {
    const getData = async () => {
      const abiImprintCost = (await nftContract!.read.getMintPrice?.()) as bigint; // lexicon-allow-abi
      setImprintCost((parseFloat(parseBalance(abiImprintCost)) * 1.01 + 0.008).toFixed(4));
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
    <PageShell variant="form">
      <PageHeader
        title="Imprint Random Walk NFT"
        subtitle="Own a Random Walk NFT and receive a 50% reduction in Gesture Cost"
      />

      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        RandomWalk NFTs are unique digital collectibles that grant holders a strategic advantage in
        the Cosmic Signature protocol. By attaching a RandomWalk NFT to your gesture, you receive a
        50% reduction in Gesture Cost — a significant edge late in the cycle. Each RandomWalk NFT
        can be used once for this discount, so choose your moment wisely for maximum impact.
      </p>

      <div className="flex flex-col items-center">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.06] to-transparent p-8 text-center max-w-md w-full">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="text-3xl font-bold font-display">
            {imprintCost} <span className="text-primary">ETH</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">Current imprint cost</p>
          <Button size="lg" onClick={handleImprint} className="w-full mt-6">
            Imprint Now
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
    </PageShell>
  );
};

export default Imprint;
