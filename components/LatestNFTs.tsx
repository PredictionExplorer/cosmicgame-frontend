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
  const [data, setData] = useState([]);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const { scrollRef, pages, activePageIndex, next, prev } = useSnapCarousel();
  useEffect(() => {
    const fetchData = async () => {
      const nfts = await api.get_cst_list();
      const data = nfts.sort((a, b) => Number(b.TokenId) - Number(a.TokenId));
      setData(data);
    };
    fetchData();
  }, []);
  return (
    <Box sx={{ backgroundColor: "#101441" }}>
      <Container sx={{ padding: "80px 10px 150px" }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
        >
          <Typography variant="h4" component="span">
            Latest NFT&#39;s
          </Typography>
        </Box>
        <Box textAlign="center" marginBottom="56px">
          <Image
            src={"/images/divider.svg"}
            width={93}
            height={3}
            alt="divider"
          />
        </Box>
        {data.length > 0 ? (
          <>
            {matches && (
              <Grid container spacing={2} marginTop="58px">
                {data.slice(0, 6).map((nft, i) => (
                  <Grid
                    key={i}
                    sx={{ position: "relative" }}
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
            <Box display={matches ? "none" : "block"}>
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
                {data.slice(0, 6).map((nft, i) => (
                  <li
                    key={i}
                    style={{
                      width: "100%",
                      flexShrink: 0,
                      marginRight: "10px",
                      position: "relative",
                    }}
                  >
                    <NFT nft={nft} />
                  </li>
                ))}
              </ul>
              <Box textAlign="center">
                <Button
                  variant="contained"
                  sx={{ mr: 1 }}
                  onClick={() => prev()}
                  disabled={activePageIndex === 0}
                >
                  <ArrowBack fontSize="small" />
                </Button>
                <Button
                  variant="contained"
                  onClick={() => next()}
                  disabled={activePageIndex === pages.length - 1}
                >
                  <ArrowForward fontSize="small" />
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Typography>There is no NFT yet.</Typography>
        )}
      </Container>
    </Box>
  );
};

export default LatestNFTs;
