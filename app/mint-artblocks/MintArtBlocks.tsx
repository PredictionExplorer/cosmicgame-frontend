'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MainWrapper, CenterBox } from '@/components/styled';
import { useActiveWeb3React } from '@/hooks/web3';
import useArtBlocksContract from '@/hooks/useArtBlocksContract';
import {
  isUserRejection,
  isEthProviderError,
  reportError,
  getEthErrorMessage,
} from '@/utils/errors';

const MintArtBlocks = () => {
  const [count, setCount] = useState(1);
  const [curTokenId, setCurTokenId] = useState(-1);
  const [mintedTokens, setMintedTokens] = useState<number[]>([]);
  const { account } = useActiveWeb3React();
  const publicClient = usePublicClient();
  const nftContract = useArtBlocksContract();

  const handleMint = async () => {
    if (nftContract) {
      try {
        let tokenIds = [...mintedTokens];
        const hash = await nftContract.write.multimint?.([account, count]);
        if (hash) await publicClient?.waitForTransactionReceipt({ hash });
        for (let i = 0; i < count; i++) {
          tokenIds.push(curTokenId + i);
        }
        setMintedTokens(tokenIds);
        getCurrentTokenId();
      } catch (err: unknown) {
        if (isUserRejection(err)) return;
        reportError(err, 'mint Art Blocks NFT');
        if (isEthProviderError(err)) {
          alert(getEthErrorMessage(err, 'Mint failed'));
        }
      }
    }
  };

  const getCurrentTokenId = async () => {
    try {
      const curTokenId = await nftContract!.read.curTokenId?.();
      setCurTokenId(Number(curTokenId ?? 0));
    } catch (err) {
      reportError(err, 'getCurrentTokenId');
    }
  };
  useEffect(() => {
    if (nftContract) {
      getCurrentTokenId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftContract]);

  return (
    <>
      <MainWrapper>
        <CenterBox>
          <span className="text-2xl font-bold">GET AN</span>
          <span className="text-2xl font-bold text-primary ml-3">ART BLOCKS</span>
          <span className="text-2xl font-bold ml-3">NFT FOR</span>
        </CenterBox>
        <div className="flex my-16">
          <Select value={String(count)} onValueChange={(val) => setCount(Number(val))}>
            <SelectTrigger className="min-w-[100px]" aria-label="Select quantity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleMint} className="ml-2" disabled={count < 1 || Number.isNaN(count)}>
            Mint now
          </Button>
        </div>
        <div className="flex">
          <p className="text-base mr-2">Current Token ID: </p>
          <p className="text-base">{curTokenId}</p>
        </div>
        {mintedTokens.length > 0 && (
          <div className="mt-4">
            {mintedTokens.map((tokenId) => (
              <Link
                key={tokenId}
                href={`/?donation=true&tokenId=${tokenId}`}
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

export default MintArtBlocks;
