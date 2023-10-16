import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Grid, Box, Typography } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { SearchBox, SearchField, SearchButton } from "./styled";
import NFT from "./NFT";

const PaginationGrid = ({ data, loading }) => {
  const [nftId, setNftId] = useState("");
  const [searchNFT, setSearchNFT] = useState(null);
  const [searchResult, setSearchResult] = useState(false);
  const [collection, setCollection] = useState([]);
  const [perPage] = useState(12);
  const [curPage, setCurPage] = useState(1);

  const router = useRouter();

  const handleNextPage = (page) => {
    router.query["page"] = page;
    router.push({ pathname: router.pathname, query: router.query });
  };

  const handleSearchChange = async (e) => {
    setNftId(e.target.value);
    if (!e.target.value) {
      setSearchNFT(null);
      setSearchResult(false);
    }
  };

  const handleSearch = async () => {
    if (nftId === "") return;
    const filtered = collection.filter((nft) => nft.TokenId === Number(nftId));
    setSearchResult(true);
    if (filtered.length) {
      setSearchNFT(filtered[0]);
    } else {
      setSearchNFT(null);
    }
  };

  useEffect(() => {
    setCollection(data);
  }, [data]);

  useEffect(() => {
    const page = parseInt(router.query["page"] as string) || 1;
    setCurPage(page);
  }, [router]);

  return (
    <Box mt={4}>
      <SearchBox>
        <SearchField
          variant="filled"
          placeholder="Enter NFT ID"
          color="secondary"
          value={nftId}
          onChange={handleSearchChange}
        />
        <SearchButton
          size="large"
          variant="contained"
          color="primary"
          onClick={handleSearch}
        >
          Search
        </SearchButton>
      </SearchBox>
      {loading ? (
        <Typography variant="h6" align="center">
          Loading...
        </Typography>
      ) : data.length > 0 ? (
        <>
          <Grid spacing={2} container>
            {!!(nftId && searchResult) ? (
              !searchNFT ? (
                <Grid item>
                  <Typography variant="h6" align="center">
                    Nothing Found!
                  </Typography>
                </Grid>
              ) : (
                <Grid item xs={6} sm={4}>
                  <NFT nft={searchNFT} />
                </Grid>
              )
            ) : (
              collection
                .slice((curPage - 1) * perPage, curPage * perPage)
                .map((nft, index) => (
                  <Grid key={index} item xs={6} sm={6} md={4}>
                    <NFT nft={nft} />
                  </Grid>
                ))
            )}
          </Grid>
          {!nftId && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                color="primary"
                page={curPage}
                onChange={(e, page) => handleNextPage(page)}
                count={Math.ceil(collection.length / perPage)}
                hideNextButton
                hidePrevButton
                shape="rounded"
              />
            </Box>
          )}
        </>
      ) : (
        <Typography variant="h6" align="center">
          Nothing Found!
        </Typography>
      )}
    </Box>
  );
};

export default PaginationGrid;
