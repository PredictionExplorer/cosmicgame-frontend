import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Link, Select, MenuItem } from "@mui/material";
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
          <Select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            sx={{ minWidth: "100px" }}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={15}>15</MenuItem>
          </Select>
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
          <Typography variant="subtitle1" mr={1}>
            Current Token ID:{" "}
          </Typography>
          <Typography variant="subtitle1">{curTokenId}</Typography>
        </Box>
        {mintedTokens.length > 0 && (
          <Box mt={2}>
            {mintedTokens.map((tokenId) => (
              <Link
                key={tokenId}
                href={`/?donation=true&tokenId=${tokenId}`}
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

export default MintArcBlocks;
