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

/* ------------------------------------------------------------------
  Component: PaginationGrid
  Renders a grid of NFTs with search and pagination features.
  
  Props:
    - data: An array of NFT objects. Each NFT has:
        TokenId: number
        ...other NFT properties...
    - loading: A boolean indicating if data is still loading.
------------------------------------------------------------------ */
const PaginationGrid = ({ data, loading }) => {
  // Search input state.
  const [searchKey, setSearchKey] = useState("");
  // NFTs to display (after filtering/search).
  const [collection, setCollection] = useState([]);
  // Number of NFTs to display per page.
  const [perPage] = useState(12);
  // Current page in the pagination.
  const [curPage, setCurPage] = useState(1);

  // Next.js router for handling query parameters (page).
  const router = useRouter();

  /**
   * Updates the URL query parameter 'page' and navigates to that page.
   * @param {number} page - The page number to navigate to.
   */
  const handleNextPage = (page) => {
    // Update the 'page' query parameter and navigate.
    router.query.page = page;
    router.push({ pathname: router.pathname, query: router.query });
  };

  /**
   * Handles changes in the search input field.
   * Resets the collection to the original data if the search is cleared.
   */
  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchKey(value);

    // If search field is empty, show the entire dataset again.
    if (!value) {
      setCollection(data);
    }
  };

  /**
   * Handles pressing 'Enter' in the search field.
   * Triggers the search action if Enter is pressed.
   */
  const handleSearchKeyPress = (e) => {
    if (e.keyCode === 13 || e.which === 13) {
      handleSearch();
    }
  };

  /**
   * Utility function to check if a given string is numeric (integer).
   * @param {string} value - The string to test.
   * @returns {boolean} True if the string is purely digits, otherwise false.
   */
  const isNumeric = (value) => {
    return /^\d+$/.test(value);
  };

  /**
   * Handles the search action. Searches by:
   *  - NFT TokenId if the searchKey is numeric.
   *  - NFT Name if the searchKey is non-numeric (via an API call).
   */
  const handleSearch = async () => {
    if (searchKey === "") return; // Do nothing if empty.

    let filtered = [];

    // If the search key is numeric, filter by TokenId directly.
    if (isNumeric(searchKey)) {
      filtered = data.filter((nft) => nft.TokenId === Number(searchKey));
    } else {
      // Else, fetch TokenId list by name via API, then filter local data.
      const res = await api.get_token_by_name(searchKey);
      const filteredIds = res.map((o) => o.TokenId);
      filtered = data.filter((nft) => filteredIds.includes(nft.TokenId));
    }

    setCollection(filtered);

    // Optionally reset page to 1 or remove page from router query
    // if you want the user to see page 1 of the filtered result.
    router.push({ pathname: router.pathname });
  };

  /**
   * Sync current page from router.query whenever the router updates.
   * Defaults to 1 if not present or invalid.
   */
  useEffect(() => {
    const page = parseInt(router.query["page"] as string) || 1;
    setCurPage(page);
  }, [router]);

  /**
   * Whenever the original data changes (e.g., new props), reset the collection.
   */
  useEffect(() => {
    if (data && data.length > 0) {
      setCollection(data);
    }
  }, [data]);

  // Calculate start & end indices based on current page and items per page.
  const startIndex = (curPage - 1) * perPage;
  const endIndex = curPage * perPage;
  // Slice the collection to only the NFTs for the current page.
  const visibleNFTs = collection.slice(startIndex, endIndex);

  return (
    <Box mt={4}>
      {/* Search Area */}
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

      {/* If still loading, show a loading message. Otherwise, show the NFTs. */}
      {loading ? (
        <Typography variant="h6" align="center">
          Loading...
        </Typography>
      ) : (
        <>
          {/* Grid of NFTs */}
          <Grid spacing={2} container>
            {collection.length === 0 ? (
              // If no results, display a "Sample NFT" placeholder.
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
              // Map each NFT in the current page to an NFT component.
              visibleNFTs.map((nft) => (
                <Grid key={nft.TokenId} item xs={6} sm={6} md={4}>
                  <NFT nft={nft} />
                </Grid>
              ))
            )}
          </Grid>

          {/* Only show pagination if there's more than one page of items */}
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
