import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import PaginationGrid from "../components/PaginationGrid";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { GetServerSideProps } from "next";

const Gallery = () => {
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const nfts = await api.get_cst_list();
      const sorted = nfts.sort((a, b) => Number(b.TokenId) - Number(a.TokenId));
      setCollection(sorted);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <MainWrapper>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
      >
        <Typography variant="h4" component="span" color="primary">
          CosmicSignature
        </Typography>
        &nbsp;
        <Typography variant="h4" component="span">
          NFT Gallery
        </Typography>
      </Box>

      <PaginationGrid data={collection} loading={loading} />
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Gallery | Cosmic Signature";
  const description =
    "Explore the Cosmic Signature NFT Gallery and discover a unique collection of digital art. Immerse yourself in vibrant, one-of-a-kind NFTs, each telling a cosmic story. Start your journey into the digital universe today!";
  const imageUrl = "http://69.10.55.2/images/cosmicsignature/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default Gallery;
