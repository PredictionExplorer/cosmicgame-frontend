import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Typography, Box, Button } from "@mui/material";
import "react-slideshow-image/dist/styles.css";
import Head from "next/head";
import { MainWrapper, CenterBox } from "../components/styled";
import useRWLKNFTContract from "../hooks/useRWLKNFTContract";
import { parseBalance } from "../utils";
import { useActiveWeb3React } from "../hooks/web3";
import PaginationRWLKGrid from "../components/PaginationRWLKGrid";

const Mint = () => {
  const [mintPrice, setMintPrice] = useState("0");
  const [loading, setLoading] = useState(true);
  const [nftIds, setNftIds] = useState([]);
  const { account } = useActiveWeb3React();
  const nftContract = useRWLKNFTContract();

  const handleMint = async () => {
    if (nftContract) {
      try {
        const mintPrice = await nftContract.getMintPrice();
        console.log(parseFloat(ethers.utils.formatEther(mintPrice)));
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
          alert("There's an error");
        }
      }
    } else {
      alert("Please connect your wallet on Arbitrum network");
    }
  };

  useEffect(() => {
    const getData = async () => {
      const mintPrice = await nftContract.getMintPrice();
      setMintPrice(
        (parseFloat(parseBalance(mintPrice)) * 1.01 + 0.008).toFixed(4)
      );
    };

    getData();
  }, [nftContract]);

  useEffect(() => {
    const getTokens = async () => {
      try {
        setLoading(true);
        const tokens = await nftContract.walletOfOwner(account);
        const nftIds = tokens.map((t) => t.toNumber()).reverse();
        setNftIds(nftIds);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    if (account) {
      getTokens();
    }
  }, [nftContract, account]);

  return (
    <>
      <Head>
        <title>Mint | Random Walk NFT</title>
        <meta
          name="description"
          content="Programmatically generated Random Walk image and video NFTs. ETH spent on minting goes back to the minters."
        />
      </Head>
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
        <PaginationRWLKGrid loading={loading} data={nftIds} />
      </MainWrapper>
    </>
  );
};

export default Mint;
