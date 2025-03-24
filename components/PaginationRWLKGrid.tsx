import React, { useState, useEffect, FC, ChangeEvent } from "react";
import Image from "next/image";
import {
  Grid,
  Box,
  CircularProgress,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import RandomWalkNFT from "./RandomWalkNFT";

// -----------------------------
// Props Type Definition
// -----------------------------
interface PaginationRWLKGridProps {
  loading: boolean;
  data: number[]; // Array of token IDs
  selectedToken?: number;
  setSelectedToken?: (tokenId: number) => void;
}

// -----------------------------
// Component
// -----------------------------
const PaginationRWLKGrid: FC<PaginationRWLKGridProps> = ({
  loading,
  data,
  selectedToken = -1,
  setSelectedToken = null,
}) => {
  const [filteredData, setFilteredData] = useState<number[]>([]);
  const [itemsPerPage] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchId, setSearchId] = useState<string>("");

  // Handle click on NFT card
  const handleCardClick = (tokenId: number) => {
    if (setSelectedToken) {
      const isAlreadySelected = tokenId === selectedToken;
      setSelectedToken(isAlreadySelected ? -1 : tokenId);
    }
  };

  // Filter NFT list based on search input
  useEffect(() => {
    const filtered = data.filter(
      (id) => searchId === "" || id === Number(searchId)
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [data, searchId]);

  // Slice current page's items from the filtered data
  const paginatedItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box mt={4}>
      {/* Search Input */}
      <TextField
        placeholder="Enter NFT ID"
        size="small"
        fullWidth
        sx={{ marginBottom: 2 }}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSearchId(e.target.value)
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Image
                src="/images/search.svg"
                width={19}
                height={19}
                alt="search icon"
              />
            </InputAdornment>
          ),
        }}
      />

      {/* Loading Spinner */}
      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress color="secondary" />
        </Box>
      )}

      {/* Grid + Pagination when data is available */}
      {!loading && filteredData.length > 0 && (
        <>
          <Grid container spacing={4}>
            {paginatedItems.map((tokenId) => (
              <Grid
                key={tokenId}
                item
                xs={6}
                sm={6}
                md={4}
                onClick={() => handleCardClick(tokenId)}
              >
                <RandomWalkNFT
                  tokenId={tokenId}
                  selected={tokenId === selectedToken}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          <Box mt={3}>
            <Pagination
              color="primary"
              shape="rounded"
              page={currentPage}
              onChange={(_e, page) => setCurrentPage(page)}
              count={Math.ceil(filteredData.length / itemsPerPage)}
              hideNextButton
              hidePrevButton
            />
          </Box>
        </>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <Typography variant="body1" align="center">
          Nothing Found!
        </Typography>
      )}
    </Box>
  );
};

export default PaginationRWLKGrid;
