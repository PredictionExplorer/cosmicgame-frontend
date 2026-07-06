import type { ReactNode } from 'react';

import { RootDocument } from '../root-document';
import { rootMetadata, rootViewport } from '../root-metadata';

import { LandingShell } from './landing-shell';

export const metadata = rootMetadata;
export const viewport = rootViewport;

/**
 * Root layout for the marketing route group (cosmicsignature.com):
 * `/landing-site` (rewritten from `/` by proxy.ts), `/about`, and `/learn`.
 *
 * Ships the lightweight LandingShell instead of the Web3 Providers tree so
 * no wallet dependency reaches the landing bundle (enforced by
 * app/(app)/__tests__/landing-shell-no-web3.test.ts). Reads no request
 * state, so every route in this group is statically generated.
 */
export default function LandingRootLayout({ children }: { children: ReactNode }) {
  return (
    <RootDocument>
      <LandingShell>{children}</LandingShell>
    </RootDocument>
  );
}
