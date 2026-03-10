import { GetServerSideProps } from 'next';

const Sitemap = () => null;

const BASE_URL = 'https://www.cosmicsignature.com';
const CHANGEFREQ = 'daily';
const PRIORITY = '0.7';

// Static pages from next-sitemap config (matches sitemap-0.xml output)
const staticPages = [
  '',
  '/admin',
  '/admin/admin',
  '/changed-parameters',
  '/charity-deposits-cg',
  '/charity-deposits-voluntary',
  '/charity-withdrawals',
  '/code',
  '/contracts',
  '/detail/sample',
  '/eth-donation',
  '/faq',
  '/gallery',
  '/how-to-play',
  '/marketing',
  '/mint',
  '/mint-artblocks',
  '/my-staking',
  '/my-statistics',
  '/my-tokens',
  '/my-winnings',
  '/named-nfts',
  '/nft-donations',
  '/prize',
  '/prize-claimed',
  '/site-map',
  '/staking',
  '/statistics',
  '/used-rwlk-nfts',
  '/winning-history',
];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const lastmod = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${CHANGEFREQ}</changefreq>
    <priority>${PRIORITY}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default Sitemap;
