import React, { useState, useEffect } from "react";
import { Typography, Box, Button, TextField, Link } from "@mui/material";
import "react-slideshow-image/dist/styles.css";
import Head from "next/head";
import { MainWrapper, CenterBox } from "../components/styled";
import { useActiveWeb3React } from "../hooks/web3";
import useArtBlocksContract from "../hooks/useArtBlocksContract";

const MintArcBlocks = () => {
  const [count, setCount] = useState(1);
  const [curTokenId, setCurTokenId] = useState(-1);
  const [mintedTokens, setMintedTokens] = useState([]);
  const { account } = useActiveWeb3React();
  const nftContract = useArtBlocksContract();

  const handleMint = async () => {
    if (nftContract) {
      try {
        let tokenIds = [...mintedTokens];
        await nftContract.multimint(account, count).then((tx) => tx.wait());
        for (let i = 0; i < count; i++) {
          tokenIds.push(curTokenId + i);
        }
        setMintedTokens(tokenIds);
        getCurrentTokenId();
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

  const getCurrentTokenId = async () => {
    try {
      const curTokenId = await nftContract.curTokenId();
      setCurTokenId(Number(curTokenId));
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (nftContract) {
      getCurrentTokenId();
    }
  }, [nftContract]);

  return (
    <>
      <Head>
        <title>Mint | Art Blocks NFT</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <CenterBox>
          <Typography variant="h4" component="span">
            GET AN
          </Typography>
          <Typography
            variant="h4"
            component="span"
            color="primary"
            sx={{ ml: 1.5 }}
          >
            ART BLOCKS
          </Typography>
          <Typography variant="h4" component="span" sx={{ ml: 1.5 }}>
            NFT FOR
          </Typography>
        </CenterBox>
        <Box display="flex" my={8}>
          <TextField
            variant="filled"
            type="number"
            defaultValue={1}
            color="secondary"
            placeholder="Enter count here"
            size="small"
            inputProps={{ min: 1 }}
            onChange={(e) => setCount(parseInt(e.target.value))}
          />
          <Button
            variant="contained"
            onClick={handleMint}
            sx={{ ml: 1 }}
            disabled={count < 1 || Number.isNaN(count)}
          >
            Mint now
          </Button>
        </Box>
        <Box sx={{ display: "flex" }}>
          <Typography mr={1}>Current Token ID: </Typography>
          <Typography>{curTokenId}</Typography>
        </Box>
        {mintedTokens.length > 0 && (
          <Box mt={2}>
            {mintedTokens.map((tokenId) => (
              <Link key={tokenId} sx={{ mr: 2, color: "inherit" }}>
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

export default MintArcBlocks;
