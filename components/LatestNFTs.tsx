import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Box,
  Typography,
  Container,
  Grid,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import { useSnapCarousel } from "react-snap-carousel";
import { ArrowForward, ArrowBack } from "@mui/icons-material";
import NFT from "./NFT";
import api from "../services/api";

const LatestNFTs = () => {
  const [nftData, setNftData] = useState<any[]>([]);

  // Material UI hooks for responsive design
  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up("md"));

  // Carousel hook for mobile view
  const { scrollRef, pages, activePageIndex, next, prev } = useSnapCarousel();

  // Fetch NFT data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const nfts = await api.get_cst_list();
        const sortedNfts = nfts.sort(
          (a: any, b: any) => Number(b.TokenId) - Number(a.TokenId)
        );
        setNftData(sortedNfts);
      } catch (error) {
        console.error("Failed to fetch NFTs", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ backgroundColor: "#101441" }}>
      <Container
        sx={{ padding: isDesktopView ? "80px 10px 150px" : "80px 10px" }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
        >
          <Typography variant="h4" component="span">
            Latest NFT&apos;s
          </Typography>
        </Box>
        <Box textAlign="center" marginBottom="56px">
          <Image
            src="/images/divider.svg"
            width={93}
            height={3}
            alt="divider"
          />
        </Box>

        {nftData.length > 0 ? (
          <>
            {/* Grid layout for Desktop view */}
            {isDesktopView && (
              <Grid container spacing={2} marginTop="58px">
                {nftData.slice(0, 6).map((nft, index) => (
                  <Grid
                    key={nft.TokenId || index}
                    item
                    xs={12}
                    sm={12}
                    md={4}
                    lg={4}
                  >
                    <NFT nft={nft} />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Carousel layout for Mobile view */}
            {!isDesktopView && (
              <Box>
                <ul
                  ref={scrollRef}
                  style={{
                    listStyle: "none",
                    display: "flex",
                    overflow: "hidden",
                    scrollSnapType: "x mandatory",
                    padding: 0,
                  }}
                >
                  {nftData.slice(0, 6).map((nft, index) => (
                    <li
                      key={nft.TokenId || index}
                      style={{
                        width: "100%",
                        flexShrink: 0,
                        marginRight: "10px",
                      }}
                    >
                      <NFT nft={nft} />
                    </li>
                  ))}
                </ul>
                <Box textAlign="center" mt={2}>
                  <Button
                    variant="contained"
                    sx={{ mr: 1 }}
                    onClick={prev}
                    disabled={activePageIndex === 0}
                  >
                    <ArrowBack fontSize="small" />
                  </Button>
                  <Button
                    variant="contained"
                    onClick={next}
                    disabled={activePageIndex === pages.length - 1}
                  >
                    <ArrowForward fontSize="small" />
                  </Button>
                </Box>
              </Box>
            )}
          </>
        ) : (
          // Display a friendly message if there are no NFTs
          <Typography textAlign="center" mt={4}>
            There is no NFT yet.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default LatestNFTs;
