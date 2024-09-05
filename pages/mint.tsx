import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Typography, Box, Button, Link } from "@mui/material";
import { MainWrapper, CenterBox } from "../components/styled";
import useRWLKNFTContract from "../hooks/useRWLKNFTContract";
import { parseBalance } from "../utils";
import { useActiveWeb3React } from "../hooks/web3";

const Mint = () => {
  const [mintPrice, setMintPrice] = useState("0");
  const [nftIds, setNftIds] = useState([]);
  const { account } = useActiveWeb3React();
  const nftContract = useRWLKNFTContract();

  const handleMint = async () => {
    if (nftContract) {
      try {
        const mintPrice = await nftContract.getMintPrice();
        const newPrice = parseFloat(ethers.utils.formatEther(mintPrice)) * 1.01;

        const receipt = await nftContract
          .mint({ value: ethers.utils.parseEther(newPrice.toFixed(6)) })
          .then((tx) => tx.wait());

        receipt.events[0].args[2].toNumber();
      } catch (err) {
        const { data } = err;
        if (data && data.message) {
          alert(data.message);
        } else {
          console.log(err);
        }
      }
    } else {
      console.log("Please connect your wallet on Arbitrum network");
    }
  };

  useEffect(() => {
    const getData = async () => {
      const mintPrice = await nftContract.getMintPrice();
      setMintPrice(
        (parseFloat(parseBalance(mintPrice)) * 1.01 + 0.008).toFixed(4)
      );
    };
    if (nftContract) {
      getData();
    }
  }, [nftContract]);

  useEffect(() => {
    const getTokens = async () => {
      try {
        const tokens = await nftContract.walletOfOwner(account);
        const nftIds = tokens
          .map((t) => t.toNumber())
          .sort()
          .reverse();
        setNftIds(nftIds);
      } catch (err) {
        console.log(err);
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
          <Typography
            variant="h4"
            component="span"
            color="primary"
            sx={{ ml: 1.5 }}
          >
            RANDOM WALK
          </Typography>
          <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
            NFT FOR
          </Typography>
          <Typography
            variant="h4"
            component="span"
            color="primary"
            sx={{ ml: 1.5 }}
          >
            {mintPrice}Ξ
          </Typography>
        </CenterBox>
        <Box mt={3}>
          <Button variant="contained" onClick={handleMint}>
            Mint now
          </Button>
        </Box>
        {/* My NFTs */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
          mt={4}
        >
          <Typography variant="h4" component="span" color="secondary">
            MY
          </Typography>
          <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
            RANDOM
          </Typography>
          <Typography
            variant="h4"
            component="span"
            color="primary"
            sx={{ ml: 1.5 }}
          >
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
                sx={{ mr: 2, color: "inherit" }}
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
