'use client';

import type { ReactNode } from 'react';
import { CookiesProvider } from 'react-cookie';

export function LandingProviders({ children }: { children: ReactNode }) {
  return <CookiesProvider>{children}</CookiesProvider>;
}
