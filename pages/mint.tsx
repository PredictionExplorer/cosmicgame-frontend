import React, { useState, useEffect } from 'react';
import { formatEther, parseEther } from 'viem';
import { usePublicClient } from 'wagmi';
import { Typography, Box, Button, Link } from '@mui/material';

import { MainWrapper, CenterBox } from '../components/styled';
import useRWLKNFTContract from '../hooks/useRWLKNFTContract';
import { parseBalance } from '../utils';
import { useActiveWeb3React } from '../hooks/web3';
import {
  isUserRejection,
  isEthProviderError,
  reportError,
  getEthErrorMessage,
} from '../utils/errors';

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

        const hash = await (
          nftContract.write.mint as unknown as (...a: unknown[]) => Promise<`0x${string}`>
        )({
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
          <Typography variant="h4" component="span">
            GET A
          </Typography>
          <Typography variant="h4" component="span" color="primary" sx={{ ml: 1.5 }}>
            RANDOM WALK
          </Typography>
          <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
            NFT FOR
          </Typography>
          <Typography variant="h4" component="span" color="primary" sx={{ ml: 1.5 }}>
            {mintPrice}Ξ
          </Typography>
        </CenterBox>
        <Box mt={3}>
          <Button variant="contained" onClick={handleMint}>
            Mint now
          </Button>
        </Box>
        {/* My NFTs */}
        <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap" mt={4}>
          <Typography variant="h4" component="span" color="secondary">
            MY
          </Typography>
          <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
            RANDOM
          </Typography>
          <Typography variant="h4" component="span" color="primary" sx={{ ml: 1.5 }}>
            WALK
          </Typography>
          <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
            NFTS
          </Typography>
        </Box>
        {nftIds.length > 0 && (
          <Box mt={2}>
            {nftIds.map((tokenId) => (
              <Link
                key={tokenId}
                href={`/?randomwalk=true&tokenId=${tokenId}`}
                sx={{ mr: 2, color: 'inherit' }}
              >
                <Typography variant="subtitle1" component="span">
                  {tokenId}
                </Typography>
              </Link>
            ))}
          </Box>
        )}
      </MainWrapper>
    </>
  );
};

export default Mint;
