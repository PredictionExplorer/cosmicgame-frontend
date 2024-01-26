import React, { useState, useEffect } from "react";
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

const PaginationRWLKGrid = ({
  loading,
  data,
  selectedToken = -1,
  setSelectedToken = null,
}) => {
  const [collection, setCollection] = useState([]);
  const [perPage] = useState(6);
  const [curPage, setCurPage] = useState(1);
  const [searchId, setSearchId] = useState("");

  const handleClick = (index) => {
    if (index === selectedToken) {
      setSelectedToken(-1);
    } else {
      setSelectedToken(index);
    }
  };

  useEffect(() => {
    const filtered = data.filter(
      (x) => searchId === "" || x === Number(searchId)
    );
    setCollection(filtered);
  }, [data, searchId]);

  return (
    <Box mt={4}>
      <TextField
        placeholder="Enter NFT ID"
        size="small"
        fullWidth
        sx={{ marginBottom: 2 }}
        onChange={(e) => setSearchId(e.target.value)}
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
      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress color="secondary" />
        </Box>
      )}
      {data.length > 0 && (
        <>
          <Grid spacing={4} container>
            {collection
              .slice((curPage - 1) * perPage, curPage * perPage)
              .map((index) => (
                <Grid
                  key={index}
                  item
                  xs={6}
                  sm={6}
                  md={4}
                  onClick={() => handleClick(index)}
                >
                  <RandomWalkNFT
                    tokenId={index}
                    selected={index === selectedToken}
                  />
                </Grid>
              ))}
          </Grid>
          <Box mt={3}>
            <Pagination
              color="primary"
              page={curPage}
              onChange={(_e, page) => setCurPage(page)}
              count={Math.ceil(collection.length / perPage)}
              hideNextButton
              hidePrevButton
              shape="rounded"
            />
          </Box>
        </>
      )}
      {!loading && !data.length && (
        <Typography variant="body1" align="center">
          Nothing Found!
        </Typography>
      )}
    </Box>
  );
};

export default PaginationRWLKGrid;
