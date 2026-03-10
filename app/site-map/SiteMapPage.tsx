'use client';

import { Box, Link, Typography } from '@mui/material';

import { MainWrapper } from '@/components/styled';

/**
 * A list of links that provide per-user information routes.
 */
const perUserLinks = [
  { href: '/my-tokens', label: 'My Tokens' },
  { href: '/my-winnings', label: 'My Unclaimed Winnings' },
  { href: '/winning-history', label: 'History of My Winnings' },
  { href: '/my-staking', label: 'My Staking' },
];

/**
 * A list of links that provide overall system information routes.
 */
const systemLinks = [
  { href: '/gallery', label: 'CosmicSignature Gallery' },
  { href: '/prize', label: 'Rounds Played' },
  { href: '/staking', label: 'Staking Rewards' },
  { href: '/marketing', label: 'Marketing Rewards' },
  { href: '/statistics', label: 'System Statistics' },
  { href: '/contracts', label: 'Contract Addresses' },
  { href: '/faq', label: 'FAQ' },
];

/**
 * SiteMapPage: A page component displaying a list of internal links grouped into categories.
 */
const SiteMapPage = () => {
  return (
    <MainWrapper>
      {/* Page heading */}
      <Typography variant="h4" color="primary" gutterBottom textAlign="center" mb={6}>
        Site Map
      </Typography>

      {/* Section for per-user information */}
      <Box>
        <Typography variant="h5">Per-user information</Typography>
        <Box ml={4}>
          {/* Map over perUserLinks to render them dynamically */}
          {perUserLinks.map(({ href, label }) => (
            <Typography variant="subtitle1" key={href}>
              <Link href={href} sx={{ fontSize: 'inherit', color: 'inherit' }}>
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
              <Link href={href} sx={{ fontSize: 'inherit', color: 'inherit' }}>
                {label}
              </Link>
            </Typography>
          ))}
        </Box>
      </Box>
    </MainWrapper>
  );
};

export default SiteMapPage;
