/** The host a share card is made for. */
export type OgHost = 'app' | 'landing';

/**
 * The public host printed in a card's footer, whatever origin rendered it
 * (a preview deployment or `next dev` prints the production host too). The
 * font subsets cut their glyph sets from these (scripts/build-og-fonts-core.ts).
 */
export const OG_DOMAINS: Readonly<Record<OgHost, string>> = {
  app: 'app.cosmicsignature.com',
  landing: 'cosmicsignature.com',
};
