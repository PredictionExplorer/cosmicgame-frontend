import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Grid, Box, Typography, CardActionArea, Link } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import {
  SearchBox,
  SearchField,
  SearchButton,
  StyledCard,
  NFTInfoWrapper,
} from "./styled";
import NFT from "./NFT";
import api from "../services/api";
import NFTImage from "./NFTImage";
import { getAssetsUrl } from "../utils";

const PaginationGrid = ({ data, loading }) => {
  const [searchKey, setSearchKey] = useState("");
  const [collection, setCollection] = useState([]);
  const [perPage] = useState(12);
  const [curPage, setCurPage] = useState(1);

  const router = useRouter();

  const handleNextPage = (page) => {
    router.query["page"] = page;
    router.push({ pathname: router.pathname, query: router.query });
  };

  const handleSearchChange = async (e) => {
    setSearchKey(e.target.value);
    if (!e.target.value) {
      setCollection(data);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.keyCode === 13 || e.which === 13) {
      handleSearch();
    }
  };

  const isNumeric = (value) => {
    return /^\d+$/.test(value);
  };

  const handleSearch = async () => {
    if (searchKey === "") return;
    let filtered = [];
    if (isNumeric(searchKey)) {
      filtered = data.filter((nft) => nft.TokenId === Number(searchKey));
    } else {
      const res = await api.get_token_by_name(searchKey);
      const filteredIds = res.map((o) => o.TokenId);
      filtered = data.filter((nft) => filteredIds.includes(nft.TokenId));
    }
    setCollection(filtered);
    router.push({ pathname: router.pathname });
  };

  useEffect(() => {
    const page = parseInt(router.query["page"] as string) || 1;
    setCurPage(page);
  }, [router]);

  useEffect(() => {
    if (data.length > 0) {
      setCollection(data);
    }
  }, [data]);

  return (
    <Box mt={4}>
      <SearchBox>
        <SearchField
          variant="filled"
          placeholder="Enter NFT ID or Name"
          color="secondary"
          value={searchKey}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
        />
        <SearchButton
          type="submit"
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
      ) : (
        <>
          <Grid spacing={2} container>
            {collection.length === 0 ? (
              <Grid item xs={6} sm={6} md={4}>
                <StyledCard>
                  <CardActionArea>
                    <Link href="/detail/sample" sx={{ display: "block" }}>
                      <NFTImage
                        src={getAssetsUrl("cosmicsignature/sample.png")}
                      />
                    </Link>
                    <NFTInfoWrapper sx={{ width: "calc(100% - 40px)" }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#FFFFFF", textAlign: "center" }}
                      >
                        Sample NFT
                      </Typography>
                    </NFTInfoWrapper>
                  </CardActionArea>
                </StyledCard>
              </Grid>
            ) : (
              collection
                .slice((curPage - 1) * perPage, curPage * perPage)
                .map((nft) => (
                  <Grid key={nft.TokenId} item xs={6} sm={6} md={4}>
                    <NFT nft={nft} />
                  </Grid>
                ))
            )}
          </Grid>
          {collection.length > perPage && (
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
      )}
    </Box>
  );
};

export default PaginationGrid;
