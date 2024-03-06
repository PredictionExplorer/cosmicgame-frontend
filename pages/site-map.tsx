import { Box, Link, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";

const SiteMap = () => {
  return (
    <>
      <Head>
        <title>Site Map | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Typography
          variant="h4"
          color="primary"
          gutterBottom
          textAlign="center"
          mb={6}
        >
          Site Map
        </Typography>
        <Box>
          <Typography variant="h5">Per-user information</Typography>
          <Box ml={4}>
            <Typography variant="subtitle1">
              <Link
                href="/my-tokens"
                sx={{ fontSize: "inherit", color: "inherit" }}
              >
                My tokens
              </Link>
            </Typography>
            <Typography variant="subtitle1">
              <Link href="/#" sx={{ fontSize: "inherit", color: "inherit" }}>
                Unclaimed assets
              </Link>
            </Typography>
            <Typography variant="subtitle1">
              <Link
                href="/winning-history"
                sx={{ fontSize: "inherit", color: "inherit" }}
              >
                Transactional history
              </Link>
            </Typography>
            <Typography variant="subtitle1">
              <Link
                href="/my-staking"
                sx={{ fontSize: "inherit", color: "inherit" }}
              >
                Staking
              </Link>
            </Typography>
          </Box>
        </Box>
        <Box mt={4}>
          <Typography variant="h5">Overall system information</Typography>
          <Box ml={4}>
            <Typography variant="subtitle1">
              <Link
                href="/gallery"
                sx={{ fontSize: "inherit", color: "inherit" }}
              >
                CosmicSignature gallery
              </Link>
            </Typography>
            <Typography variant="subtitle1">
              <Link
                href="/prize"
                sx={{ fontSize: "inherit", color: "inherit" }}
              >
                Prizes
              </Link>
            </Typography>
            <Typography variant="subtitle1">
              <Link
                href="/staking"
                sx={{ fontSize: "inherit", color: "inherit" }}
              >
                Staking Rewards
              </Link>
            </Typography>
            <Typography variant="subtitle1">
              <Link
                href="/marketing"
                sx={{ fontSize: "inherit", color: "inherit" }}
              >
                Marketing Rewards
              </Link>
            </Typography>
            <Typography variant="subtitle1">
              <Link
                href="/statistics"
                sx={{ fontSize: "inherit", color: "inherit" }}
              >
                System Statistics
              </Link>
            </Typography>
            <Typography variant="subtitle1">
              <Link
                href="/contracts"
                sx={{ fontSize: "inherit", color: "inherit" }}
              >
                Contract Addresses
              </Link>
            </Typography>
            <Typography variant="subtitle1">
              <Link href="/faq" sx={{ fontSize: "inherit", color: "inherit" }}>
                FAQ
              </Link>
            </Typography>
          </Box>
        </Box>
      </MainWrapper>
    </>
  );
};

export default SiteMap;
