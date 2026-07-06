import type { ReactNode } from 'react';

import { JsonLd, websiteJsonLd, organizationJsonLd, webApplicationJsonLd } from '@/utils/jsonLd';

import { RootDocument } from '../root-document';
import { rootMetadata, rootViewport } from '../root-metadata';

import { Providers } from './providers';

// NOTE: '@rainbow-me/rainbowkit/styles.css' is intentionally imported
// inside providers.tsx (not here) so the landing route group never ships
// the RainbowKit stylesheet.

export const metadata = rootMetadata;
export const viewport = rootViewport;

/**
 * Root layout for the dApp route group (served on app.cosmicsignature.com).
 *
 * Unlike the previous single root layout, this reads no request headers —
 * host routing is enforced by proxy.ts — so content routes in this group
 * (FAQ, How It Works, Terms, ...) can be statically generated and data
 * routes can use ISR (`revalidate`).
 */
export default function AppRootLayout({ children }: { children: ReactNode }) {
  return (
    <RootDocument
      headExtras={<JsonLd data={[websiteJsonLd(), organizationJsonLd(), webApplicationJsonLd()]} />}
    >
      <Providers showAppChrome>{children}</Providers>
    </RootDocument>
  );
}
