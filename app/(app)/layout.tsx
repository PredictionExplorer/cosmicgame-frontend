import type { ReactNode } from 'react';

import { Providers } from '../providers';

import '@rainbow-me/rainbowkit/styles.css';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
