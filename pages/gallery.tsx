import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import PaginationGrid from "../components/PaginationGrid";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";

/* ------------------------------------------------------------------
  Page Component: Gallery
  Renders a page showing the CosmicSignature NFT Gallery. The page:
    1) Fetches gallery data (client-side) from an API upon mount.
    2) Sorts the NFT list by descending TokenId.
    3) Passes the sorted data to the PaginationGrid component for display.
    4) Uses server-side props for SEO metadata (title, description, etc.).
------------------------------------------------------------------ */
const Gallery = () => {
  // Local loading state to show a loading indicator while fetching data.
  const [loading, setLoading] = useState(true);

  // Collection state to store the fetched array of NFT objects.
  const [collection, setCollection] = useState([]);

  /* 
    useEffect: On component mount, fetch NFT list from the server
    via our api service. Sort the NFTs (descending by TokenId), and
    store them in local state. 
  */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch all NFT items from the API endpoint.
      const nfts = await api.get_cst_list();

      // Sort them descending by TokenId.
      const sorted = nfts.sort((a, b) => Number(b.TokenId) - Number(a.TokenId));

      // Update state and turn off loading.
      setCollection(sorted);
      setLoading(false);
    };

    // Invoke the async function defined above.
    fetchData();
  }, []);

  return (
    <MainWrapper>
      {/* Page Header */}
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

      {/* 
        Renders the fetched NFT collection in a paginated grid.
        The grid handles searching and pagination internally.
      */}
      <PaginationGrid data={collection} loading={loading} />
    </MainWrapper>
  );
};

/* ------------------------------------------------------------------
  getServerSideProps:
  Provides server-side rendering for meta tags (title, description, 
  and Open Graph data), ensuring proper SEO for social sharing.
------------------------------------------------------------------ */
export const getServerSideProps: GetServerSideProps = async () => {
  // SEO title for the page
  const title = "Gallery | Cosmic Signature";

  // Meta description for search engines and social media
  const description =
    "Explore the Cosmic Signature NFT Gallery and discover a unique collection of digital art. Immerse yourself in vibrant, one-of-a-kind NFTs, each telling a cosmic story. Start your journey into the digital universe today!";

  // Open Graph and Twitter meta tags
  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  // Return these props to the page component
  return { props: { title, description, openGraphData } };
};

export default Gallery;
