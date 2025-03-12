import { Box, Link, Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";

/**
 * A list of links that provide per-user information routes.
 */
const perUserLinks = [
  { href: "/my-tokens", label: "My tokens" },
  { href: "/#", label: "Unclaimed assets" },
  { href: "/winning-history", label: "Transactional history" },
  { href: "/my-staking", label: "Staking" },
];

/**
 * A list of links that provide overall system information routes.
 */
const systemLinks = [
  { href: "/gallery", label: "CosmicSignature gallery" },
  { href: "/prize", label: "Prizes" },
  { href: "/staking", label: "Staking Rewards" },
  { href: "/marketing", label: "Marketing Rewards" },
  { href: "/statistics", label: "System Statistics" },
  { href: "/contracts", label: "Contract Addresses" },
  { href: "/faq", label: "FAQ" },
];

/**
 * SiteMap: A page component displaying a list of internal links grouped into categories.
 */
const SiteMap = () => {
  return (
    <MainWrapper>
      {/* Page heading */}
      <Typography
        variant="h4"
        color="primary"
        gutterBottom
        textAlign="center"
        mb={6}
      >
        Site Map
      </Typography>

      {/* Section for per-user information */}
      <Box>
        <Typography variant="h5">Per-user information</Typography>
        <Box ml={4}>
          {/* Map over perUserLinks to render them dynamically */}
          {perUserLinks.map(({ href, label }) => (
            <Typography variant="subtitle1" key={href}>
              <Link href={href} sx={{ fontSize: "inherit", color: "inherit" }}>
                {label}
              </Link>
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Section for overall system information */}
      <Box mt={4}>
        <Typography variant="h5">Overall system information</Typography>
        <Box ml={4}>
          {/* Map over systemLinks to render them dynamically */}
          {systemLinks.map(({ href, label }) => (
            <Typography variant="subtitle1" key={href}>
              <Link href={href} sx={{ fontSize: "inherit", color: "inherit" }}>
                {label}
              </Link>
            </Typography>
          ))}
        </Box>
      </Box>
    </MainWrapper>
  );
};

/**
 * getServerSideProps: Fetches and sets metadata (e.g., for SEO and social sharing)
 * before rendering the SiteMap page on the server side.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Site Map | Cosmic Signature";
  const description = "Site Map";

  // Open Graph and Twitter meta data
  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default SiteMap;
